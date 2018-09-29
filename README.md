# Group Chat Application

This project allows any user to chat with the currently online registered users in this app. Anyone can create rooms, can add & send invitations to online users to join room. All the notifications are sent in realtime.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Links

  1.)APP URL : http://chat.app.opsaini.com <br/>
	2.)API URL : http://chat-api.app.opsaini.com <br/>
	3.)Documentation : http://chat-api.app.opsaini.com/documentation.html/ <br/>
	5.)Github (Backend) URL : https://github.com/o-p-s/todo-backend/ <br/>
	6.)Github (Frontend) URL : https://github.com/o-p-s/realtime-todo/ <br/>
  
## Features

1.) User management - <br/>
	  Login, signup and forgot password functionality. Used nodemailer module for sending out emails such as password forgot and reset email. <br/><br/>

2.) Chat rooms management - <br/>
	  Any User can create a chat room. He can also delete a chat room, mark it as closed(inactive) and perform basic edits such as changing the 
    title of the chat room. When the chatroom is marked inactive, user have to mark active to use it. <br/><br/>

3.) Join chat rooms - <br/>
	  There are two ways to join a chat room - <br/>
	    a) Via invite link - If a particular user clicks the invite link sent by another email, he will be redirected to that the chat room 
          where he can join. <br/>
	    b) Via list of active chat rooms - A list of all rooms is displayed to the user. When user clicks a chat room, he should see an option 
          to join the room. Once he clicks on that join button, he should be added to that chat room. No permission is required to join a 
          chat room. Anyone can join any active chat room. <br/>
      All the users in chat room are informed when a new user joins/leaves the room. <br/><br/>

4.) Message in the chat room - <br/>
	  User is able to chat with other users of chat room in realtime. "userName is typing" just next to the title of the room gets displayed 
    whenever any user is currently typing a message and the user is be able to view all the previous chat in that room. <br/><br/>

5.) Kick from Chat room - <br/>
	  Any member of that chatroom can kick or remove other memebrs in that chatroom.(Kick button is available on navbar) <br/><br/>

6.) Sending Invites - <br/>
	  User can send invites to multiple users to join the chatroom.(Invite button is available on navbar) <br/><br/>

7.) Profile View - <br/>
	  When clicked on profile pic, user is redirected to his profile update page. But that's not working, as application has only database   linked. No storage available. <br/><br/>

8.) Sidebar - <br/>
	  Displays list of online users and all rooms. <br/> <br/>

9.) Chat Window - <br/>
	  User can only send Text Messages(No smileys, No media, No attachments) <br/><br/>

10.) User can reset his pasword using forgot password option available at signIn. User is sent a reset link to his registered email id and 
      which redirects to reset page. On Confirmation user receives email for password successfully resest. 
