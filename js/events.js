let Events=function Events(game) {

    let
        currentContext,
        currentThen,
        currentProcess,
        isRunning,
        ifAnd,
        ifElse;

    function getEvent(element,ids) {
        if (element._events) {
            let
                root = element._events;

            for (let i=0;i<ids.length;i++)
                if (root[ids[i]])
                    root = root[ids[i]];
                else
                    return false;

            return root;
        }
    }

    function endScript() {
        if (isRunning) {
            isRunning = false;
            game.tools.unlockMovement();
            if (currentThen)
                currentThen();
        }
    }

    function runEvent() {
        let
            line,
            process;
            
        process = currentProcess[currentProcess.length-1];

        process.line++;
        line = process.script[process.line];

        if (line) {
            let
                run = true,
                done = true,
                as = line.as || (line.asContext && currentContext[line.asContext]) || currentContext.as,
                times = line.times || 1;

            for (let i=0;i<times;i++) {
                    
                if (line.debugger)
                    debugger;

                if (line.if) {
                    let
                        condition = line.if,
                        as = condition.as || (condition.asContext && currentContext[condition.asContext]) || currentContext.as;


                    if (condition.else)
                        run = ifElse;
                    else if (condition.and)
                        run = ifAnd;
                    else {

                        run = true;

                        if (run && condition.canPay)
                            run = game.tools.playerCanPay(condition.canPay);

                        if (run && condition.cantPay)
                            run = !game.tools.playerCanPay(condition.cantPay);

                        if (run && condition.is)
                            for (let k in condition.is) {
                                if (as[k] != condition.is[k]) {
                                    run = false;
                                    break;
                                }
                            }

                        if (condition.not)
                            run = !run;

                        ifAnd = run;
                        ifElse = !run;

                    }

                }

                if (run) {

                    // --- JS integration

                    if (line.run) {
                        line.run(game,currentContext,(result)=>{
                            currentContext.lastRun = { result:result };
                            ifAnd = result;
                            ifElse = !result;
                            runEvent();
                        })
                        done = false;
                    } else if (line.subScript) {
                        currentProcess.push({ script:line.subScript, line:-1 });
                        break;
                    } else

                    // --- NPCs

                    if (line.changeNpc)
                        game.tools.changeNpc(as, line.changeNpc);
                    else
                    
                    // --- Elements

                    if (line.removeElement)
                       game.tools.removeElement(as);
                    else if (line.hideElement)
                       game.tools.hideElement(as);
                    else if (line.showElement)
                       game.tools.showElement(as);
                    else

                    // --- Map building

                    // --- Cell protection

                    // --- Painting
                    
                    if (line.paintFloor)
                        game.tools.paintFloor(0, as, line.paintFloor.pattern ,line.paintFloor.texture ,line.paintFloor.force);
                    else if (line.paintMapSymbol)
                        game.tools.paintMapSymbol(as, line.paintMapSymbol);
                    else if (line.paintMapSymbolColor)
                        game.tools.paintMapSymbolColor(as, line.paintMapSymbolColor);
                    else if (line.paintMapSymbolBgColor)
                        game.tools.paintMapSymbolBgColor(as, line.paintMapSymbolBgColor);
                    else

                    // --- Wall decorations

                    if (line.changeWallDecoration) {
                        game.tools.changeWallDecoration(
                            line.changeWallDecoration.area,
                            line.changeWallDecoration.side, 
                            line.changeWallDecoration.id, 
                            line.changeWallDecoration.values
                        );
                    } else if (line.addWallDecoration) {
                        game.tools.addWallDecoration(
                            0,
                            line.changeWallDecoration.area,
                            line.changeWallDecoration.side,
                            line.changeWallDecoration.mode || game.tools.SOLID,
                            line.changeWallDecoration.values
                        )
                    } else

                    // --- Floor decoration

                    // --- Ceiling decoration

                    // --- Special decorations

                    // --- Layout helpers

                    // --- Wall interactions

                    // --- Navigation

                    // --- Movement locking

                    if (line.lockMovement)
                        game.tools.lockMovement();
                    else if (line.unlockMovement)
                        game.tools.unlockMovement();
                    else

                    // --- Player

                    if (line.hitPlayer)
                        game.tools.hitPlayer(line.hitPlayer);
                    else if (line.healPlayer)
                        game.tools.healPlayer(line.healPlayer);
                    else if (line.playerGainGold)
                        game.tools.playerGainGold(as, line.playerGainGold);
                    else if (line.playerPayGold)
                        game.tools.playerPayGold(line.playerPayGold);
                    else if (line.movePlayerBack)
                        game.tools.movePlayerBack();
                    else if (line.movePlayerTo)
                        game.tools.movePlayerTo(as.x, as.y);
                    else
                    
                    // --- Inventory

                    if (line.addInventoryItem) {
                        let
                            data = {},
                            item;

                        for (let k in line.addInventoryItem.data)
                            data[k] = line.addInventoryItem.data[k];
                            
                        item = game.tools.addInventoryItem(as, data, line.addInventoryItem.className, line.skipAnimation);
                        if (line.addInventoryItem.events) {
                            if (line.addInventoryItem.events.onUse)
                                game.tools.onUse(item,line.addInventoryItem.events.onUse);
                        }

                        game.tools.playAudio("equip1");
                    } else if (line.removeInventoryItem)
                        game.tools.removeInventoryItem(as, line.skipAnimation);
                    else if (line.removeInventoryItemsFromRoom)
                        game.tools.removeInventoryItemsFromRoom(as, line.skipAnimation);
                    else if (line.storeInventoryItemsFromRoom)
                        game.tools.storeInventoryItemsFromRoom(as);
                    else if (line.restoreInventoryItemsFromRoom) {
                        if (game.tools.restoreInventoryItemsFromRoom(as))
                            game.tools.playAudio("equip1");
                    } else if (line.setInventoryItemAnimation)
                        game.tools.setInventoryItemAnimation(as, line.setInventoryItemAnimation);
                    else

                    // --- Dialogue

                    if (line.dialogueSay) {
                        game.tools.dialogueSay(as, line.dialogueSay, (answers)=>{
                            if (!currentContext.answers)
                                currentContext.answers = {};
                            for (let k in answers)
                                currentContext.answers[k] = answers[k];
                            runEvent();
                        });
                        done = false;
                        break;
                    } else

                    // --- Doors

                    if (line.openDoor)
                        game.tools.openDoor(as);
                    else

                    // --- Room unlockings

                    if (line.unlockRoom) {
                        game.tools.unlockRoom(as, ()=>{
                            runEvent();
                        })
                        done = false;
                        break;
                    } else if (line.unlockRoomItemOnly) {
                        game.tools.unlockRoomItemOnly(as, ()=>{
                            runEvent();
                        })
                        done = false;
                        break;
                    } else if (line.unlockRoomWithAttempts !== undefined) {
                        game.tools.unlockRoomWithAttempts(as, as[line.unlockRoomWithAttempts], as[line.ofAttempts], ()=>{
                            runEvent();
                        })
                        done = false;
                        break;
                    } else if (line.unlockRoomWithScore !== undefined) {
                        game.tools.unlockRoomWithScore(as, as[line.unlockRoomWithScore], as[line.ofScore], ()=>{
                            runEvent();
                        })
                        done = false;
                        break;
                    } else

                    // --- Audio

                    if (line.resetMusic)
                        game.tools.resetMusic();
                    else if (line.playMusic)
                        game.tools.playMusic(line.playMusic);
                    else if (line.cancelRoomMusic)
                        game.tools.cancelRoomMusic(as);
                    else if (line.stopMusic)
                        game.tools.stopMusic();
                    else if (line.playAudio)
                        game.tools.playAudio(line.playAudio.sample, line.playAudio.loop, line.playAudio.volume, line.playAudio.force );
                    else

                    // --- Checkpoint

                    if (line.setNextCheckpoint)
                        game.tools.setNextCheckpoint(as, line.setNextCheckpoint.id, line.setNextCheckpoint.value);
                    else if (line.sumNextCheckpoint)
                        game.tools.sumNextCheckpoint(as, line.sumNextCheckpoint.id, line.sumNextCheckpoint.value);
                    else

                    // --- Object attributes manipulation

                    if (line.setAttribute !== undefined)
                        as[line.setAttribute] = line.toValue;
                    else if (line.sumAttribute !== undefined)
                        as[line.sumAttribute]+= line.byValue;
                    else if (line.subtractAttribute !== undefined)
                        as[line.subtractAttribute]-= line.byValue;
                    else

                    // --- Script flow

                    if (line.endScript) {
                        done = false;
                        endScript();
                        break;
                    } else if (line.endSubScript) {
                        currentProcess.pop();
                        break;
                    } else if (line.wait) {
                        setTimeout(runEvent, line.wait);
                        done = false;
                        break;
                    } else

                    // --- Debugging

                    if (line.log) {
                        if (CONST.DEBUG.showLogs)
                            console.log(">>>", line.log, as);
                    } else

                    // --- [RESERVED - NOT TOOLS] Main story/run progress

                    if (line.runNextStory)
                        game.menu.progressStory(game);
                    else if (line.progressStory !== undefined)
                        PROGRESS.progressStory(line.progressStory);
                    else if (line.startGameBreak) {
                        done = false;
                        game.menu.startGameBreak(game, ()=>{
                            runEvent();
                        });
                        break;
                    } else if (line.fixDialogueBox) {
                        PROGRESS.progressStory(false);
                        game.dialogue.show();
                    } else if (line.fixTitle)
                        game.menu.fixTitle();
                    else if (line.resetFixedGame)
                        game.menu.resetFixedGame(game);
                    else if (line.goToCredits) {
                        done = false;
                        PROGRESS.progressStory(true);
                        game.menu.goToCredits(game);
                    } else if (line.goBackToIntro) {
                        done = false;
                        // The story ending won't appear again on the same run you've cleared it.
                        game.checkpoints.data["kesiev-lore-st:s"].p = game.checkpoints.data["kesiev-lore-st:s"].n;
                        PROGRESS.setCheckpoints(game.checkpoints);
                        PROGRESS.progressStory(true);
                        game.menu.resetGame(game);
                        break;
                    }
                    else if (line.endRun)
                        game.movement.gameOver(CONST.GAMEOVER.SUCCESS);
                    else
                        console.warn("Can't run line",line);
                    
                    // --- [IT CAN BE ADDED TO ANY LINE] Screen

                    if (line.refreshScreen)
                        game.tools.refreshScreen();

                } else
                    break;

            }

            if (done)
                runEvent();
        } else
            if (currentProcess.length > 1) {
                currentProcess.pop();
                runEvent();
            } else 
                endScript();
    }

    this.runScript=(context,script,then)=>{
        endScript();
        game.tools.lockMovement();
        currentContext = context;
        currentThen = then;
        currentProcess = [ { script:script, line:-1 } ];
        ifAnd = false;
        ifElse = false;
        isRunning = true;
        runEvent();
    }

    this.runEvent=(context,ids,then)=>{
        let
            event = getEvent(context.as,ids);

        if (event) {
            this.runScript(context,event,then);
            return true;
        } else if (then)
            then();
    };
    
    this.add=(element,ids,actions)=>{

        let
            root,
            key = ids[ids.length-1];

        if (!element._events) element._events = {};

        root = element._events;

        for (let i=0;i<ids.length-1;i++) {
            if (!root[ids[i]])
                root[ids[i]] = {};
            root = root[ids[i]];
        }

        if (!root[key]) root[key] = [];
        
        actions.forEach(event=>{
            root[key].push(event);
        })
    }

}