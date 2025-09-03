(function(){

    let
        TOMB_ID = "kesiev-snake",
        TOMB_TAGS = [ "tomb", "arcade" ],
        ANIMATION_FLOAT = [ { dy:1 }, { dy:1 }, 0, { dy:-1 }, { dy:-1 }, 0  ],
        ARCHITECT= ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        APPLE = {
            isApple:true,
            sprite:[
                { image:"images/npc.png", imageX:3, imageY:0 },
                { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:6, animation:ANIMATION_FLOAT },
            ]
        },
        MAPS = [
            { 
                center:{
                    map:[
                        ".........",
                        ".........",
                        ".........",
                        ".........",
                        ".........",
                        ".........",
                        ".........",
                        ".........",
                        ".........",
                    ]
                }
            },{ 
                center:{
                    map:[
                        ".........",
                        ".........",
                        ".#.....#.",
                        ".#.....#.",
                        ".#.....#.",
                        ".#.....#.",
                        ".#.....#.",
                        ".........",
                        "........."
                    ]
                }
            },{
                center:{
                    map:[
                        ".........",
                        ".##...##.",
                        ".#.....#.",
                        ".........",
                        ".........",
                        ".........",
                        ".#.....#.",
                        ".##...##.",
                        "........."
                    ]
                }
            },{ 
                center:{
                    map:[
                        ".........",
                        "...###...",
                        ".........",
                        ".#.....#.",
                        ".#.....#.",
                        ".#.....#.",
                        ".........",
                        "...###...",
                        "........."
                    ]
                }
            },{ 
                center:{
                    map:[
                        ".........",
                        "..#...#..",
                        ".##...##.",
                        ".........",
                        ".........",
                        ".........",
                        ".##...##.",
                        "..#...#..",
                        "........."
                    ]
                }
            }
        ],
        PALETTE = {
            ".":{
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                ceiling:[ "defaultCeiling" ],
                floor:[ [ "defaultFloorAccentTexture" ] ],
                walls:[ 0, 0, 0, 0 ]
            },
            "#":{
                skipOnProtectedCell:true,
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                isWall:true,
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                ceiling:[ "defaultCeiling" ],
                floor:[ "defaultFloor" ],
                walls:[
                    "defaultWall",
                    "defaultWall",
                    "defaultWall",
                    "defaultWall"
                ]
            }
        },
        START_APPLES = 3,
        MOVEMENT_SPEED = 1,
        MIN_SCORE = 10,
        RANGE_SCORE = 20;

    function addNewApple(game, room, state) {
        let
            positions = [],
            px = game.position.x-room.x,
            py = game.position.y-room.y;

        for (let y=0;y<room.height;y++)
            for (let x=0;x<room.width;x++)
                if (((x != px) || (y != py)) && !game.map[room.y+y][room.x+x].isWall && !state.cells[y][x])
                    positions.push([x,y]);
        
        if (positions.length) {
            let
                position = room.random.element(positions);
            state.cells[position[1]][position[0]] = game.tools.addElement(room.x+position[0], room.y+position[1], Tools.clone(APPLE), true);
        }

    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Apples Room",
        description:"The classic Snake game in first person.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/items.png" },
            { type:"audio", title:"Untitled", by:[ "ant512" ], id:"kesiev-snake1",mod:"tombs/kesiev/audio/music/ant512_-_untitled.xm", isSong:true},
            { type:"audio", id:"kesiev-snake-crunch1", title:"Crunch SFX", by:[ "StarNinjas" ], file:"tombs/kesiev/audio/sfx/crunch1" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:MAPS[0].center.map[0].length,
                    height:MAPS[0].center.map.length,
                    isSolved:false,
                    isRunning:false,
                    score:0,
                    maxScore:0
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    firstApple,
                    map = room.random.element(MAPS),
                    centerX = room.x+Math.floor(room.width/2),
                    centerY = room.y+Math.floor(room.height/2),
                    architectPositions = [
                        { x:centerX, y:centerY },
                        { x:centerX, y:centerY-1 },
                    ],
                    state = {
                        timer:MOVEMENT_SPEED,
                        cells:[],
                        tail:[]
                    };

                room.maxScore = MIN_SCORE+Math.floor(room.difficulty*RANGE_SCORE);

                for (let y=0;y<room.height;y++)
                    state.cells[y]=[];

                game.tools.blitPattern(0, room, map, PALETTE ),

                firstApple = game.tools.addElement(centerX, centerY, Tools.clone(APPLE), true);

                game.tools.onInteract(firstApple,[
                    {
                        removeElement:true,
                        refreshScreen:true
                    },{
                        asContext:"room",
                        addInventoryItem:{
                            data:{
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,                                
                                model:"default",
                                counter:0,
                                sprite:[
                                    { image:"tombs/kesiev/images/items.png", imageX:1, imageY:1 },
                                ]
                            }
                        }
                    },{
                        playAudio:{ sample:("kesiev-snake-crunch1") }  
                    },{
                        playMusic:"kesiev-snake1"
                    },{
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:ARCHITECT.layout.name,
                                text:"Oh no! You ate the cursed apple! Get ready to eat more!"
                            }
                        ]
                    },{
                        run:(game, context, done)=>{
                            state.scoreCard = game.tools.getInventoryItemsFromRoom(room)[0];
                            game.tools.lockControl("up");
                            game.tools.lockControl("down");
                            for (let i=0;i<START_APPLES;i++)
                                addNewApple(game, room, state);
                            room.isRunning = true;
                            game.tools.refreshScreen();
                            done(true);
                        }
                    }
                ]);

                // --- Move the "snake" :)

                room.onFrame = (game)=>{

                    if (room.isRunning) {

                        if (state.timer)
                            state.timer--;
                        else {

                            let
                                isGameOver = false,
                                doAddNewApple = false,
                                doHit = false,
                                direction = CONST.DIRECTIONS[game.position.direction],
                                cell = game.map[game.position.y+direction.y][game.position.x+direction.x],
                                startPosition = game.tools.getRoomPosition(room);
                                endPosition = game.tools.getRoomPosition(room, cell);

                            state.timer = MOVEMENT_SPEED;

                            if (endPosition && !endPosition.cell.isWall) {
                                let
                                    gameCell = state.cells[endPosition.roomY][endPosition.roomX];

                                if (gameCell && gameCell.isTail) {
                                    isGameOver = true;
                                    doHit = true;
                                } else {

                                    let
                                        tailSegment;

                                    if (gameCell && gameCell.isApple) {
                                        game.tools.removeElement(gameCell);
                                        state.cells[endPosition.roomY][endPosition.roomX] = 0;
                                        tailSegment = {
                                            isTail:true,
                                            model:"ball",
                                            ball:"energy",
                                            size:"brightDefault"
                                        };
                                        doAddNewApple = true;

                                        game.tools.playAudio("kesiev-snake-crunch1");

                                        room.score++;
                                        game.tools.setInventoryItemCounter(state.scoreCard, room.score);
                                        game.tools.setInventoryItemAnimation(state.scoreCard, "bounce");
                                        if (room.score >= room.maxScore)
                                            isGameOver = true;

                                    } else if (state.tail.length) {
                                        tailSegment = state.tail.shift();
                                        game.tools.removeElement(tailSegment);
                                        state.cells[tailSegment.y-room.y][tailSegment.x-room.x] = 0;
                                    }

                                    if (tailSegment) {
                                        game.tools.addElement(startPosition.x, startPosition.y, tailSegment);
                                        state.cells[startPosition.roomY][startPosition.roomX] = tailSegment;
                                        state.tail.push(tailSegment);
                                    }

                                    game.tools.movePlayerTo(endPosition.x, endPosition.y);

                                    if (doAddNewApple)
                                        addNewApple(game, room, state);

                                }
                            } else {
                                doHit = true;
                                isGameOver = true;
                            }

                            if (doHit)
                                game.tools.hitPlayer(2);

                            if (isGameOver) {

                                 for (let y=0;y<room.height;y++)
                                    for (let x=0;x<room.width;x++)
                                        if (state.cells[y][x])
                                            game.tools.removeElement(state.cells[y][x]);

                                room.isRunning = false;
                                room.isSolved = true;
                                game.tools.unlockControls();
                                game.tools.removeInventoryItemsFromRoom(room);
                                game.tools.resetMusic();
                                game.tools.unlockRoomWithScore(room,room.score,room.maxScore,()=>{
                                    // --- Add the architect

                                    let
                                        architectPosition = architectPositions.filter(cell=>((cell.x!=game.position.x) || (cell.y!=game.position.y)))[0],
                                        architect = game.tools.addNpc(architectPosition.x, architectPosition.y, Tools.clone(ARCHITECT.layout));

                                    game.tools.onInteract(architect,[
                                        {
                                            subScript:[
                                                game.tools.scriptArchitectPaidQuote(game, room, ARCHITECT),
                                                {
                                                    dialogueSay:[
                                                        {
                                                            audio:ARCHITECT.voiceAudio,
                                                            by:"{name}",
                                                            text:"Anyway... I wonder how these apples work..."
                                                        }
                                                    ]
                                                },
                                                { movePlayerBack:true },
                                                { endScript:true }
                                            ]
                                        }
                                    ]);

                                    game.tools.refreshScreen();
                                });

                                
                            }

                        }

                    }
                    
                }

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

            })
        }
        
    })
    
})();

