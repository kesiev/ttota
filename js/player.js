function Player(game) {

    this.isAlive = true;
    this.maxHealth = 10;
    this.health = this.maxHealth;
    this.gold = 0;
    this.gainedGold = 0;
    this.spentGold = 0;
    this.gainedHealth = 0;
    this.lostHealth = 0;
    this.lostGain = 0;

    this.hit = function (damage) {
        if (this.isAlive) {
            if (!damage) damage = 1;
            if (damage >= this.health) {
                this.isAlive = false;
                this.lostHealth += this.health;
                this.health = 0;
                game.inventory.setCounter(this.healthItem, 0);
                game.movement.playCameraAnimation(game.movement.CAMERA_ANIMATION.DEAD, 1500);
                game.audio.playAudio(game.audio.audio.death1);
                game.movement.gameOver(false);
            } else {
                this.lostHealth += damage;
                this.health -= damage;
                game.movement.playCameraAnimation(game.movement.CAMERA_ANIMATION.HIT);
                game.inventory.setCounter(this.healthItem, this.health);
                game.audio.playAudio(game.audio.audio.pain1);
            }
        }
    }

    this.heal = function (amount) {
        if (this.isAlive) {
            let
                maxAmount = this.maxHealth - this.health;
            if (!amount) amount = 1;
            if (amount > maxAmount)
                amount = maxAmount;

            if (amount) {
                this.health += amount;
                this.gainedHealth += amount;
                game.movement.playCameraAnimation(game.movement.CAMERA_ANIMATION.HEAL);
                game.inventory.setCounter(this.healthItem, this.health);
                game.audio.playAudio(game.audio.audio.cure1);
            } else {
                game.audio.playAudio(game.audio.audio.nogain1);
                this.lostGain++;
            }
        }
    }

    this.kill=()=>{
        this.hit(this.health);
    }

    this.canPay = function(gold) {
        return CONST.DEBUG.noMoney || (this.gold >= gold);
    }

    this.gainGold = function (room, gold) {
        if (this.isAlive && room) {
            if (!gold || (gold < 0))
                gold = 0;
            if (room.goldBudget) {
                gold = Math.ceil(gold);
                if (gold > room.goldBudget) gold = room.goldBudget;
                if (gold) {
                    this.gold += gold;
                    this.gainedGold += gold;
                    room.goldBudget -= gold;
                    game.dungeon.goldBudget -= gold;
                    game.inventory.setCounter(this.goldItem, this.gold);
                    game.audio.playAudio(game.audio.audio.gaingold1);
                }
            } else {
                game.audio.playAudio(game.audio.audio.nogain1);
                this.lostGain++;
            }
        }
    }

    this.payGold = function (gold) {
        if (this.isAlive) {
            if (CONST.DEBUG.noMoney) {
                game.audio.playAudio(game.audio.audio.losegold1);
            } else if (this.gold) {
                if (!gold) gold = 1;
                if (gold > this.gold) gold = this.gold;
                this.gold -= gold;
                this.spentGold += gold;
                game.inventory.setCounter(this.goldItem, this.gold);
                game.audio.playAudio(game.audio.audio.losegold1);
            }
        }
    }

    this.initialize = function () {
            
        this.healthItem = game.inventory.addItem(0,{
            id:"stat-health",
            group:CONST.GROUP.STATS,
            color:CONST.ITEMCOLOR.HEALTH,                                
            model:"default",
            image:"heart",
            counter:this.health,
            of:this.maxHealth
        });

        game.tools.onUse(this.healthItem,[
            {
                dialogueSay:[
                    {
                        text:"You have {counter} Health Points out of {of}. When you hit 0 HP, you will die!"
                    }
                ]  
            }
        ]);

        this.goldItem = game.inventory.addItem(0,{
            id:"stat-gold",
            group:CONST.GROUP.STATS,
            color:CONST.ITEMCOLOR.GOLD,                                
            model:"default",
            image:"gold",
            counter:this.gold
        });

        game.tools.onUse(this.goldItem,[
            {
                dialogueSay:[
                    {
                        text:"You have {counter} Golden Coins. The more GC you have, the richer you are!"
                    }
                ]  
            }
        ])
    }

}