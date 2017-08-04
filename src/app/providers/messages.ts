export const signIn = 'signIn';
export const getSyncFolders = 'getSyncFolders';

export class MessageHandler {

  static getMessage(type: string): any {
    return {type: type};
  }

  static getJsonHeaders(): Headers {
    return new Headers({'Content-Type': 'application/json'});
  }

}
