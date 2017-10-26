let monitor = require('../server').monitor;
let world = require('../server').world;
let db = require('../server').db;

class Monster {
    constructor(data) {
        if (data) {
            this.ID = data.ID;
            this.monsterID = data.monsterID;            
            this.Location = data.Location;            
            this.SpawnerID = data.SpawnerID;
            this.getMonsterData(this.mosnterID);
        } else {
            this.ID = ID;
            this.monsterID = 10004;
            this.Status = {
                HP: 1,
                MovementSpeed: 1
            }

            this.Location = {
                TargetPosition: { x: 0 },
                CurrentPosition: { x: 0, y: 0 }, //Use client physic for real
                AvailableZone: { Start: { x: 33.18, y: 0 }, End: { x: 56.7, y: 0 } },
                Map: "Bangkok"
            };
            this.ItemDrop = [{ ItemID: 100004, Rate: 60.5 }];            
            this.SpawnerID = 0;
        }
        this.movingTimeout = undefined;
        this.movingInterval = undefined;
        this.angryInterval = undefined;
        this.attackInterval = undefined;
        this.TargetPlayer = undefined;
        this.damageTakenBy = [];
        this.ItemPool = [];
        this.State = "idle";        
        // this.startAngry(69);     
        //this.normalMoving();
        //send monsterData to client (Spawn)
    }

    async getMonsterData() {
        let monsterdata = await db.getMonster(this.monsterID);
        this.ItemDrop = monsterdata.ItemDrop;
        this.Status = monsterdata.Status;
        this.Status.MaxHP = this.Status.HP
        this.calculateItemDrop();
        world.spawnMonsterToWorld(this);
    }

    calculateItemDrop(){        
        this.ItemDrop.forEach((item)=>{
            let chance = (Math.random())*100;
            if(chance<=item.Rate){
                this.ItemPool.push(item.ItemID);
            }
        });        
    }

    goToTarget() {
        this.movingInterval = setInterval(() => {
            if (findDistance(this.Location.CurrentPosition.x, this.Location.TargetPosition.x)
                > 1) {
                this.State = "Moving";
                // monitor.log("Monster state : Moving");
                let moveValue = (findDirection(this.Location.CurrentPosition.x, this.Location.TargetPosition.x)
                    * this.Status.MovementSpeed) * (90 / 1000);
                
                this.Location.CurrentPosition.x += moveValue;
                //send data to temp
                world.addMonsterDataToQueue({
                    ID: this.ID,
                    HP: this.Status.HP,
                    Map: this.Location.Map,
                    Position: {
                        x: this.Location.CurrentPosition.x,
                        y: this.Location.CurrentPosition.y
                    }
                });
            } else {
                //we reach the target
                this.stopMoving();
                this.normalMoving();
            }
        }, 90);
    }

    setTargetPosition(x) {
        clearInterval(this.movingInterval);
        this.Location.TargetPosition.x += x;
        this.goToTarget();
    }

    hurt(attacker, damage, knockback) {
        //damage -= this.Status.DEF;
        this.stopMoving();        
        // For avoid over damage to monster ex. 100atk but hp is 50 left > hp = -50
        if(damage > this.Status.HP){
            damage = this.Status.HP;
        }
        this.Status.HP -= damage > 0 ? damage : 1;  // check if zero damage or not
        // Save damage     
        let indexOfExistData = this.damageTakenBy.findIndex((attackHistory) => { return attackHistory.ID == attacker });
        if (indexOfExistData > -1) {
            this.damageTakenBy[indexOfExistData].Damage += damage;
        } else {
            this.damageTakenBy.push({ ID: attacker, Damage: damage });
        }
        if (this.Status.HP <= 0) {
            //monster die :(
            this.Status.HP = 0;
            this.stopAngry();
            this.deleteMySelf();
        } else {
            this.startAngry(attacker);
        }
        //send to client this monster was hurt
        world.addMonsterHurtToQueue({
            ID: this.ID,
            Damage: damage,
            HPLeft: this.Status.HP,
            Map: this.Location.Map,
            KnockbackDirection: knockback
        });
    }

    deleteMySelf() {
        this.damageTakenBy.forEach((attacker)=>{
            let damagePercent = (attacker.Damage/this.Status.MaxHP) * 100;
            monitor.log("Attacked by " + attacker.ID + " Damage : " + damagePercent + "%");
        })
        world.eliminateMonster(this.ID, this.Location.Map, this.SpawnerID, this.ItemPool);
    }

