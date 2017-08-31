var packet_writer = require('dgt-net').packet_writer

var packet = {

  ////////////////////////////////////////////////////////////////////////////////
  // Client to Server
  ////////////////////////////////////////////////////////////////////////////////

  CS_CONNECTION: 10001,
  CS_PING: 10002,
  CS_REGISTER: 10010,
  CS_AUTHENTICATION: 10011,
  CS_UPDATE_PLAYERDATA: 10012,
  CS_REQUEST_ENTER_WORLD: 10020,
  CS_PLAYER_MOVING: 10021,
  CS_EXIT_WORLD: 10022,
  CS_CHAT: 10023,
  CS_NOTIFICATION: 10024,

  ////////////////////////////////////////////////////////////////////////////////
  // Server to Client
  ////////////////////////////////////////////////////////////////////////////////

  SC_ERROR: 20000,
  SC_CONNETION: 20001,
  SC_PING_SUCCESS: 20002,
  SC_REGISTER_SUCCESS: 20010,
  SC_REGISTER_FAILED: 20011,
  SC_AUTHENTICATION_GRANT: 20012,
  SC_AUTHENTICATION_DENIED: 20013,
  SC_PLAYER_DATA: 20014,
  SC_MULTIPLAYER_PLAYERS_IN_WORLD: 20020,
  SC_MULTIPLAYER_CONNECT: 20021,
  SC_MULTIPLAYER_CONTROL: 20022,
  SC_MULTIPLAYER_DISCONNET: 20023,
  SC_CHAT: 20024,
  SC_NOTIFICATION: 20025,
};

////////////////////////////////////////////////////////////////////////////////
// Received Packets
////////////////////////////////////////////////////////////////////////////////

packet[packet.CS_CONNECTION] = function (remoteProxy, data) {
  if (!data.completed()) return true;

}

packet[packet.CS_PING] = function (remoteProxy, data) {
  var pingTime = data.read_uint8();
  if (!data.completed()) return true;
  //remoteProxy.ping(pingTime);
}

packet[packet.CS_REGISTER] = function (remoteProxy, data) {
  var accountKey = data.read_string();
  if (!data.completed()) return true;
  remoteProxy.registerAccount(accountKey);
}

packet[packet.CS_UPDATE_PLAYERDATA] = function (remoteProxy, data) {
  var color = data.read_uint8();
  var highest_level = data.read_uint16();
  var highest_checkpoint = data.read_uint16();
  if (!data.completed()) return true;
  remoteProxy.updateAccountData(color,highest_level,highest_checkpoint);
}

packet[packet.CS_AUTHENTICATION] = function (remoteProxy, data) {
  var deviceId = data.read_string();
  var name = data.read_string();
  if (!data.completed()) return true;
  remoteProxy.authentication(deviceId,name);
}

packet[packet.CS_PLAYER_MOVING] = function (remoteProxy, data) {
  let dataSet = {uid:data.read_uint32(),
              position:{x:data.read_float(), y:data.read_float()},
              velocity:{x:data.read_float(), y:data.read_float()},
              scaleX:data.read_float()}
  if (!data.completed()) return true;
  // console.log("Player moving");
  // console.log("UID : "+dataSet.UID);
  // console.log("x : "+dataSet.Position.x);
  // console.log("y :" + dataSet.Position.y);
  // console.log("Speed x :" + dataSet.Velocity.x);
  // console.log("Speed y :" + dataSet.Velocity.y);
  //remoteProxy.float(f);
  remoteProxy.submitPlayerData(dataSet);
}

packet[packet.CS_REQUEST_ENTER_WORLD] = function (remoteProxy, data) {
  let position = {x:data.read_float(),y:data.read_float()}
  let color = data.read_uint16()
  if (!data.completed()) return true;
  remoteProxy.playerEnterWorld(position, color);
}

packet[packet.CS_EXIT_WORLD] = (remoteProxy,data)=>{
  remoteProxy.playerExitWorld();
}

packet[packet.CS_CHAT] = function (remoteProxy, data) {
  var msg = data.read_string();
  if (!data.completed()) return true;

}
packet[packet.CS_NOTIFICATION] = function (remoteProxy, data) {
  var notification = data.read_string();
  if (!data.completed()) return true;
  ///remoteProxy.notification(notification);
}

