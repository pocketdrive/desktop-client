import {Injectable} from '@angular/core';
import {Http, ConnectionBackend, RequestOptions, RequestOptionsArgs, Response, Headers, Request} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {environment} from 'environments';
import {LocalStorageService} from "./localstorage.service";

@Injectable()
export class HttpInterceptor extends Http {

  constructor(private backend: ConnectionBackend,
              private defaultOptions: RequestOptions,
              private localStorageService: LocalStorageService) {
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

  // Implement POST, PUT, DELETE HERE

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
        'Authorization': `Bearer ` + this.localStorageService.getItem('token')
      });
    }
    return options;
  }

  /**
   * Build API url.
   * @param url
   * @returns {string}
   */
  private getFullUrl(url: string): string {
    return environment.apiEndpoint + url;
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
    console.log(res);
  }

  /**
   * onError
   * @param error
   */
  private onError(error: any): void {
    console.log(error);
  }

}