    startAngry(targetID) {
        targetID = targetID;
        this.TargetPlayer = targetID;        
        clearInterval(this.angryInterval); // avoid multiple angry
        this.angryInterval = setInterval(() => {
            monitor.debug("Monster attack interval work for Monster : " + this.ID);
            let targetPosition = world.getPlayerPositionFromID(targetID);
            if (targetPosition) {                
                if (findDistance(this.Location.CurrentPosition.x, targetPosition.x)
                    > 2) {
                    this.State = "Angry Moving";
                    let moveValue = (findDirection(this.Location.CurrentPosition.x, targetPosition.x)
                        * this.Status.MovementSpeed) * (90 / 1000);
                    this.Location.CurrentPosition.x += moveValue;
                    //send data to temp 
                    world.addMonsterDataToQueue({
                        ID: this.ID,
                        HP: this.Status.HP,
                        Map: this.Location.Map,
                        Position: {
                            x: this.Location.CurrentPosition.x,
                            y: this.Location.CurrentPosition.y
                        }
                    });
                } else {
                    // //we near to the target
                    this.State = "Attacking";   
                    this.attack(targetPosition);         
                    // monitor.log("Position current : " + JSON.stringify(this.Location.CurrentPosition));
                    // monitor.log("Position target  : " + JSON.stringify(targetPosition));
                    // monitor.log("Let attack distance : " + findDistance(this.Location.CurrentPosition.x, targetPosition.x));                    
                }
            } else {
                // Can't find target
                monitor.debug("stop angry {not found player} by monster [" + this.ID + "]");
                this.stopAngry();
            }
        }, 90);
    }

    attack(position) {        
        clearInterval(this.angryInterval);
        clearInterval(this.attackInterval); // avoid multiple attack
        let direction = findDirection(this.Location.CurrentPosition.x, position.x);
        // attack type move toward target
        let positionToGo = position.x + (direction * 5);
        this.attackInterval = setInterval(() => {
            if (findDistance(this.Location.CurrentPosition.x, positionToGo)
                > 1) {
                this.State = "Attacking";                
                let moveValue = ((findDirection(this.Location.CurrentPosition.x, positionToGo)
                * this.Status.MovementSpeed) * (90 / 1000)); // move more faster
                // monitor.log("Attacking direct : "+(direction * 5));
                // monitor.log("attack move value : " + moveValue);
                this.Location.CurrentPosition.x += moveValue;                
                //send data to temp 
                world.addMonsterDataToQueue({
                    ID: this.ID,
                    HP: this.Status.HP,
                    Map: this.Location.Map,
                    Position: {
                        x: this.Location.CurrentPosition.x,
                        y: this.Location.CurrentPosition.y
                    }
                });
            } else {                
                // done attack stop attacking and startAngry again                
                clearInterval(this.attackInterval);
                this.startAngry(this.TargetPlayer);
            }
        }, 90);
    }

    normalMoving() {
        this.movingTimeout = setTimeout(() => {
            let movingValue = Math.random() * 8;
            movingValue *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
            let xAfterMove = movingValue + this.Location.CurrentPosition.x;
            while ((xAfterMove < this.Location.AvailableZone.Start.x) || (xAfterMove > this.Location.AvailableZone.End.x)) {
                movingValue = Math.random() * 8;
                movingValue *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
                xAfterMove = movingValue + this.Location.TargetPosition.x;
            }
            this.setTargetPosition(movingValue);
        }, ((Math.random() * 3) + 3) * 1000);
    }

    stopMoving() {
        this.ๆState = "Idle";
        clearInterval(this.movingInterval);
        clearTimeout(this.movingTimeout);
    }

    stopAngry() {
        monitor.debug("[Monster] Nevermind (Stop angry) :( from [" + this.ID + "]")
        clearInterval(this.angryInterval);
        clearInterval(this.attackInterval);
        this.stopMoving();
        this.TargetPlayer = undefined;
        this.normalMoving();
    }
}

findDirection = (x1, x2) => {
    return x1 < x2 ? 1 : -1;
}
findDistance = (x1, x2) => {
    return Math.abs(x1 - x2)
}
module.exports = Monster;

