// This file contains development variables. (When you work in DEV MODE)
// This file is use by webpack. Please don't rename it and don't move it to another directory.

export const environment = {
  production: false,
  deviceId: '76e3d74e-5610-4b06-9203-7c7b32dbeb69',
  syncPort: 5000,
  centralServer: "http://45.55.94.191:8080",

  USER_HOME_OF_CLIENT:'/home/dulaj',

  NIS_DATA_PATH: '/home/dulaj/.PocketDrive/nis-data',

  // PD_FOLDER_PATH: '/home/dulaj/PocketDrive/home-pd',
  // NE_DB_PATH_CHECKSUM: '/home/dulaj/.PocketDrive/home-pd/checksum.db',
  // NE_DB_PATH_SYNC_METADATA: '/home/dulaj/.PocketDrive/home-pd/sync_metadata.db',

  // PD_FOLDER_PATH: LocalStorageService.getItem(Constants.localStorageKeys.PD_FOLDER_PATH),
  // NE_DB_PATH_CHECKSUM: LocalStorageService.getItem(Constants.localStorageKeys.NE_DB_PATH_CHECKSUM),
  // NE_DB_PATH_SYNC_METADATA: LocalStorageService.getItem(Constants.localStorageKeys.NE_DB_PATH_SYNC_METADATA),
  NE_DB_PATH_NIS_METADATA: '/home/dulaj/.PocketDrive/nis_metadata.db'
};
