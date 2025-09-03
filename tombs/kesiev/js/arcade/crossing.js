(function(){

    const
        TOMB_ID = "kesiev-crossing",
        TOMB_TAGS = [ "tomb", "arcade" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        LANES_COUNT = 5,
        ANIMATION_LAVA = [ { dx:0 }, { dx:-16 }, { dx:-32 }, { dx:-48 }, { dx:-64 }, { dx:-80 } ],
        TEXTURE_LAVA = [
            { image:"tombs/kesiev/images/texture.png", imageX:3, imageY:5, animation:ANIMATION_LAVA, backgroundColor: CONST.COLORS.RED }
        ],
        TEXTURE_PLATFORM = [
            { image:"tombs/kesiev/images/texture.png", imageX:3, imageY:5, animation:ANIMATION_LAVA, backgroundColor: CONST.COLORS.RED },
            { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:5 },
        ],
        TEXTURE_START = [ { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0 } ],
        LANES = [
            [
                { pattern:"..#####..", speed:2 },
                { pattern:".###.###.", speed:3 },
                { pattern:"...###...", speed:3 },
            ],[
                { pattern:"##..##...", speed:3 },
                { pattern:"...###...", speed:2 },
                { pattern:".###.###.", speed:2 },
            ],[
                { pattern:"...##....", speed:3 },
                { pattern:"..##.##..", speed:3 },
                { pattern:"##..##...", speed:2 },
            ],[
                { pattern:"...##....", speed:2 },
                { pattern:"..##.##..", speed:2 },
            ],[
                { pattern:"...##....", speed:1 },
                { pattern:"..##.##..", speed:1 },
                { pattern:"..#..##..", speed:1 },
            ]
        ];

    function drawLanes(game, room, area, lanes) {
        if (lanes) {
            let
                texture,
                isDeadly;
            lanes.forEach(lane=>{
                for (let i=0;i<lane.pattern.length;i++) {
                    let
                        cell = game.map[lane.y][lane.x+i];

                    if (lane.pattern[i] == ".") {
                        texture = TEXTURE_LAVA;
                        isDeadly = true;
                    } else {
                        texture = TEXTURE_PLATFORM;
                        isDeadly = false;
                    }

                    game.tools.paintFloor(0, cell, game.tools.SOLID, texture, true);
                    cell.isDeadly = isDeadly;
                }
            })
        } else
            game.tools.paintFloor(0, area, game.tools.SOLID, game.dungeon.defaultFloor, true);
    }

    function checkPlayerPosition(game, room) {
        let
            position = game.tools.getRoomPosition(room);

        if (position && position.cell.isDeadly) {
            room.attempts++;
            game.tools.hitPlayer(1);
        }
    }

    function resetGame(game, room, area, lanes) {
        room.status = 0;
        lanes.forEach(lane=>{
            lane.timer = 0;
        });
        drawLanes(game, room, area, 0);
    }

    function startGame(game, room, area, lanes) {
        resetGame(game, room, area, lanes);
        room.attempts++;
        room.status = 1;
        drawLanes(game, room, area, lanes);
        game.tools.refreshScreen();
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Crossing Room",
        description:"Cross the room avoiding the lava.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"Avalanche", by:[ "Andreas Viklund" ], id:"kesiev-avalanche1",mod:"tombs/kesiev/audio/music/andreas_v_avalanche.xm", isSong:true},
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:LANES[0][0].pattern.length,
                    height:(LANES_COUNT*2)+1,
                    attempts:0,
                    attemptsLimit:5,
                    isSolved:false,
                    status:0
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach((room,id)=>{

                let
                    start = game.map[room.y+room.height-1][room.x+Math.floor(room.width/2)],
                    goal = { x:room.x, y:room.y, width:room.width, height:1 },
                    area = { x:room.x, y:room.y+1, width:room.width, height:room.height-2 },
                    laneDifficulty = Math.floor(room.difficulty*(LANES.length-1)),
                    lanes = [];

                for (let i=0;i<LANES_COUNT;i++) {
                    let
                        lane = room.random.element(LANES[laneDifficulty]);
                    lanes.push({ x:room.x, y:room.y+1+(i*2), pattern:lane.pattern, speed:lane.speed, direction:i%2 });
                    if ((i%2) && laneDifficulty)
                        laneDifficulty--;
                }

                game.tools.setElementPaintable(area,false);
                game.tools.setFloorPaintable(area,false);

                // --- Draw the goal area

                game.tools.paintFloor(0, goal, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);

                // --- Draw the start area

                game.tools.addFloorDecoration(0, start, game.tools.SOLID, TEXTURE_START, true);

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
                                            if ((room.status == 0) && (game.position.cell == start)) {
                                                startGame(game, room, area, lanes);
                                                done(true);
                                            } else
                                                done(false);
                                        }  
                                    },{
                                        if:{ and:true },
                                        playMusic:"kesiev-avalanche1"
                                    },{
                                        if:{ and:true },
                                        dialogueSay:[
                                            {
                                                audio:ARCHITECT.voiceAudio,
                                                by:ARCHITECT.layout.name,
                                                text:"Now come to me without hurting yourself too much!"
                                            }
                                        ]
                                    },{
                                        if:{ else:true },
                                        dialogueSay:[
                                            {
                                                text:"Nothing happens..."
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
                    {
                        run:(game, context, done)=>{
                            resetGame(game, room, area, lanes);
                            done(true);
                        }
                    },
                    { removeInventoryItemsFromRoom:true }
                ]);

                // --- Initialize the game

                resetGame(game, room, area, lanes);

                // --- Move the lanes

                room.onFrame = (game)=>{

                    if (room.status == 1) {
                        let
                            lanesMoved = false;
                        lanes.forEach(lane=>{
                            lane.timer++;
                            if (lane.timer>=lane.speed) {
                                lanesMoved = true;
                                lane.timer = 0;
                                if (lane.direction)
                                    lane.pattern=lane.pattern.substr(1)+lane.pattern[0];
                                else
                                    lane.pattern=lane.pattern[lane.pattern.length-1]+lane.pattern.substr(0,lane.pattern.length-1);
                            }
                        });
                        if (lanesMoved) {
                            drawLanes(game, room, area, lanes);
                            checkPlayerPosition(game, room, area, lanes);
                        }
                    }
                    
                }

                // --- Check falling on lava

                game.tools.onMove(room,[
                    {
                        run:(game, context,done)=>{
                            if (room.status == 1)
                                checkPlayerPosition(game, room, area, lanes);
                            done(true);
                        }
                    }
                ]);

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
                                        text:"How scared I was!"
                                    }
                                ]
                            },
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        if:{
                            asContext:"room",
                            is:{ status:0 }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Let's play a game! Go to the starting point and let me know when you're ready!"
                            }
                        ]
                    },{
                        if:{
                            asContext:"room",
                            is:{ status:1 }
                        },
                        run:(game, context, done)=>{
                            resetGame(game, room, area, lanes);
                            done(true);
                        }
                    },{
                        if:{ and:true },
                        resetMusic:true
                    },{
                        if:{ and:true },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Wow! You survived this far! Great job!"
                            }
                        ]
                    },{
                        if:{ and:true },
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
                    },
                    { movePlayerBack:true }
                ]);

            })
        }
        
    })
    
})();

