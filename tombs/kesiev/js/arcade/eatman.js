(function(){

    const
        TOMB_ID = "kesiev-eatman",
        TOMB_TAGS = [ "tomb", "arcade" ],
        ARCHITECT=ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        ANIMATION_PILL = [ { dy:-1 }, { dy:-1 }, 0, { dy:1 }, { dy:1 }, 0  ],
        ANIMATION_GHOST = [ { dy:1 }, { dy:1 }, 0, { dy:-1 }, { dy:-1 }, 0  ],
        MAZE_WALL = { image:"tombs/kesiev/images/texture.png", imageX:1, imageY:0 },
        MAZE_PATTERNS = [
            {
                center:{
                    map:[
                        "_______",
                        "_##_##_",
                        "_______",
                        "_##_##_",
                        "_#___#_",
                        "___#___",
                        "_#___#_",
                        "_##_##_",
                        "_______",
                        "_##_##_",
                        "_______",
                    ],
                    elements:[
                        ".......",
                        ".  .  .",
                        ".......",
                        ".  .  .",
                        ". ... .",
                        ".M. .M.",
                        ". ... .",
                        ".  .  .",
                        ".......",
                        ".  .  .",
                        ".......",
                    ]
                }
            },{
                center:{
                    map:[
                        "_______",
                        "_#_#_#_",
                        "_#_#_#_",
                        "___#___",
                        "_#___#_",
                        "_##_##_",
                        "_#___#_",
                        "___#___",
                        "_#_#_#_",
                        "_#_#_#_",
                        "_______",
                    ],
                    elements:[
                        ".......",
                        ". . . .",
                        ". . . .",
                        "... ...",
                        ". .M. .",
                        ".  .  .",
                        ". .M. .",
                        "... ...",
                        ". . . .",
                        ". . . .",
                        ".......",
                    ]
                }
            },{
                center:{
                    map:[
                        "_______",
                        "_##_##_",
                        "_#___#_",
                        "_#_#_#_",
                        "_#_#_#_",
                        "___#___",
                        "_#_#_#_",
                        "_#_#_#_",
                        "_#___#_",
                        "_##_##_",
                        "_______",
                    ],
                    elements:[
                        ".......",
                        ".  .  .",
                        ". ... .",
                        ". . . .",
                        ". . . .",
                        "..M M..",
                        ". . . .",
                        ". . . .",
                        ". ... .",
                        ".  .  .",
                        ".......",
                    ]
                }
            },{
                center:{
                    map:[
                        "_______",
                        "_#####_",
                        "_______",
                        "_#####_",
                        "_______",
                        "_#_#_#_",
                        "_#_#_#_",
                        "___#___",
                        "_#_#_#_",
                        "_#_#_#_",
                        "_______",
                    ],
                    elements:[
                        ".......",
                        ".     .",
                        ".......",
                        ".     .",
                        ".......",
                        ". M M .",
                        ". . . .",
                        "... ...",
                        ". . . .",
                        ". . . .",
                        ".......",
                    ]
                }
            }
        ],
        MAZE_PALETTE = {
            "_":{
                isMaze:true,
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                mapSymbolBgColor:CONST.COLORS.YELLOW,
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                isWallPaintable:[ true, true, true, true ],
                ceiling:[ "defaultCeiling" ],
                floor:[ "defaultFloor" ]
            },
            "#":{
                skipOnProtectedCell:true,
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                mapSymbolColor:CONST.COLORS.BLUE,
                isWall:true,
                isTransparent:true,
                isMazeBorder:true,
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                isWallPaintable:false,
                ceiling:[ "defaultCeiling" ],
                floor:[ "defaultFloor" ],
                walls:[
                    [ MAZE_WALL ],
                    [ MAZE_WALL ],
                    [ MAZE_WALL ],
                    [ MAZE_WALL ]
                ],
            },
            ".":{
                isPellet:true,
                brightness:CONST.BRIGHTNESS.LAMP,
                sprite:[
                    { image:"images/npc.png", imageX:3, imageY:0 },
                    { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:0, animation:ANIMATION_PILL }
                ]
            },
            "M":{
                isGhost:true,
                sprite:[
                    { image:"images/npc.png", imageX:2, imageY:0 },
                    { image:"tombs/kesiev/images/texture.png", imageX:3, imageY:0, animation:ANIMATION_GHOST }
                ]
            }
        };

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Eating Room",
        description:"Get all the dots in a maze and avoid the roaming ghosts.",
        byArchitect:ARCHITECT.layout.name,

        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            { type:"audio", title:"PacManOnWax", by:[ "JAM" ], id:"kesiev-pacman1",mod:"tombs/kesiev/audio/music/pacmawax.xm", isSong:true},
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    music:"kesiev-pacman1",
                    name:this.name,
                    author:this.byArchitect,
                    width:MAZE_PATTERNS[0].center.map[0].length,
                    height:MAZE_PATTERNS[0].center.map.length,
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    ghosts = [],
                    assets = game.tools.blitPattern(0, room, room.random.element(MAZE_PATTERNS), MAZE_PALETTE ),
                    pelletsLeft = 0;

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Remove maze adjacent walls

                for (let y=room.y;y<room.y+room.height;y++)
                    for (let x=room.x;x<room.x+room.width;x++)
                        CONST.DIRECTIONS.forEach((direction,id)=>{
                            if (game.map[y+direction.y][x+direction.x].isMazeBorder)
                                game.map[y][x].walls[id] = 0;
                            }
                        )

                // --- Add interaction to map elements

                assets.elements.forEach(element=>{
                    if (element.isPellet) {
                        pelletsLeft++;
                        game.tools.onInteract(element,[
                            { asContext:"room", playerGainGold:1 },
                            { removeElement:true, refreshScreen:true },
                            {
                                run:(game, context, done)=>{
                                    pelletsLeft--;
                                    if (!pelletsLeft) {
                                        room.isSolved = true;
                                        ghosts.forEach(ghost=>{
                                            game.tools.removeElement(ghost);
                                        });
                                        ghosts = [];
                                        game.tools.cancelRoomMusic(room);
                                        game.tools.unlockRoom(room, done);
                                    } else
                                        done();
                                }
                            },
                        ])
                    } else if (element.isGhost)
                        ghosts.push(element);
                });

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
                                text:"Ugh! I didn't know where to put myself, sorry!"
                            }
                        ]
                    },
                    { removeElement:true, refreshScreen:true }
                ]);

                // --- Remove the pellet at Architect position

                game.tools.getElementsAt(architectPosition.x, architectPosition.y).list.forEach(element=>{
                    if (element.isPellet) {
                        pelletsLeft--;
                        game.tools.removeElement(element);
                    }
                });

                // --- Move ghosts

                game.tools.onMove(room,[
                    {
                        run:(game, context,done)=>{
                            if (!room.isSolved) {
                                let
                                    damage = 0;

                                ghosts.forEach(ghost=>{
                                    let
                                        directionId = "",
                                        availableDirections=[];

                                    CONST.DIRECTIONS.forEach((direction,id)=>{
                                        let
                                            x = ghost.x+direction.x,
                                            y = ghost.y+direction.y;
                                        
                                        if (game.map[y][x].isMaze) {
                                            directionId+=id;
                                            if ((id != ghost.direction) && (id != (ghost.direction+2)%4))
                                                availableDirections.push(id);
                                        }
                                    });

                                    if (availableDirections.length && (ghost.directionId != directionId))
                                        ghost.direction = room.random.element(availableDirections);

                                    game.tools.moveElementBy(ghost, CONST.DIRECTIONS[ghost.direction].x, CONST.DIRECTIONS[ghost.direction].y);

                                    if ((ghost.x == game.position.x) && (ghost.y == game.position.y))
                                        damage+=2+Math.floor(room.difficulty*2);
                                    
                                });

                                if (damage)
                                    game.tools.hitPlayer(damage);
                            }

                            done();
                        }
                    }
                ])

                
            })
        }
        
    })
    
})();

