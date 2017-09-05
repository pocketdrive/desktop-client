import DataStore from 'nedb';

export const fileMetaDataDb = new DataStore({filename: process.env.NE_DB_PATH_FILE_METADATA, autoload: true});
export const checkSumDB = new DataStore({filename: process.env.NE_DB_PATH_CHECKSUM, autoload: true});
