(function(){

    const
        TOMB_ID = "kesiev-memory",
        TOMB_TAGS = [ "tomb", "memory" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        ROOM_SIZE = 4,
        PALETTE = [
            "A", "B", "C", "D",
            "&#x2660;", "&#x2663;", "&#x2665;", "&#x2666;"
        ],
        TEXTURE_COVEREDTILE = { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.GRAY },
        TEXTURE_SELECTEDTILE = { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.CYAN },
        TEXTURE_CORRECTTILE = { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.GREEN };

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Pairs Room",
        description:"The classic Memory game.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:ROOM_SIZE,
                    height:ROOM_SIZE,
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach((room,id)=>{

                let
                    field = [],
                    selected = [],
                    timesSelected = [],
                    left = PALETTE.length,
                    hint = [];

                // --- Prepare and shuffle the playfield

                PALETTE.forEach(symbol=>{
                    field.push(symbol);
                    field.push(symbol);
                });

                room.random.shuffle(field);

                // --- Add hint

                for (let i=0;i<ROOM_SIZE*2;i++)
                    hint.push(field[i]);

                game.tools.hintAddSequence(room, hint);

                // --- Add entrance plaques

                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Paint the room with empty tiles

                game.tools.paintFloor(0, room, game.tools.SOLID, [ TEXTURE_COVEREDTILE ]);

                // --- Place the architect

                let
                    walkableCells = game.tools.getWalkableCells(room),
                    architectPosition = room.random.element(walkableCells),
                    architect = game.tools.addNpc(architectPosition.x, architectPosition.y, Tools.clone(ARCHITECT.layout));

                game.tools.onInteract(architect,[
                    game.tools.scriptArchitectPaidQuote(game, room, ARCHITECT, true),
                    {
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"I hope you can keep everything in mind! Bye!"
                            }
                        ]
                    },
                    { removeElement:true, refreshScreen:true }
                ]);

                
                // --- Give the "flip cell" card when the player enters the room

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
                                                selectionThreshold = 10-(room.difficulty*8),
                                                result = 0,
                                                position = game.tools.getRoomPosition(room);

                                            // Unselect selected cells

                                            if (selected.length == 2) {
                                                selected.forEach(selection=>{
                                                    selection.cell.isFlipped = false;
                                                    game.tools.paintFloor(0, selection.cell, game.tools.SOLID, [ TEXTURE_COVEREDTILE ], true);
                                                    game.tools.paintMapSymbol(selection.cell, CONST.MAPSYMBOLS.FLOOR);
                                                })
                                                selected = [];
                                            }

                                            if (position && !position.cell.isFlipped) {
                                                let
                                                    fieldPosition = position.roomX+(position.roomY*room.width),
                                                    symbol = field[fieldPosition],
                                                    cell = game.map[game.position.y][game.position.x];

                                                cell.isFlipped = true;
                                                game.tools.paintFloor(0, cell, game.tools.SOLID, [ TEXTURE_SELECTEDTILE, CONST.TEXTURES.FONT[symbol] ], true);
                                                game.tools.paintMapSymbol(cell, symbol);

                                                if (!timesSelected[fieldPosition])
                                                    timesSelected[fieldPosition] = 1;
                                                else {
                                                    timesSelected[fieldPosition]++;
                                                    if (timesSelected[fieldPosition] >= selectionThreshold)
                                                        game.tools.hitPlayer(1);
                                                }

                                                if (game.player.isAlive) {

                                                    switch (selected.length) {
                                                        // Unveil tile
                                                        case 0:{
                                                            selected.push({ symbol:symbol, cell:cell });
                                                            game.tools.playAudio("mouseclick1");
                                                            break;
                                                        }
                                                        // Match tile
                                                        case 1:{
                                                            if (selected[0].symbol == symbol) {
                                                                game.tools.paintFloor(0, cell, game.tools.SOLID, [ TEXTURE_CORRECTTILE, CONST.TEXTURES.FONT[selected[0].symbol] ], true);
                                                                game.tools.paintFloor(0, selected[0].cell, game.tools.SOLID, [ TEXTURE_CORRECTTILE, CONST.TEXTURES.FONT[selected[0].symbol] ], true);
                                                                game.tools.paintMapSymbolBgColor(cell, CONST.COLORS.GREEN);
                                                                game.tools.paintMapSymbolBgColor(selected[0].cell, CONST.COLORS.GREEN);
                                                                selected = [];
                                                                left--;
                                                                if (left <= 0) {
                                                                    room.isSolved = true;
                                                                    result = 2;
                                                                } else
                                                                    game.tools.playerGainGold(room, 4);
                                                            } else {
                                                                game.tools.paintFloor(0, cell, game.tools.SOLID, [ TEXTURE_SELECTEDTILE, CONST.TEXTURES.FONT[symbol] ], true);
                                                                selected.push({ symbol:symbol, cell:cell });
                                                                game.tools.playAudio("nogain1");
                                                            }
                                                            break;
                                                        }
                                                    }

                                                    game.tools.refreshScreen();

                                                }

                                            } else
                                                result = 1;
                                            
                                            done(result);
                                        }  
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result: 1 }
                                        },
                                        dialogueSay:[     
                                            {
                                                text:"Nothing seems to change..."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result: 2 }
                                        },
                                        asContext:"room",
                                        unlockRoom:true
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        removeInventoryItemsFromRoom:true
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Take back the "flip cell" card when the player exits the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);

            })
        }
        
    })
    
})();

