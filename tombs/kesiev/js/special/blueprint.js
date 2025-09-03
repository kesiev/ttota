(function(){

    const
        TOMB_ID = "kesiev-blueprint",
        TOMB_TAGS = [ "tomb", "special" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        GRID_WIDTH = 5,
        GRID_HEIGHT = 5,
        GRID_BORDER = 1;

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Blueprint Room",
        description:"Place the room walls following the instructions scattered around the room.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", id:"kesiev-break1", title:"Breaking SFX", by:[ "rubberduck" ], file:"tombs/kesiev/audio/sfx/break1" },
            { type:"audio", id:"kesiev-build1", title:"Building SFX", by:[ "rubberduck" ], file:"tombs/kesiev/audio/sfx/build1" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:GRID_WIDTH+GRID_BORDER*2,
                    height:GRID_HEIGHT+GRID_BORDER*2,
                    scoreLimit:10,
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                // --- Prepare the solution and the playfield

                let
                    pieces = 0,
                    placements = 0,
                    hint = [],
                    hints = [],
                    solution = [],
                    blockFace = [ Tools.clone(game.dungeon.defaultWallAccentTexture) ],
                    block = [ blockFace, blockFace, blockFace, blockFace ];

                for (let i=0;i<GRID_HEIGHT;i++) {
                    hints.push([]);
                    solution.push([]);
                }

                for (let x=0;x<GRID_WIDTH;x++)
                    for (let y=0;y<GRID_HEIGHT;y++) {
                        let
                            hintPlaces = [];

                        if (room.random.integer(3) == 0) {
                                
                            if (!hints[y][x])
                                hintPlaces.push({ x:x, y:y, symbol:"X" });

                            if (room.difficulty > 0.25) {
                                if ((x<GRID_WIDTH-1) && !hints[y][x+1])
                                    hintPlaces.push({ x:x+1, y:y, symbol:"&#x2190;", ceilingSymbol:"&#x2192;" });
                                if ((x>0) && !hints[y][x-1])
                                    hintPlaces.push({ x:x-1, y:y, symbol:"&#x2192;", ceilingSymbol:"&#x2190;" });
                                if ((y<GRID_HEIGHT-1) && !hints[y+1][x])
                                    hintPlaces.push({ x:x, y:y+1, symbol:"&#x2191;" });
                                if ((y>0) && !hints[y-1][x])
                                    hintPlaces.push({ x:x, y:y-1, symbol:"&#x2193;" });
                            }

                            if (room.difficulty > 0.75) {
                                if ((x<GRID_WIDTH-2) && !hints[y][x+2])
                                    hintPlaces.push({ x:x+2, y:y, symbol:"&#x25C4;", ceilingSymbol:"&#x25BA;" });
                                if ((x>1) && !hints[y][x-2])
                                    hintPlaces.push({ x:x-2, y:y, symbol:"&#x25BA;", ceilingSymbol:"&#x25C4;" });
                                if ((y<GRID_HEIGHT-2) && !hints[y+2][x])
                                    hintPlaces.push({ x:x, y:y+2, symbol:"&#x25B2;" });
                                if ((y>1) && !hints[y-2][x])
                                    hintPlaces.push({ x:x, y:y-2, symbol:"&#x25BC;" });
                            }

                            if (hintPlaces.length) {
                                let
                                    hintPlace = room.random.element(hintPlaces),
                                    hintCell = { x:room.x+hintPlace.x+GRID_BORDER, y:room.y+hintPlace.y+GRID_BORDER, width:1, height:1 },
                                    position = room.random.integer(3);

                                hints[hintPlace.y][hintPlace.x] = true;
                                solution[y][x] = true;
                                pieces++;

                                switch (position) {
                                    case 0:{
                                        game.tools.paintMapSymbol(hintCell, hintPlace.symbol);
                                        break;
                                    }
                                    case 1:{
                                        game.tools.addFloorDecoration(0, hintCell, game.tools.SOLID, [ CONST.TEXTURES.FONT[hintPlace.symbol] ],true);
                                        game.tools.setFloorPaintable(hintCell, false);
                                        game.tools.setElementPaintable(hintCell, false);
                                        break;
                                    }
                                    case 2:{
                                        game.tools.addCeilingDecoration(0, hintCell, game.tools.SOLID, [ CONST.TEXTURES.FONT[hintPlace.ceilingSymbol || hintPlace.symbol] ],true);
                                        game.tools.setCeilingPaintable(hintCell, false);
                                        game.tools.setElementPaintable(hintCell, false);
                                        break;
                                    }
                                }
                            }

                        }

                    }

                // --- Add hint

                for (let y=0;y<2;y++)
                    for (let x=0;x<GRID_WIDTH;x++)
                        hint.push(solution[y][x] ? "#" : "x");

                game.tools.hintAddSequence(room, hint);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Place the architect

                // Protect the blueprint area, so the architect doesn't spawn there
                game.tools.setProtected({ x:room.x+1, y:room.y+1, width:GRID_WIDTH, height:GRID_HEIGHT }, true);

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
                                        text:"Oh, and thanks! I really needed a hand!"
                                    }
                                ]
                            },
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        run:(game, context, done)=>{
                            let
                                result = 0,
                                placedPieces = 0,
                                isSolved = true;

                            for (let x=0;x<room.width;x++)
                                for (let y=0;y<room.height;y++) {
                                    let
                                        isPlaced = !!game.map[room.y+y][room.x+x].isDiggable,
                                        correctValue = !!(solution[y-GRID_BORDER] && solution[y-GRID_BORDER][x-GRID_BORDER]);

                                    if (isPlaced)
                                        placedPieces++;

                                    if (isPlaced != correctValue) {
                                        if (CONST.DEBUG.showLogs)
                                            console.log(x,y,isPlaced,correctValue);
                                        isSolved = false;
                                    }
                                }

                            if (isSolved) {
                                room.score = placements - pieces - Math.floor((1-room.difficulty)*3);
                                room.isSolved = true;
                                result = 2;
                            } else if (placedPieces)
                                result = 1;
                            else
                                result = 0;

                            done(result);
                        }  
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result: 0 }
                        },
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Damn! I didn't finish this room in time!"
                            }
                        ]
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result: 1 }
                        },
                        hitPlayer:1
                    },{
                        if:{ and:true },
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Please, this is a sacred place! Be more careful!"
                            }
                        ]
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result: 2 }
                        },
                        asContext:"room",
                        unlockRoomWithAttempts:"score",
                        ofAttempts:"scoreLimit"
                    },{
                        if:{ and:true },
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"That's exactly what I had in mind! Great job!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);
                    
                // --- Give the "dig/build" cards when the player enters the room

                game.tools.onEnter(room,[
                    {
                        addInventoryItem:{
                            data:{
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,                                
                                model:"default",
                                image:"dig"
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                result = 0,
                                                position = game.tools.getRoomPosition(room, {
                                                    x:game.position.x+CONST.DIRECTIONS[game.position.direction].x,
                                                    y:game.position.y+CONST.DIRECTIONS[game.position.direction].y,
                                                });
                                                
                                            if (position) {
                                                if (position.cell.isWall)
                                                    if (position.cell.isDiggable) {
                                                        position.cell.isDiggable = false;
                                                        position.cell.isWall = false;
                                                        game.tools.removeWalls(position.cell);
                                                        result = 3;
                                                        game.tools.playAudio("kesiev-break1");
                                                        game.tools.refreshScreen();
                                                    } else
                                                        result = 2;
                                                else
                                                    result = 1;
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
                                                text:"How could you use it?"
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result: 1 }
                                        },
                                        dialogueSay:[     
                                            {
                                                text:"You wave the pickaxe in the air..."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result: 2 }
                                        },
                                        dialogueSay:[     
                                            {
                                                text:"This wall seems to be too hard..."
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    },{
                        addInventoryItem:{
                            data:{
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,                                
                                model:"default",
                                image:"build"
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                result = 0,
                                                position = game.tools.getRoomPosition(room, {
                                                    x:game.position.x+CONST.DIRECTIONS[game.position.direction].x,
                                                    y:game.position.y+CONST.DIRECTIONS[game.position.direction].y,
                                                });
                                                
                                            if (position)
                                                if (position.cell == architectPosition.cell)
                                                    result =3;
                                                else if (position.cell.isWall)
                                                    result = 1;
                                                else {
                                                    position.cell.isDiggable = true;
                                                    position.cell.isWall = true;
                                                    game.tools.setWalls(position.cell, block);
                                                    result = 2;
                                                    placements++;
                                                    game.tools.playAudio("kesiev-build1");
                                                    game.tools.refreshScreen();
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
                                                text:"This doesn't seem like the right place..."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result: 1 }
                                        },
                                        dialogueSay:[     
                                            {
                                                text:"There already seems to be a wall here..."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result: 3 }
                                        },
                                        dialogueSay:[
                                            {
                                                audio:ARCHITECT.voiceAudio,
                                                by:ARCHITECT.layout.name,
                                                text:"Hey! You want to wall me up alive?!"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Take back the "dig/build" cards when the player exits the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);

            });

        }
    })
    
})();

