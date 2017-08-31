//Dinoku server
let Monitor = require("./monitor");
let monitor = new Monitor();
exports.monitor = monitor;

/*let World = require(' ./world')
let world = new World()
world.responseTime = 100;
world.startQueueResponse();
exports.world = world;
*/
let server = require('dgt-net').server;
let packet = require('./network/packet');
let remoteProxy = require('./network/remoteproxy');
let config = require("./package");
let port = 21200;
let runningCheck = ["|","/","-","\\"]
let indexRunning = 0;
let status = setInterval(function() {
  indexRunning = ++indexRunning == 4 ? 0 : indexRunning;
  monitor.status("["+runningCheck[indexRunning]+"] [ Thailand Travel World Server ] {red-fg}::{/red-fg} " + remoteProxy.countClient() +
  " Clients {red-fg}::{/red-fg} " + 0 + "  Player In world");
}, 100);

monitor.info("========================================");
monitor.info("|| King Mongkut University of Technology Thonburi");
monitor.info("|| Thailand Travel World server  ");
monitor.info("|| Server Side v" + config.version);
monitor.info("|| Server port         : " + port);
monitor.info("========================================");
server.setRemoteProxyClass(remoteProxy.RemoteProxy);
server.setPacketObject(packet);
server.listen(port);
// remoteProxy.db.checkConnection((err)=>{
//   if(err){
//     monitor.log("Error can't connect database.");
//     monitor.log(err);
//     monitor.log("Database server connection          [{red-fg}FAILED{/red-fg}]");
//     monitor.log("Failed to start server.");
//     monitor.log("Press q or ctrl+c to exit ....");
//     clearInterval(status);
//     return ;
//   }
//   monitor.log("Database server connection          [{green-fg}OK{/green-fg}]");
//   monitor.log("Server ready to connect.");
// });
