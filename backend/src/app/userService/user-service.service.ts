import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  HttpHeaders } from '@angular/common/http';
import { CONFIG } from 'config';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  constructor(private http: HttpClient) { }

  verifyUserEmail(action: string, data = {} , token): Promise<any> 
  {

    console.log("password:",data);
    console.log("token:",token);

    
    return new Promise<any>(resolve => 
      {
          const headers = new HttpHeaders({
            'x-access-token': token
          });
          const httpOptions = {
            headers: headers
          };

          this.http.post(CONFIG.API_ENDPOINT + action, data, httpOptions).subscribe(data => {
            resolve(data);

          },
            err => {
              // console.log(err);
              resolve(err);
            }
          );
    });
  }


  postApi(action: string, data = {}): Promise<any> {
    return new Promise<any>(resolve => {
      // this.storage.getValue(Constants.USER_ID).then(userId => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        'x-access-token': localStorage.getItem('admintoken') ? localStorage.getItem('admintoken') : ''
      });
      const httpOptions = {
        headers: headers
      };

      this.http.post(CONFIG.API_ENDPOINT + action, JSON.stringify(data), httpOptions).subscribe(data => {
        resolve(data);

      },
        err => {
          // console.log(err);
          resolve(err);
        }
      );
    });
  }
  deleteApi(action: string, data = {}): Promise<any> {
    return new Promise<any>(resolve => {
      // this.storage.getValue(Constants.USER_ID).then(userId => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json; charset=utf-8',
        'x-access-token': localStorage.getItem('admintoken') ? localStorage.getItem('admintoken') : '',
      });
      const httpOptions = {
        headers: headers,
        body: data
      };

      this.http.delete(CONFIG.API_ENDPOINT + action, httpOptions).subscribe(data => {
        resolve(data);

      },
        err => {
          // console.log(err);
          resolve(err);
        }
      );
    });
  }
  getApi(action: string): Promise<any> {
    return new Promise<any>(resolve => {
      // this.storage.getValue(Constants.USER_ID).then(userId => {
      const headers = new HttpHeaders({
        'Accept-Language': localStorage.getItem('language') ? localStorage.getItem('language') : 'en',
        'x-access-token': localStorage.getItem('admintoken') ? localStorage.getItem('admintoken') : ''
      });
      const httpOptions = {
        headers: headers
      };

      this.http.get(CONFIG.API_ENDPOINT + action, httpOptions).subscribe(data => {
        resolve(data);

      },
        err => {
          // console.log(err);
          resolve(err);
        }
      );
    });
  }

  updateAPi(action: string, data: {}): Promise<any> {
    console.log("data",data)
    return new Promise<any>(resolve => {
      // this.storage.getValue(Constants.USER_ID).then(userId => {
      const headers = new HttpHeaders({
        'Accept': 'application/json',
        'x-access-token': localStorage.getItem('admintoken') ? localStorage.getItem('admintoken') : ''
      });
      const httpOptions = {
        headers: headers
      };
      
      this.http.put(CONFIG.API_ENDPOINT + action, data, httpOptions).subscribe(data => {
        resolve(data);

      },
        err => {
          // console.log(err);
          resolve(err);
        }
      );
    });
  }
  
  fileUpload(action: string, data = {}): Promise<any> {
    return new Promise<any>(resolve => {
      // this.storage.getValue(Constants.USER_ID).then(userId => {
      const headers = new HttpHeaders({

        // 'content-type':'multipart/form-data',
        'x-access-token': localStorage.getItem('admintoken') ? localStorage.getItem('admintoken') : ''
      });
      const httpOptions = {
        headers: headers
      };

      this.http.post(CONFIG.API_ENDPOINT + action, data, httpOptions).subscribe(data => {
        resolve(data);

      },
        err => {
          // console.log(err);
          resolve(err);
        }
      );
    });
  }
  callHttp(url): Promise<any> {
    return new Promise(resolve => {
      this.http.get(url).subscribe(data => {
        resolve(data);
      }, err => {
        resolve(null);
      });
    });
  }
}
