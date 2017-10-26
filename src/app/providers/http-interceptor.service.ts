import {Injectable} from '@angular/core';
import {ConnectionBackend, Headers, Http, RequestOptions, RequestOptionsArgs, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {LocalStorageService} from "./localstorage.service";
import {Router} from "@angular/router";
import {PocketDrive} from "../models/pocketdrive";
import {Constants} from "../constants";

@Injectable()
export class HttpInterceptor extends Http {

  token: string;
  baseUrl: string;
  baseUrlWithoutPort: string;

  constructor(private backend: ConnectionBackend,
              private defaultOptions: RequestOptions,
              private router: Router) {
    super(backend, defaultOptions);
  }

  /**
   * Performs a request with `get` http method.
   * @param url
   * @param options
   * @returns {Observable<>}
   */
  get(url: string, options?: RequestOptionsArgs): Observable<any> {
    return super.get(this.getFullUrl(url), this.requestOptions(options))
      .catch(this.onCatch)
      .do((res: Response) => {
        this.onSuccess(res);
      }, (error: any) => {
        this.onError(error);
      })
  }

  post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
    return super.post(this.getFullUrl(url), body, this.requestOptions(options))
      .do((res: Response) => {
        this.onSuccess(res);
      }, (error: any) => {
        this.onError(error);
      });
  }

  /**
   * Request options.
   * @param options
   * @returns {RequestOptionsArgs}
   */
  private requestOptions(options?: RequestOptionsArgs): RequestOptionsArgs {
    if (options == null) {
      options = new RequestOptions();
    }

    if (options.headers == null) {
      options.headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ` + this.getToken()
      });
    }

    return options;
  }

  /**
   * Error handler.
   * @param error
   * @param caught
   * @returns {ErrorObservable}
   */
  private onCatch(error: any, caught: Observable<any>): Observable<any> {
    return Observable.throw(error);
  }

  /**
   * onSuccess
   * @param res
   */
  private onSuccess(res: Response): void {
    // console.log(res);
  }

  /**
   * onError
   * @param error
   */
  private onError(error: any): void {
    console.error('onError', error);

    if (error.status == 401) {
      this.router.navigate(['']);
    }

  }

  private getToken(): string {
    if (!this.token) {
      this.token = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.authToken));
    }

    return this.token;
  }

  getFullUrl(url: string): string {
    if (!this.baseUrl) {
      let pd: PocketDrive = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd));
      this.baseUrl = 'http://' + pd.ip + ':' + pd.port;
    }

    return this.baseUrl + '/' + url;
  }

  getUrlWithoutPort(): string {
    if (!this.baseUrlWithoutPort) {
      let pd: PocketDrive = JSON.parse(LocalStorageService.getItem(Constants.localStorageKeys.selectedPd));
      this.baseUrlWithoutPort = 'http://' + pd.ip;
    }

    return this.baseUrlWithoutPort;
  }
}
