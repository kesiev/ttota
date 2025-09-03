(function(){

    const
        TOMB_ID = "kesiev-memories",
        TOMB_TAGS = [ "tomb", "special" ],
        CHECKPOINT_ID = "s",
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        PALETTE = [ "RED", "GREEN", "BLUE", "YELLOW", "CYAN", "PURPLE" ],
        IMAGES_COUNT = 3,
        GRID_WIDTH = 8,
        GRID_HEIGHT = 8;

    function paintCell(game, room, cell, item) {
        game.tools.paintFloor(0, cell, game.tools.SOLID, [ { backgroundColor:CONST.COLORS[item.pencilColor]} ], true);
        game.tools.paintMapSymbolBgColor(cell, CONST.COLORS[item.pencilColor]);
        game.tools.refreshScreen();
        cell.pencilId = item.pencilId;
        cell.isPainted = true;
        game.tools.playAudio("nogain1");
    }

    function dumpImage(game, room) {
        let
            out = {
                image:[],
                isDone:true,
                isRight:true
            };

        for (let y=0;y<GRID_HEIGHT;y++)
            for (let x=0;x<GRID_HEIGHT;x++) {
                let
                    cell = game.map[room.y+1+y][room.x+x];

                if (cell.isPainted) {
                    if (!out.image[y]) out.image[y]=[];
                    out.image[y][x]=cell.pencilId;
                    if (room.selectedImage && (cell.pencilId != room.selectedImage[y][x]))
                        out.isRight = false;
                } else {
                    out.isRight = false;
                    out.isDone = false;
                }
            }

        return out;
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Memories Room",
        description:"Paint some rooms as you want, then unveil them again with numbers.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:GRID_WIDTH,
                    height:GRID_HEIGHT+1,
                    isSolved:false,
                    attempts:1,
                    attemptsLimit:3
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    area = { x:room.x, y:room.y+1, width:room.width, height:room.height-1 },
                    bar = { x:room.x, y:room.y, width:room.width, height:1 },
                    pencils = [],
                    checkpoint = Tools.clone(game.tools.getCheckpoint(room,CHECKPOINT_ID)) || { images:[] },
                    walkableCells,
                    architectPosition,
                    architect;

                // --- Draw the Architect bar

                game.tools.paintFloor(0, bar, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);

                // --- Protect the answers area, so the architect doesn't spawn there

                game.tools.setProtected(area, true);

                // --- Prepare the architect

                walkableCells = game.tools.getWalkableCells(room);
                architectPosition = room.random.element(walkableCells);
                architect = game.tools.addNpc(architectPosition.x, architectPosition.y, Tools.clone(ARCHITECT.layout));

                // --- Prepare the pencil and the game mode

                room.isDrawMode = checkpoint.images.length < IMAGES_COUNT;

                PALETTE.forEach((color,id)=>{
                    pencils.push({ id:id, shuffleId:id, color:color });
                })

                if (room.isDrawMode) {

                    // --- Prepare the empty canvas

                    // --- Gives the numbered cards
                        
                    let
                        cards = [];

                    pencils.forEach(pencil=>{
                        cards.push({
                            if:{
                                asContext:"room",
                                is:{ isSolved:false }
                            },
                            addInventoryItem:{
                                data:{
                                    pencilId:pencil.id,
                                    pencilColor:pencil.color,
                                    group:CONST.GROUP.ROOMITEM,
                                    color:pencil.color,
                                    model:"default"
                                },
                                events:{
                                    onUse:[
                                        { setInventoryItemAnimation:"bounce" },
                                        {
                                            run:(game, context, done)=>{
                                                let
                                                    position = game.tools.getRoomPosition(room);

                                                if (position && (position.roomY > 0)) {
                                                    paintCell(game, room, position.cell, context.as);
                                                    done(true);
                                                } else  
                                                    done (false);
                                            }
                                        },{
                                            if:{ else:true },
                                            dialogueSay:[
                                                {
                                                    text:"It's a Developer Color card."
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        });
                    });

                    game.tools.onEnter(room,cards);

                    // --- Prepare the Architect script
                        
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
                                            text:"It's fun to color a little... you don't have to be an artist!"
                                        }
                                    ]
                                },
                                { movePlayerBack:true },
                                { endScript:true }
                            ]
                        },{
                            run:(game, context, done)=>{
                                room.dumpedImage = dumpImage(game, room);
                                done(room.dumpedImage.isDone);
                            }
                        },{
                            if:{ else:true },
                            dialogueSay:[     
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"How about some coloring? When you've colored the whole canvas, come over!"
                                }
                            ]
                        },{
                            if:{ else:true },
                            movePlayerBack:true
                        },{
                            if:{ else:true },
                            endScript:true
                        },{
                            if:{ and:true },
                            dialogueSay:[     
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"Let's see the map... Oh! What a beautiful drawing! Did you finish it?",
                                    options:[
                                        {
                                            id:"saveIt",
                                            value:true,
                                            label:"Yes!"
                                        },{
                                            id:"saveIt",
                                            value:false,
                                            label:"Not yet"
                                        }
                                    ]
                                }
                            ]
                        },{
                            if:{
                                asContext:"answers",
                                is:{ saveIt:true }
                            },
                            run:(game, context, done)=>{
                                checkpoint.images.push(room.dumpedImage.image);
                                game.tools.setNextCheckpoint(room,CHECKPOINT_ID,checkpoint);
                                done(true);
                            }
                        },{
                            if:{ and:true },
                            asContext:"room",
                            removeInventoryItemsFromRoom:true
                        },{
                            if:{ and:true },
                            asContext:"room",
                            setAttribute:"isSolved",
                            toValue:true
                        },{
                            if:{ and:true },
                            asContext:"room",
                            unlockRoom:true
                        },{
                            if:{ and:true },
                            dialogueSay:[     
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"Thank you so much! I will always keep it with me!"
                                }
                            ]
                        },
                        { movePlayerBack:true }
                    ]);
                    
                } else {

                    // --- Prepare the number board

                    let
                        idToShuffleId = {};

                    room.selectedImage = room.random.removeElement(checkpoint.images);

                    room.random.shuffle(pencils);

                    pencils.forEach((pencil,id)=>{
                        pencil.shuffleId = id+1;
                        idToShuffleId[pencil.id]=pencil.shuffleId;
                    })

                    for (let y=0;y<GRID_HEIGHT;y++)
                        for (let x=0;x<GRID_HEIGHT;x++)
                            game.tools.addCeilingDecoration(0, game.map[room.y+1+y][room.x+x], game.tools.SOLID, [ CONST.TEXTURES.FONT[idToShuffleId[room.selectedImage[y][x]]] ],true);

                    // --- Avoid decorations over numbers
                    
                    game.tools.setCeilingPaintable(area, false);

                    // --- Gives the numbered cards
                        
                    let
                        cards = [];

                    pencils.forEach(pencil=>{
                        cards.push({
                            if:{
                                asContext:"room",
                                is:{ isSolved:false }
                            },
                            addInventoryItem:{
                                data:{
                                    pencilId:pencil.id,
                                    pencilColor:pencil.color,
                                    group:CONST.GROUP.ROOMITEM,
                                    color:CONST.ITEMCOLOR.ROOMITEM,
                                    model:"default",
                                    character:pencil.shuffleId
                                },
                                events:{
                                    onUse:[
                                        { setInventoryItemAnimation:"bounce" },
                                        {
                                            run:(game, context, done)=>{
                                                let
                                                    position = game.tools.getRoomPosition(room);

                                                if (position && (position.roomY > 0)) {
                                                    paintCell(game, room, position.cell, context.as);
                                                    done(true);
                                                } else  
                                                    done (false);
                                            }
                                        },{
                                            if:{ else:true },
                                            dialogueSay:[
                                                {
                                                    text:"It's a card with a "+pencil.shuffleId+" on it."
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        });
                    });

                    game.tools.onEnter(room,cards);

                    // --- Prepare the architect script

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
                                            text:"It was nice, wasn't it?"
                                        }
                                    ]
                                },
                                { movePlayerBack:true },
                                { endScript:true }
                            ]
                        },{
                            run:(game, context, done)=>{
                                room.dumpedImage = dumpImage(game, room);
                                done(room.dumpedImage.isDone);
                            }
                        },{
                            if:{ else:true },
                            dialogueSay:[     
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"I forgot something important... Can you help me remember?"
                                }
                            ]
                        },{
                            if:{ else:true },
                            movePlayerBack:true
                        },{
                            if:{ else:true },
                            endScript:true
                        },{
                            if:{ and:true },
                            run:(game, context, done)=>{
                                done(room.dumpedImage.isRight);
                            }
                        },{
                            if:{ and:true },
                            run:(game, context, done)=>{
                                game.tools.setNextCheckpoint(room,CHECKPOINT_ID,checkpoint);
                                done(true);
                            }
                        },{
                            if:{ and:true },
                            asContext:"room",
                            removeInventoryItemsFromRoom:true
                        },{
                            if:{ and:true },
                            asContext:"room",
                            setAttribute:"isSolved",
                            toValue:true
                        },{
                            if:{ and:true },
                            asContext:"room",
                            unlockRoomWithAttempts:"attempts",
                            ofAttempts:"attemptsLimit"
                        },{
                            if:{ and:true },
                            dialogueSay:[     
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"Oh! That's right! It was this drawing! Thank you!"
                                }
                            ]
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
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"Hey! What's this squiggle?"
                                }
                            ]
                        },
                        { movePlayerBack:true }
                    ]);

                }

                // --- Take back the "select cell" card when the player exits the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

            });

        }
    })
    
})();

