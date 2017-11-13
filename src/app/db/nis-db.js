import Databases from "./dbs";

/**
 * @author Anuradha Wickramarachchi
 */
export default class NisClientDbHandler {

  static getNextSequenceID(deviceId) {
    let result = {success: false};

    return new Promise((resolve) => {
      Databases.nisClientDb.find({deviceID: deviceId}).sort({sequence_id: -1}).limit(1).exec((err, docs) => {
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

  static getOrderedOperations(otherDeviceId, username, fileFetched) {
    let result = {success: false};

    return new Promise((resolve) => {
      Databases.nisClientDb.find({
        otherDeviceID: otherDeviceId,
        user: username,
        fileFetched: fileFetched
      }).sort({sequence_id: 1}).exec((err, docs) => {
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

  static upsertEntry(entry) {
    Databases.nisClientDb.update(
      {
        user: entry.user,
        otherDeviceID: entry.otherDeviceID,
        path: entry.path
      }, entry, {upsert: true}, () => {
      });
  }

  static removeEvent(id) {
    Databases.nisClientDb.remove({_id: id}, (err, numDeleted) => {
    });
  }
}
