import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';
import {Cookie} from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private url="http://localhost:3000";

  constructor(public http:HttpClient) { }
  
  public signupFunction(data):Observable<any>{
    const params= new HttpParams()
    .set('firstName',data.firstName)
    .set('lastName',data.lastName)
    .set('mobile',data.mobile)
    .set('email',data.email)
    .set('password',data.password)
    .set('apiKey',data.apiKey);

    return this.http.post(`${this.url}/api/v1/users/signup`,params);
  } //end of signupFunction

  public signinFunction(data):Observable<any>{
    const params= new HttpParams()
    .set('email',data.email)
    .set('password',data.password);

    return this.http.post(`${this.url}/api/v1/users/login`,params);
  } //end of loginFunction

  public setUserInfoInLocalStorage=(data)=>{
    localStorage.setItem('userInfo',JSON.stringify(data));
  }

  public getUserInfoFromLocalStorage=()=>{
    return JSON.parse(localStorage.getItem('userInfo'));
  }

  public logout(): Observable<any> {

    const params = new HttpParams()
      .set('authToken', Cookie.get('authtoken'))

    return this.http.post(`${this.url}/api/v1/users/logout`, params);

  } // end logout function

  public forgotPassword(data):Observable<any>{
    const params=new HttpParams()
    .set('email',data.email)
    return this.http.post(`${this.url}/api/v1/users/forgot-password`,params);
  }
  public resetPassword(data):Observable<any>{
    const params=new HttpParams()
    .set('newPassword',data.newPassword)
    .set('verifyPassword',data.verifyPassword)
    .set('token',data.token)
    return this.http.post(`${this.url}/api/v1/users/reset-password`,params);
  }
  public sendInvites(data):Observable<any>{
    const params=new HttpParams()
    .set('authToken',Cookie.get('authtoken'))
    .set('senderId',data.senderId)
    .set('senderName',data.senderName)
    .set('roomId',data.roomId)
    .set('roomName',data.roomName)
    .set('members',data.members);
    return this.http.post(`${this.url}/api/v1/users/send-invites`,params)
  }
}
