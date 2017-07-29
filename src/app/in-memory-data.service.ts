import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const pds = [
      { uuid: '0001',  name: 'Home Drive' , ip: '192.168.8.2', port: '8000'},
      { uuid: '0002',  name: 'Room Drive' , ip: '192.168.8.3', port: '8000'},
      { uuid: '0003',  name: 'Office Drive' , ip: '192.168.8.5', port: '8000'}
    ];
    return {pds};
  }
}