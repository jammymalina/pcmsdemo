import DataRepositoryConfig from './dataRepositoryConfig';
import AWS from 'aws-sdk';

class DataRepository {
  tableName: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;

  constructor(config: DataRepositoryConfig) {
    this.tableName = config.tableName;
  }
}

export default DataRepository;
