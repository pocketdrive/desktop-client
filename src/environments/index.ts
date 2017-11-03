// This file contains development variables. (When you work in DEV MODE)
// This file is use by webpack. Please don't rename it and don't move it to another directory.

export const environment = {
  production: false,
  deviceId: '76e3d74e-5610-4b06-9203-7c7b32dbeb69',
  syncPort: 5000,
  centralServer: "http://45.55.94.191:8080",

  USER_HOME_OF_CLIENT:'/home/dulaj',

  // PD_FOLDER_PATH: '',
  NIS_DATA_PATH: '/home/dulaj/.PocketDrive/nis-data',

  // NE_DB_PATH_CHECKSUM: '/home/dulaj/.PocketDrive/home-pd/checksum.db',
  // NE_DB_PATH_SYNC_METADATA: '/home/dulaj/.PocketDrive/home-pd/sync_metadata.db',
  NE_DB_PATH_NIS_METADATA: '/home/dulaj/.PocketDrive/nis_metadata.db'
};
