import { Injectable } from '@angular/core';
import storage from 'electron-json-storage';

@Injectable()
export class UtilsService {

  constructor() { }

  saveToLocalStorage(key: string, value: string): void {
    storage.set(key, value, function (error) {
      if (error) {
        console.log("Error occurred while saving " + key + " to local storage", error);
      }
    });
  }
}