let packet_writer = require('dgt-net').packet_writer

let animationId = {
  IDLE: 1,
  WALK: 2,
  HURT: 3,
  ATTACK: 4,
  JUMP: 5,
  FALL: 6,
  DIE: 7,
  DIE_LOOP: 8
}

let packet = {

  ////////////////////////////////////////////////////////////////////////////////
  // Client to Server
  ////////////////////////////////////////////////////////////////////////////////
  CS_CONNECTION: 10001,
  CS_PING: 10002,
  /* 11xxx for Account Access */
  CS_REGISTER: 11010,
  CS_AUTHENTICATION: 11011,
  CS_UPDATE_ACCOUNTDATA: 11012,
  CS_CHECK_CHARACTER_NAME: 11013,
  CS_CREATE_CHARACTER: 11014,
  CS_AUTHENTICATION_WITH_FACEBOOK: 11015,
  CS_REGISTER_FACEBOOK_DATA: 11016,
  /* 12xxx for Online Realtime*/
  CS_REQUEST_ENTER_WORLD: 12020,
  CS_SEND_PLAYER_MOVING: 12021,
  CS_EXIT_WORLD: 12022,
  CS_PLAYER_CHANGE_MAP: 12023,
  CS_SEND_PLAYER_STATUS: 12024,
  CS_INVENTORY_ADD: 12025,
  CS_INVENTORY_INCREASE: 12026,
  CS_INVENTORY_DECREASE: 12027,
  CS_INVENTORY_REMOVE: 12028,
  CS_INVENTORY_UPDATE_MONEY: 12029,
  // Monster Part
  CS_SEND_MONSTER_HURT: 12201,
  //------- Quest Part
  CS_SEND_QUEST_ACCEPT: 12300,
  CS_SEND_QUEST_UPDATE: 12301,
  CS_SEND_QUEST_SUCCESS: 12302,
  // Checkin Part
  CS_SEND_CHECKIN: 12400,
  CS_CHAT: 12101,
  CS_NOTIFICATION: 12102,

  ////////////////////////////////////////////////////////////////////////////////
  // Server to Client
  ////////////////////////////////////////////////////////////////////////////////

  SC_ERROR: 20000,
  SC_CONNETION: 20001,
  SC_PING_SUCCESS: 20002,
  /* 21xxx for Account Access */
  SC_REGISTER_SUCCESS: 21010,
  SC_REGISTER_FAILED: 21011,
  SC_AUTHENTICATION_GRANT: 21012,
  SC_AUTHENTICATION_DENIED: 21013,
  SC_ACCOUN_DATA: 21014,
  SC_CHARACTER_NAME_AVAILABLE: 21015,
  SC_CHARACTER_NAME_ALREADY_USED: 21016,
  SC_CHARACTER_CREATE_SUCCESS: 21017,
  SC_CHARACTER_CREATE_FAILED: 21018,
  SC_FACEBOOK_REQUEST_REGISTER: 21019,
  /* 22xxx for Online Realtime*/
  SC_ONLINE_REALTIME_CONTROL: 22000,
  SC_MULTIPLAYER_PLAYERS_IN_WORLD: 22020,
  SC_MULTIPLAYER_ENTER_WORLD_GRANT: 22021,
  SC_MULTIPLAYER_ENTER_WORLD_DENIED: 22022,
  SC_ONLINE_PLAYER_CONNECT: 22023,
  SC_ONLINE_PLAYER_CONTROL: 22024,
  SC_ONLINE_PLAYER_DISCONNECT: 22025,
  //------- Monster Part
  SC_ONLINE_MONSTER_IN_WORLD: 22200,
  SC_ONLINE_MONSTER_SPAWN: 22201,
  SC_ONLINE_MONSTER_CONTROL: 22202,
  SC_ONLINE_MONSTER_ELIMINATE: 22203,
  SC_ONLINE_MONSTER_REWARD: 22204,
  //------- Community Part
  SC_CHAT: 22026,
  SC_NOTIFICATION: 22027,
};

////////////////////////////////////////////////////////////////////////////////
// Received Packets
////////////////////////////////////////////////////////////////////////////////

