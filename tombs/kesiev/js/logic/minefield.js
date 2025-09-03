(function(){

    const
        TOMB_ID = "kesiev-minefield",
        TOMB_TAGS = [ "tomb", "logic" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS);

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Smile Room",
        description:"The classic Minefield puzzle game.",
        byArchitect:ARCHITECT.layout.name,

        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"Architect KesieV's tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:6,
                    height:6,
                    cellsToDiscover:0,
                    isStarted:false,
                    isSolved:false,
                    attempts:1,
                    attemptsLimit:3
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    flags = [];

                room.mines = 6+Math.floor(room.difficulty*4);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

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
                                text:"Ugh... This place looks dangerous. Better run away!"
                            }
                        ]
                    },
                    { removeElement:true, refreshScreen:true }
                ]);

                // --- Draw the minefield mud

                game.tools.paintFloor(0, room, game.tools.SOLID, [
                    { image:"tombs/kesiev/images/texture.png", imageX:4, imageY:0, backgroundColor:CONST.COLORS.DARKRED }
                ]);

                // --- Give the "shovel" and "flag" cards when the player enters the room

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
                                image:"shovel"
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                px = game.position.x-room.x,
                                                py = game.position.y-room.y;

                                            // --- Place mines, skipping current position

                                            if (!room.isStarted) {
                                                let
                                                    row,
                                                    cells = [];

                                                room.grid = [];
                                                room.discovered = [];
                                                for (let y=0;y<room.height;y++) {
                                                    row = [];
                                                    room.grid.push(row);
                                                    room.discovered.push([]);
                                                    for (let x=0;x<room.width;x++) {
                                                        row.push(0);
                                                        if ((x != px) && (y != py))
                                                            cells.push({ x:x, y:y });
                                                    }
                                                }
                                                for (let i=0;i<room.mines;i++) {
                                                    let
                                                        pos = room.random.removeElement(cells);
                                                    room.grid[pos.y][pos.x] = -1;
                                                    for (let x=-1;x<2;x++)
                                                        for (let y=-1;y<2;y++) {
                                                            if ((x || y) && room.grid[pos.y+y] && (room.grid[pos.y+y][pos.x+x]>=0))
                                                                room.grid[pos.y+y][pos.x+x]++;
                                                        }
                                                }
                                                room.cellsToDiscover = room.width*room.height-room.mines;
                                                room.isStarted = true;
                                            }

                                            // --- Dig in the current position

                                            if (!room.discovered[py][px]) {

                                                game.tools.playAudio("dig1");

                                                if (room.grid[py][px]<0) {
                                                    room.discovered[py][px] = true;
                                                    game.tools.playAudio("kesiev_explosion1");
                                                    game.tools.hitPlayer(2);
                                                    room.attempts++;
                                                } else if (!room.grid[py][px]) {

                                                    // --- Uncover adjacent zeroes

                                                    let
                                                        pos,
                                                        schedule = [ { x:px, y:py }];

                                                    while (schedule.length) {
                                                        pos = schedule.pop();
                                                        if (!room.grid[pos.y][pos.x])
                                                            for (let x=-1;x<2;x++)
                                                                for (let y=-1;y<2;y++) {
                                                                    if (room.grid[pos.y+y] && (room.grid[pos.y+y][pos.x+x]>=0) && !room.discovered[pos.y+y][pos.x+x]) {
                                                                        room.cellsToDiscover--;
                                                                        room.discovered[pos.y+y][pos.x+x] = true;
                                                                        schedule.push({ x:pos.x+x, y:pos.y+y});
                                                                    }
                                                                }
                                                    }
                                                } else {
                                                    room.discovered[py][px] = true;
                                                    room.cellsToDiscover--;
                                                }

                                                // --- Update map

                                                for (let y=0;y<room.height;y++)
                                                    for (let x=0;x<room.width;x++)
                                                        if (room.discovered[y][x]) {
                                                            let
                                                                texture;
                                                            switch (room.grid[y][x]) {
                                                                case 0:{
                                                                    texture = [ { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:game.dungeon.floorColor } ];
                                                                    break;
                                                                }
                                                                case -1:{
                                                                    texture = [
                                                                        { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:game.dungeon.floorAccent },
                                                                        { image:"tombs/kesiev/images/texture.png", imageX:6, imageY:0 },
                                                                    ];
                                                                    break;
                                                                }
                                                                default:{
                                                                    texture = [
                                                                        { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:game.dungeon.floorColor },
                                                                        CONST.TEXTURES.FONT[room.grid[y][x]]
                                                                    ];
                                                                }
                                                            }
                                                            game.tools.paintFloor(0, game.map[room.y+y][room.x+x], game.tools.SOLID, texture, true);
                                                        }

                                                if (!room.cellsToDiscover) {
                                                    room.isSolved = true;
                                                    flags.forEach(flag=>{
                                                        game.tools.removeElement(flag);
                                                    })
                                                    flags = [];
                                                }

                                                game.tools.refreshScreen();

                                                done(true);
                                            
                                            } else
                                                done(false);
                                        }  
                                    },{
                                        if:{ else:true },
                                        dialogueSay:[
                                            {
                                                text:"A shovel. Maybe you can use it to dig somewhere..."
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
                    },{
                        if:{ and:true },
                        addInventoryItem:{
                            data:{
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,                                
                                model:"default",
                                image:"flag"
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                add = true;
                                            flags = flags.filter(flag=>{
                                                if ((flag.x == game.position.x) && (flag.y == game.position.y)) {
                                                    game.tools.removeElement(flag);
                                                    add = false;
                                                    return false;
                                                } else
                                                    return true;
                                            })
                                            if (add)
                                                flags.push(game.tools.addElement(game.position.x, game.position.y, {
                                                    sprite:[
                                                        { image:"images/npc.png", imageX:3, imageY:0 },
                                                        { image:"tombs/kesiev/images/texture.png", imageX:5, imageY:0 },
                                                    ]
                                                }));
                                            game.tools.playAudio("equip1");
                                            game.tools.refreshScreen();
                                            done(true);
                                        }  
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Take back the "shovel" and "flag" cards when the player exits the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);

            })
        }
        
    })
    
})();

