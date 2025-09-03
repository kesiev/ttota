(function(){

    const
        TOMB_ID = "kesiev-scratch",
        TOMB_TAGS = [ "tomb", "luck" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        SCRATCH_WIDTH = 4,
        SCRATCH_HEIGHT = 4,
        MIN_WIN = 3,
        RANGE_WIN = 5,
        ICON_WIN = { color:CONST.COLORS.GREEN, character:"!" },
        ICON_LOSE = { color:CONST.COLORS.GRAY, character:CONST.MAPSYMBOLS.FLOOR },
        TEXTURE_EMPTY = [
            { image:"tombs/kesiev/images/texture.png", imageX:3, imageY:4, backgroundColor:CONST.COLORS.GRAY }
        ],
        TEXTURE_LOSE = [
            { image:"tombs/kesiev/images/texture.png", imageX:3, imageY:4, backgroundColor:CONST.COLORS.WHITE },
            { image:"tombs/kesiev/images/texture.png", imageX:4, imageY:4 },
        ],
        TEXTURE_WIN = [
            { image:"tombs/kesiev/images/texture.png", imageX:3, imageY:4, backgroundColor:CONST.COLORS.WHITE },
            { image:"tombs/kesiev/images/texture.png", imageX:5, imageY:4 }
        ];

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Four-Leaf Room",
        description:"A giant scratch card.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"Jazz Extravaganza", by:[ "Boo and Spin Dizzy" ], id:"kesiev-scratch1",mod:"tombs/kesiev/audio/music/boo_-_jazz_extravaganza.xm", isSong:true},
            { type:"audio", id:"kesiev-scratch-scratch1", title:"Scratch SFX", by:[ "AntumDeluge" ], file:"tombs/kesiev/audio/sfx/scratch1" },
            { type:"audio", id:"kesiev-scratch-victory1", title:"Victory SFX", by:[ "Kenney" ], file:"tombs/kesiev/audio/sfx/victory1" },
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    music:"kesiev-scratch1",
                    name:this.name,
                    author:this.byArchitect,
                    width:SCRATCH_WIDTH,
                    height:SCRATCH_HEIGHT,
                    attempts:0,
                    attemptsLimit:5,
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                // --- Prepare the scratch card

                let
                    hintSequence = [],
                    card = [],
                    victories = MIN_WIN+Math.floor((1-room.difficulty)*RANGE_WIN),
                    victoriesToGo = victories,
                    hintLimit = victories;

                room.attempts -= victories-2;

                do {
                    let
                        isOk = false,
                        x = room.random.integer(SCRATCH_WIDTH),
                        y = room.random.integer(SCRATCH_HEIGHT);

                    if (!card[y]) {
                        card[y] = [];
                        isOk = true;
                    } else
                        isOk = !card[y][x];

                    if (isOk) {
                        card[y][x] = 1;
                        victories--;
                        if (hintSequence.length<hintLimit) {
                            hintSequence.push(x);
                            hintSequence.push(y);
                        }
                    }

                } while (victories);

                game.tools.hintAddSequence(room, hintSequence);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Paint the room

                game.tools.paintFloor(0, room, game.tools.SOLID, TEXTURE_EMPTY);
                game.tools.setElementPaintable(room, false);
                game.tools.setFloorPaintable(room, false);

                // --- Prepare the architect positions

                let
                    walkableCells = game.tools.getWalkableCells(room),
                    architect,
                    architectPositions = [],
                    architectPosition;

                for (let i=0;i<3;i++)
                    architectPositions.push(room.random.removeElement(walkableCells));

                architectPosition = architectPositions[0];
                
                architect = game.tools.addNpc(architectPosition.x, architectPosition.y, Tools.clone(ARCHITECT.layout));
                architect.positions = architectPositions;
                architect.currentPosition = 0;
                room.architect = architect;
                
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
                                        text:"Well. Sometimes you just need a stroke of luck!"
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
                                text:"I wonder what's down here. Oh, sorry. I'll move."
                            }
                        ]
                    },{
                        run:(game, context, done)=>{
                            let
                                position;

                            context.as.currentPosition = (context.as.currentPosition+1)%context.as.positions.length;
                            position = context.as.positions[context.as.currentPosition];

                            game.tools.moveElementAt(context.as, position.x, position.y);

                            game.tools.refreshScreen();

                            done(true);

                        }
                    }
                ]);

                // --- Give the "scratch" card when the player enters the room

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
                                image:"gold"
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                result = 0,
                                                position = game.tools.getRoomPosition(room);

                                            if (position) {
                                                if (!card[position.roomY])
                                                    card[position.roomY]=[];
                                                switch (card[position.roomY][position.roomX]) {
                                                    case 1:{
                                                        context.room.attempts++;
                                                        game.tools.paintFloor(0, position.cell, game.tools.SOLID, TEXTURE_WIN, true);
                                                        game.tools.paintMapSymbol(position.cell, ICON_WIN.character);
                                                        game.tools.paintMapSymbolBgColor(position.cell, ICON_WIN.color);
                                                        card[position.roomY][position.roomX] = 2;
                                                        victoriesToGo--;
                                                        if (victoriesToGo)
                                                            result = 2;
                                                        else
                                                            result = 3;
                                                        break;
                                                    }
                                                    case 2:{
                                                        result = 0;
                                                        break;
                                                    }
                                                    default:{
                                                        context.room.attempts++;
                                                        game.tools.paintFloor(0, position.cell, game.tools.SOLID, TEXTURE_LOSE, true);
                                                        game.tools.paintMapSymbol(position.cell, ICON_LOSE.character);
                                                        game.tools.paintMapSymbolBgColor(position.cell, ICON_LOSE.color);
                                                        card[position.roomY][position.roomX] = 2;
                                                        result = 1;
                                                        break;
                                                    }
                                                }
                                            }

                                            done(result);
                                        }  
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:0 }
                                        },
                                        dialogueSay:[
                                            {
                                                text:"No matter how hard you scratch, nothing happens."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:1 }
                                        },
                                        playAudio:{ sample:"kesiev-scratch-scratch1" }
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:2 }
                                        },
                                        playAudio:{ sample:"kesiev-scratch-victory1" }
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:3 }
                                        },
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
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Take back the "move cell" card when the player exits the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);
                
            });

        }
    })
    
})();