packet[packet.CS_CONNECTION] = function (remoteProxy, data) {
  if (!data.completed()) return true;

}

packet[packet.CS_PING] = function (remoteProxy, data) {
  if (!data.completed()) return true;
  remoteProxy.ping(pingTime);
}

packet[packet.CS_REGISTER] = function (remoteProxy, data) {
  let username = data.read_string();
  let password = data.read_string();
  let email = data.read_string();
  let gender = data.read_string();
  if (!data.completed()) return true;
  remoteProxy.registerAccount(username, password, email, gender);
}

packet[packet.CS_AUTHENTICATION] = function (remoteProxy, data) {
  let username = data.read_string();
  let password = data.read_string();
  if (!data.completed()) return true;
  remoteProxy.authentication(username, password);
}

packet[packet.CS_CHECK_CHARACTER_NAME] = function (remoteProxy, data) {
  let characterName = data.read_string();
  if (!data.completed()) return true;
  remoteProxy.checkCharacterName(characterName);
}

packet[packet.CS_UPDATE_ACCOUNTDATA] = function (remoteProxy, data) {
  let color = data.read_uint8();
  let highest_level = data.read_uint16();
  let highest_checkpoint = data.read_uint16();
  if (!data.completed()) return true;
  remoteProxy.updateAccountData(color, highest_level, highest_checkpoint);
}

packet[packet.CS_CREATE_CHARACTER] = function (remoteProxy, data) {
  let name = data.read_string();
  let gender = data.read_string();
  let job = data.read_string();
  let hair = data.read_string();
  if (!data.completed()) return true;
  remoteProxy.createCharacter(name, gender, job,hair);
}

packet[packet.CS_AUTHENTICATION_WITH_FACEBOOK] = function (remoteProxy, data) {
  let fbid = data.read_string();
  let token = data.read_string();
  if (!data.completed()) return true;
  remoteProxy.authenticationWithFacebook(fbid, token);
}

packet[packet.CS_REGISTER_FACEBOOK_DATA] = function (remoteProxy, data) {
  let email = data.read_string();
  let gender = data.read_string();
  if (!data.completed()) return true;
  remoteProxy.registerFacebookData(email, gender);
}

packet[packet.CS_SEND_PLAYER_MOVING] = function (remoteProxy, data) {
  let dataSet = {
    UID: data.read_uint32(),
    Position: { x: data.read_float(), y: data.read_float() },
    Velocity: { x: data.read_float(), y: data.read_float() },
    ScaleX: data.read_float(),
    Animation: data.read_uint8()
  }
  let characterData = {};
  if (!data.completed()) return true;
  remoteProxy.submitPlayerControlData(dataSet);
}

packet[packet.CS_REQUEST_ENTER_WORLD] = function (remoteProxy, data) {
  let characterName = data.read_string();
  if (!data.completed()) return true;
  remoteProxy.playerEnterWorld(characterName);
}

packet[packet.CS_PLAYER_CHANGE_MAP] = function (remoteProxy, data) {
  let mapName = data.read_string();
  let position = { x: data.read_float(), y: data.read_float() };
  if (!data.completed()) return true;
  remoteProxy.playerChangeMap(mapName, position);
}

packet[packet.CS_SEND_PLAYER_STATUS] = function (remoteProxy, data) {
  let status = {
    Level: data.read_uint8(),
    EXP: data.read_uint16(),
    MaxEXP: data.read_uint16(),
    HP: data.read_uint16(),
    MaxHP: data.read_uint16(),
    SP: data.read_uint16(),
    MaxSP: data.read_uint16(),
    ATK: data.read_uint16(),
    DEF: data.read_uint16()
  }
  if (!data.completed()) return true;
  remoteProxy.updateCharacterStatus(status);
}

packet[packet.CS_EXIT_WORLD] = (remoteProxy, data) => {
  remoteProxy.playerExitWorld();
}

packet[packet.CS_INVENTORY_ADD] = (remoteProxy, data) => {
  let itemId = data.read_uint32();
  let amount = data.read_uint16();
  remoteProxy.addItemToInventory(itemId, amount);
}

