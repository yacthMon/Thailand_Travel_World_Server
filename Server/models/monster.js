class Monster {
    constructor() {
        this.monsterId = 0;
        this.Location = {
            TargetPosition: { x: 0},
            CurrentPosition: { x: 0}, //Use client physic for real
            Map: "Bangkok"
        };
        this.movingInterval = undefined;

        this.Status = {
            Name: "สามล้อคลั่ง",
            HP: 100,
            MaxHP: 100,
            DEF: 5,
            EXP: 10,
            Level: 1,
            MovementSpeed: 10,
            State: "Idle"
        }
        this.TargetPlayer = undefined;

        this.ItemPool = [10000, 10002];
        //send monsterData to client
    }

    goToTarget() {
        this.movingInterval = setInterval(() => {
            if (findistance(this.Location.CurrentPosition.x, this.Location.TargetPosition.x)
                <= 1) {
                this.Status.State = "Moving";
                let moveValue = findDirection(this.Location.CurrentPosition.x, this.Location.TargetPosition.x)
                    * this.Status.MovementSpeed;
                this.Location.CurrentPosition.x += moveValue;

                //send data to temp
            } else {
                //we reach the target
                this.Status.State = "Idle";
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

    hurt(damage) {
        damage -= this.Status.DEF;
        this.Status.HP -= damage > 0 ? damage : 1;
        //send to client this monster was hurt

    }

    normalMoving() {
        setTimeout(() => {
            this.setTargetPosition(Math.random()*8);
        }, (Math.random() * 5) + 3);
    }
}

findDirection = (x1, x2) => {
    return x1 < x2 ? 1 : -1;
}
findDistance = (x1, x2) => {
    return Math.abs(x1 - x2)
}
module.exports = Monster;

