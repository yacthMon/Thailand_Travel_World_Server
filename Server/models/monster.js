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
                CurrentPosition: { x: 0, y: 0 }, //Use client physic for real
                Map: "Bangkok"
            };
            this.ItemPool = [{ ItemID: 100004, Rate: 60.5 }];
        }
        this.movingInterval = undefined;
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
                this.Status.State = "Idle";
                // monitor.log("Monster state : Idle");
                clearInterval(this.movingInterval);
                this.normalMoving();
            }
        }, 90);
    }

    setTargetPosition(x) {
        clearInterval(this.movingInterval);
        this.Location.TargetPosition.x += x;
        this.goToTarget();
    }

    stopMoving() {
        clearInterval(this.movingInterval);
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
    }

    normalMoving() {
        setTimeout(() => {
            let movingValue = Math.random() * 8;
            movingValue *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
            this.setTargetPosition(movingValue);
        }, ((Math.random() * 5) + 3) * 1000);
    }
}

findDirection = (x1, x2) => {
    return x1 < x2 ? 1 : -1;
}
findDistance = (x1, x2) => {
    return Math.abs(x1 - x2)
}
module.exports = Monster;

