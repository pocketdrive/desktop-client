import DataStore from 'nedb';
import {environment} from "../../environments/index";

export default class Databases {

  static init() {
    Databases.fileMetaDataDb = new DataStore({filename: environment.NE_DB_PATH_SYNC_METADATA, autoload: true});
    Databases.checkSumDB = new DataStore({filename: environment.NE_DB_PATH_CHECKSUM, autoload: true});
    Databases.nisClientDb = new DataStore({filename: environment.NE_DB_PATH_NIS_METADATA, autoload: true});

    Databases.fileMetaDataDb.ensureIndex({fieldName: 'path', unique: true});
    Databases.checkSumDB.ensureIndex({fieldName: 'path', unique: true});
  }

}
