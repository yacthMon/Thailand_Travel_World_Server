let server = require('dgt-net').server;
let packet = require('./packet');
let monitor = require('../server').monitor;
let db = require("../server").db;
let world = require('../server').world;
let monsterController = require('../server').monsterController;
let clientCount = 0;
let account = [];
let error = {
  100: "Username already exist.",
  101: "Invalid username or password.",
  102: "Account data not found."
};
// What to do on Server-side
class RemoteProxy extends server.RemoteProxy {

  initProperties() {
    this.accountKey = "";
    this.userdata = undefined;
    this.character = undefined;// Character that was choose by player
    this.responseData = undefined;// response data for send to other player
    this.inWorld = false;
    //=== Facebook
    this.facebookId = undefined;
    this.facebookToken = undefined;
    /* Response data 
            uid : user id,        
            location : position(x,y) & currentMap,
            HP : health point,
            SP : Stamina point,
            Level : level,
            Equipment : Head & Weapon & Body
            */
    // static
    // characterName : character name, Job : job,
  }

  onConnected() {
    monitor.log("[RemoteProxy] There is a connection from " + this.getPeerName())
    clientCount++;
    this.initProperties();
  }

  onDisconnected() {
    if (this.inWorld) {
      world.removeRemote(this);
    }
    if (this.character) {
      this.updateCharacterData(this.character);
    }
    monitor.log("[RemoteProxy] Disconnected from " + this.getPeerName())
    clientCount--;
  }

  ping() {
    this.send(packet.make_ping_success())
  }

  async registerAccount(username, password, email, gender) {
    db.addAccount(username, password, email, gender).then((err, res) => {
      if (err) {
        monitor.log("Register failed : " + err);
        this.send(packet.make_register_failed(err, error[err]));
        return;
      } else {
        monitor.log("Registing success for Username ['" + username + "']")
        this.send(packet.make_register_success(username));
        return;
      }
    }, (err) => {
      monitor.log("Error while registing account " + err);
      this.send(packet.make_register_failed(0, err));
    });
  }

  async authentication(username, password) {
    monitor.debug('Client [' + this.getPeerName() + ']  request authentication')
    if (db) {
      let loginResult = await db.doLogin(username, password);
      if (loginResult) {
        if (typeof (loginResult) === "number") {
          monitor.debug('Client access denied [try to login as \'' + username + '\']');
          this.send(packet.make_authentication_denied(loginResult, error[loginResult]));
        } else {
          monitor.debug('Client access grant [ login as : \'' + username + '\']');
          // monitor.log(JSON.stringify(loginResult));
          this.userdata = loginResult;
          this.send(packet.make_authentication_grant());
          this.send(packet.make_account_data(loginResult));
        }
      } else {
        monitor.debug('Client access denied [try to login as not exist username \'' + username + '\']');
        this.send(packet.make_authentication_denied(102, error[102]));
      }
    } else
      monitor.log("Error : No DB :(");
  }

  async authenticationWithFacebook(fbid, token) {
    monitor.debug('Client [' + this.getPeerName() + ']  request authentication with facebook')
    this.facebookId = fbid;
    this.facebookToken = token;
    if (db) {
      let loginResult = await db.doLoginWithFacebook(fbid, token);
      if (loginResult) {
        if (typeof (loginResult) === "number") {
          monitor.debug('Client access denied [try to with facebook \'' + fbid + '\']');
          this.send(packet.make_authentication_denied(loginResult, error[loginResult]));
        } else {
          monitor.debug('Client access grant [ login as facebook : \'' + fbid + '\']');
          // monitor.log(JSON.stringify(loginResult));
          this.userdata = loginResult;
          this.send(packet.make_authentication_grant());
          this.send(packet.make_account_data(loginResult));
        }
      } else {
        monitor.debug('Client access denied [try to login as not exist facebook account \'' + fbid + '\']');
        this.send(packet.make_facebook_request_register());
      }
    } else
      monitor.log("Error : No DB :(");
  }

