import DataRepositoryConfig from './DataRepositoryConfig';
import AWS from 'aws-sdk';
import splitArray from './splitArray';

class DataRepository {
  private _tableName: string;
  private _primaryKey: string;
  private dynamodb: AWS.DynamoDB;
  private documentClient: AWS.DynamoDB.DocumentClient;
  private _data: any[];

  constructor(config: DataRepositoryConfig) {
    this._tableName = config.tableName;
    this.dynamodb = new AWS.DynamoDB({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region
    });
    this.documentClient = new AWS.DynamoDB.DocumentClient({
      service: this.dynamodb
    });
    this._data = [];
  }

  get data(): any[] {
    return [...this._data];
  }

  get size(): number {
    return this.data.length;
  }

  get tableName(): string {
    return this._tableName;
  }

  get tablePrimaryKey(): string {
    return this._primaryKey;
  }

  get dataKeys(): string[] {
    const allKeys = this.data
      .map(x => Object.keys(x))
      .reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);
    const keySet = new Set<string>(allKeys);
    return Array.from(keySet);
  }

  async init() {
    try {
      const tableInfo = await this.dynamodb.describeTable({ TableName: this._tableName }).promise();
      this._primaryKey = tableInfo.Table.KeySchema && tableInfo.Table.KeySchema.length > 0 ?
        tableInfo.Table.KeySchema[0].AttributeName : '';
      await this.refresh();
    } catch (err) {
      console.log(`Unable to init repository: ${err.message}`);
    }
  }

  private async deleteChunk(chunk: any[]) {
    const deleteRequests = chunk.map(x => ({
      DeleteRequest: {
        Key: { [this._primaryKey]: x }
      }
    }));
    const params = {
      RequestItems: {
        [this._tableName]: deleteRequests
      }
    };
    try {
      await this.documentClient.batchWrite(params).promise();
      return chunk;
    } catch (err) {
      console.log(`Unable to delete chunk from the table ${this._tableName}`);
      return [];
    }
  }

  async delete(...ids: string[]): Promise<string[]> {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    const deleteChunks = splitArray(ids, 25);
    const promises = deleteChunks.map(chunk => this.deleteChunk(chunk));
    const result = await Promise.all(promises);
    await this.refresh();
    return result.reduce((accumulator, currentValue) => accumulator.concat(currentValue), []);
  }

  async getAllItems() {
    const items = [];
    try {
      let scanResult = await this.documentClient.scan({ TableName: this._tableName }).promise();
      items.push(...scanResult.Items);
      while (scanResult.LastEvaluatedKey) {
        scanResult = await this.documentClient.scan({
          TableName: this._tableName,
          ExclusiveStartKey: scanResult.LastEvaluatedKey
        }).promise();
        items.push(...scanResult.Items);
      }
      this._data = [...this._data, ...items];
    } catch (err) {
      console.log(`Unable to fetch the data from the table ${this._tableName}: ${err.message || 'no info'}`);
    }

    return this._data;
  }

  async refresh() {
    this._data = [];
    return this.getAllItems();
  }
}

export default DataRepository;