packet[packet.CS_INVENTORY_INCREASE] = (remoteProxy, data) => {
  let itemId = data.read_uint32();
  let amount = data.read_uint16();
  remoteProxy.increaseItemInventory(itemId, amount);
}

packet[packet.CS_INVENTORY_DECREASE] = (remoteProxy, data) => {
  let itemId = data.read_uint32();
  let amount = data.read_uint16();
  remoteProxy.decreaseItemInventory(itemId, amount);
}

packet[packet.CS_INVENTORY_REMOVE] = (remoteProxy, data) => {
  let itemId = data.read_uint32();
  remoteProxy.removeItemFromInventory(itemId);
}

packet[packet.CS_INVENTORY_UPDATE_MONEY] = (remoteProxy, data) => {
  let money = data.read_uint32();
  remoteProxy.updateMoney(money);
}

// Monster part
// 12201
packet[packet.CS_SEND_MONSTER_HURT] = (remoteProxy, data) => {
  let idMonster = data.read_uint32();
  let knockback = data.read_int8();
  remoteProxy.attackMonster(idMonster, knockback);
}

// Quest part
// 12300
packet[packet.CS_SEND_QUEST_ACCEPT] = (remoteProxy, data) => {
  let questID = data.read_uint16();  
  remoteProxy.acceptQuest(questID);
}
// 12301
packet[packet.CS_SEND_QUEST_UPDATE] = (remoteProxy, data) => {
  let questID = data.read_uint16();
  let currentTotal = data.read_uint16();
  remoteProxy.updateProcessQuest(questID, currentTotal);
}
// 12302
packet[packet.CS_SEND_QUEST_SUCCESS] = (remoteProxy, data) => {
  let questID = data.read_uint16();
  remoteProxy.successQuest(questID);
}
// 12400
packet[packet.CS_SEND_CHECKIN] = (remoteProxy, data) => {
  let placeID = data.read_uint8();
  let time = data.read_string();
  remoteProxy.checkin(placeID,time);
}

packet[packet.CS_CHAT] = function (remoteProxy, data) {
  let msg = data.read_string();
  if (!data.completed()) return true;

}

packet[packet.CS_NOTIFICATION] = function (remoteProxy, data) {
  let notification = data.read_string();
  if (!data.completed()) return true;
  ///remoteProxy.notification(notification);
}

////////////////////////////////////////////////////////////////////////////////
// Send Packets
////////////////////////////////////////////////////////////////////////////////

packet.make_error = function (msg) {
  let o = new packet_writer(packet.SC_ERROR);
  o.append_string(msg);
  o.finish();
  return o.buffer;
}

packet.make_connection = function (msg) {
  let o = new packet_writer(packet.SC_CONNETION);
  //o.append_string(msg);
  o.finish();
  return o.buffer;
}

packet.make_ping_success = function () {
  let o = new packet_writer(packet.SC_PING_SUCCESS);
  o.finish();
  return o.buffer;
}

packet.make_authentication_grant = function (uid, color, highest_level, highest_checkpoint) {
  let o = new packet_writer(packet.SC_AUTHENTICATION_GRANT);
  o.finish();
  return o.buffer;
}

packet.make_register_success = (username) => {
  let o = new packet_writer(packet.SC_REGISTER_SUCCESS);
  o.append_string(username);
  o.finish();
  return o.buffer;
}

packet.make_register_failed = (errCode, msg) => {
  let o = new packet_writer(packet.SC_REGISTER_FAILED);
  o.append_int8(errCode);
  o.append_string(msg);
  o.finish();
  return o.buffer;
}

packet.make_authentication_denied = (errCode, msg) => {
  let o = new packet_writer(packet.SC_AUTHENTICATION_DENIED);
  o.append_uint8(errCode);
  o.append_string(msg);
  o.finish()
  return o.buffer;
}

packet.make_facebook_request_register = (errCode, msg) => {
  let o = new packet_writer(packet.SC_FACEBOOK_REQUEST_REGISTER);
  o.finish()
  return o.buffer;
}

