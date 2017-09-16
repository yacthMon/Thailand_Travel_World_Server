let packet = require('../network/packet');
let monitor = require('../server').monitor;
let AOIamount = 10; // ช่วงระยะห่างระหว่าง Client ที่จะรับข้อมูล
// let monitor = console;
class World {
    constructor() {
        this.remotes = []
        this.responseTime = 100;
        this.responseTimer = undefined;
        this.responseDatas = [];
    }

    addRemote(remote) {
        let playerInWorld = [];
        this.remotes.forEach((otherRemote) => { // stored players that already in world to playerInWorld array
            playerInWorld.push({ "uid": otherRemote.uid, "location": otherRemote.location, })
        })
        remote.send(packet.make_multiplayer_in_world(playerInWorld)); // send playerInWorld to the client who just enter
        this.remotes.push(remote) // add this client to retmoes
        this.broadcastExcept(remote, packet.make_multiplayer_connect(remote.uid, remote.name, remote.position, remote.color));
    }

    removeRemote(remote) {
        var indexOfRemote = this.remotes.indexOf(remote);
        if (indexOfRemote > -1) {
            this.remotes.splice(indexOfRemote, 1);
            this.broadcast(packet.make_multiplayer_disconnect(remote.uid));
        }
    }

    broadcast(data) {
        this.remotes.forEach((remote) => {
            remote.send(data)
        })
    }

    broadcastExcept(exceptRemote, data) {
        this.remotes.forEach((remote) => {
            if (remote == exceptRemote) return
            remote.send(data)
        })
    }

    addPlayerDataToQueue(data) {
        let indexOfExistData = this.responseDatas.findIndex((dataSet) => { return dataSet.uid == data.uid });
        if (indexOfExistData > -1) {
            this.responseDatas.splice(indexOfExistData, 1, data);
        } else {
            this.responseDatas.push(data)
        }
    }

    countPlayer() {
        return this.remotes.length;
    }

    startQueueResponse() {
        this.responseTimer = setInterval(() => {
            if (this.countPlayer() > 0) {
                // Broadcast data to client
                // this.broadcast(packet.make_multiplayer_control(this.responseDatas));
                // monitor.log("Broadcast queue to " + this.countPlayer() +" clients");
                // monitor.log("With data "+this.responseDatas.length+" sets");
                // ---------------- Old not AOI -------------------
                // ---------------- AOI (Area of Interest) --------
                this.remotes.forEach((remote) => { // for All remote in world
                    let position = remote.location.position; // get remote's current position;
                    let tempDatas = [];
                    this.responseDatas.forEach((data) => { // for All response
                        if (Math.abs(position.x - data.position.x) <= AOIamount) { //Check if in distance
                            tempDatas.push(data); // Add data that in distance to tempData;
                        } else {//not in distance

                        }

                    });
                    remote.send(packet.make_multiplayer_control(tempDatas)); // send temp data to remote
                })
                // ---------------- AOI (Area of Interest) --------
                this.responseDatas = [];
            } else {
                // console.log("[World] No one in this world");
            }
        }, this.responseTime);
    }
    stopQueueResponse() {
        clearInterval(this.responseTimer);
    }
}

module.exports = World
