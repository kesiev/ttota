(function(){

    const
        TOMB_ID = "kesiev-change",
        TOMB_TAGS = [ "tomb", "memory" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        ROOM_SIZE = 5,
        MIN_CHANGES = 2,
        RANGE_CHANGES = 5,
        RANGE_ATTEMPTS = 3,
        DARK_TEXTURE = { backgroundColor:CONST.COLORS.BLACK },
        HINTS = [ "Breakdown", "Failure", "Malfunction", "Fault" ],
        ELEMENTS = [
            { frequency:16, texture:[ { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:CONST.COLORS.WHITE } ] },
            { frequency:8, texture:[ { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:CONST.COLORS.RED } ] },
            { frequency:4, texture:[ { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:CONST.COLORS.BLUE } ] },
            { frequency:2, texture:[ { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:CONST.COLORS.GREEN } ] },
        ];

    function paintRoom(game, room, leverPosition, isLeverPulled, tiles, mode) {
        if (tiles) {
            game.tools.paintCeiling(0, room, game.tools.SOLID, game.dungeon.defaultCeiling, true);
            game.tools.paintWalls(0, room, game.tools.SOLID, game.dungeon.defaultWall, true);
            for (let y=0;y<ROOM_SIZE;y++)
                for (let x=0;x<ROOM_SIZE;x++)
                    game.tools.paintFloor(0, game.map[room.y+y][room.x+x], game.tools.SOLID, ELEMENTS[tiles[y][x][mode]].texture, true);
        } else {
            game.tools.paintCeiling(0, room, game.tools.SOLID, [ DARK_TEXTURE ], true);
            game.tools.paintWalls(0, room, game.tools.SOLID, [ DARK_TEXTURE ], true);
            game.tools.paintFloor(0, room, game.tools.SOLID, [ DARK_TEXTURE ], true);
        }
        game.tools.addWallDecoration(0, leverPosition, leverPosition.side, game.tools.SOLID, [
            {  isLever:true, image:"images/texture.png", imageX:(isLeverPulled ? 4 : 3), imageY:1 }
        ],true);
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Minuscule Room",
        description:"Find the room changes after turning the lights off and on.",
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
                    isPulled:false,
                    isSolved:false,
                    attempts:0,
                    attemptsLimit:1
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach((room,id)=>{

                // --- Prepare the room symbols

                let
                    changesCount = MIN_CHANGES+Math.floor(RANGE_CHANGES*(1-room.difficulty)),
                    changesBag = { elements:[] },
                    elementsRange = 2+Math.round((ELEMENTS.length-2)*room.difficulty),
                    tiles = [];

                for (let i=0;i<elementsRange;i++)
                    for (let j=0;j<ELEMENTS[i].frequency;j++)
                        changesBag.elements.push(i);

                room.attemptsLimit+=Math.floor((1-room.difficulty)*RANGE_ATTEMPTS);

                for (let y=0;y<ROOM_SIZE;y++) {
                    tiles[y]=[];
                    for (let x=0;x<ROOM_SIZE;x++) {
                        let
                            value = room.random.bagPick(changesBag);
                        tiles[y][x]={
                            isChanged:false,
                            original:value,
                            changed:value
                        }
                    }
                }

                for (let i=0;i<changesCount;i++) {
                    let
                        x, y, value, newValue;
                    do {
                        x = room.random.integer(ROOM_SIZE);
                        y = room.random.integer(ROOM_SIZE);
                    } while (tiles[y][x].isChanged);

                    value = tiles[y][x].changed;

                    do {
                        newValue = room.random.integer(elementsRange);
                    } while (newValue == value);

                    game.tools.hintAddCoordinates(room, room.random.element(HINTS), x, y);

                    tiles[y][x].changed = newValue;
                    tiles[y][x].isChanged = true;
                }
                
                // --- Add entrance plaques

                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Place the confirmation lever

                let
                    walkableWalls = game.tools.getWalkableWalls(room),
                    leverPosition = room.random.element(walkableWalls);

                game.tools.onBumpWall(leverPosition.x, leverPosition.y, leverPosition.side, [
                    {
                        if:{
                            asContext:"room",
                            is:{ isPulled:true }
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
                                text:"There is a lever. Do you want to pull it?",
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
                        run:(game, context, done)=>{
                            paintRoom(game, room, leverPosition, true);
                            game.tools.refreshScreen();
                            done();
                        }
                    },{
                        dialogueSay:[
                            {
                                text:"It looks like the power went out!"
                            }
                        ]
                    },{
                        playAudio:{ sample:"lever1" }
                    },{
                        run:(game, context, done)=>{
                            context.room.isPulled = true;
                            paintRoom(game, room, leverPosition, false, tiles, "changed");
                            game.tools.refreshScreen();
                            done();
                        }
                    },{
                        asContext:"room",
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

                                            if (position) {
                                                context.room.attempts++;
                                                if (tiles[position.roomY][position.roomX].isChanged) {
                                                    game.tools.paintCeiling(0, position.cell, game.tools.SOLID, [
                                                        { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:CONST.COLORS.GREEN }
                                                    ], true);
                                                    game.tools.paintMapSymbolBgColor(position.cell, CONST.COLORS.GREEN);
                                                    done(2);
                                                } else {
                                                    game.tools.paintCeiling(0, position.cell, game.tools.SOLID, [
                                                        { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:CONST.COLORS.RED }
                                                    ], true);
                                                    game.tools.paintMapSymbolBgColor(position.cell, CONST.COLORS.RED);
                                                    done(1);
                                                }
                                                game.tools.refreshScreen();
                                            } else
                                                done(0);
                                        }  
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:2 }
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
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:1 }
                                        },
                                        hitPlayer:1
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:0 }
                                        },
                                        dialogueSay:[     
                                            {
                                                text:"Nothing happens..."
                                            }
                                        ]
                                    }
                                ]
                            }
                        },
                    },{
                        dialogueSay:[
                            {
                                text:"It seems the light has come back on... and you have something in your hand."
                            }
                        ]
                    }
                ]);

                 // Avoid random decorations on the lever
                game.tools.setWallPaintable(leverPosition.x, leverPosition.y, leverPosition.side, false);

                // Protect the lever area, so the architect doesn't spawn there
                game.tools.setProtected(leverPosition.front, true);

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
                                        text:"Anyway... I think a fuse burned somewhere..."
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
                                text:"I thought I'd fixed that problem... Oh, sorry."
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

                // --- Prepare the room

                game.tools.setCeilingPaintable(room, false);
                game.tools.setFloorPaintable(room, false);
                game.tools.setEdgesPaintable(room, false);

                paintRoom(game, room, leverPosition, false, tiles, "original");

                // --- Restore the "select zone" card (if any) when the player enters the room

                game.tools.onEnter(room,[{
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        restoreInventoryItemsFromRoom:true
                    }
                ]);

                // --- Store the "select zone" card (if any) when the player leaves the room

                game.tools.onLeave(room,[ { storeInventoryItemsFromRoom:true } ]);

            })
        }
        
    })
    
})();

