let monitor = require('../server').monitor;
let world = require('../server').world;

class Monster {
    constructor(data) {
        if (data) {
            this.ID = data.ID;
            this.monsterID = data.monsterID;
            this.Status = data.Status;
            this.Location = data.Location;
            this.ItemPool = data.ItemPool;
        } else {
            this.ID = ID;
            this.monsterID = 10004;
            this.Status = {
                HP: 100,
                MovementSpeed: 3,
                State: "Idle"
            }

            this.Location = {
                TargetPosition: { x: 0 },
                CurrentPosition: { x: 40, y: 0 }, //Use client physic for real
                AvailableZone: { Start: { x: 33.18, y: 0 }, End: { x: 56.7, y: 0 } },
                Map: "Bangkok"
            };
            this.ItemPool = [{ ItemID: 100004, Rate: 60.5 }];
        }
        this.movingTimeout = undefined;
        this.movingInterval = undefined;
        this.attackInterval = undefined;
        this.TargetPlayer = undefined;
        //this.normalMoving();
        //send monsterData to client (Spawn)
    }

    goToTarget() {
        this.movingInterval = setInterval(() => {
            if (findDistance(this.Location.CurrentPosition.x, this.Location.TargetPosition.x)
                > 1) {
                this.Status.State = "Moving";
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
        this.Status.HP -= damage > 0 ? damage : 1;
        if (this.Status.HP < 0) {
            this.Status.HP = 0;
        }
        //Find target to follow
        //send to client this monster was hurt
        world.addMonsterHurtToQueue({
            ID: this.ID,
            Damage: damage,
            HPLeft: this.Status.HP,
            Map: this.Location.Map,
            KnockbackDirection: knockback
        });
        monitor.debug("[Monster] got attack :(");
        this.startAngry(attacker);
    }

    startAngry(targetID) {
        this.TargetPlayer = targetID;
        this.attackInterval = setInterval(() => {
            let TargetPosition = world.getPlayerPositionFromID(targetID);
            if (TargetPosition) {
                if (findDistance(this.Location.CurrentPosition.x, TargetPosition.x)
                    > 2) {
                    this.Status.State = "Angry Moving";
                    let moveValue = (findDirection(this.Location.CurrentPosition.x, TargetPosition.x)
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
                    // this.Status.State = "Attacking";                
                    // clearInterval(this.attackInterval);
                }
            } else {
                // Can't find target
                this.stopAngry();
            }
        }, 90);
    }

    attack(target) {

    }

    normalMoving() {
        this.movingTimeout = setTimeout(() => {
            let movingValue = Math.random() * 8;
            movingValue *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
            let xAfterMove = movingValue + this.Location.CurrentPosition.x;
            monitor.log("Current position : " + this.Location.CurrentPosition.x);
            monitor.log("xAfterMove : " + xAfterMove + " : " + this.Location.AvailableZone.Start.x + " : "+this.Location.AvailableZone.End.x);
            monitor.log("Moving value : " + movingValue);
            while ((xAfterMove < this.Location.AvailableZone.Start.x) || (xAfterMove > this.Location.AvailableZone.End.x)) {
                monitor.log("Ops.. not in my zone x__x gotta find new way");
                movingValue = Math.random() * 8;
                movingValue *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
                xAfterMove = movingValue + this.Location.TargetPosition.x;
            }
            this.setTargetPosition(movingValue);
        }, ((Math.random() * 5) + 3) * 1000);
    }

    stopMoving() {
        this.Status.State = "Idle";
        clearInterval(this.movingInterval);
        clearTimeout(this.movingTimeout);
    }

    stopAngry() {
        monitor.debug("[Monster] Nevermind :(")
        this.stopMoving();
        clearInterval(this.attackInterval);
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

