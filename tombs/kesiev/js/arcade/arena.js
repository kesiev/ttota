(function(){

    let
        TOMB_ID = "kesiev-arena",
        TOMB_TAGS = [ "tomb", "arcade" ],
        ARCHITECT= ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        MAZE_WALL = { image:"tombs/kesiev/images/texture.png", imageX:6, imageY:4 },
        MAZE_FLOOR = { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:4 },
        MIN_GHOSTS = 1,
        RANGE_GHOSTS = 3,
        MIN_SCORE = 3,
        RANGE_SCORE = 6,
        AMMO_RESPAWN_TIME = 10,
        GHOST_RESPAWN_TIME = 4,
        GHOST_SPEED = 5,
        ANIMATION_AMMO = [ { dy:-1 }, { dy:-1 }, 0, { dy:1 }, { dy:1 }, 0  ],
        ANIMATION_GHOST = [ { dy:1 }, { dy:1 }, 0, { dy:-1 }, { dy:-1 }, 0  ],
        ANIMATION_BLINK = [ { dx:-101 }, { dx:-101 }, { dx:-101 }, 0, 0, 0 ],
        ARENA_PATTERNS = [
            {
                center:{
                    map:[
                        "O_____O",
                        "_##_##_",
                        "_______",
                        "_##_##_",
                        "_#___#_",
                        "___A___",
                        "_#___#_",
                        "_##_##_",
                        "_______",
                        "_##_##_",
                        "O_____O",
                    ],
                    elements:[
                        "       ",
                        "   J   ",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "   J   ",
                        "       ",
                    ]
                }
            },{
                center:{
                    map:[
                        "_______",
                        "_#####_",
                        "_#__O#_",
                        "_##_##_",
                        "_#___#_",
                        "___A___",
                        "_#___#_",
                        "_##_##_",
                        "_#O__#_",
                        "_#####_",
                        "_______",
                    ],
                    elements:[
                        "J      ",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "      J",
                    ]
                }
            },{
                center:{
                    map:[
                        "_______",
                        "___#___",
                        "__O#O__",
                        "_#####_",
                        "_#_____",
                        "___A___",
                        "_____#_",
                        "_#####_",
                        "__O#O__",
                        "___#___",
                        "_______",
                    ],
                    elements:[
                        "       ",
                        "       ",
                        "       ",
                        "      J",
                        "       ",
                        "       ",
                        "       ",
                        "J      ",
                        "       ",
                        "       ",
                        "       ",
                    ]
                }
            },{
                center:{
                    map:[
                        "_______",
                        "_#O#O#_",
                        "_#___#_",
                        "_#_#_#_",
                        "_#_#_#_",
                        "_#_A_#_",
                        "_#_#_#_",
                        "_#_#_#_",
                        "_#___#_",
                        "_#O#O#_",
                        "_______",
                    ],
                    elements:[
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "J     J",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                        "       ",
                    ]
                }
            }
        ],
        ARENA_PALETTE = {
            "_":{
                isMaze:true,
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                isElementPaintable:true,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                isWallPaintable:[ true, true, true, true ],
                ceiling:[ "defaultCeiling" ],
                floor:[ [ MAZE_FLOOR ] ]
            },
            "O":{
                isMaze:true,
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                isWallPaintable:[ true, true, true, true ],
                ceiling:[ "defaultCeiling" ],
                floor:[ [
                    MAZE_FLOOR,
                    { image:"tombs/kesiev/images/texture.png", imageX:6, imageY:5, animation:ANIMATION_BLINK },
                ] ]
            },
            "J":{
                isAmmo:true,
                isHidden:true,
                brightness:CONST.BRIGHTNESS.LAMP,
                sprite:[
                    { image:"images/npc.png", imageX:3, imageY:0 },
                    { image:"tombs/kesiev/images/texture.png", imageX:5, imageY:5, animation:ANIMATION_AMMO }
                ]
            },
            "#":{
                skipOnProtectedCell:true,
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                mapSymbolColor:CONST.COLORS.GRAY,
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
            }
        };

    // Hide the architect spawnpoint

    ARENA_PALETTE["A"] = ARENA_PALETTE["_"];

    function resetGame(game, room, ghosts, bullets, ammos, architect) {
        if (room.isRunning) {
            room.isRunning = false;
            ghosts.forEach(ghost=>{
                game.tools.hideElement(ghost);
            });
            ammos.forEach(ammo=>{
                game.tools.hideElement(ammo);
            });
            bullets.forEach(bullet=>{
                game.tools.removeElement(bullet);
            })
            bullets = [];
            game.tools.showElement(architect);
            game.tools.removeInventoryItemsFromRoom(room);
            game.tools.refreshScreen();
        }
    }

    function clearGame(game, room, ghosts, bullets, ammos, architect) {
        room.isSolved = true;
        resetGame(game, room, ghosts, bullets, ammos, architect);
        game.tools.resetMusic();
        game.tools.unlockRoom(room,()=>{});
    }

    function startGame(game, room, ghosts, bullets, ammos, architect) {
        if (!room.isRunning) {
            room.isRunning = true;
            room.targetsToGo = room.targetScore;
            room.ammoItem = game.tools.getInventoryItemsFromRoom(room).filter(item=>item.isWeapon)[0];
            ghosts.forEach((ghost,id)=>{
                ghost.respawnTimer = (id+1)*GHOST_RESPAWN_TIME;
            });
            ammos.forEach(ammo=>{
                ammo.respawnTimer =AMMO_RESPAWN_TIME;                
            })
            game.tools.hideElement(architect);
            game.tools.refreshScreen();
        }
    }

    function checkBullet(game, room, bullet, ghosts) {
        let
            keepBullet = true;
        ghosts.forEach(ghost=>{
            if (!ghost.isHidden && (ghost.x == bullet.x) && (ghost.y == bullet.y)) {
                game.tools.playerGainGold(room,1);
                game.tools.hideElement(ghost);
                ghost.respawnTimer = GHOST_RESPAWN_TIME;
                keepBullet = false;
                if (room.targetsToGo)
                    room.targetsToGo--;
            }
        })
        return keepBullet;
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Drooney Room",
        description:"Hunt and be hunted by ghosts in an arena.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            { type:"audio", title:"Fireball SFX", by:[ "KesieV" ], id:"kesiev-fireball1", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"whitenoise","attack":0.015,"sustain":0.06,"decay":0.033,"release":0.172,"frequency":505,"tremoloDepth":0.17,"pitch":-0.0017,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0}},
            { type:"audio", title:"Couch Doctor", by:[ "SAMPLE DAMAGE" ], id:"kesiev-arena1",mod:"tombs/kesiev/audio/music/couch_do.xm", isSong:true},
            { type:"audio", id:"kesiev-arenareload1", title:"Reload SFX", by:[ "zer0_sol" ], file:"tombs/kesiev/audio/sfx/reload1" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:ARENA_PATTERNS[0].center.map[0].length,
                    height:ARENA_PATTERNS[0].center.map.length,
                    isSolved:false,
                    isRunning:true
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    architectPosition,
                    spawnPoints = [],
                    ghosts = [],
                    bullets = [],
                    ammos = [],
                    ghostsCount = MIN_GHOSTS+Math.floor(room.difficulty*RANGE_GHOSTS),
                    arena = room.random.element(ARENA_PATTERNS),
                    assets = game.tools.blitPattern(0, room, arena, ARENA_PALETTE );

                room.targetScore = MIN_SCORE+Math.floor(room.difficulty*RANGE_SCORE);

                assets.elements.forEach(element=>{
                    if (element.isAmmo) {
                        ammos.push(element);
                        game.tools.onInteract(element,[
                            {
                                run:(game, context, done)=>{
                                    game.tools.setInventoryItemCounter(context.room.ammoItem, context.room.ammoItem.counter+1);
                                    game.tools.setInventoryItemAnimation(context.room.ammoItem, "bounce");
                                    game.tools.hideElement(context.as);
                                    context.as.respawnTimer = AMMO_RESPAWN_TIME;
                                    game.tools.playAudio("kesiev-arenareload1");
                                    done(true);
                                }
                            }
                        ])
                    }
                });

                arena.center.map.forEach((row,y)=>{
                    for (let x=0;x<row.length;x++)
                        switch (row[x]) {
                            case "O":{
                                spawnPoints.push({ x:room.x+x, y:room.y+y, width:1, height:1 });
                                break;
                            }
                            case "A":{
                                architectPosition = { x:room.x+x, y:room.y+y, width:1, height:1 };
                                break;
                            }
                        }
                });

                for (let i=0;i<ghostsCount;i++) {
                    let
                        ghost = game.tools.addElement(spawnPoints[0].x, spawnPoints[0].y,{
                            respawnTimer:i*GHOST_RESPAWN_TIME,
                            isHidden:true,
                            isGhost:true,
                            sprite:[
                                { image:"images/npc.png", imageX:2, imageY:0 },
                                { image:"tombs/kesiev/images/texture.png", imageX:3, imageY:0, animation:ANIMATION_GHOST }
                            ]
                        });
                    ghosts.push(ghost);
                    game.tools.onInteract(ghost,[
                        {
                            hitPlayer:1
                        }
                    ]);
                }

                // --- Place the architect

                let
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
                                        text:"Anyway... It was very intense!"
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
                                text:"What do you say... shall we get started?",
                                options:[
                                    {
                                        id:"startIt",
                                        value:true,
                                        label:"I'm ready!"
                                    },{
                                        id:"startIt",
                                        value:false,
                                        label:"Wait"
                                    }
                                ]
                            }
                        ]
                    },{
                        if:{
                            asContext:"answers",
                            is:{ startIt:true }
                        },
                        asContext:"room",
                        addInventoryItem:{
                            data:{
                                isWeapon:true,
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,
                                counter:0,                              
                                model:"default",
                                image:"rod"
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            if (room.isRunning) {
                                                if (context.as.counter > 0) {
                                                    bullets.push(game.tools.addElement(game.position.x, game.position.y, {
                                                        movement:CONST.DIRECTIONS[game.position.direction],
                                                        model:"ball",
                                                        ball:"energy",
                                                        size:"brightDefault"
                                                    }));
                                                    game.tools.playAudio("kesiev-fireball1");
                                                    game.tools.setInventoryItemCounter(context.as, context.as.counter-1);
                                                } else
                                                    game.tools.playAudio("nogain1");
                                            }
                                            done(true);
                                        }  
                                    }
                                ]
                            }
                        }
                    },{
                        if:{ and:true },
                        playMusic:"kesiev-arena1"
                    },{
                        if:{ and:true },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Well... I think you should get some ammo!"
                            }
                        ]
                    },{
                        if:{ and:true },
                        run:(game, context, done)=>{
                            startGame(game, room, ghosts, bullets, ammos, architect);
                            done(true);
                        }
                    },{
                        if:{ else:true },
                        movePlayerBack:true
                    }
                ]);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Take back anything when the player exits the room

                game.tools.onLeave(room,[
                    {
                        run:(game, context, done)=>{
                            resetGame(game, room, ghosts, bullets, ammos, architect);
                            done(true);
                        }
                    }
                ]);

                // --- Animate the arena

                room.onFrame = (game)=>{

                    if (room.isRunning) {
                        let
                            position,
                            damage = 0;

                        // --- Move bullets

                        for (let i=0;i<bullets.length;) {
                            let
                                keepBullet = false,
                                bullet = bullets[i];
                            if (keepBullet = checkBullet(game, room, bullet, ghosts)) {
                                game.tools.moveElementBy(bullet, bullet.movement.x, bullet.movement.y);
                                position = game.tools.getRoomPosition(room, bullet);
                                if (!position || position.cell.isWall)
                                    keepBullet = false;
                                else
                                    keepBullet = checkBullet(game, room, bullet, ghosts);
                            }
                            if (keepBullet)
                                i++;
                            else {
                                game.tools.removeElement(bullet);
                                bullets.splice(i,1);
                            }
                        }

                        // --- Move ghosts

                        ghosts.forEach(ghost=>{
                            if (ghost.respawnTimer) {
                                ghost.respawnTimer--;
                                if (!ghost.respawnTimer) {
                                    let
                                        selectedPoint,
                                        distance = 0;

                                    spawnPoints.forEach(spawnpoint=>{
                                        let
                                            a = game.position.x - spawnpoint.x,
                                            b = game.position.y - spawnpoint.y,
                                            d = Math.sqrt( a*a + b*b );

                                        if (d > distance) {
                                            selectedPoint = spawnpoint;
                                            distance = d;
                                        }
                                    });

                                    ghost.movementTimer = GHOST_SPEED;
                                    game.tools.moveElementAt(ghost, selectedPoint.x, selectedPoint.y);
                                    game.tools.showElement(ghost);
                                }
                            } else if (ghost.movementTimer)
                                ghost.movementTimer--;
                            else {
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
                                    damage++;

                                ghost.movementTimer = GHOST_SPEED;
                            }
                        });

                        // --- Manage ammos

                        ammos.forEach(ammo=>{
                            if (ammo.respawnTimer) {
                                ammo.respawnTimer--;
                                if (!ammo.respawnTimer)
                                    game.tools.showElement(ammo);
                            }
                        });

                        // --- Apply damage

                        if (damage)
                            game.tools.hitPlayer(damage);
                        
                        if (!room.targetsToGo)
                            clearGame(game, room, ghosts, bullets, ammos, architect);
                    }   
                }

                // --- Reset the game

                resetGame(game, room, ghosts, bullets, ammos, architect);

            })
        }
        
    })
    
})();

