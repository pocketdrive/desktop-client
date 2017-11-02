import NisCommunicator from "../communicator/nis-communicator";

export class NisRunner {

  constructor(currentDeviceId, username, activeNisMaps) {
    console.log(currentDeviceId, username, activeNisMaps) ;
    this.currentDeviceId = currentDeviceId;
    this.username = username;
    this.activeNisMaps = activeNisMaps;
  }

  async start() {
    _.each(this.activeNisMaps, (key, deviceId) => {
      let nisCommunicator = new NisCommunicator(this.currentDeviceId, deviceId, this.username);
      setInterval(() => {
        console.log(`[NIS][${this.currentDeviceId} --> ${deviceId}]`);

        nisCommunicator.requestFileHashes();
      }, 5000);
    });
  }

}
