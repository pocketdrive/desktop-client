import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { BASE_URL } from "../const";
import { User } from "../models/user";

@Injectable()
export class UserService {

  private headers = new Headers({'Content-Type': 'application/json'});
  private url = BASE_URL + 'signin';

  user: User;

  constructor(private http: Http) { }

  signIn(para: any): Promise<User> {
    console.log(para);
    return this.http
      .post(this.url, JSON.stringify(para), {headers: this.headers})  
      .toPromise()
      .then(res => res.json().data as User)
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.log('handler error');
    return Promise.reject(error.message || error);
  }
}
