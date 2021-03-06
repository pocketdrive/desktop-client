import {Injectable} from '@angular/core';
import storage from 'electron-json-storage-sync';

@Injectable()
export class LocalStorageService {

  constructor() {
  }

  static setItem(key: string, value: string): void {
    const result = storage.set(key, value);

    if (!result.status) {
      console.log("Error occurred while saving " + key + " to local storage", result.error);
    } else {
      console.log(key + ' saved to local storage');
    }
  }

  static getItem(key: string): any {
    const result = storage.get(key);

    if (!result.status) {
      console.warn("Error occurred while reading " + key + " from local storage", result.error);
      return null;
    } else {
      return result.data;
    }
  }


}
