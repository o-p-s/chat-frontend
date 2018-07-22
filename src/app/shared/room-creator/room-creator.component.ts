import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SocketService } from '../../socket.service';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-room-creator',
  templateUrl: './room-creator.component.html',
  styleUrls: ['./room-creator.component.css']
})
export class RoomCreatorComponent implements OnInit{

  @Output() changeView: EventEmitter<string> = new EventEmitter<string>();
  @Output() warning:EventEmitter<string>=new EventEmitter<string>();
  @Input() creatorName: String;
  @Input() creatorId: String;
  @Input() action:String;
  @Input() usersList:any;
  @Input() roomList:any;
  @Input() roomModel:any;

  public roomName:string;
  public members:any=[];
  public rooms:any=[];
  public memberList:any=[];
  public state="active";
  public stateUpdate:any;
  users=new FormControl();

  constructor(public socketService: SocketService,public router: Router) {}
  ngOnInit(){}
  public roomCreatorFunction=()=>{
    switch (this.action) {
      case "create":this.createRoom();        
        break;
      case "delete":this.deleteRoom();
        break;
      case "update":this.updateRoom();
      default:
        break;
    }
   
  }
  public createRoom=()=>{
    if(!this.roomName){    
      this.warning.emit('Enter Room Name');

    }else if(this.members.length==0){
      this.warning.emit('Select Members');
    }else{
      this.members.forEach(member => {
        for(let x in this.usersList){
          if(member==this.usersList[x].name){
            this.memberList.push(this.usersList[x].userId)
          }
        }
      });
      let data={
        roomName:this.roomName,
        creatorId:this.creatorId,
        creatorName:this.creatorName,
        members:this.memberList,
        state:this.state
      }
      this.socketService.createRoom(data);
      this.changeView.emit(`Room ${name} Created`);
    }
  }
  public deleteRoom(){
    if(!this.rooms){
      this.warning.emit('Select atleast one room.')
    }else{
      this.rooms.forEach(room => {
        for(let x in this.roomList){
          if(room==this.roomList[x].name){
            this.socketService.deleteRoom({roomId:this.roomList[x].roomId,roomName:this.roomList[x].roomName})
          }
        }
      });
    }
    this.changeView.emit(`Room ${name} Deleted`);
  }
  public updateRoom(){
    this.socketService.updateRoom({
      roomId:this.roomModel.roomId,
      roomName:this.roomName,
      state:this.stateUpdate,
      previousroomName:this.roomModel.name,
      userName:this.roomModel.userName
    })
    this.changeView.emit(`${this.roomModel.name} edited successfully.`)
  }
  public backToView(){
    this.changeView.emit(``);
  }      
}
