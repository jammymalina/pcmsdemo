import config from './config.json';
import DataRepository from './DataRepository';
import DataRepoComponent from './ui/DataRepoComponent';
import feather from 'feather-icons';

document.addEventListener('DOMContentLoaded', async () =>  {
  const alertRepo = new DataRepository(config.dataRepositories[0]);
  const devicesoftwareRepo = new DataRepository(config.dataRepositories[1]);
  const repoInits = [alertRepo.init(), devicesoftwareRepo.init()];
  await Promise.all(repoInits);

  const alertComponent = new DataRepoComponent(alertRepo);
  const devicesoftwareComponent = new DataRepoComponent(devicesoftwareRepo);

  alertComponent.inject(document.getElementById('alertdata'));
  devicesoftwareComponent.inject(document.getElementById('devicesoftwaredata'));
  feather.replace();
  const repoRenders = [alertComponent.render(), devicesoftwareComponent.render()];
  await Promise.all(repoRenders);
  console.log('Ready');
});
