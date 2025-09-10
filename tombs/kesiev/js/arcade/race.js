(function(){

    let
        TOMB_ID = "kesiev-race",
        TOMB_TAGS = [ "tomb", "arcade" ],
        ARCHITECT= ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        LAPS_COUNT = 3,
        CIRCUIT_PATTERNS = [
            { 
                center:{
                    map:[
                        "..........",
                        ".>>>>>>>V.",
                        ".^......V.",
                        ".^......V.",
                        ".#...V<<<.",
                        ".^...V....",
                        ".^...>>>V.",
                        ".^......V.",
                        ".^<<<<<<<.",
                        "..........",
                    ]
                }
            },{ 
                center:{
                    map:[
                        "..........",
                        ".>>>>>>>V.",
                        ".^<<<<<.V.",
                        "......^.V.",
                        ".>>>V.^.V.",
                        ".^..V.^.V.",
                        ".#..>>^.V.",
                        ".^......V.",
                        ".^<<<<<<<.",
                        "..........",
                    ]
                }
            },{ 
                center:{
                    map:[
                        "..........",
                        ".>>V.>>>V.",
                        ".^.V.^..V.",
                        ".^.V.^..V.",
                        ".^.V.^.V<.",
                        ".^.V.^.V..",
                        ".#.V.^.>V.",
                        ".^.>>^..V.",
                        ".^<<<<<<<.",
                        "..........",
                    ]
                }
            },{ 
                center:{
                    map:[
                        "..........",
                        ".>>>>>>>V.",
                        ".^......V.",
                        ".^<<<<<.V.",
                        "......^.V.",
                        ".>>>V.#.V.",
                        ".^..>>^.V.",
                        ".^......V.",
                        ".^<<<<<<<.",
                        "..........",
                    ]
                }
            },{ 
                center:{
                    map:[
                        "..........",
                        ".V<<<<....",
                        ".V...^....",
                        ".V...^<<<.",
                        ".V......^.",
                        ".>>>V...#.",
                        "....V...^.",
                        "....V...^.",
                        "....>>>>^.",
                        "..........",
                    ]
                }
            }
        ]
        CIRCUIT_PALETTE = {
             ".":{
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                isElementPaintable:true,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                isWallPaintable:[ true, true, true, true ],
                ceiling:[ "defaultCeiling" ],
                floor:[
                    [ { image:"tombs/kesiev/images/texture.png", imageX:4, imageY:0, backgroundColor:CONST.COLORS.GRAY } ]
                ]
            },
            "#":{
                roadDirection:0,
                isStart:true,
                isProtected:true,
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:"&#x2302;",
                mapSymbolBgColor:CONST.COLORS.GRAY,
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                isWallPaintable:[ true, true, true, true ],
                ceiling:[ "defaultCeiling" ],
                floor:[
                    [ { image:"tombs/kesiev/images/texture.png", imageX:4, imageY:1, backgroundColor:CONST.COLORS.WHITE } ]
                ]
            },
            "^":{
                roadDirection:0,
                isProtected:true,
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                mapSymbolBgColor:CONST.COLORS.GRAY,
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                isWallPaintable:[ true, true, true, true ],
                ceiling:[ "defaultCeiling" ],
                floor:[
                    [ { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:1, backgroundColor:CONST.COLORS.WHITE } ]
                ]
            },
            ">":{
                roadDirection:1,
                isProtected:true,
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                mapSymbolBgColor:CONST.COLORS.GRAY,
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                isWallPaintable:[ true, true, true, true ],
                ceiling:[ "defaultCeiling" ],
                floor:[
                    [ { image:"tombs/kesiev/images/texture.png", imageX:1, imageY:1, backgroundColor:CONST.COLORS.WHITE } ]
                ]
            },
            "V":{
                roadDirection:2,
                isProtected:true,
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                mapSymbolBgColor:CONST.COLORS.GRAY,
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                isWallPaintable:[ true, true, true, true ],
                ceiling:[ "defaultCeiling" ],
                floor:[
                    [ { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:1, backgroundColor:CONST.COLORS.WHITE } ]
                ]
            },
            "<":{
                roadDirection:3,
                isProtected:true,
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                mapSymbolBgColor:CONST.COLORS.GRAY,
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                isWallPaintable:[ true, true, true, true ],
                ceiling:[ "defaultCeiling" ],
                floor:[
                    [ { image:"tombs/kesiev/images/texture.png", imageX:3, imageY:1, backgroundColor:CONST.COLORS.WHITE } ]
                ]
            }
        };

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Circuit Room",
        description:"Run automatically on a circuit and steer to the right direction as fast as possible.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"Avalanche", by:[ "Andreas Viklund" ], id:"kesiev-avalanche1",mod:"tombs/kesiev/audio/music/andreas_v_avalanche.xm", isSong:true},
            { type:"image", title:"Architect KesieV's tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            { type:"audio", title:"Lap SFX", by:[ "KesieV" ], id:"kesiev-lap1", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"triangle","attack":0.006,"sustain":0.156,"decay":0.105,"release":0.156,"frequency":595,"frequencyJump1onset":0.19,"frequencyJump1amount":0.26,"frequencyJump2onset":0.27,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump2amount":0,"pitch":0}},
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:CIRCUIT_PATTERNS[0].center.map[0].length,
                    height:CIRCUIT_PATTERNS[0].center.map.length,
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                // --- Blit the circuit
                let
                    circuit = room.random.element(CIRCUIT_PATTERNS),
                    racerCard,
                    laps = 1,
                    time = 0,
                    steps = 0,
                    isStarted = false;

                game.tools.blitPattern(0, room, circuit, CIRCUIT_PALETTE ),
                
                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Place the architect

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
                            game.tools.scriptArchitectPaidQuote(game, room, ARCHITECT),
                            {
                                dialogueSay:[
                                    {
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"Well... that was a great race! See you soon!"
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
                                text:"Do you want to race on this circuit?"
                            },{
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Get ready on the starting line and try to make the best time!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // --- Move the "car" :)

                room.onFrame = (game)=>{

                    if (isStarted) {
                        let
                            cell = game.map[game.position.y][game.position.x];

                        time++;

                        if (cell && (cell.roadDirection !== undefined)) {
                            if (cell.roadDirection == game.position.direction) {
                                let
                                    direction = CONST.DIRECTIONS[cell.roadDirection];
                                game.tools.movePlayerTo(game.position.x+direction.x, game.position.y+direction.y);

                                steps++;
                                cell = game.map[game.position.y][game.position.x];

                                if (cell.isStart) {
                                    laps++;
                                    if (laps > LAPS_COUNT) {
                                        isStarted = false;
                                        room.isSolved = true;
                                        game.tools.unlockControls();
                                        game.tools.resetMusic();
                                        game.tools.unlockRoomWithAttempts(room,time-steps-16+Math.floor(room.difficulty*5),10,()=>{});
                                        game.tools.removeInventoryItemsFromRoom(room);
                                    } else {
                                        game.tools.setInventoryItemCounter(racerCard, laps);
                                        game.tools.setInventoryItemAnimation(racerCard, "bounce");
                                        game.tools.playAudio("kesiev-lap1");
                                    }
                                }
                            }
                        }
                    }
                    
                }

                // --- Give the "set cell" card when the player enters the room

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
                                    {
                                        run:(game, context, done)=>{
                                            if (isStarted)
                                                done(true);
                                            else {
                                                let
                                                    position = game.tools.getRoomPosition(room);
                                                if (position && position.cell.isStart) {
                                                    if (game.position.direction == 0) {
                                                        game.tools.removeInventoryItem(context.as);
                                                        racerCard = game.tools.addInventoryItem(room, {
                                                            group:CONST.GROUP.ROOMITEM,
                                                            color:CONST.ITEMCOLOR.ROOMITEM,                                
                                                            model:"default",
                                                            counter:laps,
                                                            counterOf:LAPS_COUNT,
                                                            sprite:[
                                                                { image:"tombs/kesiev/images/items.png", imageX:2, imageY:2 },
                                                            ]
                                                        });
                                                        game.tools.playMusic("kesiev-avalanche1");
                                                        game.tools.dialogueSay(ARCHITECT.layout, [
                                                            {
                                                                audio:ARCHITECT.voiceAudio,
                                                                by:"{name}",
                                                                text:"I've added a lap indicator to your Pilot Card! Ready to go?"
                                                            },{
                                                                audio:ARCHITECT.voiceAudio,
                                                                by:"{name}",
                                                                text:"3..."
                                                            },{
                                                                audio:ARCHITECT.voiceAudio,
                                                                by:"{name}",
                                                                text:"2..."
                                                            },{
                                                                audio:ARCHITECT.voiceAudio,
                                                                by:"{name}",
                                                                text:"1..."
                                                            },{
                                                                audio:ARCHITECT.voiceAudio,
                                                                by:"{name}",
                                                                text:"GO!"
                                                            }
                                                        ], (answers)=>{
                                                            game.tools.lockControl("up");
                                                            game.tools.lockControl("down");
                                                            isStarted = true;
                                                            done(true);
                                                        });
                                                    } else {
                                                        game.tools.dialogueSay(0, [{
                                                            text:"Now you should be facing the right direction..."
                                                        }], (answers)=>{
                                                            done(true);
                                                        });
                                                    }
                                                } else {
                                                    game.tools.dialogueSay(0, [{
                                                        text:"It looks like this is not the starting line..."
                                                    }], (answers)=>{
                                                        done(true);
                                                    });
                                                }
                                            }
                                        }  
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Take back the "set cell" card when the player leaves the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);

            })
        }
        
    })
    
})();

