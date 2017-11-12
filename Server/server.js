//Dinoku server
let Monitor = require("./monitor");
let monitor = new Monitor();
exports.monitor = monitor;

let World = require('./models/world')
let world = new World();
world.responseTime = 100;
world.startQueueResponse();
exports.world = world;

let server = require('dgt-net').server;
let packet;// = require('./network/packet');
let remoteProxy;// = require('./network/remoteproxy');
///////// Database
let db;
let config = require('./config');
///////// Database

let package = require('./package');
let mongoDB = require("./models/databaseManage");
let port = 21200;
let runningCheck = ["|", "/", "-", "\\"]
let indexRunning = 0;
let status = setInterval(function () {
  indexRunning = ++indexRunning == 4 ? 0 : indexRunning;
  monitor.status("[" + runningCheck[indexRunning] + "] [ Thailand Travel World Server ] {red-fg}::{/red-fg} " + remoteProxy.countClient() +
    " Clients {red-fg}::{/red-fg} " + world.countPlayer() + "  Player In world {red-fg}::{/red-fg} " 
    + monsterController.getMonsterInWorld() +"/"+monsterController.maxMonster +" Monsters");
}, 100);
process.title = "Thailand Travel World Server";
monitor.info("========================================");
monitor.info("|| King Mongkut University of Technology Thonburi");
monitor.info("|| Thailand Travel World server  ");
monitor.info("|| Server Side         : v" + package.version);
monitor.info("|| Node.JS version     : " + process.version);
monitor.info("|| Server port         : " + port);
monitor.info("|| Database Server     : " + config.Database.ip);
monitor.info("|| Log path            : " + monitor.logPath);
monitor.info("========================================");
// Setting DB
db = new mongoDB(config.Database,(err) => {  
  if (!err) {
    monitor.log("Database server connection               [{green-fg}OK{/green-fg}]");
    db.connect().then(()=>{
      monitor.log("Database class connect to server         [{green-fg}OK{/green-fg}]");
      this.monsterController.db = this.db; //set database to monsterController
      this.monsterController.spawnMonsterToSpawnList(); // spawn monster
    },()=>{
      monitor.log("Database class connect to server         [{red-fg}FAILED{/red-fg}]");
    });
  } else {
    monitor.log("Error while connect to database.");
    monitor.log(err);
    monitor.log("Database server connection               [{red-fg}FAILED{/red-fg}]");
    monitor.log("Failed to start server.");
    monitor.log("Press q or ctrl+c to exit ....");
    clearInterval(status);
    return;
  }
});
exports.db = db;
// Setting Monster Controller
let MonsterController = require('./controllers/monsterController');
let monsterController = new MonsterController();
world.monsterControl = monsterController; // world must delcare first and have monsterController later
exports.monsterController = monsterController;

packet = require('./network/packet');
remoteProxy = require('./network/remoteproxy');
server.setRemoteProxyClass(remoteProxy.RemoteProxy);
server.setPacketObject(packet);
server.listen(port);

