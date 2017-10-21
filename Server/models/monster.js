class Monster {
    constructor(id, location, status) {
        this.monsterId = 0;
        this.Location = {
            TargetPosition: { x: 0, y: 0 },
            CurrentPosition: { x: 0, y: 0 },
            Map: ""
        };
        this.movingInterval = undefined;

        this.Status = {
            Name: "สามล้อคลั่ง",
            HP: 100,
            MaxHP: 100,
            DEF : 5,
            EXP : 10,
            Level: 1,
            MovementSpeed: 10
        }
        this.TargetPlayer = undefined;

        this.ItemPool = [10000, 10002];
        //send monsterData to client
    }

    goToTarget() {
        this.movingInterval = setInterval(()=>{
            if(findistance(this.Location.CurrentPosition.x,this.Location.TargetPosition.x) 
            <= 1){
                let moveValue = findDirection(this.Location.CurrentPosition.x,this.Location.TargetPosition.x)
                *this.Status.MovementSpeed;
                this.Location.CurrentPosition.x += moveValue;
            } else {
                //we reach the target
                clearInterval(this.movingInterval);
            }
        }, 90);
    }

    setTargetPosition(x,y){
        this.Location.TargetPosition = {x:x, y:y};
        goToTarget();
    }

    hurt(damage){
        damage -= this.Status.DEF;
        this.Status.HP -= damage > 0 ? damage : 1;
        //send to client this monster was hurt

    }

}

findDirection = (x1,x2)=>{
    return x1<x2?1:-1;
}
findDistance = (x1,x2)=>{
    return Math.abs(x1-x2)
}
module.exports = Monster;