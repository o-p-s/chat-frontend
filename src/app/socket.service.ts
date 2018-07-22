import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';

import { Cookie } from 'ng2-cookies/ng2-cookies';


@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private url = 'http://localhost:3000';  
  private socket;

  constructor(private http:HttpClient) { 
    //connection is being created
    this.socket=io(this.url);
  }

  //events to be listened
  public verifyUser=()=>{
    return Observable.create((observer)=>{
      this.socket.on('verifyUser',(data)=>{
        observer.next(data);
      }); //end of Socket
    }); //end of Observer
  } //emd of verifyUser
  public verifyInvite=(data)=>{
    this.socket.emit('verify-invite',(data)); 
  }
  public onlineUserList=()=>{
    return Observable.create((observer)=> {
      this.socket.on('online-user-list', (userList)=>{
        observer.next(userList); 
      });//end of socket
    }); //end of Observer
  } //end of onlineUserList
  public authError=()=>{
    return Observable.create((observer)=>{
      this.socket.on('auth-error',(data)=>{
        observer.next(data);
      }); //end of Socket
    }); //end of Observer
  } //emd of auth-error
  public onVerifiedInvite=()=>{
    return Observable.create((observer)=>{
      this.socket.on('decoded-info',(data)=>{
        observer.next(data);
      }); //end of Socket
    }); //end of Observer
  } //emd of on verified invite
  public activeRoomsList=()=>{
    return Observable.create((observer)=> {
      this.socket.on('all-active-rooms', (RoomsList)=>{
        observer.next(RoomsList);
      });//end of socket
    }); //end of Observer
  } //end of ActiveRoomsList
  public updateList=()=>{
    this.socket.emit('update-list');
  } //end of updateList
  public setUpdate=()=>{
    return Observable.create((observer)=> {
      this.socket.on('setUpdate', (data)=>{
        observer.next(data);
      });//end of socket
    }); //end of Observer
  }
  public createRoom=(data)=>{
      this.socket.emit('create-chatRoom',data);
  }
  public joinRoom=(data)=>{
    this.socket.emit('join-room',(data))
  }
  public deleteRoom=(data)=>{
    this.socket.emit('delete-room',data);
  }
  public onDeleteRoom=()=>{
    return Observable.create((observer)=> {
      this.socket.on("leave-room-onDelete",(data)=>{
        observer.next(data);
      });
    })
  }
  public onJoinRoom=(data)=>{
    this.socket.emit('join-room',(data))
  }
  public onLeaveRoom=(data)=>{
    this.socket.emit("leave-room",(data))
  }
  public kickUser=(data)=>{
    this.socket.emit('kick-from-room',data);
  }
  public typing=(data)=>{
    this.socket.emit('user-typing',(data));
  }
  public onTyping=()=>{
    return Observable.create((observer)=>{
      this.socket.on('typing',(data)=>{
        observer.next(data);
      })
    })
  }
  public updateRoom=(data)=>{
    this.socket.emit('update-room',(data));
  }
  public disconnectedSocket=()=>{
    return Observable.create((observer)=>{
      this.socket.on('disconnect',()=>{
        observer.next();
      });
    });//end of Observer
  }
  //end of events to be listened
  // events to be emitted
  public setUser=(authToken)=>{
    this.socket.emit('set-user',authToken);
  }
  public setRooms=()=>{
    this.socket.emit('set-rooms');
  }
  public markChatAsSeen=(data):Observable<any>=>{
    const params= new HttpParams()
    .set('senderId',data.senderId)
    .set('userId',data.userId)
    .set('authToken',Cookie.get('authtoken'))
    return this.http.post(`${this.url}/api/v1/chat/mark/as/seen`,params)
    .catch(this.handleError);
  }
  public noOfUnseenChat=(data):Observable<any>=>{    
  return this.http.get(`${this.url}/api/v1/chat/count/unseen?senderId=${(data.senderId)?data.senderId:''}&userId=${data.userId}&authToken=${Cookie.get('authtoken')}`)
  .do(data=>console.log('Unseen Chats count Received'))
  .catch(this.handleError);
  }
  public getChat(senderId,receiverId,skip):Observable<any>{
    return this.http.get(`${this.url}/api/v1/chat/get/for/user?senderId=${senderId}&receiverId=${receiverId}&skip=${skip}&authToken=${Cookie.get('authtoken')}`)
    .do(data=>console.log('Chats Received'))
    .catch(this.handleError);
  }
  public getChatforRoom(roomId,skip):Observable<any>{
    return this.http.get(`${this.url}/api/v1/chat/get/for/group?roomId=${roomId}&skip=${skip}&authToken=${Cookie.get('authtoken')}`)
    .do(data=>console.log('Chats Received'))
    .catch(this.handleError);
  }
  public myIOUserId=(userId)=>{
    return Observable.create((observer) => {     
      this.socket.on(userId, (data) => {
        if(data.req==="join"){
          this.joinRoom(data);
        }else
        //console.log(data)
        observer.next(data); console.log(data);
      }); // end Socket
    }); // end Observable
  } // end chatByUserId
  public roomMessage=()=>{
    return Observable.create((observer) => { 
      this.socket.on('roomMessage',(data)=>{
        observer.next(data);
      })
    })
  } // receiving messages inside rooms
  public SendChatMessage=(chatMsgObject)=>{
    this.socket.emit('chat-msg', chatMsgObject);
  } // end getChatMessage

  public exitSocket=()=>{
    this.socket.disconnect(); console.log('called')
  }// end exit socket

  public handleError(err:HttpErrorResponse){
    let errorMessage='';
    if(err.error instanceof Error){
      errorMessage=`An Error Occurred : ${err.error.message}`;
    }else{
      errorMessage=`Server Returned Code : ${err.status}, error message is :${err.message}`;
    }
    console.error(errorMessage);
    return Observable.throw(errorMessage);
  }
}
