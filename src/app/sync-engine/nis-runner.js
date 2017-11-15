import NisCommunicator from "../communicator/nis-communicator";

export class NisRunner {

  constructor(currentDeviceId, username, activeNisMaps) {
    this.currentDeviceId = currentDeviceId;
    this.username = username;
    this.activeNisMaps = activeNisMaps;
    this.intervalIds = [];
    this.communicators = [];
  }

  async startNis() {
    _.each(this.activeNisMaps, (key, deviceId) => {
      let nisCommunicator = new NisCommunicator(this.currentDeviceId, deviceId, this.username);

      let intervalId = setInterval(() => {
        console.log(`[NIS][${this.currentDeviceId} --> ${deviceId}]`);
        nisCommunicator.requestFileHashes();
      }, 5000);

      this.communicators.push(nisCommunicator);
      this.intervalIds.push(intervalId);
    });
  }

  stopNis() {
    _.each(this.intervalIds, id => clearTimeout);
    _.each(this.communicators, communicator => communicator.closeSocket());
  }

}