  async registerFacebookData(email, gender) {
    db.addFacebookAccount(this.facebookId, this.facebookToken, email, gender).then((err, res) => {
      if (err) {
        monitor.log("Register with Facebook failed : " + err);
        this.send(packet.make_register_failed(err, error[err]));
        return;
      } else {
        monitor.log("Registing with Facebook success for email ['" + email + "']")
        this.authenticationWithFacebook(this.facebookId, this.facebookToken);
        return;
      }
    }, (err) => {
      monitor.log("Error while registing account " + err);
      this.send(packet.make_register_failed(0, err));
    });
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
        MaxEXP: 150,
        HP: 100,
        MaxHP: 100,
        SP: 50,
        MaxSP: 50,
        ATK: 20,
        DEF: 5,
        Equipment: {
          Head: 0,
          Body: 1,
          Weapon: 1
        }
      },
      Location: {
        Position: { x: 0, y: 0 },
        Map: "Bangkok",
      },
      Inventory: {
        Gold: 100,
        Items: []
      }
    };
    let result = await db.createCharacter(this.userdata._id, data);
    if (result) {
      monitor.debug("Characterd created");
      this.userdata.Characters.push(data);
      this.send(packet.make_character_create_success(result));
    } else {
      monitor.debug("Failed to create character");
      this.send(packet.make_character_create_failed());
    }
  }

  async updateCharacterData(character) {
    let result = await db.updateCharacterData(this.character);
    monitor.debug("Update character \"" + character.Name + "\" of User ID : " + this.userdata._id +
      (result ? "[{green-fg}OK{/green-fg}]" : "[{red-fg}FAILED{/red-fg}]"));

  }

  playerEnterWorld(characterName) {
    /* Response data 
        UID : user id,        
        Location : Position(x,y) & Map,
        HP : health point,
        SP : Stamina point,
        Level : level,
        Equipment : Head & Weapon & Body
        */
    // static
    // characterName : character name, Job : job,
    monitor.debug("Character enter world \"" + characterName + "\"");
    let characterIndex = this.userdata.Characters.findIndex((character) => { return character.Name == characterName });
    if (characterIndex > -1) {
      this.character = this.userdata.Characters[characterIndex]; // set choosed character
      this.responseData = {
        UID: this.userdata._id,
        Location: this.character.Location,
        HP: this.character.Status.HP,
        SP: this.character.Status.SP,
        Level: this.character.Status.Level,
        Equipment: this.character.Status.Equipment
      }
      this.inWorld = true;
      world.addRemote(this);
      this.send(packet.make_multiplayer_enter_world_grant());
    } else {
      //Something wrong :( Can't find character that player choosed
      this.send(packet.make_multiplayer_enter_world_denied());
    }
  }

  playerChangeMap(mapName, position) {
    world.removeRemote(this);
    monitor.debug("ID : " + this.userdata._id + " change map form " + this.character.Location.Map + " to " + mapName);
    this.character.Location.Map = mapName;
    this.character.Location.Position = position;
    world.addRemote(this);
  }

  playerExitWorld() {
    monitor.log("UID : " + this.userdata._id + " has exit from world");
    this.inWorld = false;
    world.removeRemote(this);
  }

  submitPlayerControlData(data) {
    //console.log("RemoteProxy send player data");
    this.character.Location.Position = data.Position;
    data.Map = this.character.Location.Map;
    world.addPlayerDataToQueue(data);
  }

  updateCharacterStatus(status) {
    // Add other status that not exist in status parameter
    status.Gender = this.character.Status.Gender;
    status.Job = this.character.Status.Job;
    status.Equipment = this.character.Status.Equipment;
    // Overwrite character status with status parameter
    this.character.Status = status;
    if(status.HP <=0){// Oh no player die :(
      monsterController.clearMonsterAngryTo(this.userdata._id);
    }
  }
  // --------- Inventory
  addItemToInventory(itemId, amount) {
    this.character.Inventory.Items.push({ ItemId: itemId, Amount: amount });
  }

  increaseItemInventory(itemId, amount) {
    let indexOfItem = this.character.Inventory.Items.findIndex((item) => { return item.ItemId == itemId });
    if (indexOfItem > -1) {
      this.character.Inventory.Items[indexOfItem].Amount += amount;
    }
  }

  decreaseItemInventory(itemId, amount) {
    let indexOfItem = this.character.Inventory.Items.findIndex((item) => { return item.ItemId == itemId });
    if (indexOfItem > -1) {
      this.character.Inventory.Items[indexOfItem].Amount -= amount;
    }
  }

  removeItemFromInventory(itemId, amount) {
    let indexOfItem = this.character.Inventory.Items.findIndex((item) => { return item.ItemId == itemId });
    if (indexOfItem > -1) {
      this.character.Inventory.Items.splice(indexOfItem, 1);
    }
  }
  // --------- Inventory
  // --------- Monster
  attackMonster(IDmonster, knockback) {
    let monster = monsterController.getMonsterById(IDmonster);
    if (monster) {
      monster.hurt(this.userdata._id, this.character.Status.ATK, knockback);
    }
  }
  // --------- Monster

  chat(msg) {
    console.log('RemoteProxy chat: ' + msg)
    // world.broadcast(packet.make_chat(msg))
  }

  notification(notic) {
    console.log('RemoteProxy notification : ' + notic)
    // world.broadcast(packet.make_notification(notic))
  }


}
function countClient() {
  return clientCount;
}
module.exports = { RemoteProxy: RemoteProxy, countClient: countClient/*, db:db*/ }
