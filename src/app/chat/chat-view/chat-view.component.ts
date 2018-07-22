import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SocketService } from './../../socket.service';
import { AppService } from './../../app.service';

import { Router, ActivatedRoute } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ToastrService } from 'ngx-toastr';
import { chatMessage } from '../chat';
import { isError } from 'util';

@Component({
  selector: 'app-chat-view',
  templateUrl: './chat-view.component.html',
  styleUrls: ['./chat-view.component.css'],
  providers: [SocketService]
})
export class ChatViewComponent implements OnInit {
  @ViewChild('scrollMe', { read: ElementRef }) 
  
  public scrollMe: ElementRef;

  public authToken: any;
  public userInfo: any;
  public room:Boolean=false;  //setting ChatRoom property in ChatMsg Model 
  public roomJoined:boolean;  // for checking join button
  public previousChat:boolean;   //handles state of previouschat link
  public roomLeave;             //handles states for leave and kick buttons
  public receiverId: any;
  public receiverName: any;
  public userList: any = [];
  public roomsList:any=[];
  public disconnectedSocket: boolean;
  public scrollToChatTop:boolean= false;

  public previousChatList: any = [];
  public messageText: any; 
  public messageList: any = []; // stores the current message list display in chat box
  public membersList:any=[]; // storing members for a room for kick operation
  public chosenMemberList:any=[]; //storing user selected for kick
  public pageValue: number = 0;
  public loadingPreviousChat: boolean = false;
  public sidebarState:boolean;
  public contentState:boolean;
  public chatboxState:boolean;
  public removeUserState:boolean;
  public writeboxState:boolean=true;
  public navbarState:boolean=true;
  public action:string='';      //handling kick or invite
  public profileeditorState:boolean=false;
  public roomcreatorState=false;
  public typingUserName='';   //for setting who is typing 
  public roomAction="";   //for setting create or delete room fields 
  public roomModel:any;   //for sending current room details to edit.
  public num:number;    //storing no of unread msgs
  constructor(
    public appService: AppService,
    public socketService: SocketService,
    public router: Router,
    private toastr: ToastrService,
    private _route:ActivatedRoute) 
  {
    this.receiverId = Cookie.get('receiverId');
    this.receiverName = Cookie.get('receiverName');
  }
  ngOnInit() {
    if(this._route.snapshot.queryParamMap.get('token')){
      this.socketService.verifyInvite(this._route.snapshot.queryParamMap.get('token'))
    }
    this.authToken = Cookie.get('authtoken');
    this.userInfo = this.appService.getUserInfoFromLocalStorage();
    this.receiverId = Cookie.get("receiverId");
    this.receiverName =  Cookie.get('receiverName');

    if(this.receiverId!=null && this.receiverId!=undefined && this.receiverId!=''){
      this.userSelectedToChat(this.receiverId,this.receiverName)
    }
    this.contentState=false;
    this.sidebarState=false;
    this.chatboxState=true;this.removeUserState=false;
    this.roomJoined=false;
    this.previousChat=true;
    this.roomLeave=false;
    
    this.verifyUserConfirmation();
  }
  //initialization operations
  public authError:any=()=>{
    this.socketService.authError().subscribe((data)=>{
      if(data.status==500){
        console.log('Incorrect Auth Token.')
        this.toastr.error('Sign in again.')
        this.router.navigate(['/']);
      }else if(data.status==400){
        console.log('Invalid Invite Token')
        this.toastr.error('Invalid Invite Token.')
        this.router.navigate(['/chat'])
      }
    })
  }
  public verifyUserConfirmation:any=()=>{
    this.socketService.verifyUser()
      .subscribe((data) => {
        this.disconnectedSocket = false;
     
        this.socketService.setUser(this.authToken);
        this.getOnlineUserList()
        this.socketService.setRooms();
        this.socketService.updateList(); //for rooms
        this.authError();
        this.getActiveRoomsList()
        this.getMessageFromAUser()
        this.getMessageFromARoom()
        this.onSetUpdate()
        this.onDeleteRoom()
        this.onTyping()
        this.onVerifiedInvite()
    });
  } //end verify user confirmation
  public onVerifiedInvite:any=()=>{
    this.socketService.onVerifiedInvite().subscribe((data)=>{
     if(data.data.userId==this.userInfo.userId){
      this.router.navigate(['/chat'])
       this.setSidebarState();
       this.setContentState();
       this.roomSelectedToChat(data.data.roomId,data.data.roomName);
     }else{
       this.router.navigate(['/chat'])
     }
    })
  }
  public getOnlineUserList:any=()=>{
    this.socketService.onlineUserList()
      .subscribe((userList) => {
        this.userList = [];
        for (let x in userList) {
          if(userList[x].userId!=this.userInfo.userId){
            let temp = { 'userId': userList[x].userId, 'name': userList[x].fullName,
            'unread': 0, 'chatting': false };
            this.userList.push(temp); 
            this.unseenChats(userList[x].userId);
          }        
        }
        console.log(this.userList);
      }); // end online-user-list
  } //end onlineuserlist
  public getActiveRoomsList:any=()=>{
    this.socketService.activeRoomsList()
      .subscribe((roomsList) => {
        this.roomsList = [];
        for (let x in roomsList) {
          let temp = { 'roomId': roomsList[x].roomId, 'name': roomsList[x].roomName, 'unread': 0, 'chatting': false,state:roomsList[x].state,members:roomsList[x].members };
          this.roomsList.push(temp);          
        }console.log(this.roomsList);
      }); // end online-user-list
  } //end active room list 
  public logout:any=()=>{

    this.appService.logout()
      .subscribe((apiResponse) => {
        if (apiResponse.status === 200) {
          console.log("logout called")
          Cookie.delete('authtoken');
          Cookie.delete('receiverId');
          Cookie.delete('receiverName');
          this.socketService.exitSocket()
          this.router.navigate(['/']);
        } else {
          this.toastr.error(apiResponse.message)
        } // end condition
      }, (err) => {
        this.toastr.error('some error occured')
      });  
  } // end logout

