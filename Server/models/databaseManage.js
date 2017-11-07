let mongo = require('mongodb').MongoClient;
let md5 = require('md5');
class mongoDB {
    constructor(config, callback) {
        this.config = config;
        mongo.connect("mongodb://" + config.user + ":" + config.password + "@" + config.ip + ":" + config.port + "/" + config.database + "?authMechanism=DEFAULT&authSource=" + config.database, (err, db) => {
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
                mongo.connect("mongodb://" + this.config.user + ":" + this.config.password + "@" + this.config.ip + ":" + this.config.port + "/" + this.config.database + "?authMechanism=DEFAULT&authSource=" + this.config.database)
                    .then((database) => {
                        _this.db = database;
                        resolve(true);
                    }, (err) => {
                        // console.log("Error connecting to database : " + err.message);
                        reject(err.message);
                    }
                    );
            }
        })
    }

    close() {
        this.db.close();
        // delete this;
    }

    async getAccountById(id) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ _id: id }, (err, data) => {
                if (err) { reject(err); return; }
                resolve(data);
            })
        });
    }

    async getAccountByCustom(specify) {
        return new Promise((resolve, reject) => {
            this.db.findOne(specify, (err, data) => {
                if (err) { reject(err); return; }
                resolve(data);
            })
        });
    }

    async getSpawners() {
        return new Promise((resolve, reject) => {
            this.db.collection("Spwaner").find({}).toArray((err, data) => {
                if (err) { reject(err); return; }
                resolve(data);
            })
        });
    }

    async getMonster(id) {
        return new Promise((resolve, reject) => {
            this.db.collection("Monster").findOne({ _id: id }, (err, data) => {
                if (err) { reject(err); return; }
                resolve(data);
            })
        });
    }

    async addAccount(username, password, email, gender) {
        return new Promise(async (resolve, reject) => {
            if (!await this.isUsernameExist(username)) {
                let lastestId = await this.getNextID();
                let data = {
                    _id: lastestId,
                    Username: username,
                    Password: password,
                    Email: email,
                    Gender: gender,
                    Characters: [],
                    Checkin: [],
                    Friends: []
                };
                this.db.collection("Account").insertOne(data, (err, res) => {
                    if (err) { reject(err); return; }
                    resolve(undefined, res);
                })
            } else {
                //err codde username already exist.
                resolve(100);
            }
        });
    }

    async addFacebookAccount(fbid, fbtoken, email, gender) {
        return new Promise(async (resolve, reject) => {
            if (!await this.isFacebookIdExist(fbid)) {
                let lastestId = await this.getNextID();
                let data = {
                    _id: lastestId,
                    FacebookId: fbid,
                    FacebookToken: fbtoken,
                    Email: email,
                    Gender: gender,
                    Characters: [],
                    Friends: []
                };
                this.db.collection("Account").insertOne(data, (err, res) => {
                    if (err) { reject(err); return; }
                    resolve(undefined, res);
                })
            } else {
                //err codde username already exist.
                resolve(100);
            }
        });
    }

    async isUsernameExist(username) {
        return new Promise((resolve, reject) => {
            this.db.collection("Account").findOne({ Username: username }, (err, data) => {
                if (err) { reject(err); return; }
                resolve(data ? true : false);
            })
        });
    }

    async isFacebookIdExist(fbid) {
        return new Promise((resolve, reject) => {
            this.db.collection("Account").findOne({ FacebookId: fbid }, (err, data) => {
                if (err) { reject(err); return; }
                resolve(data ? true : false);
            })
        });
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
    }

    async doLogin(username, password) {
        return new Promise((resolve, reject) => {
            this.db.collection("Account").findOne({ Username: username }, (err, user) => {
                if (err) { reject(err); return; }
                if (user) {
                    //found user                    
                    if (password === user.Password) {
                        // resolve(true); // Access Grant
                        resolve(user)//Access grant
                    } else {
                        resolve(101); // wrong password
                    }

                } else {
                    resolve(undefined);// username not found
                }
            })
        });
    }

    async doLoginWithFacebook(fbid, token) {
        return new Promise((resolve, reject) => {
            this.db.collection("Account").findOne({ FacebookId: fbid }, (err, user) => {
                if (err) { reject(err); return; }
                if (user) {
                    //found user
                    // resolve(true); // Access Grant
                    resolve(user)//Access grant
                } else {
                    resolve(undefined);// user not found
                }
            })
        });
    }

    async isCharacterNameExist(name) {
        return new Promise((resolve, reject) => {
            this.db.collection("Account").findOne({ "Characters.Name": name }, (err, data) => {
                if (err) { reject(err); return; }
                resolve(data ? true : false);
            })
        });
    }

    async createCharacter(userid, characterData) {
        return new Promise((resolve, reject) => {
            this.db.collection("Account").update({ _id: userid }, { $push: { "Characters": characterData } }, (err, data) => {
                if (err) { reject(err); return; }
                resolve(data.result.n > 0 ? characterData : false);
            })
        })
    }

    async updateCharacterData(characterData) {
        return new Promise((resolve, reject) => {
            this.db.collection("Account").update({ "Characters.Name": characterData.Name },
                { $set: { "Characters.$": characterData } }, (err, data) => {
                    if (err) { reject(err); return; }
                    resolve(data.result.n > 0 ? true : false);
                });
        })
    }

}

module.exports = mongoDB;
/*
let config = require("../config");
let dbTest = new mongoDB(config.Database);
// dbTest.connect().then(()=>{dbTest.getNextID();},()=>{});

let doTest = async () => {
    // dbTest.getNextID().then((v) => { console.log(v) });
    // dbTest.addAccount("yacthMon", "1234", "yacthmon@protonmail.com","male",res => { console.log(res) })
    //if (await dbTest.doLogin("yacthMon", md5("1234"))) { console.log("Login pass") } else { console.log("Login failed") }
    // console.log(await dbTest.isCharacterNameExist("เทพซ่าส์"))
    // console.log(await dbTest.createCharacter(1, {"testCreate":"555", testPure : {Title : "So pure", Detail : 5555}}));
    // console.log(await dbTest.getSpawners());
    console.log(await dbTest.getMonster(10004));
    console.log("Done Test");
}
dbTest.connect().then(doTest, (err) => { console.log("Error while connecting : " + err); });
// */