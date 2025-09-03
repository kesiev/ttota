(function(){

    const
        TOMB_ID = "kesiev-dodge",
        TOMB_TAGS = [ "tomb", "arcade" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        ARENA_WIDTH = 5,
        ARENA_HEIGHT = 7,
        PLATFORMBAR_TEXTURE = [
            "defaultFloorTexture",
            { image:"tombs/kesiev/images/texture.png", imageX:6, imageY:8 }
        ],
        PLATFORM_TEXTURE = [
            "defaultFloorTexture",
            { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:8 }
        ],
        ANIMATION_FLOAT = [ { dy:1 }, { dy:1 }, 0, { dy:-1 }, { dy:-1 }, 0  ],
        APPLE = {
            isApple:true,
            sprite:[
                { image:"images/npc.png", imageX:3, imageY:0 },
                { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:6, animation:ANIMATION_FLOAT },
            ]
        },
        ENERGYBALL = {
            isEnergyBall:true,
            model:"ball",
            ball:"energy",
            size:"brightDefault"
        },
        SPEED_MIN = 1,
        SPEED_RANGE = 2,
        DURATION = 10,
        HAZARDS_DISTANCE = 2,
        HAZARDS_VARIETY = 3,
        HAZARDS = [
            { energyBalls:1, apples:1 },
            { energyBalls:1, apples:1 },
            { energyBalls:2 },
            { energyBalls:2, apples:1 },
            { energyBalls:3 },
            { energyBalls:3, apples:1 },
            { energyBalls:3 },
            { energyBalls:4, apples:1 },
        ];

    function updatePlatform(game, room) {
        game.tools.paintFloor(0, room.platformBar, game.tools.SOLID, PLATFORMBAR_TEXTURE, true);
        game.tools.paintFloor(0, room.platform, game.tools.SOLID, PLATFORM_TEXTURE, true);
    }

    function checkPlayer(game, room) {
        room.sprites = room.sprites.filter(sprite=>{
            if ((sprite.x == game.position.x) && (sprite.y == game.position.y)) {
                if (sprite.isEnergyBall)
                    game.tools.hitPlayer(1);
                if (sprite.isApple) {
                    room.score++;
                    game.tools.playerGainGold(room, 1);
                }
                game.tools.removeElement(sprite);
                return false;
            } else
                return true;
        })
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Dodge Room",
        description:"Dodge energy balls and catch apples moving sideways.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"Avalanche", by:[ "Andreas Viklund" ], id:"kesiev-avalanche1",mod:"tombs/kesiev/audio/music/andreas_v_avalanche.xm", isSong:true},
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            { type:"audio", id:"kesiev-dodge-chain1", title:"Metal SFX", by:[ "rubberduck" ], file:"tombs/kesiev/audio/sfx/chain1" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:ARENA_WIDTH,
                    height:ARENA_HEIGHT+1,
                    isSolved:false,
                    hazardDistance:1,
                    duration:DURATION,
                    score:0,
                    maxScore:0,
                    status:0
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach((room,id)=>{

                let
                    goal = { x:room.x, y:room.y, width:room.width, height:1 };

                room.sprites = [];

                room.nextTime = room.speed = SPEED_MIN + Math.floor((1-room.difficulty)*SPEED_RANGE);
                room.hazardLevel = Math.floor((HAZARDS.length-HAZARDS_VARIETY)*room.difficulty);

                room.platform = { x:room.x+Math.floor(room.width/2), y:room.y+room.height-1, width:1, height:1 };
                room.platformBar = { x:room.x, y:room.platform.y, width:room.width, height:1 };

                game.tools.paintFloor(0, goal, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);

                game.tools.setProtected(room.platformBar, true);
                game.tools.setFloorPaintable(room.platformBar, false);
                game.tools.setElementPaintable(room.platformBar, false);

                updatePlatform(game, room);                

                // --- Add entrance plaques

                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Give the "start game" card when the player enters the room

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
                                    {
                                        run:(game, context, done)=>{
                                            if (game.tools.getRoomPosition(room.platform))
                                                if (game.position.direction == 0) {
                                                    game.tools.lockControl("up");
                                                    game.tools.lockControl("down");
                                                    game.tools.lockControl("left");
                                                    game.tools.lockControl("right");
                                                    done(0);
                                                } else
                                                    done(2);
                                            else
                                                done(1);
                                        }  
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result: 0 }
                                        },
                                        playMusic:"kesiev-avalanche1"
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        removeInventoryItemsFromRoom:true
                                    },{
                                        if:{ and:true },
                                        dialogueSay:[
                                            {
                                                text:"Your legs were held in place by clamps!"
                                            }
                                        ]
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        setAttribute:"status",
                                        toValue:1
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result: 1 }
                                        },
                                        dialogueSay:[
                                            {
                                                text:"Nothing happens..."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result: 2 }
                                        },
                                        dialogueSay:[
                                            {
                                                text:"The place is right but you're facing the wrong direction..."
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Take back the "start game" card and reset the game when the player leaves the room

                game.tools.onLeave(room,[
                    { removeInventoryItemsFromRoom:true }
                ]);

                // --- Move the elements

                room.onFrame = (game)=>{

                    if (room.status == 1) {

                        if (room.nextTime)
                            room.nextTime--;
                        else {
                            room.nextTime = room.speed;

                            room.sprites = room.sprites.filter(sprite=>{
                                if (sprite.y == room.platformBar.y) {
                                    game.tools.removeElement(sprite);
                                    return false;
                                } else {
                                    game.tools.moveElementBy(sprite, 0, 1);
                                    return true;
                                }
                            });

                            checkPlayer(game, room);

                            if (room.hazardDistance)
                                room.hazardDistance--;
                            else if (room.duration>0) {
                                
                                let
                                    hazard = HAZARDS[room.hazardLevel+room.random.integer(HAZARDS_VARIETY)],
                                    cellsBag = { elements:[] };

                                for (let i=0;i<ARENA_WIDTH;i++)
                                    cellsBag.elements.push(i);

                                for (let i=0;i<hazard.energyBalls;i++) {
                                    let
                                        pos = room.random.bagPick(cellsBag);
                                    room.sprites.push(game.tools.addElement(room.x+pos, room.y+1, Tools.clone(ENERGYBALL), true));
                                }

                                for (let i=0;i<hazard.apples;i++) {
                                    let
                                        pos = room.random.bagPick(cellsBag);
                                    room.sprites.push(game.tools.addElement(room.x+pos, room.y+1, Tools.clone(APPLE), true));
                                    room.maxScore++;
                                }

                                room.duration--;
                                room.hazardDistance = HAZARDS_DISTANCE;

                            } else if (!room.sprites.length) {
                                room.status = 2;
                                room.isSolved = true;
                                game.tools.resetMusic();
                                game.tools.unlockControls();
                                game.tools.unlockRoomWithScore(room, room.score, room.maxScore,()=>{});
                            }
                        }
                       
                    }
                    
                }

                // --- Move the player

                room.onKey = (game, key)=>{

                    if (room.status == 1) {

                        let
                            movePlatform;

                        switch (key) {
                            case "left":{
                                if (room.platform.x>room.x)
                                    movePlatform = -1;
                                break;
                            }
                            case "right":{
                                if (room.platform.x<room.x+room.width-1)
                                    movePlatform = 1;
                                break;
                            }
                        }

                        if (movePlatform) {
                            room.platform.x+=movePlatform;
                            game.tools.movePlayerTo(room.platform.x, room.platform.y);
                            updatePlatform(game, room);
                            game.tools.refreshScreen();
                            game.tools.playAudio("kesiev-dodge-chain1");
                            checkPlayer(game, room);
                        }
                       
                    }
                    
                }

                // --- Add the architect in the goal zone

                let
                    walkableCells = game.tools.getWalkableCells(goal),
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
                                        text:"Anyway... You're good at dodging!"
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
                                text:"Hey! What are you doing here? Get on the platform and let me know when you're ready!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

            })
        }
        
    })
    
})();