    // chat related methods 
    public userSelectedToChat:any=(id,name)=>{ 
      this.markChatAsSeen(id);
      console.log("setting user as active")  // setting that user to chatting true           
      this.userList.map((user)=>{
        (user.userId==id)?user.chatting=true: user.chatting = false;user.unread=0;
      })
      this.messageList = [];
      this.pageValue = 0;
      this.getPreviousChatWithAUser();
      Cookie.set('receiverId', id);
      Cookie.set('receiverName', name);  
      this.receiverName = name;
      this.receiverId = id;   
      this.removeUserState=false;
      this.roomJoined=true;
      this.room=false;this.roomLeave=false;this.roomModel='';
      if(!this.contentState)this.setContentState();
      if(!this.chatboxState)this.setChatBoxState();
      if(!this.writeboxState)this.setWriteBoxState();
      if(this.roomcreatorState)this.setRoomCreatorState(); 
      if(!this.sidebarState)this.setSidebarState(); 
      if(this.profileeditorState)this.setProfileEditorState();
        
    } // end userBtnClick function
    public roomSelectedToChat:any=(id,name)=>{
      console.log("setting room as active") // setting that room to chatting true 
      this.userList.map((user)=>{
        (user.userId==this.receiverId)?user.chatting=false:'';
      })
        this.messageList = [];
        this.pageValue = 0;
        this.roomJoined=false; this.previousChat=false;this.roomLeave=false;this.roomModel='';
        for(let x in this.roomsList){
            if(this.roomsList[x].roomId==id){
              this.roomsList[x].members.forEach(member => {
                if(this.userInfo.userId==member){          
                  this.roomJoined=true;this.previousChat=true;this.roomLeave=true;
                  Cookie.set('receiverId', id);
                  Cookie.set('receiverName', name);
                  this.receiverName = name;
                  this.receiverId = id;
                  this.getPreviousChatWithinARoom();               
                }
              });
              this.roomsList[x].chatting=true;this.room=true;
              this.roomModel=this.roomsList[x];this.roomModel.userName=this.userInfo.firstName+' '+this.userInfo.lastName; 
              if(this.roomsList[x].state==='active'){
                if(!this.contentState)this.setContentState();
                if(this.roomcreatorState)this.setRoomCreatorState(); 
                if(!this.sidebarState)this.setSidebarState(); 
              }else {
                this.onRoomCreatorView('update');
                this.toastr.error('Room is inactive. Change state to active.')
              }
            }
            this.roomsList[x].chatting=false;
        }                 
      
      Cookie.set('receiverId', id);
      Cookie.set('receiverName', name);
      this.receiverName = name;
      this.receiverId = id;
      this.removeUserState=false;
      if(!this.chatboxState)this.setChatBoxState();
      if(!this.writeboxState)this.setWriteBoxState();
      if(this.profileeditorState)this.setProfileEditorState(); 
    } //end room selected
    public getPreviousChatWithAUser:any=()=>{
      let previousData = (this.messageList.length > 0 ? this.messageList.slice() : []);
      
      this.socketService.getChat(this.userInfo.userId, this.receiverId, this.pageValue * 10)
      .subscribe((apiResponse) => { 
  
        if (apiResponse.status == 200) {
          this.messageList = apiResponse.data.concat(previousData);
        } else {
          this.messageList = previousData;
          this.toastr.warning('No Messages available')      
        }
        this.loadingPreviousChat = false;
      },(err) => {
        this.toastr.error('some error occured')
      });
  
    } // end get previous chat with any user
    public getPreviousChatWithinARoom:any=()=>{
      let previousData = (this.messageList.length > 0 ? this.messageList.slice() : []);
      
      this.socketService.getChatforRoom(this.receiverId, this.pageValue * 10)
      .subscribe((apiResponse) => { 
  
        if (apiResponse.status == 200) {
          this.messageList = apiResponse.data.concat(previousData);
        } else {
          this.messageList = previousData;
          this.toastr.warning('No Messages available')      
        }
        this.loadingPreviousChat = false;
      },(err) => {
        this.toastr.error('some error occured')
      });
    } // end get previous chat within a room
    public loadEarlierPageOfChat:any=()=>{
  
      this.loadingPreviousChat = true;
  
      this.pageValue++;
      this.scrollToChatTop = true;
  
      this.getPreviousChatWithAUser() 
  
    } // end loadPreviousChat
    public unseenChats=(senderId)=>{
      this.socketService.noOfUnseenChat({userId:this.userInfo.userId,senderId:senderId}).subscribe((data)=>{
        if(data!='' && data !=null && data!=undefined){
          this.userList.forEach(user => {
              if(senderId==user.userId)
                user.unread=data.data;
              else 
              user.unread=0;
            });
        }
      });
    }
    public markChatAsSeen(id){
      this.socketService.markChatAsSeen({userId: this.userInfo.userId,senderId: id}).subscribe(
        (data)=>{ })
    }

