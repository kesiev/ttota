(function(){

    const
        TOMB_ID = "kesiev-copy",
        TOMB_TAGS = [ "tomb", "memory" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        ROOM_SIZE = 3,
        PALETTE = [ "RED", "GREEN", "BLUE", "YELLOW", "CYAN", "PURPLE" ];

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Copy Room",
        description:"Memorize the colors of a painted room and copy them on another one.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:2,
        maxRooms:2,

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
                },{
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:ROOM_SIZE,
                    height:ROOM_SIZE,
                    isSolved:false,
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                answer = [],
                solution = [];

            rooms.forEach((room,id)=>{

                // --- Add entrance plaques

                game.tools.addPlaques(room);

                switch (id) {
                    case 0:{
                        // --- Model room

                        // --- Set the room data

                        room.quote = room.random.element(ARCHITECT.plaques);

                        // --- Generate and paint the solution

                        for (let y=0;y<ROOM_SIZE;y++) {
                            let
                                row = [];
                            
                            solution.push(row);
                            answer.push([]);

                            for (let x=0;x<ROOM_SIZE;x++) {
                                let
                                    color = room.random.elementIndex(PALETTE);
                                row.push(color);

                                if (room.difficulty < 0.3)
                                    game.tools.paintMapSymbolBgColor(game.map[room.y+y][room.x+x], CONST.COLORS[PALETTE[color]]);

                                if (room.random.bool())
                                    game.tools.paintFloor(0, game.map[room.y+y][room.x+x], game.tools.SOLID, [
                                        { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0, backgroundColor:CONST.COLORS[PALETTE[color]] }
                                    ]);
                                else 
                                    game.tools.paintCeiling(0, game.map[room.y+y][room.x+x], game.tools.SOLID, [
                                        { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0, backgroundColor:CONST.COLORS[PALETTE[color]] }
                                    ]);
                            }
                        }

                        // --- Add the architect

                        let
                            architect = game.tools.addNpc(room.x+1, room.y+1, Tools.clone(ARCHITECT.layout));

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
                                                text:"Good luck with your adventure!"
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
                                        text:"Oh, I almost forgot! I have something for you..."
                                    }
                                ]
                            },{
                                asContext:"room",
                                unlockRoom:true
                            },{
                                asContext:"room",
                                setAttribute:"isSolved",
                                toValue:true
                            },{
                                dialogueSay:[     
                                    {
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"Make good use of it! See you soon!"
                                    }
                                ]
                            },
                            { movePlayerBack:true }
                        ]);

                        break;
                    }
                    case 1:{
                        // --- Test room

                        // --- Set the room data

                        room.quote = "\"Do you remember?\"";
                        room.attempts = 1;
                        room.attemptsLimit = 3;

                        // --- Add a lever to solve this room

                        let
                            walkableWalls = game.tools.getWalkableWalls(room),
                            leverPosition = room.random.element(walkableWalls);

                        game.tools.addWallDecoration(0, leverPosition, leverPosition.side, game.tools.SOLID, [
                            {  isLever:true, image:"images/texture.png", imageX:3, imageY:1 }
                        ]);

                        game.tools.onBumpWall(leverPosition.x, leverPosition.y, leverPosition.side, [
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
                                        text:"This lever is connected to this room floor. Do you want to pull it?",
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
                                changeWallDecoration:{
                                    area:leverPosition,
                                    side:leverPosition.side,
                                    id:"isLever",
                                    values:{ imageX:4 }
                                },
                                refreshScreen:true
                            },{
                                run:(game, context, done)=>{

                                    if (CONST.DEBUG.showLogs)
                                        console.log(solution);

                                    let
                                        isSolved = true;
                                    for (let x=0;x<ROOM_SIZE;x++)
                                        for (let y=0;y<ROOM_SIZE;y++)
                                            if (solution[y][x] !== answer[y][x]) {
                                                isSolved = false;
                                                break;
                                            }
                                    done(isSolved);
                                }
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
                            },{
                                if:{ else:true },
                                hitPlayer:2
                            },{
                                if:{ else:true },
                                asContext:"room",
                                sumAttribute:"attempts",
                                byValue:1
                            },{
                                if:{ else:true },
                                dialogueSay:[
                                    {
                                        text:"The Developer Color cards you are holding in your hand are burning!"
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
                        game.tools.setWallPaintable(leverPosition.x, leverPosition.y, leverPosition.side, false);

                        // --- Give the "color cards" cards when the player enters the room

                        let
                            cards = [];

                        PALETTE.forEach((color,id)=>{
                            cards.push({
                                if:{
                                    asContext:"room",
                                    is:{ isSolved:false }
                                },
                                addInventoryItem:{
                                    data:{
                                        group:CONST.GROUP.ROOMITEM,
                                        color:CONST.COLORS[color],
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
                                                        answer[position.roomY][position.roomX] = id;
                                                        game.tools.paintFloor(0, position, game.tools.SOLID, [
                                                            { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0, backgroundColor:CONST.COLORS[color] }
                                                        ], true);
                                                        game.tools.paintMapSymbolBgColor(position, CONST.COLORS[color]);
                                                        game.tools.playAudio("nogain1");
                                                        done(true);
                                                    } else
                                                        done(false);
                                                }  
                                            },{
                                                if:{ else:true },
                                                dialogueSay:[
                                                    {
                                                        text:"The color of this paper seems to stick to your hands..."
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                }
                            });
                        });

                        game.tools.onEnter(room,cards);

                        // --- Take back the "color cards" card when the player leaves the room

                        game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);
                        break;
                    }
                }
                
            })
        }
        
    })
    
})();