packet.make_account_data = (data) => {
  let o = new packet_writer(packet.SC_ACCOUN_DATA);
  o.append_int32(data._id); // accountID  
  if (data.Characters) {
    o.append_int8(data.Characters.length); // Length of Character
    for (let i = 0; i < data.Characters.length; i++) { // Append data for each character      
      let character = data.Characters[i];
      convertCharacterDataToPacketData(o, character);
    }
  } else {
    o.append_int8(0); // don't have any Character
  }
  o.finish();
  return o.buffer;
}

packet.make_character_name_available = () => {
  let o = new packet_writer(packet.SC_CHARACTER_NAME_AVAILABLE);
  o.finish();
  return o.buffer;
}

packet.make_character_name_already_used = function () {
  let o = new packet_writer(packet.SC_CHARACTER_NAME_ALREADY_USED);
  o.finish();
  return o.buffer;
}

packet.make_character_create_success = function (character) {
  let o = new packet_writer(packet.SC_CHARACTER_CREATE_SUCCESS);
  convertCharacterDataToPacketData(o, character);
  o.finish();
  return o.buffer;
}

packet.make_character_create_failed = function () {
  let o = new packet_writer(packet.SC_CHARACTER_CREATE_FAILED);
  o.finish();
  return o.buffer;
}

packet.make_multiplayer_enter_world_grant = function () {
  let o = new packet_writer(packet.SC_MULTIPLAYER_ENTER_WORLD_GRANT);
  o.finish();
  return o.buffer;
}

packet.make_multiplayer_enter_world_denied = function () {
  let o = new packet_writer(packet.SC_MULTIPLAYER_ENTER_WORLD_DENIED);
  o.finish();
  return o.buffer;
}

packet.make_multiplayer_connect = function (uid, character) {
  let o = new packet_writer(packet.SC_ONLINE_PLAYER_CONNECT);
  // get data from pure Character
  o.append_uint32(uid);
  o.append_string(character.Name);
  o.append_float(character.Location.Position.x);
  o.append_float(character.Location.Position.y);
  o.append_string(character.Status.Gender);
  o.append_string(character.Status.Job);
  o.append_uint32(character.Status.HP);
  o.append_uint32(character.Status.SP);
  o.append_uint32(character.Status.Level);
  o.append_string(character.Status.Equipment.Head);
  o.append_string(character.Status.Equipment.Body);
  o.append_string(character.Status.Equipment.Weapon);
  o.finish();
  return o.buffer;
}

packet.make_multiplayer_control = function (datas) {
  let o = new packet_writer(packet.SC_ONLINE_PLAYER_CONTROL);
  o.append_uint16(datas.length); //add length first to tell client before loop
  for (let i = 0; i < datas.length; i++) {
    // UID, Name, HP,SP,Job,Level,Equipment,Position only
    //current : uid, position, velocity, scaleX , animation
    o.append_uint32(datas[i].UID);
    o.append_float(datas[i].Position.x);
    o.append_float(datas[i].Position.y);
    o.append_float(datas[i].Velocity.x);
    o.append_float(datas[i].Velocity.y);
    o.append_float(datas[i].ScaleX);
    o.append_int8(datas[i].Animation);
  }
  o.finish(); //[Bug(5)]ทำงานก่อนที่ for จะเสร็จ ??
  return o.buffer;
}

packet.make_multiplayer_in_same_map = function (players) {
  let o = new packet_writer(packet.SC_MULTIPLAYER_PLAYERS_IN_WORLD);
  //get data from temp
  o.append_uint16(players.length);
  for (let i = 0; i < players.length; i++) {
    o.append_uint32(players[i].UID);
    o.append_string(players[i].CharacterName);
    o.append_float(players[i].Location.Position.x);
    o.append_float(players[i].Location.Position.y);
    o.append_string(players[i].Gender);
    o.append_string(players[i].Job);
    o.append_uint32(players[i].HP);
    o.append_uint32(players[i].SP);
    o.append_uint32(players[i].Level);
    o.append_string(players[i].Equipment.Head);
    o.append_string(players[i].Equipment.Body);
    o.append_string(players[i].Equipment.Weapon);
  }
  o.finish();
  return o.buffer;
}

