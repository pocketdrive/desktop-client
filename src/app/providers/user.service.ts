import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {BASE_URL} from "../const";
import {User} from "../models/user";
import {MessageHandler, signIn} from "./messages";

@Injectable()
export class UserService {

  private url = BASE_URL + 'signin';

  constructor(private http: Http) {
  }

  signIn(username: string, password: string): Promise<any> {
    let message = MessageHandler.getMessage(signIn);
    message.data = {
      username: username,
      password: password
    };

    return this.http
      .post(this.url, message, MessageHandler.getJsonHeaders())
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.log('handler error');
    return Promise.reject(error.message || error);
  }

}
