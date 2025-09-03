let Locks=function(game) {

    function giveKey(id) {
        let
            newItem = game.inventory.addItem(0, {
                isKey:true,
                id:"key-"+id,
                group:CONST.GROUP.KEY,
                color:CONST.ITEMCOLOR.KEY,
                model:"key",
                shape:id,
                uses:game.keyDoors[id]
            });
        game.tools.onUse(newItem,[
            {
                if:{
                    asContext:"cell",
                    is:{
                        isDoor:true,
                        needsKey:id
                    }
                },
                asContext:"cell",
                openDoor:true
            },{
                if:{ and:true },
                sumAttribute:"uses",
                byValue:-1
            },{
                if:{ else:true },
                dialogueSay:[
                    {
                        text:"A key with a "+CONST.KEY_NAMES[id]+"-shaped symbol."
                    }
                ]
            },{
                if:{ is:{ uses:0 } },
                removeInventoryItem:true
            }
        ]);
        game.audio.playAudio(game.audio.audio.equip1);
        return newItem;
    }

    function gainGoldBudget(room, score) {
        let
            out = " ",
            gain = Math.floor(room.goldBudget*score);

        if (gain > 0) {
            out += "gained "+gain+" Golden Coin"+(gain == 1 ? "" : "s")+" and "
            game.player.gainGold(room, gain);
        };
        return out;
    }

    function unlock(room, giveGold, score, done) {
        if (game.player.isAlive && room.unlock) {

            let
                unlock = room.unlock,
                keyId = "key-"+unlock.key;

            room.unlock = 0;

            if (unlock.partOf) {
                let
                    partId = keyId+"-part",
                    item = game.inventory.getItem(partId),
                    ownedParts = item ? item.counter : 0;

                if (ownedParts) {
                    ownedParts++;
                    if (ownedParts>=unlock.partOf) {
                        game.inventory.removeItem(item);
                        giveKey(unlock.key, done);
                        game.dialogue.say(0, [
                            {
                                text:"You"+(giveGold ? gainGoldBudget(room, score) : " ")+"completed the "+Tools.capitalize(CONST.KEY_NAMES[unlock.key])+" Key!"
                            }
                        ], ()=>{
                            done();
                        });
                    } else {
                        game.inventory.setCounter(item, ownedParts);
                        game.dialogue.say(0, [
                            {
                                text:"You"+(giveGold ? gainGoldBudget(room, score) : " ")+"got another Key Part!"
                            }
                        ], ()=>{
                            done();
                        });
                        game.audio.playAudio(game.audio.audio.equip1);
                    }
                } else {
                    let
                        newItem = game.inventory.addItem(0, {
                            id: partId,
                            group:CONST.GROUP.KEYPART,
                            counter:1,
                            of: unlock.partOf,
                            color:CONST.ITEMCOLOR.KEY,
                            model:"default",
                            image:"brokenKey"
                        });
                    game.tools.onUse(newItem,[
                        {
                            dialogueSay:[
                                {
                                    text:"Some pieces of a key. They don't look very useful now."
                                }
                            ]
                        }
                    ]);
                    game.dialogue.say(0, [
                        {
                            text:"You"+(giveGold ? gainGoldBudget(room, score) : " ")+"got a Key Part!"
                        }
                    ], ()=>{
                        done();
                    });
                    game.audio.playAudio(game.audio.audio.equip1);
                }

            } else {
                giveKey(unlock.key, done);
                game.dialogue.say(0, [
                    {
                        text:"You"+(giveGold ? gainGoldBudget(room, score) : " ")+"got the "+Tools.capitalize(CONST.KEY_NAMES[unlock.key])+" Key!"
                    }
                ], ()=>{
                    done();
                });
            }

        } else
            done();
    }

    this.useKeyForDoor=(door)=>{
        if (!door.needsKey || CONST.DEBUG.openDoors) {
            game.tools.openDoor(door);
            return true;
        } else {
            let
                item = game.inventory.getItem("key-"+door.needsKey);
            if (item) {
                game.events.runEvent({
                    as:item,
                    cell:door,
                    room:game.position.currentRoom
                },[ "onUse" ]);
                return true;
            }
        }
    }

    this.unlockWithAttempts=(room, attempt, maxattempts, done)=>{
        unlock(room, true, 1-Math.min(1,Math.max(0,(attempt-1)/maxattempts)), done );
    }

    this.unlockWithScore=(room, score, maxscore, done)=>{
        unlock(room, true, Math.min(1,Math.max(0,score/maxscore)), done );
    }

    this.unlock=(room, done)=>{
        unlock(room, true, 1, done );
    }

    this.unlockItemOnly=(room, done)=>{
        unlock(room, false, 1, done );
    }

}