    //user actions on chat window
    public sendMessageUsingKeypress:any=(event:any)=>{
    if (event.keyCode === 13) { // 13 is keycode of enter.
      this.sendMessage();
    }

    } // end sendMessageUsingKeypress
    public onTyping=()=>{
      this.socketService.onTyping().subscribe((data)=>{
        this.typingUserName=data.userName;
        setTimeout(() => {
          this.typingUserName='';
        }, 1500); 
      })
    } //listener for room typing
    public typing=()=>{
    this.socketService.typing({
      receiverId:this.receiverId,
      userName:this.userInfo.firstName+' '+this.userInfo.lastName,
      req:(this.room)?'room':'user',
    })
    }//end typing
    public sendMessage:any=()=>{
    if(this.messageText){
      let chatMsgObject:chatMessage = {
        senderName: this.userInfo.firstName + " " + this.userInfo.lastName,
        senderId: this.userInfo.userId,
        receiverName: Cookie.get('receiverName'),
        receiverId: Cookie.get('receiverId'),
        message: this.messageText,
        createdOn: new Date(),
        modifiedOn:new Date(),
        chatRoom:this.room,
        seen:false
      } // end chatMsgObject
      this.socketService.SendChatMessage(chatMsgObject)
      this.pushToChatWindow(chatMsgObject)
    }
    else{
      this.toastr.warning('text message can not be empty')
    }
    } // end sendMessage
    public pushToChatWindow:any=(data)=>{

    this.messageText="";
    this.messageList.push(data);
    this.scrollToChatTop = false;


    }// end push to chat window

