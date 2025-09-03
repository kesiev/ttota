(function(){

    const
        TOMB_ID = "kesiev-simon",
        TOMB_TAGS = [ "tomb", "memory" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        PALETTE = [ "RED", "GREEN", "BLUE", "YELLOW" ],
        GAME_SPEED = 2,
        PLAYER_SPEED = 2,
        MIN_SEQUENCE = 4,
        RANGE_SEQUENCE = 4;

    function showColor(game, room, id) {
        let
            wallTexture = game.dungeon.defaultWall,
            ceilingTexture = game.dungeon.defaultCeiling,
            floorTexture = game.dungeon.defaultFloor;

        if (PALETTE[id])
            wallTexture = ceilingTexture = floorTexture = [
                { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:CONST.COLORS[PALETTE[id]] }
            ];

        game.tools.paintCeiling(0, room, game.tools.SOLID, ceilingTexture, true);
        game.tools.paintWalls(0, room, game.tools.SOLID, wallTexture, true);
        game.tools.paintFloor(0, room, game.tools.SOLID, floorTexture, true);
    }

    function resetGame(game, room) {
        room.status = 0;
        showColor(game, room, -1);
    }

    function startGame(game, room) {
        room.attempts++;
        resetGame(game, room);
        room.round = 1;
        room.sequencePosition = -1;
        room.timer = GAME_SPEED;
        room.status = 1;
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Says Room",
        description:"The classic Simon game.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            { type:"audio", title:"Colors SFX", by:[ "KesieV" ], id:"kesiev-simon-0", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"square","attack":0.015,"sustain":0.02,"decay":0.018,"release":0.2,"frequency":190,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0} },
            { type:"audio", title:"Colors SFX", by:[ "KesieV" ], id:"kesiev-simon-1", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"square","attack":0.015,"sustain":0.02,"decay":0.018,"release":0.2,"frequency":290,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0} },
            { type:"audio", title:"Colors SFX", by:[ "KesieV" ], id:"kesiev-simon-2", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"square","attack":0.015,"sustain":0.02,"decay":0.018,"release":0.2,"frequency":390,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0} },
            { type:"audio", title:"Colors SFX", by:[ "KesieV" ], id:"kesiev-simon-3", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"square","attack":0.015,"sustain":0.02,"decay":0.018,"release":0.2,"frequency":490,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0} },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:3,
                    height:3,
                    music:0,
                    attempts:0,
                    attemptsLimit:3,
                    isSolved:false,
                    status:0
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach((room,id)=>{

                let
                    sequenceLength = MIN_SEQUENCE + Math.ceil(room.difficulty * RANGE_SEQUENCE),
                    hintLength = sequenceLength / 2,
                    sequence = [],
                    hintSequence = [];

                for (let i=0;i<sequenceLength;i++) {
                    let
                        index = room.random.elementIndex(PALETTE);
                    sequence.push(index);
                    if (i<hintLength)
                        hintSequence.push(PALETTE[index]);
                }

                game.tools.hintAddSequence(room, hintSequence);

                // --- No floor/ceiling/wall decorations in the whole room

                game.tools.setEdgesPaintable(room, false);
                game.tools.setFloorPaintable(room, false);
                game.tools.setCeilingPaintable(room, false);

                // --- Add entrance plaques

                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Add the Architect

                let
                    architect = game.tools.addNpc(room.x+1, room.y+1, Tools.clone(ARCHITECT.layout));

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
                                        text:"Well... It's been a long time since I played this game!"
                                    }
                                ]
                            },
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        run:(game, context, done)=>{
                            resetGame(game, room);
                            done(true);
                        }
                    },{
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Let's start from scratch!"
                            }
                        ]
                    },{
                        run:(game, context, done)=>{
                            startGame(game, room);
                            done(true);
                        }
                    },{
                        movePlayerBack:true
                    }
                ]);

                // --- Give the "color cards" cards when the player enters the room

                let
                    cards = [];

                PALETTE.forEach((color,id)=>{
                    cards.push({
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        addInventoryItem:{
                            data:{
                                id:"simon-color-"+id,
                                colorId:id,
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.COLORS[color],
                                model:"default"
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            if ((room.status == 2) && !room.timer) {
                                                showColor(game, room, context.as.colorId);
                                                game.tools.playAudio("kesiev-simon-"+context.as.colorId);
                                                game.tools.refreshScreen();
                                                room.timer = PLAYER_SPEED;
                                                if (sequence[room.inputPosition] == context.as.colorId) {
                                                    room.inputPosition++;
                                                    if (room.inputPosition < room.round) {
                                                        done(true);
                                                    } else {
                                                        if (room.inputPosition < sequence.length) {
                                                            room.round++;
                                                            room.status+=2;
                                                            done(true);
                                                        } else {
                                                            room.isSolved = true;
                                                            game.tools.removeInventoryItemsFromRoom(room);
                                                            game.tools.cancelRoomMusic(room);
                                                            game.tools.unlockRoomWithAttempts(room, room.attempts, room.attemptsLimit,done);
                                                        }
                                                    }
                                                } else {
                                                    room.attempts++;
                                                    room.status+=2;
                                                    game.tools.hitPlayer(1);
                                                    done(true);
                                                }
                                            } else
                                                done(true);
                                        }  
                                    }
                                ]
                            }
                        }
                    });
                });

                game.tools.onEnter(room,cards);

                // --- Take back the "color cards" card and reset the game when the player leaves the room

                game.tools.onLeave(room,[
                    {
                        run:(game, context, done)=>{
                            resetGame(game, room);
                            done(true);
                        }
                    },
                    { removeInventoryItemsFromRoom:true }
                ]);

                // --- Initialize the game

                resetGame(game, room);

                // --- Play the pattern

                room.onFrame = (game)=>{

                    switch (room.status) {
                        case 1:{
                            // Play the sequence
                            if (room.timer)
                                room.timer--;
                            else {
                                room.sequencePosition++;
                                if (room.sequencePosition<room.round) {
                                    let
                                        item = game.tools.getInventoryItem("simon-color-"+sequence[room.sequencePosition]);
                                    game.tools.playAudio("kesiev-simon-"+sequence[room.sequencePosition]);
                                    showColor(game, room, sequence[room.sequencePosition]);
                                    game.tools.setInventoryItemAnimation(item, "bounce");
                                    room.timer = GAME_SPEED;
                                } else {
                                    showColor(game, room, -1);
                                    room.status++;
                                    room.inputPosition = 0;
                                }
                            }
                            break;
                        }
                        case 2:{
                            // Play the player cards
                            if (room.timer) {
                                room.timer--;
                                if (!room.timer)
                                    showColor(game, room, -1);
                            }
                            break;
                        }
                        case 3:{
                            // Wait for the next round
                            if (room.timer) {
                                room.timer--;
                                if (!room.timer) {
                                    room.sequencePosition = -1;
                                    room.status = 1;
                                }
                            }
                            break;
                        }
                        case 4:{
                            // Play wrong color
                            if (room.timer) {
                                room.timer--;
                                if (!room.timer) {
                                    showColor(game, room, -1);
                                    room.timer = GAME_SPEED;
                                    room.status--;
                                }
                            }
                            break;
                        }
                    }
                    
                }

            })
        }
        
    })
    
})();

