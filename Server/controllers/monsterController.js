const Monster = require('../models/monster');
let monitor = require('../server').monitor;
let db;
const sampleSpawner = {
    _id: 0,
    LocationSpanwer: { Start: { x: 33.18, y: 0 }, End: { x: 56.7, y: 0 }, Map: "Way_Udon1" },
    MonsterID: 10004,
    MaxAmount: 3,
    CurrentAmount: 0,
    Time: 30
}

class MonsterController {
    constructor() {
        this.idGenerate = 0;
        this.monsterList = [];
        this.spawnerList = [];
        this.spawnerList.push(sampleSpawner);
    }

    async spawnMonsterToSpawnList() {
        Monster.db = this.db;   
        this.spawnerList = await this.db.getSpawners();
        let spawnerCount = 0, spawnedCount = 0, monsterCount = 0;
        this.spawnerList.forEach((spawner) => {
            spawnerCount++;
            if (spawner.CurrentAmount < spawner.MaxAmount) {
                spawnedCount++;
                this.spawnMonster(spawner); // first spawn Monster
                setInterval(()=>{ // Loop check and refill monster for this spawner
                    this.spawnMonster(spawner);
                }, spawner.Time*1000);
            }
        });
        monitor.log("Spawner process complete !");
        monitor.log("Spawners [" + spawnerCount + "] :: Spawned [{yellow-fg}" + spawnedCount +
            "{/yellow-fg}] :: Monster spawned [{yellow-fg}" + this.monsterList.length+"{/yellow-fg}]");
    }

    spawnMonster(spawner){
        if (spawner.CurrentAmount < spawner.MaxAmount) {            
            while (spawner.CurrentAmount<spawner.MaxAmount) {                        
                let randomX = (Math.random() * (spawner.LocationSpanwer.End.x -
                    spawner.LocationSpanwer.Start.x + 1) + spawner.LocationSpanwer.Start.x);                      
                let monsterData = {
                    ID: ++this.idGenerate,
                    monsterID: spawner.MonsterID,
                    Status: { HP: 100, MovementSpeed: 2, State: "Idle" },
                    Location: {
                        TargetPosition: { x: randomX },
                        CurrentPosition: { x: randomX , y: spawner.LocationSpanwer.Start.y },
                        AvailableZone: {Start:spawner.LocationSpanwer.Start,End:spawner.LocationSpanwer.End},
                        Map: spawner.LocationSpanwer.Map
                    },
                    ItemPool: [{ ItemID: 100004, Rate: 60.5 }],
                    SpawnerID : spawner._id
                };
                spawner.CurrentAmount++;
                let monster = new Monster(monsterData);
                monster.normalMoving();                
                this.monsterList.push(monster);
                monitor.debug("spawn 1 monster to spawner["+ spawner._id  + "] : " + spawner.CurrentAmount+"/"+spawner.MaxAmount);
            }
        }
    }

    clearMonsterAngryTo(playerID){
        this.monsterList.forEach((monster)=>{
            if(monster.TargetPlayer == playerID){
                monitor.debug("[Monster] I done with you :( !");
                monster.stopAngry();
            }
        });
    }

    getMonsterById(id){
        return this.monsterList.find((monster)=>{return monster.ID==id});
    }

    deleteMonsterFromList(id,spawnerID){
        let indexOfMonster = this.monsterList.findIndex((monster)=>{return monster.ID == id});
        if (indexOfMonster > -1) {
            monitor.debug("Remove monster ["+id+"] from list");
            this.decreaseMonsterInSpawnerByID(spawnerID);
            this.monsterList.splice(indexOfMonster, 1);            
        }
    }

    decreaseMonsterInSpawnerByID(spawnerID){
        this.spawnerList.forEach((spawner)=>{
            if(spawner._id == spawnerID){                
                spawner.CurrentAmount--;
            }
        })
    }
}

module.exports = MonsterController;