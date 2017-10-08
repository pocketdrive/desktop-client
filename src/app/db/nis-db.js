import * as databases from './dbs';

/**
 * @author Anuradha Wickramarachchi
 */
export default class NisClientDbHandler {

  static getNextSequenceID(deviceId) {
    let result = {success: false};

    return new Promise((resolve) => {
      databases.nisClientDb.find({deviceID: deviceId}).sort({sequence_id: -1}).limit(1).exec((err, docs) => {
        if (err) {
          this.handleError(result, 'DB Error. Cannot get max sequenceID', err);
        } else {
          result.success = true;
          result.data = (docs && docs.length !== 0) ? docs[0].sequence_id + 1 : 0;
        }

        resolve(result);
      });
    });
  }

  static getOrderedOperations(deviceId, username) {
    let result = {success: false};

    return new Promise((resolve) => {
      databases.nisClientDb.find({deviceID: deviceId, user: username}).sort({sequence_id: 1}).exec((err, docs) => {
        if (err) {
          this.handleError(result, 'DB Error. Cannot get max sequenceID', err);
        } else {
          result.success = true;
          result.data = (docs && docs.length !== 0) ? docs : [];
        }

        resolve(result);
      });
    });
  }

  static insertEntry(entry) {
    databases.nisClientDb.insert(entry, (err) => {
    });
  }
}
