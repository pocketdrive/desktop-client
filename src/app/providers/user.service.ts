import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

import 'rxjs/add/operator/toPromise';

import {HttpInterceptor} from "./http-interceptor.service";

@Injectable()
export class UserService {

  private url = 'user/signin';

  constructor(private http: Http,
              private httpInterceptor: HttpInterceptor) {
  }

  signIn(username: string, password: string): Promise<any> {
    let message = {type: 'signIn'};
    message['data'] = {
      username: username,
      password: password
    };

    return this.http
      .post(this.httpInterceptor.getFullUrl(this.url), message, new Headers({'Content-Type': 'application/json'}))
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

}
