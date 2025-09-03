(function(){

    const
        TOMB_ID = "kesiev-fifteen",
        TOMB_TAGS = [ "tomb", "logic" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        FIFTEEN_SYMBOLS = [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F" ];

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Fifteen Room",
        description:"The classic Fifteen puzzle game.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:4,
                    height:5,
                    isSolved:false,
                    attempts:1,
                    attemptsLimit:3
                }
            ];
        },

        renderRooms:function(game, rooms) {

            // --- Reset the puzzle state

            function resetPuzzle(room) {

                let
                    size = room.width,
                    maxValue = size*size;
                    
                for (x=0;x<size;x++)
                    for (y=0;y<size;y++) {
                
                        let
                            cell = { x:room.x+x, y:room.y+y, width:1, height:1 },
                            value = room.startingGrid[y][x];

                        game.tools.setElementPaintable(cell,false);

                        if (value<maxValue) {
                            game.tools.paintFloor(0,cell,game.tools.SOLID,[
                                { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.BLUE },
                                CONST.TEXTURES.FONT[FIFTEEN_SYMBOLS[value]]
                            ], true);
                            game.tools.paintData(cell,{
                                value: value
                            });
                            game.tools.paintMapSymbol(cell,FIFTEEN_SYMBOLS[value]);
                            game.tools.paintMapSymbolColor(cell,CONST.COLORS.BLACK);
                        } else {
                            game.tools.paintFloor(0,cell,game.tools.SOLID,[
                                { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:game.dungeon.floorAccent }
                            ], true);
                            game.tools.paintData(cell,{
                                isMovable:true,
                                value: value
                            });
                            game.tools.paintMapSymbol(cell,CONST.MAPSYMBOLS.WALL);
                            game.tools.paintMapSymbolColor(cell,game.dungeon.floorAccent);
                        }
                    }

            }

            rooms.forEach(room=>{

                let
                    moves = 2+Math.floor(6*room.difficulty),
                    size = room.width,
                    grid = [],
                    windowX = size-1,
                    windowY = size-1;

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Prepare the game

                room.moves = moves;

                // --- Prepare and shuffle the puzzle grid

                for (y=0;y<size;y++) {
                    grid[y] = [];
                    for (x=0;x<4;x++)
                        grid[y][x]=1+x+y*size;
                }

                for (let i=0;i<moves;i++) {

                    let
                        swap,
                        direction,
                        directions = [];

                    if (windowX>0)
                        directions.push({ x:windowX-1, y:windowY });
                    if (windowX<size-1)
                        directions.push({ x:windowX+1, y:windowY });
                    if (windowY>0)
                        directions.push({ x:windowX, y:windowY-1 });
                    if (windowY<size-1)
                        directions.push({ x:windowX, y:windowY+1 });

                    direction = room.random.element(directions);

                    swap = grid[windowY][windowX];
                    grid[windowY][windowX] = grid[direction.y][direction.x];
                    grid[direction.y][direction.x] = swap;

                    windowX = direction.x;
                    windowY = direction.y;

                }

                room.startingGrid = grid;
                
                // --- Initialize the puzzle grid in the room

                resetPuzzle(room);

                // --- Place the architect

                let
                    walkableCells = game.tools.getWalkableCells({ x:room.x, y:room.y+size, width:room.width, height:1 }),
                    architectPosition = room.random.element(walkableCells),
                    architect = game.tools.addNpc(architectPosition.x, architectPosition.y, Tools.clone(ARCHITECT.layout));

                game.tools.onInteract(architect,[
                    game.tools.scriptArchitectPaidQuote(game, room, ARCHITECT),
                    { movePlayerBack:true }
                ]);

                // Protect the cell, so the lever won't spawn there
                game.tools.setProtected(architectPosition, true);

                // --- Add the "reset puzzle" lever

                let
                    walkableWalls = game.tools.getWalkableWalls(room),
                    leverPosition = room.random.element(walkableWalls);

                game.tools.addWallDecoration(0,leverPosition,leverPosition.side,game.tools.SOLID,[
                    {  isLever:true, image:"images/texture.png", imageX:3, imageY:1 }
                ]);

                game.tools.onBumpWall(leverPosition.x,leverPosition.y,leverPosition.side,[
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
                                text:"There is a lever on the wall. Do you want to pull it?",
                                options:[
                                    {
                                        id:"pullIt",
                                        value:true,
                                        label:"Pull it"
                                    },{
                                        label:"Leave",
                                        id:"pullIt",
                                        value:false
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
                        run:(game, context, done)=>{
                            resetPuzzle(room);
                            done(true);
                        }
                    },{
                        asContext:"room",
                        sumAttribute:"attempts",
                        byValue:1
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
                        dialogueSay:[
                            {
                                text:"You hear a loud rumble..."
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
                game.tools.setWallPaintable(leverPosition.x,leverPosition.y,leverPosition.side, false);

                // --- Give the "move cell" card when the player enters the room

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
                                                position = game.tools.getRoomPosition(room),
                                                facingPosition = game.tools.getRoomFacingPosition(room);

                                            if (position && facingPosition && position.cell.isMovable && facingPosition.cell.value) {
                                                let
                                                    isSolved = true,
                                                    size = room.width;

                                                game.tools.swapCells(position.cell, facingPosition.cell);
                                                game.tools.movePlayerTo(facingPosition.x, facingPosition.y);

                                                for (x=0;x<size;x++)
                                                    for (y=0;y<size;y++) {
                                                        if (game.map[room.y+y][room.x+x].value != (1+x+y*size)) {
                                                            isSolved = false;
                                                            break;
                                                        }
                                                    }

                                                room.isSolved = isSolved;
                                                done(true);
                                            } else
                                                done(false);
                                        }  
                                    },{
                                        if:{ and: true },
                                        playAudio:{ sample:"moverock1" }
                                    },{
                                        if:{ else:true },
                                        hitPlayer:1
                                    },{
                                        if:{ else:true },
                                        dialogueSay:[
                                            {
                                                text:"As you invoke the spell, your feel your hands burning! Maybe it's not the right place to use it..."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"room",
                                            is:{ isSolved: true }
                                        },
                                        asContext:"room",
                                        unlockRoomWithAttempts:"attempts",
                                        ofAttempts:"attemptsLimit"
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

                // --- Take back the "move cell" card when the player exits the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);
                
            })
        }
    })
    
})();