////////////////////////////////////////////////////////////////////////////////
// Send Packets
////////////////////////////////////////////////////////////////////////////////

packet.make_error = function (msg) {
  var o = new packet_writer(packet.SC_ERROR);
  o.append_string(msg);
  o.finish();
  return o.buffer;
}

packet.make_connection = function (msg) {
  var o = new packet_writer(packet.SC_CONNETION);
  //o.append_string(msg);
  o.finish();
  return o.buffer;
}

packet.make_ping = function (ping_time) {
  var o = new packet_writer(packet.SC_PING);
  o.append_uint8(ping_time);
  o.finish();
  return o.buffer;
}

packet.make_authentication_grant = function (uid,color,highest_level,highest_checkpoint) {
  var o = new packet_writer(packet.SC_AUTHENTICATION_GRANT);
  o.append_uint32(uid);
  o.append_uint8(color);
  o.append_uint16(highest_level);
  o.append_uint16(highest_checkpoint);
  /*o.append_uint32(uid);
  o.append_string(name);
  o.append_uint16(floor);

  let a = [10, 20, 50, 60];
  o.append_uint8(a.length);
  for (let i = 0; i < a.length; i++) {
    o.append_uint16(a[i]);
  }
  */
  o.finish();
  return o.buffer;
}
packet.make_register_success = (uid,color,highest_level,highest_checkpoint)=>{
  let o = new packet_writer(packet.SC_REGISTER_SUCCESS);
  o.append_uint32(uid);
  o.append_uint8(color);
  o.append_uint16(highest_level);
  o.append_uint16(highest_checkpoint);
  o.finish();
  return o.buffer;
}
packet.make_register_failed = (errCode,msg)=>{
  let o = new packet_writer(packet.SC_REGISTER_FAILED);
  o.append_uint16(errCode);
  o.append_string(msg);
  o.finish();
  return o.buffer;
}

packet.make_authentication_denied = (errCode,msg)=>{
  var o = new packet_writer(packet.SC_AUTHENTICATION_DENIED);
  o.append_uint8(errCode);
  o.append_string(msg);
  o.finish()
  return o.buffer;
}

packet.make_multiplayer_connect = function (uid,name,position,color) {
  var o = new packet_writer(packet.SC_MULTIPLAYER_CONNECT);
  o.append_uint32(uid);
  o.append_string(name);
  o.append_float(position.x);
  o.append_float(position.y);
  o.append_uint16(color);  //------------
  o.finish();
  return o.buffer;
}

packet.make_multiplayer_control = function (datas) {
  var o = new packet_writer(packet.SC_MULTIPLAYER_CONTROL);
  o.append_uint16(datas.length); //add length first to tell client before loop
  for(let i=0; i<datas.length;i++){
    o.append_uint32(datas[i].uid);
    o.append_float(datas[i].position.x);
    o.append_float(datas[i].position.y);
    o.append_float(datas[i].velocity.x);
    o.append_float(datas[i].velocity.y);
    o.append_float(datas[i].scaleX);
  }
  o.finish();
  return o.buffer;
}

packet.make_multiplayer_in_world = function (players) {
  var o = new packet_writer(packet.SC_MULTIPLAYER_PLAYERS_IN_WORLD);
  o.append_uint16(players.length);
  for(let i=0;i<players.length;i++){
    o.append_uint32(players[i].uid);
    o.append_string(players[i].name);
    o.append_float(players[i].position.x);
    o.append_float(players[i].position.y);
    o.append_uint16(players[i].color);
  }
  o.finish();
  return o.buffer;
}

packet.make_multiplayer_disconnect = function (uid) {
  var o = new packet_writer(packet.SC_MULTIPLAYER_DISCONNET);
  o.append_uint32(uid);
  o.finish();
  return o.buffer;
}

packet.make_chat = function (msg) {
  var o = new packet_writer(packet.SC_CHAT);
  o.append_string(msg);
  o.finish();
  return o.buffer;
}
packet.make_notification = function (noti) {
  var o = new packet_writer(packet.SC_NOTIFICATION);
  o.append_string(noti);
  o.finish();
  return o.buffer;
}

////////////////////////////////////////////////////////////////////////////////
// Export Module
////////////////////////////////////////////////////////////////////////////////

module.exports = packet;
