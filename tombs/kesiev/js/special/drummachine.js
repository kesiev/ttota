(function(){

    const
        TOMB_ID = "kesiev-drummachine",
        TOMB_TAGS = [ "tomb", "special" ],
        ARCHITECT=ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        CELLSET = { isCellSet:true, image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0 },
        INSTRUMENTS = [ "kesiev-hihat1", "kesiev-ride1", "kesiev-snaredrum1", "kesiev-bass1" ],
        PATTERNS = [
            {
                title:"Something suspended...",
                set:[
                    [ 1, 1, 1, 1, 1, 1, 1, 1 ],
                    [ 1, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 0, 1, 0, 1 ],
                    [ 1, 1, 0, 0, 1, 0, 1, 0 ]
                ]
            },{
                title:"Something jazzy...",
                set:[
                    [ 0, 0, 1, 1, 0, 1, 1, 0 ],
                    [ 0, 0, 0, 0, 0, 1, 0, 1 ],
                    [ 0, 0, 1, 0, 0, 0, 1, 0 ],
                    [ 1, 0, 0, 0, 1, 0, 0, 0 ]
                ]
            },{
                title:"Something rock...",
                set:[
                    [ 1, 1, 1, 1, 1, 1, 1, 1 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 0, 0, 1, 0 ],
                    [ 1, 0, 0, 1, 0, 0, 0, 0 ]
                ]
            },{
                title:"Something rhythmic...",
                set:[
                    [ 0, 1, 0, 0, 1, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 0, 1, 0, 0 ],
                    [ 1, 0, 0, 1, 0, 0, 0, 1 ]
                ]
            },{
                title:"Something dance...",
                set:[
                    [ 1, 1, 1, 1, 1, 1, 1, 1 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 1 ],
                    [ 0, 0, 1, 0, 0, 0, 1, 0 ],
                    [ 1, 0, 0, 0, 1, 0, 0, 0 ]
                ]
            },{
                title:"Something simple...",
                set:[
                    [ 1, 1, 1, 1, 1, 1, 1, 1 ],
                    [ 0, 0, 0, 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 1, 0, 0, 0 ],
                    [ 1, 0, 0, 0, 0, 0, 0, 0 ]
                ]
            }
        ];

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Noise Room",
        description:"Hear a drum pattern and replicate it on a drum machine.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV"  ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            { type:"audio", id:"kesiev-hihat1", title:"Drum machine SFX", by:[ CONST.CREDITS.UNKNOWN ], file:"tombs/kesiev/audio/sfx/hihat1" },
            { type:"audio", id:"kesiev-ride1", title:"Drum machine SFX", by:[ CONST.CREDITS.UNKNOWN ], file:"tombs/kesiev/audio/sfx/ride1" },
            { type:"audio", id:"kesiev-snaredrum1", title:"Drum machine SFX", by:[ CONST.CREDITS.UNKNOWN ], file:"tombs/kesiev/audio/sfx/snaredrum1" },
            { type:"audio", id:"kesiev-bass1", title:"Drum machine SFX", by:[ CONST.CREDITS.UNKNOWN ], file:"tombs/kesiev/audio/sfx/bass1" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {

            let
                answer = game.random.element(PATTERNS);

            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:answer.set[0].length,
                    height:answer.set.length+1,
                    music:0,
                    isSolved:false,
                    answer:answer,
                    attempts:1,
                    attemptsLimit:5
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    calendarMetadata = {};

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Add hints

                calendarMetadata["Title"] = room.answer.title;

                room.answer.set.forEach((row,id)=>{
                    calendarMetadata["Row "+id] = row.map(bit=>bit ? "#" : "_" ).join("");
                    game.tools.hintAddSequence(room, row.map(bit=>bit ? "&#x266A;" : "x" ));
                });

                room.calendarMetadata = calendarMetadata;

                // --- Prepare drum machine

                room.answerPosition = 0;
                room.position = 0;
                room.prevPosition = 0;
                room.pattern = [];

                for (let i=0;i<room.answer.set.length;i++)
                    room.pattern.push([]);

                // --- Play the pattern

                room.onFrame = (game)=>{

                    switch (room.playbackMode) {
                        case 1:{
                            // Paused
                            break;
                        }
                        case 2:{
                            room.answerPosition = (room.answerPosition+1)%room.width;
                            room.answer.set.forEach((row,id)=>{
                                if (row[room.answerPosition])
                                    game.tools.playAudio(INSTRUMENTS[id]);
                            })
                            break;
                        }
                        default:{
                            room.position = (room.position+1)%room.width;
                            room.pattern.forEach((row,id)=>{
                                game.tools.setFloorLayerAttribute(game.map[room.y+1+id][room.x+room.prevPosition], 0, "backgroundColor", game.dungeon.floorColor);
                                game.tools.setFloorLayerAttribute(game.map[room.y+1+id][room.x+room.position], 0, "backgroundColor", CONST.COLORS.WHITE);
                                if (row[room.position])
                                    game.tools.playAudio(INSTRUMENTS[id]);
                            })
                            room.prevPosition = room.position;
                        }
                    }
                    
                }

                // --- Draw the drum machine

                // Paint the "architect strip", so the drum machine is more visible
                game.tools.paintFloor(0, { x:room.x, y:room.y, width:room.width, height:1 }, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);

                // --- Place the architect

                // Protect the drum machine area, so the architect doesn't spawn there
                game.tools.setProtected({ x:room.x, y:room.y+1, width:room.width, height:room.height-1 }, true);

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
                                        text:"Oh, and thanks! That was the rhythm I was looking for!"
                                    }
                                ]
                            },
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        asContext:"room",
                        setAttribute:"playbackMode",
                        toValue:1
                    },{
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Hey! I had a little beat in mind..."
                            },{
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"It was something like..."
                            }
                        ]
                    },{
                        asContext:"room",
                        setAttribute:"playbackMode",
                        toValue:2
                    },{
                        asContext:"room",
                        setAttribute:"answerPosition",
                        toValue:-1
                    },{
                        as:room.answer,
                        log:true
                    },{
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:room.answer.title
                            }
                        ]
                    },{
                        asContext:"room",
                        setAttribute:"playbackMode",
                        toValue:1
                    },{
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Can you help me?"
                            }
                        ]
                    },{
                        asContext:"room",
                        setAttribute:"playbackMode",
                        toValue:0
                    },{
                        asContext:"room",
                        setAttribute:"position",
                        toValue:-1
                    },
                    { movePlayerBack:true }
                ]);

                // Protect the cell, so the lever won't spawn there
                game.tools.setProtected(architectPosition, true);

                // --- Place the confirmation lever

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
                        dialogueSay:[
                            {
                                text:"This lever is connected to this room floor. Do you want to pull it?",
                                options:[
                                    {
                                        id:"pullIt",
                                        value:true,
                                        label:"Pull it"
                                    },{
                                        id:"pullIt",
                                        value:false,
                                        label:"Leave"
                                    }
                                ]
                            }
                        ]
                    },{
                        if:{
                            asContext:"answers",
                            is:{ pullIt:false }
                        },
                        endScript:true
                    },{
                        playAudio:{ sample:"lever1" }
                    },{
                        changeWallDecoration:{
                            area:leverPosition,
                            side:leverPosition.side,
                            id:"isLever",
                            values:{ imageX:4 }
                        },
                        refreshScreen:true
                    },{
                        run:(game, context, done)=>{
                            let
                                correct = true;

                            room.answer.set.forEach((row,rowId)=>{
                                row.forEach((cell,cellId)=>{
                                    if (!cell != !room.pattern[rowId][cellId])
                                        correct = false;
                                })
                            })

                            done(correct);
                        }
                    },{
                        if:{ and:true },
                        asContext:"room",
                        cancelRoomMusic:true
                    },{
                        if:{ and:true },
                        asContext:"room",
                        setAttribute:"playbackMode",
                        toValue:1
                    },{
                        if:{ and:true },
                        asContext:"room",                                        
                        removeInventoryItemsFromRoom:true
                    },{
                        if:{ and:true },
                        asContext:"room",
                        unlockRoomWithAttempts:"attempts",
                        ofAttempts:"attemptsLimit"
                    },{
                        if:{ and:true },
                        asContext:"room",
                        setAttribute:"isSolved",
                        toValue:true
                    },{
                        if:{ else:true },
                        hitPlayer:2+Math.floor(room.difficulty*3)
                    },{
                        if:{ else:true },
                        asContext:"room",
                        sumAttribute:"attempts",
                        byValue:1
                    },{
                        if:{ else:true },
                        dialogueSay:[
                            {
                                text:"You feel an electric shock coming from the lever. Probably the rhythm is not right..."
                            }
                        ]
                    },{
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

                // --- Give the "set cell" card when the player enters the room

                game.tools.onEnter(room,[
                    {
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        addInventoryItem:{
                            data:{
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
                                                position = game.tools.getRoomPosition(room);

                                            if (position && (position.roomY > 0)) {
                                                let
                                                    instrument = position.roomY-1,
                                                    value = !room.pattern[instrument][position.roomX],
                                                    cell = game.map[game.position.y][game.position.x];
                                                
                                                room.pattern[instrument][position.roomX] = value;

                                                if (value) {
                                                    game.tools.addFloorDecoration(0, cell, game.tools.SOLID, CELLSET);
                                                    game.tools.paintMapSymbol(cell, "&#x25CF;");
                                                    game.tools.playAudio(INSTRUMENTS[instrument]);
                                                } else {
                                                    game.tools.removeFloorDecoration(cell, "isCellSet");
                                                    game.tools.paintMapSymbol(cell, CONST.MAPSYMBOLS.FLOOR);
                                                    game.tools.playAudio("nogain1");
                                                }

                                                game.tools.refreshScreen();

                                                done(true);
                                            } else
                                                done(false);
                                        }  
                                    },{
                                        if:{ else:true },
                                        dialogueSay:[
                                            {
                                                text:"A voice in your head says, \"Let's make some noise!\""
                                            }
                                        ]
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

