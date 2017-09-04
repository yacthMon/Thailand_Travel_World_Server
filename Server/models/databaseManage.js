let mongo = require('mongodb').MongoClient;
// let monitor = require('../server').monitor;
let md5 = require('md5');
let config = {
    ip: "188.166.208.125",
    port: "27017",
    user: "TTW",
    password: "thailandTravelworld",
    db: "TTW"
}
class mongoDB {
    constructor(callback) {
        mongo.connect("mongodb://" + config.user + ":" + config.password + "@" + config.ip + ":" + config.port + "/" + config.db + "?authMechanism=DEFAULT&authSource=" + config.db, (err, db) => {
            if (err) { callback ? callback(err) : ''; return; }
            if (callback) callback();
            db.close();
        })
    }

    async connect() {
        // mongo.connect("mongodb://"+config.user+":"+config.password+"@"+config.ip+":" + config.port + "/" + config.db+"?authMechanism=DEFAULT&authSource="+config.db, (err,db)=>{                        
        //     if(err){ callback(err);return;}
        //     callback(undefined,db);
        //     db.close();
        // })     

        let _this = this;
        return new Promise((resolve, reject) => {
            if (_this.db) {
                resolve();
            } else {
                mongo.connect("mongodb://" + config.user + ":" + config.password + "@" + config.ip + ":" + config.port + "/" + config.db + "?authMechanism=DEFAULT&authSource=" + config.db)
                    .then((database) => {
                        _this.db = database;
                        resolve();
                    }, (err) => {
                        console.log("Error connecting to database : " + err.message);
                        reject(err.message);
                    }
                    );
            }
        })
        // async
        // if (_this.db) {
        //     return;
        // } else {
        //     try {
        //         await mongo.connect("mongodb://" + config.user + ":" + config.password + "@" + config.ip + ":" + config.port + "/" + config.db + "?authMechanism=DEFAULT&authSource=" + config.db)
        //             .then((database) => {
        //                 _this.db = database;
        //                 resolve();
        //             }, (err) => {
        //                 monitor.log("Error connecting to database : " + err.message);
        //                 reject(err.message);
        //             }
        //             );
        //     } catch (error) {
        //         console.error(error.message);
        //     }
        // }

    }

    close() {
        this.db.close();
    }

    isAccountIdExist(id) {

    }

    getAccountById(id) {

    }

    async addAccount(id, username, password, callback) {
        let lastestId = await this.getNextID();
        let data = {
            _id: lastestId,
            Username: username,
            Password: md5(password),
            Information: null,
            Character: null,
            Checkin: null,
            Friends: null
        };
        console.log("Ready to put data");
        this.db.collection("TTW").insertOne(data, (err, res) => {
            if (err) { callback(err); return; }
            callback(res);
        })

    }

    async getNextID() {
        return new Promise((resolve, reject) => {
            this.db.collection("counter").findAndModify(
                { _id: "userid" }, [], { $inc: { seq: 1 } }, { new: true }, (err, data) => {
                    if (err) { reject(err); return; }
                    resolve(data.value.seq);
                }
            );
        });
        // return this.db ? "yep" : "noh";        
        // let id = this.db.collection("counter").findAndModify(
        //     { _id: "userid" }, [], { $inc: { seq: 1 } }, { new: true }, (err, data) => {
        //         // console.log("YY")
        //         if (err) { console.log(err); return; }
        //         return data;
        //     }
        // );
        // return await id;
        // return id;

        // this.connect((err,db)=>{
        //     if(err){ callback(err,undefined); return;}
        //     callback(db.collection("counter").findAndModify(
        //         {
        //           query: { _id: "userid" },
        //           update: { $inc: { seq: 1 } },
        //           new: true
        //         }
        //     ))
        // })        

    }
}
module.exports = mongoDB;
let dbTest = new mongoDB();
// dbTest.connect().then(()=>{dbTest.getNextID();},()=>{});

let doTest = () => {
    dbTest.getNextID().then((v) => { console.log(v) });
    dbTest.addAccount(0, "yacthMon", "0000", res => { console.log(res) })
    console.log("TEAT");
}
dbTest.connect().then(doTest, () => { console.log("error"); });