    //listeners on user and room
    public getMessageFromAUser:any=()=>{
      this.socketService.myIOUserId(this.userInfo.userId)
      .subscribe((data)=>{ 
        if(data.senderName){
        (this.receiverId==data.senderId)?this.messageList.push(data):'';
        this.toastr.success(`${data.senderName} says : ${data.message}`)
        this.scrollToChatTop=false;
        this.unseenChats(data.senderId);
        }else if(data.req==="kick"){
          this.socketService.onLeaveRoom(data)
          this.setContentState();
          this.setSidebarState();
        }else if(data.req==="user"){
          this.typingUserName=' ';
          setTimeout(() => {
            this.typingUserName='';
          }, 1500); 
        }else{
          this.toastr.success(data);
          console.log(data);
        }
      });//end subscribe

    }// end get message from a user
  
    public getMessageFromARoom:any=()=>{
    this.socketService.roomMessage().subscribe((data)=>{
      if(data.senderName){
      this.messageList.push(data)
      this.toastr.success(`${data.senderName} says :${data.message} in ${data.receiverName}`)
      this.scrollToChatTop=false;
      }else{
        this.toastr.success(data);
      }
    })
    } 
  
  //room related operations
  public onDeleteRoom=()=>{
    this.socketService.onDeleteRoom().subscribe((data)=>{
      data.userId=this.userInfo.userId;
      data.req="delete";
      this.socketService.onLeaveRoom(data)
    })
  }
  public onSetUpdate=()=>{
    this.socketService.setUpdate().subscribe((data)=>{
      this.socketService.updateList();
    })
  }
  public onJoinRoom=()=>{
    this.socketService.onJoinRoom({
      userId:this.userInfo.userId,
      userName:`${this.userInfo.firstName} ${this.userInfo.lastName}`,
      roomId:this.receiverId,
      roomName:this.receiverName,
      req:'join'
    });
    this.previousChat=true;
    this.roomJoined=true;this.roomLeave=true;
    this.getPreviousChatWithinARoom();
  }
  public onLeaveRoom=()=>{
    this.socketService.onLeaveRoom({
      userId:this.userInfo.userId,
      userName:this.userInfo.firstName+' '+this.userInfo.lastName,
      roomId:this.receiverId,
      roomName:this.receiverName,
      req:"leave"
    }); 
    this.setContentState();
    this.setSidebarState();
  }
  public onAction=(action)=>{
    this.action=action;          
    this.membersList=[];
    if(action=='kick'){
    for(let x in this.roomsList){
      if(this.roomsList[x].roomId==this.receiverId){
        this.roomsList[x].members.forEach(member => {
          this.userList.forEach(user => {
            if(user.userId==member)this.membersList.push({name:user.name,userId:user.userId})
          });
        });
      }
    }
    }else if(action=='invite'){
      for(let x in this.roomsList){
        if(this.roomsList[x].roomId==this.receiverId){
          this.roomsList[x].members.forEach(member => {
            this.userList.forEach(user => {
              if(user.userId!=member)this.membersList.push({name:user.name,userId:user.userId})
            });
          });
        }
      }
    }
    this.removeUserState=true;
    if(this.chatboxState)this.setChatBoxState();
    if(this.writeboxState)this.setWriteBoxState();
  }

