export interface chatMessage{
    chatId?:String;
    senderId:String;
    receiverId:String;
    senderName:String;
    receiverName:String;
    message:String;
    createdOn:Date;
    modifiedOn:Date;
    seen:boolean;
    chatRoom:Boolean;
}