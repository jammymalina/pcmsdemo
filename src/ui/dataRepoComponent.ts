import Component from './component';
import DataRepository from '../dataRepository';

class DataRepoComponent extends Component {
  constructor(dataRepository: DataRepository) {
    super(document.createElement('table'));
    this.state = {
      repository: dataRepository
    };
  }
};
