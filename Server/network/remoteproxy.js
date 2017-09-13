let server = require('dgt-net').server;
//let db = require('./database-control');
let packet = require('./packet');
let monitor = require('../server').monitor;
let db = require("../server").db;
//let world = require('./index').world;
let clientCount = 0;
let account = [];
let error = {
  100: "Account already exits",
  101: "Account not found",
  102: "Account data not found"
};
// What to do on Server-side
class RemoteProxy extends server.RemoteProxy {

  initProperties() {
    this.accountKey = "";
    this.userdata = undefined;
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

  async registerAccount(username, password, email, gender) {
    db.addAccount(username, password, email, gender).then((err, res) => {
      if (err) {
        monitor.log("Register failed : " + err);
        this.send(packet.make_register_failed());
        return;
      } else {
        monitor.log("Registing success for Username ['" + username + "']")
        this.send(packet.make_register_success());
        return;
      }
    }, (err) => {
      monitor.log("Error while registing account " + err);
    });
    // monitor.log(username);
    // monitor.log(password);
    // monitor.log(email);
    // monitor.log(gender);
  }

  async authentication(username, password) {
    monitor.debug('Client [' + this.getPeerName() + ']  request authentication')
    if (db) {
      this.userdata = await db.doLogin(username, password);
      if (this.userdata) {
        monitor.debug('Client access grant [ login as : \'' + username + '\']');
        // monitor.log(JSON.stringify(this.userdata));
        this.send(packet.make_authentication_grant());
        this.send(packet.make_account_data(this.userdata));
      } else {
        monitor.debug('Client access denied [try to login as : \'' + username + '\']');
        this.send(packet.make_authentication_denied(102, error[102]));
      }
    } else
      monitor.log("Error : No DB :(");
  }

  async checkCharacterName(characterName) {
    if (!await db.isCharacterNameExist(characterName)) {
      monitor.debug("Name '" + characterName + "' is available ");
      this.send(packet.make_character_name_available());
      
    } else {
      monitor.debug("Name '" + characterName + "' is already exist. ");
      this.send(packet.make_character_name_already_used());
    }
  }
        
  async createCharacter(name, gender, job) {
    let data = {
      Name: name,
      Status: {
        Gender: gender,
        Job: job,
        Level: 1,
        EXP: 0,
        HP: 100,
        SP: 50,
        MaxHP: 100,
        MaxSP: 50,
        ATK: 20,
        DEF: 5,
        Equipment: {
          Head: 1111,
          Body: 2222,
          Weapon: 3333
        }
      },
      Location : {
        Map:"Bangkok",
        X:0,
        Y:0,
      },
      Inventory : {
        Gold : 100,
        Items : []
      }
    };    
    let result = await db.createCharacter(this.userdata._id, data);
    if(result){
      monitor.debug("Characterd created");
      this.send(packet.make_character_create_success(result));
    } else {
      monitor.debug("Failed to create character");
      this.send(packet.make_character_create_failed());
    }
  }

  updateAccountData(color, highest_level, highest_checkpoint) {
    // db.setAccountData({"target":{"uid":this.uid},
    // "data":{"color":color,"highest_level":highest_level,"highest_checkpoint":highest_checkpoint}},(result)=>{
    //   if(result.affectedRows >0){
    //     monitor.debug("Update account data for UID "+this.uid+" success");
    //   }
    // })
  }

  playerEnterWorld(position, color) {
    // this.position = position;
    // this.color = color;  //-----
    // monitor.log("UID : "+this.uid+" has enter world");
    // world.addRemote(this);
  }

  playerExitWorld() {
    // monitor.log("UID : "+this.uid+" has exit from world");
    // world.removeRemote(this);
  }
  playerControl(movement) {
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

  submitPlayerData(data) {
    //console.log("RemoteProxy send player data");
    this.position = data.position;
    // world.addPlayerDataToQueue(data);
  }
}
function countClient() {
  return clientCount;
}
module.exports = { RemoteProxy: RemoteProxy, countClient: countClient/*, db:db*/ }
