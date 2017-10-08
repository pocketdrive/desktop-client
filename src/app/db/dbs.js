import DataStore from 'nedb';
import {environment} from "../../environments/index";

export const fileMetaDataDb = new DataStore({filename: environment.NE_DB_PATH_FILE_METADATA, autoload: true});
export const checkSumDB = new DataStore({filename: environment.NE_DB_PATH_CHECKSUM, autoload: true});
export const nisClientDb = new DataStore({filename: environment.NE_DB_PATH_NIS, autoload: true});

fileMetaDataDb.ensureIndex({ fieldName: 'path', unique: true });
checkSumDB.ensureIndex({ fieldName: 'path', unique: true });