  public FromRoom=(action)=>{
    if(action=='kick'){
      if(this.chosenMemberList.length!=0){
        this.chosenMemberList.forEach(member => {
          for(let x in this.membersList){
            if(this.membersList[x].name==member){
              this.socketService.kickUser({
                userId:this.membersList[x].userId,
                userName:this.membersList[x].name,
                roomId:this.receiverId,
                roomName:this.receiverName,
                req:"kick"})
            }
          }
        });
      }else
      this.toastr.warning('Choose Members to Kick.')
    }else if(action=='invite'){
      if(this.chosenMemberList.length!=0){
        let invitedMembers=[];
        this.chosenMemberList.forEach(member => {
          for(let x in this.membersList){
            if(this.membersList[x].name==member){
             invitedMembers.push(this.membersList[x].userId)
            }
          }
        });
        this.appService.sendInvites({
          senderId:this.userInfo.userId,
          senderName:this.userInfo.firstName+' '+this.userInfo.lastName,
          roomId:this.receiverId,
          roomName:this.receiverName,
          members:invitedMembers
        }).subscribe((apiResponse)=>{
          if (apiResponse.status === 200) {
            this.toastr.success('Invites sent.');
          } else {
            this.toastr.error(apiResponse.message);
          }
        },(err)=>{
          this.toastr.error('some error occured');
        })
      }else
      this.toastr.warning('Choose Members to Kick.')
    }
    if(!this.chatboxState)this.setChatBoxState();
    if(!this.writeboxState)this.setWriteBoxState();
    this.removeUserState=false;
  }

    //DOM States Changing functions
    public showUserName=(name:string)=>{
      this.toastr.success("You are Chatting with "+name);
    }
    public setSidebarState=()=>{
      (this.sidebarState)?this.sidebarState=false:this.sidebarState=true;
    }
    public setChatBoxState=()=>{
      (this.chatboxState)?this.chatboxState=false:this.chatboxState=true;
    }
    public setWriteBoxState=()=>{
      (this.writeboxState)?this.writeboxState=false:this.writeboxState=true;     
    }
    public setNavBarState=()=>{
      (this.navbarState)?this.navbarState=false:this.navbarState=true;
    }
    public setProfileEditorState=()=>{
      (this.profileeditorState)?this.profileeditorState=false:this.profileeditorState=true;
    }
    public setContentState=()=>{
      (this.contentState)?this.contentState=false:this.contentState=true;
    }
    public setRoomCreatorState=()=>{
      (this.roomcreatorState)?this.roomcreatorState=false:this.roomcreatorState=true;
    }
    public onProfileView=()=>{
      this.setSidebarState();this.setProfileEditorState();
      if(this.roomcreatorState)this.setRoomCreatorState();
      if(this.contentState)this.setContentState();
    }
    public backToList=()=>{
      let flag:boolean=false;
      this.setContentState();this.setSidebarState();
      if(!this.chatboxState)this.setChatBoxState();
      if(!this.writeboxState)this.setWriteBoxState();
      this.removeUserState=false;
      this.roomsList.map((room)=>{
        if(room.roomId==this.receiverId){
          room.chatting=false;flag=true;room.unread=0;
        }
      })
      if(!flag){
      this.userList.map((user)=>{
        if(user.userId==this.receiverId){
          user.chatting=false;user.unread=0;
        }
      })}
    }
    public back=(message:string)=>{
      this.setSidebarState();
      this.setRoomCreatorState();
      
      if(message!='')
      this.toastr.success(message);
    }
    public showWarning=(message:string)=>{
      this.toastr.warning(message);
    }
    public checkContent=()=>{
      if((this.contentState!=true) && (this.profileeditorState!=true) && (this.roomcreatorState!=true))
      return true 
      else 
      return false
    }
    public onRoomCreatorView=(message)=>{
      if((message=='create')||(message=='delete')||(message=='update' && (this.room))){
      this.roomAction=message;
      if(this.contentState)this.setContentState();
      if(this.profileeditorState)this.setProfileEditorState();
      if(!this.sidebarState)this.setSidebarState();
      if(!this.roomcreatorState)this.setRoomCreatorState();
      this.removeUserState=false;
      }
    }
}