packet.make_multiplayer_disconnect = function (uid) {
  let o = new packet_writer(packet.SC_ONLINE_PLAYER_DISCONNECT);
  o.append_uint32(uid);
  o.finish();
  return o.buffer;
}
//------------ Monster Part
packet.make_online_monster_in_world = (monsters) => {
  let o = new packet_writer(packet.SC_ONLINE_MONSTER_IN_WORLD);
  o.append_uint8(monsters.length);
  for (var i = 0; i < monsters.length; i++) {
    let monster = monsters[i];
    convertMonsterDataToPacketData(o,monster);
  }
  o.finish();
  return o.buffer;
}

packet.make_online_monster_spawn = (monster) => {
  let o = new packet_writer(packet.SC_ONLINE_MONSTER_SPAWN);
  convertMonsterDataToPacketData(o,monster);
  o.finish();
  return o.buffer;
}

packet.make_online_monster_control = (monsters) => { // not used
  let o = new packet_writer(packet.SC_ONLINE_MONSTER_CONTROL);
  o.append_uint8(monsters.length);
  for (var i = 0; i < monsters.length; i++) {
    let monster = monsters[i];
    o.append_uint32(monster.ID);
    o.append_uint32(monster.HP);
    o.append_float(monster.Position.x);
    o.append_float(monster.Position.y);
  }
  o.finish();
  return o.buffer;
}

packet.make_online_monster_eliminate = (monsterID, itemPool) => {
  let o = new packet_writer(packet.SC_ONLINE_MONSTER_ELIMINATE);
  o.append_uint32(monsterID);
  o.append_uint8(itemPool.length);
  itemPool.forEach((itemID) => {
    o.append_int32(itemID);
  })
  o.finish();
  return o.buffer;
}

packet.make_online_monster_reward = (monsterID, attackData) => {
  let o = new packet_writer(packet.SC_ONLINE_MONSTER_REWARD);
  //ID[int] Damage[int] EXPReceive[int] Killer[bool]
  o.append_uint32(monsterID);
  o.append_uint32(attackData.EXPReceive);
  o.append_int8(attackData.Killer ? 1 : 0);
  o.finish();
  return o.buffer;
}


packet.make_online_realtime_control = (playerDatas, monsterDatas, monsterHurtDatas) => {
  let o = new packet_writer(packet.SC_ONLINE_REALTIME_CONTROL);
  // Player
  o.append_uint16(playerDatas.length); //add length first to tell client before loop
  for (let i = 0; i < playerDatas.length; i++) {
    // UID, Name, HP,SP,Job,Level,Equipment,Position only
    //current : uid, position, velocity, scaleX , animation
    o.append_uint32(playerDatas[i].UID);
    o.append_float(playerDatas[i].Position.x);
    o.append_float(playerDatas[i].Position.y);
    o.append_float(playerDatas[i].Velocity.x);
    o.append_float(playerDatas[i].Velocity.y);
    o.append_float(playerDatas[i].ScaleX);
    o.append_int8(playerDatas[i].Animation);
  }
  // Monster Control
  o.append_uint8(monsterDatas.length);
  for (let i = 0; i < monsterDatas.length; i++) {
    o.append_uint32(monsterDatas[i].ID);
    o.append_uint32(monsterDatas[i].HP);
    o.append_float(monsterDatas[i].Position.x);
    o.append_float(monsterDatas[i].Position.y);
  }
  // Monster Hurt
  o.append_uint8(monsterHurtDatas.length);
  for (let i = 0; i < monsterHurtDatas.length; i++) {
    o.append_uint32(monsterHurtDatas[i].ID);
    o.append_uint32(monsterHurtDatas[i].Damage);
    o.append_uint32(monsterHurtDatas[i].HPLeft);
    o.append_int8(monsterHurtDatas[i].KnockbackDirection);

  }
  o.finish();
  return o.buffer;
}
//------------- Commuinity Part
packet.make_chat = function (msg) {
  let o = new packet_writer(packet.SC_CHAT);
  o.append_string(msg);
  o.finish();
  return o.buffer;
}
packet.make_notification = function (noti) {
  let o = new packet_writer(packet.SC_NOTIFICATION);
  o.append_string(noti);
  o.finish();
  return o.buffer;
}

