(function(){

    const
        TOMB_ID = "kesiev-slots",
        TOMB_TAGS = [ "tomb", "luck" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        WHEELS = 3,
        WHEEL_TIME = 4,
        HOLD_OFF = { isHold:true, image:"tombs/kesiev/images/texture.png", imageX:5, imageY:2 },
        HOLD_ON = { isHold:true, image:"tombs/kesiev/images/texture.png", imageX:6, imageY:2 },
        HOLD_DISABLED = { isHold:true, image:"tombs/kesiev/images/texture.png", imageX:7, imageY:2 },
        WHEEL_ANIMATION = [
            { isSymbol:true, image:"tombs/kesiev/images/texture.png", imageX:6, imageY:1 },
            { isSymbol:true, image:"tombs/kesiev/images/texture.png", imageX:7, imageY:1 },
        ],
        WHEEL_SYMBOLS = [
            { symbolName:"Pear", isSymbol:true, image:"tombs/kesiev/images/texture.png", imageX:0, imageY:2 },
            { symbolName:"Horseshoe", isSymbol:true, image:"tombs/kesiev/images/texture.png", imageX:1, imageY:2 },
            { symbolName:"Bell", isSymbol:true, image:"tombs/kesiev/images/texture.png", imageX:2, imageY:2 },
            { symbolName:"Cherry", isSymbol:true, image:"tombs/kesiev/images/texture.png", imageX:3, imageY:2 },
            { symbolName:"Berry", isSymbol:true, image:"tombs/kesiev/images/texture.png", imageX:4, imageY:2 }
        ];

    function evaluateSlots(slots) {
        let
            count = [];
        slots.forEach(wheel=>{
            count[wheel] = count[wheel] ? count[wheel] + 1 : 1;
        });
        
        if (count[0] == WHEELS)
            return { rank:"Lucky Pear Jackpot", payout:100 };
        else if (count[1] == WHEELS)
            return { rank:"Lucky Jackpot", payout:50 };
        else if (count[2] == WHEELS)
            return { rank:"Bell Jackpot", payout:20 };
        else if (count[3] == WHEELS)
            return { rank:"Cherry Jackpot", payout:10 };
        else if (count[4] == WHEELS)
            return { rank:"Berry Jackpot", payout:5 };
        else if (count[1] == 2)
            return { rank:"Double Luck", payout:2 };
        else if (count[1] == 1)
            return { rank:"Single Luck", payout:1 };
        else
            return { rank:"Nothing", payout:0 };
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Pear Room",
        description:"The classic Slots game.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            { type:"audio", title:"Jazz Extravaganza", by:[ "Boo and Spin Dizzy" ], id:"kesiev-slots1",mod:"tombs/kesiev/audio/music/boo_-_jazz_extravaganza.xm", isSong:true},
            { type:"audio", title:"Slot SFX", by:[ "KesieV" ], id:"kesiev-slot1", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"whitenoise","sustain":0.02,"decay":0.018,"release":0.024,"frequency":1540,"bitCrush":0,"bitCrushSweep":0,"attack":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0} },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    music:"kesiev-slots1",
                    name:this.name,
                    author:this.byArchitect,
                    width:WHEELS,
                    height:4,
                    isSolved:false,
                    gameState:0,
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    ficheValue = Math.ceil(room.goldBudget/20),
                    wheelTimer = 0,
                    wheels = [],
                    holds = [],
                    holdCount = 0,
                    holdState = [],
                    slotValue = [];

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Draw the slots

                // Paint the "architect strips", so the drum machine is more visible
                game.tools.paintFloor(0, { x:room.x, y:room.y, width:room.width, height:1 }, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);
                game.tools.paintFloor(0, { x:room.x, y:room.y+3, width:room.width, height:1 }, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);

                // Paint the wheels
                game.tools.paintFloor(0, { x:room.x, y:room.y+1, width:room.width, height:1 }, game.tools.SOLID, [
                    { image:"tombs/kesiev/images/texture.png", imageX:5, imageY:1, backgroundColor:CONST.COLORS.WHITE },
                ]);

                // Paint the slot wheels and hold buttons
                for (let i=0;i<room.width;i++) {
                    let
                        wheel = { x:room.x+i, y:room.y+1, width:1, height:1 },
                        hold = { x:room.x+i, y:room.y+2, width:1, height:1 };

                    wheels.push(wheel);
                    holds.push(hold);

                    game.tools.addFloorDecoration(0, wheel, game.tools.SOLID, [ room.random.element(WHEEL_SYMBOLS) ], true);
                    game.tools.addFloorDecoration(0, hold, game.tools.SOLID, [ HOLD_DISABLED ], true);
                }

                // Do not allow random decorations on the slots area
                game.tools.setFloorPaintable({ x:room.x, y:room.y+1, width:room.width, height:2 }, false);
                game.tools.setElementPaintable({ x:room.x, y:room.y+1, width:room.width, height:2 }, false);

                // --- Place the slot lever

                let
                    walkableWalls = game.tools.getWalkableWalls(room),
                    leverPosition = room.random.element(walkableWalls);

                game.tools.addWallDecoration(0, leverPosition, leverPosition.side, game.tools.SOLID, [
                    {  isLever:true, image:"images/texture.png", imageX:3, imageY:1 }
                ]);

                game.tools.onBumpWall(leverPosition.x, leverPosition.y, leverPosition.side, [
                    {
                        if:{
                            asContext:"room",
                            is:{ isSolved:true }
                        },
                        dialogueSay:[
                            {
                                text:"This lever is now stuck..."
                            }
                        ]
                    },{
                        if:{ and:true },
                        endScript:true,
                    },{
                        run:(game, context, done)=>{
                            let
                                result = true,
                                isResetHold = false,
                                isPayOut = false;

                            room.isNewRoll = false;

                            switch (room.gameState) {
                                case 0:{
                                    // First game, no payout.
                                    room.isNewRoll = true;
                                    isResetHold = true;
                                    break;
                                }
                                case 2:{
                                    // Some wheel to roll?
                                    if (holdCount<room.width) {
                                        // Roll again...
                                        room.isNewRoll = true;
                                    } else {
                                        // Else, payout, reset, and new rool
                                        isPayOut = true;
                                        room.isNewRoll = true;
                                        isResetHold = true;
                                        room.gameState = 0;
                                    }
                                    break;
                                }
                                case 4:{
                                    // New game
                                    isPayOut = true;
                                    room.isNewRoll = true;
                                    isResetHold = true;
                                    room.gameState = 0;
                                    break;
                                }
                                default:{
                                    result = false;
                                }
                            }

                            if (isPayOut) {
                                room.rank = evaluateSlots(slotValue); 
                                room.payOut = room.rank.payout * ficheValue;
                                room.isPayOut = room.payOut > 0;
                                game.tools.playerGainGold(room, room.payOut);
                                if (room.goldBudget <= 0) {
                                    isResetHold = true;
                                    room.isNewRoll = false;
                                    room.isSolved = true;
                                }
                            } else
                                room.isPayOut = false;

                            if (isResetHold) {
                                holdCount = 0;
                                holds.forEach((hold,id)=>{
                                    holdState[id] = false;
                                    game.tools.addFloorDecoration(0, hold, game.tools.SOLID, [ HOLD_DISABLED ], true);
                                });
                            }

                            done(result);
                        }
                    },{
                        if: { else:true },
                        dialogueSay:[
                            {
                                text:"A voice says: \"Please, wait!\""
                            }
                        ]
                    },{
                        if:{ else:true },
                        endScript:true
                    },{
                        if:{
                            asContext:"room",
                            is:{ isPayOut:true }
                        },
                        asContext:"room",
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:ARCHITECT.layout.name,
                                text:"You scored a {rank.rank}! You won {payOut} Golden Coins."
                            }
                        ]
                    },{
                        if:{ and:true },
                        asContext:"room",
                        unlockRoomItemOnly:true
                    },{
                        if:{
                            asContext:"room",
                            is:{ isSolved:true }
                        },
                        dialogueSay:[
                            {
                                text:"It looks like the coin box is empty..."
                            }
                        ]
                    },{
                        if:{
                            asContext:"room",
                            is:{ isNewRoll:true }
                        },
                        playAudio:{ sample:"lever1" }
                    },{
                        if:{ and:true },
                        changeWallDecoration:{
                            area:leverPosition,
                            side:leverPosition.side,
                            id:"isLever",
                            values:{ imageX:4 }
                        },
                        refreshScreen:true
                    },{
                        if:{ and:true },
                        run:(game, context, done)=>{
                            holds.forEach((hold,id)=>{
                                game.tools.addFloorDecoration(0, hold, game.tools.SOLID, [ HOLD_DISABLED ], true);
                            });
                            room.isRolling = true;
                            room.gameState++;
                            wheelTimer = 0;
                            done(true);
                        }
                    },{
                        if:{ and:true},
                        wait:500
                    },{
                        if:{ and:true },
                        changeWallDecoration:{
                            area:leverPosition,
                            side:leverPosition.side,
                            id:"isLever",
                            values:{ imageX:3 }
                        },
                        refreshScreen:true
                    }
                ]);

                // Avoid random decorations on the lever
                game.tools.setWallPaintable(leverPosition.x, leverPosition.y, leverPosition.side, false);

                // Protect the lever area, so the architect doesn't spawn there
                game.tools.setProtected(leverPosition.front, true);

                // --- Place the architect

                // Protect the slots area, so the architect doesn't spawn there
                game.tools.setProtected({ x:room.x, y:room.y+1, width:room.width, height:room.height-2 }, true);

                let
                    walkableCells = game.tools.getWalkableCells(room),
                    architectPosition = room.random.element(walkableCells),
                    architect = game.tools.addNpc(architectPosition.x, architectPosition.y, Tools.clone(ARCHITECT.layout));

                game.tools.onInteract(architect,[
                    {
                        if:{
                            asContext:"room",
                            is:{ isSolved:true }
                        },
                        subScript:[
                            game.tools.scriptArchitectPaidQuote(game,room, ARCHITECT),
                            {
                                dialogueSay:[
                                    {
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"Well... Lady Luck really helped you out!"
                                    }
                                ]
                            },
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"It's time to test your luck!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // --- Animate the slot

                room.onFrame = (game)=>{

                    if ((room.gameState == 1) || (room.gameState == 3)) {
                        for (let i=0;i<room.width;i++) {
                            let
                                wheelTime = WHEEL_TIME*(i+1);
                            if (!holdState[i])
                                if (wheelTimer < wheelTime)
                                    game.tools.changeFloorDecoration(wheels[i], "isSymbol", WHEEL_ANIMATION[wheelTimer%WHEEL_ANIMATION.length]);
                                else if (wheelTimer == wheelTime) {
                                    game.tools.playAudio("kesiev-slot1");
                                    slotValue[i]=room.random.elementIndex(WHEEL_SYMBOLS);
                                    game.tools.changeFloorDecoration(wheels[i], "isSymbol", WHEEL_SYMBOLS[slotValue[i]]);
                                }
                        }
                        if (wheelTimer == room.width*WHEEL_TIME) {
                            room.gameState++;
                            if (room.gameState == 2)
                                holds.forEach((hold,id)=>{
                                    holdState[id] = false;
                                    game.tools.addFloorDecoration(0, hold, game.tools.SOLID, [ HOLD_OFF ], true);
                                });
                        } else
                            wheelTimer++;
                    }   
                }

                // --- Add hints

                let
                    hintRandom = room.random.clone(),
                    sequence = [];

                for (let i=0;i<6;i++)
                    sequence.push(hintRandom.element(WHEEL_SYMBOLS).symbolName);

                game.tools.hintAddSequence(room, sequence);

                // --- Give the "hold" card when the player enters the room

                game.tools.onEnter(room,[
                    {
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        addInventoryItem:{
                            data:{
                                id:"kesiev-race-card",
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,                                
                                model:"default",
                                image:"push"
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                result = 0;
                                            if (room.gameState == 2) {
                                                result = 1;
                                                holds.forEach((hold,id)=>{
                                                    if ((hold.x == game.position.x) && (hold.y == game.position.y)) {
                                                        holdState[id] = !holdState[id];
                                                        game.tools.addFloorDecoration(0, hold, game.tools.SOLID, [ holdState[id] ? HOLD_ON : HOLD_OFF ], true);
                                                        game.tools.refreshScreen();
                                                        if (holdState[id])
                                                            holdCount++;
                                                        else
                                                            holdCount--;
                                                        result = 2;
                                                    }
                                                });
                                            }
                                            done(result);
                                        }  
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result: 0 }
                                        },
                                        dialogueSay:[     
                                            {
                                                text:"Nothing happens..."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result: 1 }
                                        },
                                        dialogueSay:[     
                                            {
                                                text:"This doesn't seem like the right place..."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result: 2 }
                                        },
                                        playAudio:{ sample:"mouseclick1" }
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Take back the "hold" card when the player leaves the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);

            });

        }
    })
    
})();

