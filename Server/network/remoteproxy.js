let server = require('dgt-net').server;
//let db = require('./database-control');
let packet = require('./packet');
let monitor = require('../server').monitor;
let db = require("../server").db;
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
    this.username = "";
    this.id = 0;        
  }

  onConnected() {
    monitor.log("[RemoteProxy] There is a connection from " + this.getPeerName())
    clientCount++;
    this.initProperties();
  }

  onDisconnected() {
    monitor.log("[RemoteProxy] Disconnected from " + this.getPeerName())
    clientCount--;
  }

  ping() {
    // monitor.log('[RemoteProxy] ping: ' + pingTime)
    this.send(packet.make_ping_success())
  }

  async registerAccount(username, password,email,gender){
      db.addAccount(username,password,email,gender).then((err,res)=>{
        if(err){
          monitor.log("Register failed : " + err);           
          this.send(packet.make_register_failed());
          return;
        }else{
          monitor.log("Registing success for Username ['" + username +"']" )
          this.send(packet.make_register_success());
          return;
        }        
      },(err)=>{
        monitor.log("Error while registing account " + err);
      });
      // monitor.log(username);
      // monitor.log(password);
      // monitor.log(email);
      // monitor.log(gender);
  }

  async authentication(username,password) {
    monitor.debug('Client request authentication')
    if(db)
    if(await db.doLogin(username,password)){
      monitor.debug('Client access grant [ login as : \'' + username +'\']');
      this.username = username;
      this.send(packet.make_authentication_grant());
    } else {
      monitor.debug('Client access denied [try to login as : \''+ username +'\']');
      this.send(packet.make_authentication_denied(102,error[102]));
    }
    else
      monitor.log("No DB :(");
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
