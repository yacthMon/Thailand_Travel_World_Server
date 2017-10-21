const Monster = require('../models/monster');

const sampleSpawner = {
    ID:0,
    LocationSpanwer: {Start:{x:0,y:0} , End:{x:10,y:0}, Map:"Bangkok"},
    MonsterID: 10000,
    MaxAmount: 5
}
let monsterList = [];
let spawnerList = [];

spawnMonster = (spawner)=>{
     //check if already full monster for this spawner yet ?
     let monster = new Monster();
     monsterList.push(monster);
}
/*
let spawnInterval = setInterval(()=>{
    spawnerList.forEach((spawner)=>{
        spawnMonster(spawner);
    })
}, 60000); // Check and spawn new monster for every 1 minute*/