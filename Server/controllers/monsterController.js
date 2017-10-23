const Monster = require('../models/monster');
let monitor = require('../server').monitor;
const sampleSpawner = {
    ID: 0,
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

    spawnMonsterToSpawnList() {
        //check if already full monster for this spawner yet ?
        // let monster = new Monster();
        // this.monsterList.push(monster);
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
        monitor.log("Spawner [" + spawnerCount + "] :: Spawned [{yellow-fg}" + spawnedCount +
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
                    Status: { HP: 100, MovementSpeed: 3, State: "Idle" },
                    Location: {
                        TargetPosition: { x: 0 },
                        CurrentPosition: { x: randomX, y: spawner.LocationSpanwer.Start.y },
                        Map: spawner.LocationSpanwer.Map
                    },
                    ItemPool: [{ ItemID: 100004, Rate: 60.5 }]
                };
                spawner.CurrentAmount++;
                let monster = new Monster(monsterData);
                monster.normalMoving();                
                this.monsterList.push(monster);
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

    
}

module.exports = MonsterController;