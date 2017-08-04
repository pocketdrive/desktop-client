import {Injectable} from '@angular/core';
import storage from 'electron-json-storage';

@Injectable()
export class LocalStorageService {

  constructor() {
  }

  addItem(key: string, value: string): void {
    storage.set(key, value, (error) => {
      if (error) {
        console.log("Error occurred while saving " + key + " to local storage", error);
      }
    });
  }

  getItem(key: string): Promise<any> {
    return new Promise((resolve) => {
      storage.get(key, (error, data) => {
        if (error) {
          console.log("Error occurred while saving " + key + " to local storage", error);
          resolve(error);
        }
        resolve(data);
      });
    });
  }


}
