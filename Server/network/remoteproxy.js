let server = require('dgt-net').server;
//let db = require('./database-control');
let packet = require('./packet');
let monitor = require('../server').monitor;
//let world = require('./index').world;
let clientCount=0;
let account = [];
let error = {100:"Account already exits",
          101:"Account not found",
          102:"Account data not found"};
// What to do on Server-side
class RemoteProxy extends server.RemoteProxy {

  initProperties(){
    this.accountKey = "";
    this.uid = 0;
    this.name = "";
    this.position = {x:0,y:0};
    this.point = 0;
    this.floor = 1;
    this.color = 1;
    this.receiveList = []; // stored UID only
  }

  onConnected() {
    monitor.log("RemoteProxy There is a connection from " + this.getPeerName())
    clientCount++;
    this.initProperties();
  }

  onDisconnected() {
    monitor.log("RemoteProxy Disconnected from " + this.getPeerName())
    clientCount--;
  }

  ping(pingTime) {
    monitor.log('RemoteProxy ping: ' + pingTime)
    this.send(packet.make_ping_success(pingTime))
  }

  registerAccount(accountKey, name){
      // this.uid = account.length;
      // account[this.uid] = accountKey;

      // db.registerAccount(accountKey,(result)=>{
      //     if(result.affectedRows == 1){
      //     this.uid = result.insertId;
      //     monitor.debug("New Account for this user");
      //     monitor.debug('Account Key  : ' + this.accountKey);
      //     monitor.debug('Name : ' + this.name);
      //     monitor.debug('UID : ' + this.uid);
      //     monitor.log(this.getPeerName() + " has register as UID " + this.uid);
      //     this.send(packet.make_register_success(this.uid,1,1,1)); //color,level,checkpoint
      //     return;
      //   } else {
      //     this.send(packet.make_register_failed(0,"unknow error"));
      //     return;
      //   }
      // })
  }

  authentication(accountKey,name) {
    // monitor.debug('Client request authentication')
    // this.name = name;
    // this.accountKey = accountKey;
    //
    // db.getAccount({"accountKey":accountKey}, (account)=>{
    //   if(account[0]){ // if found acount
    //     this.uid = account[0].UID;
    //     monitor.debug('Found Account for this user');
    //     monitor.debug('Account Key  : ' + this.accountKey);
    //     monitor.debug('Name : ' + this.name);
    //     monitor.debug('UID : ' + this.uid);
    //     monitor.log(this.getPeerName() + " has login as UID " + this.uid);
    //     db.getAccountData({uid:this.uid}, (rows)=>{
    //       monitor.debug("Account data for UID : " + this.uid);
    //       monitor.debug("Color              : " + rows[0].color);
    //       monitor.debug("Highest Level      : " + rows[0].highest_level);
    //       monitor.debug("Highest Checkpoint : " + rows[0].highest_checkpoint);
    //       if(rows[0]){
    //         this.send(packet.make_authentication_grant(this.uid,rows[0].color,rows[0].highest_level,rows[0].highest_checkpoint))
    //         return;
    //       } else {
    //         this.send(packet.make_authentication_denied(102,error[102]));
    //       }
    //     });
    //   } else { // if account not found then register account
    //     this.registerAccount(accountKey, name);
    //     return;
    //   }
    // })
  }

  updateAccountData(color, highest_level, highest_checkpoint){
    // db.setAccountData({"target":{"uid":this.uid},
    // "data":{"color":color,"highest_level":highest_level,"highest_checkpoint":highest_checkpoint}},(result)=>{
    //   if(result.affectedRows >0){
    //     monitor.debug("Update account data for UID "+this.uid+" success");
    //   }
    // })
  }

  playerEnterWorld(position, color){
    // this.position = position;
    // this.color = color;  //-----
    // monitor.log("UID : "+this.uid+" has enter world");
    // world.addRemote(this);
  }

  playerExitWorld(){
    // monitor.log("UID : "+this.uid+" has exit from world");
    // world.removeRemote(this);
  }
  playerControl(movement){
    // world.broadcast(packet.make_playercontrol(movement))
  }

  chat(msg) {
    console.log('RemoteProxy chat: ' + msg)
    // world.broadcast(packet.make_chat(msg))
  }

  notification(notic) {
    console.log('RemoteProxy notification : ' + notic)
    // world.broadcast(packet.make_notification(notic))
  }

  submitPlayerData(data){
    //console.log("RemoteProxy send player data");
    this.position = data.position;
    // world.addPlayerDataToQueue(data);
  }
}
function countClient(){
  return clientCount;
}
module.exports = {RemoteProxy:RemoteProxy, countClient:countClient/*, db:db*/}
