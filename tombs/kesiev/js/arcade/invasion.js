(function(){

    let
        TOMB_ID = "kesiev-invasion",
        TOMB_TAGS = [ "tomb", "arcade" ],
        ARCHITECT= ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        SIZE = 3,
        ROOMSIZE = SIZE*2+1,
        HORDE_SPEED = 2,
        HORDE_SPAWN_SPEED = 6,
        HORDE_SIZE = 10,
        ANIMATION_GHOST = [ { dy:1 }, { dy:1 }, 0, { dy:-1 }, { dy:-1 }, 0  ],
        SPAWNPOINT_TEXTURE = { image:"images/texture.png", imageX:5, imageY:1 },
        CENTER_TEXTURE = { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0 };

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Invasion Room",
        description:"Spin on the center of the room and shoot at the coming enemies.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"Fireball SFX", by:[ "KesieV" ], id:"kesiev-fireball1", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"whitenoise","attack":0.015,"sustain":0.06,"decay":0.033,"release":0.172,"frequency":505,"tremoloDepth":0.17,"pitch":-0.0017,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0}},
            { type:"audio", title:"Avalanche", by:[ "Andreas Viklund" ], id:"kesiev-avalanche1",mod:"tombs/kesiev/audio/music/andreas_v_avalanche.xm", isSong:true},
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:ROOMSIZE,
                    height:ROOMSIZE,
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    center = { x:room.x+SIZE, y:room.y+SIZE, width:1, height:1 },
                    spawnpoints = [
                        { x:room.x+SIZE, y:room.y, width:1, height:1, movement:CONST.DIRECTIONS[2] },
                        { x:room.x+SIZE, y:room.y+ROOMSIZE-1, width:1, height:1, movement:CONST.DIRECTIONS[0] },
                        { x:room.x, y:room.y+SIZE, width:1, height:1, movement:CONST.DIRECTIONS[1] },
                        { x:room.x+ROOMSIZE-1, y:room.y+SIZE, width:1, height:1, movement:CONST.DIRECTIONS[3] }
                    ],
                    lanes = [
                        { x:room.x, y:room.y+SIZE, width:ROOMSIZE, height:1 },
                        { x:room.x+SIZE, y:room.y, width:1, height:ROOMSIZE }
                    ],
                    hordeSize = HORDE_SIZE+Math.floor(HORDE_SIZE*room.difficulty),
                    isStarted = false,
                    hordeProgress = 0,
                    hordeTimer = 0,
                    horde = [],
                    enemies = [],
                    score = 0,
                    bullet;

                function resetHorde() {
                    isStarted = false;
                    hordeProgress = 0;
                    hordeTimer = 0;
                    enemies.forEach(enemy=>{
                        game.tools.removeElement(enemy);
                    })
                    if (bullet) {
                        game.tools.removeElement(bullet);
                        bullet = 0;
                    }
                    enemies.length = 0;
                }

                function restartHorde() {
                    resetHorde();
                    isStarted = true;
                }

                function checkBullet() {
                    enemies = enemies.filter(enemy=>{
                        if (bullet && (enemy.x == bullet.x) && (enemy.y == bullet.y)) {
                            game.tools.playerGainGold(room,1);
                            game.tools.removeElement(bullet);
                            game.tools.removeElement(enemy);
                            bullet = 0;
                            score++;
                            return false;
                        } else
                            return true;
                    })
                    return bullet;
                }

                for (let i=0;i<hordeSize;i++)
                    horde.push(room.random.element(spawnpoints));

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Draw the arena

                lanes.forEach(lane=>{
                    game.tools.paintFloor(0, lane, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);
                    // Protect the cell, so the architect won't spawn there
                    game.tools.setProtected(lane, true);
                });
                
                game.tools.addFloorDecoration(0, center, game.tools.SOLID, [ CENTER_TEXTURE ],true);

                spawnpoints.forEach(spawnpoint=>{
                    game.tools.addFloorDecoration(0, spawnpoint, game.tools.SOLID, [ SPAWNPOINT_TEXTURE ],true);
                });

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
                            {
                                dialogueSay:[
                                    {
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"Well done! You wiped them all out! It reminded me a thing..."
                                    }
                                ]
                            },
                            game.tools.scriptArchitectPaidQuote(game, room, ARCHITECT),
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Nice stick, isn't it?"
                            },{
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"It can shoot energy balls! Go try it!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // --- Animate the arena

                room.onFrame = (game)=>{

                    let
                        cell;

                    if (isStarted) {

                        // --- Move the bullet

                        if (bullet) {
                            if (checkBullet()) {
                                game.tools.moveElementBy(bullet, bullet.movement.x, bullet.movement.y);
                                cell = game.map[bullet.y][bullet.x];
                                if (cell.isWall) {
                                    game.tools.removeElement(bullet);
                                    bullet = 0;
                                } else
                                    checkBullet();
                            }
                        }

                        
                        // --- Move enemies

                        enemies = enemies.filter(enemy=>{
                            if (enemy.timer)
                                enemy.timer--;
                            else {
                                enemy.timer = HORDE_SPEED;
                                game.tools.moveElementBy(enemy, enemy.movement.x, enemy.movement.y);
                                if ((enemy.x == center.x) && (enemy.y == center.y)) {
                                    game.tools.removeElement(enemy);
                                    game.tools.hitPlayer(1);
                                    return false;
                                }
                            }
                            return true;
                        })                            

                        // --- Spawn the horde

                        if (horde[hordeProgress])

                            if (hordeTimer)
                                hordeTimer--;
                            else {
                                let
                                    spawnpoint = horde[hordeProgress];
                                enemies.push(game.tools.addElement(spawnpoint.x, spawnpoint.y, {
                                    timer:HORDE_SPEED,
                                    movement:spawnpoint.movement,
                                    sprite:[
                                        { image:"images/npc.png", imageX:2, imageY:0 },
                                        { image:"tombs/kesiev/images/texture.png", imageX:3, imageY:0, animation:ANIMATION_GHOST }
                                    ]
                                }));

                                hordeTimer = HORDE_SPAWN_SPEED;
                                hordeProgress++;
                            }
                        
                        else if (!enemies.length) {
                            resetHorde();
                            game.tools.unlockControls();
                            game.tools.resetMusic();
                            game.tools.unlockRoomWithScore(room,score,hordeSize,()=>{});
                            room.isSolved = true;
                            game.tools.removeInventoryItemsFromRoom(room);
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
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,                                
                                model:"default",
                                image:"rod"
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            if (isStarted) {
                                                if (!bullet) {
                                                    bullet = game.tools.addElement(game.position.x, game.position.y, {
                                                        movement:CONST.DIRECTIONS[game.position.direction],
                                                        model:"ball",
                                                        ball:"energy",
                                                        size:"brightDefault"
                                                    }, true);
                                                    game.tools.playAudio("kesiev-fireball1");
                                                }
                                                done(true);
                                            } else {
                                                if ((game.position.x == center.x) && (game.position.y == center.y)) {
                                                    game.tools.lockControl("up");
                                                    game.tools.lockControl("down");
                                                    game.tools.playMusic("kesiev-avalanche1");
                                                    game.tools.dialogueSay(0, [
                                                        {
                                                            text:"Brace yourself! They are coming!"
                                                        }
                                                    ], ()=>{
                                                        restartHorde();
                                                        done(true);
                                                    });
                                                } else
                                                    game.tools.dialogueSay(0, [
                                                        {
                                                            text:"This stick looks ready to fire!"
                                                        }
                                                    ],()=>{
                                                        done(true);
                                                    });
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