////////////////////////////////////////////////////////////////////////////////
// Custom method
////////////////////////////////////////////////////////////////////////////////

function convertCharacterDataToPacketData(packet, character) {
  packet.append_string(character.Name);// character name  
  //////////////////////////////////////////      
  ///////////// Status
  packet.append_string(character.Status.Gender); // Gender
  packet.append_string(character.Status.Job);    // Job      
  packet.append_int8(character.Status.Level);    // Level
  packet.append_int32(character.Status.EXP);     // EXP
  packet.append_int32(character.Status.HP);      // HP
  packet.append_int32(character.Status.SP);      // SP
  packet.append_int32(character.Status.MaxEXP);  // Max EXP
  packet.append_int32(character.Status.MaxHP);   // Max HP
  packet.append_int32(character.Status.MaxSP);   // Max SP
  packet.append_int32(character.Status.ATK);     // ATK
  packet.append_int32(character.Status.DEf);     // DEF
  //////////////////////////////////////////
  // Equipment
  packet.append_string(character.Status.Equipment.Head);    // HEAD
  packet.append_string(character.Status.Equipment.Body);    // BODY
  packet.append_string(character.Status.Equipment.Weapon);  // WEAPON
  //////////////////////////////////////////
  // Location
  packet.append_string(character.Location.Map);  // Current Map
  packet.append_float(character.Location.Position.x);    // X
  packet.append_float(character.Location.Position.y);    // Y
  //////////////////////////////////////////
  // Inventory
  packet.append_int32(character.Inventory.Money);   // Money
  if (character.Inventory.Items) { // if have Item
    packet.append_int8(character.Inventory.Items.length); // append length of item
    for (let j = 0; j < character.Inventory.Items.length; j++) {// Append data for each Itme
      let item = character.Inventory.Items[j];
      packet.append_int32(item.ItemId);
      packet.append_int16(item.Amount);
    }
  } else {
    packet.append_int8(0); // don't have any Item
  }
  ///////////////////////////////////////////
  // Quest Success
  packet.append_uint16(character.Quest.Success.length);
  for (let i = 0; i < character.Quest.Success.length; i++) {
    packet.append_uint16(character.Quest.Success[i].QuestID);
  }
  // Quest Process
  packet.append_uint16(character.Quest.Process.length);
  for (let i = 0; i < character.Quest.Process.length; i++) {    
    packet.append_uint16(character.Quest.Process[i].QuestID);
    packet.append_uint16(character.Quest.Process[i].CurrentTotal);
  }
  /////////////////////////////////////////////
  // CheckIn
  packet.append_uint8(character.CheckIn.length);
  for(let i=0; i<character.CheckIn.length; i++){
    packet.append_uint8(character.CheckIn[i].PlaceID);
    packet.append_string(character.CheckIn[i].Time);
  }
  // return packet;
}

function convertMonsterDataToPacketData(packet, monster){
  packet.append_uint32(monster.ID);
  packet.append_uint32(monster.monsterID);
  packet.append_string(monster.Name);
  packet.append_uint8(monster.Status.Level);
  packet.append_uint32(monster.Status.HP);
  packet.append_uint32(monster.Status.MaxHP);
  packet.append_uint16(monster.Status.ATK);
  packet.append_uint16(monster.Status.DEF);
  packet.append_uint8(monster.Status.MovementSpeed);  
  packet.append_float(monster.Location.CurrentPosition.x);
  packet.append_float(monster.Location.CurrentPosition.y);
  packet.append_float(monster.Location.TargetPosition.x);
  packet.append_float(monster.Location.TargetPosition.y);
  // return packet;
}

////////////////////////////////////////////////////////////////////////////////
// Export Module
////////////////////////////////////////////////////////////////////////////////

module.exports = packet;
