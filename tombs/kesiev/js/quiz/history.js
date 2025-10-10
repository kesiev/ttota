(function(){

    const
        TOMB_ID = "kesiev-history",
        TOMB_TAGS = [ "tomb", "quiz" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        EVENTS = 4;

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Narration Room",
        description:"Arrange some historical events in chronological order.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            { type:"data", id:"kesiev-history-data", title:"Historic events data", license:"Creative Commons CC0 1.0 Universal", by:[ "Wikipedia / Wikidata" ], file:"tombs/kesiev/data/history/history.txt" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:EVENTS,
                    height:5,
                    isSolved:false,
                    attempts:1,
                    attemptsLimit:5
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                events = LOADER.DATA["kesiev-history-data"].split("\n"),
                answer = [];

            rooms.forEach(room=>{

                let
                    calendarMetadata = {};

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Draw the room

                // Paint the timeline
                for (let i=0;i<EVENTS;i++) {
                    let
                        guideCell = game.map[room.y+2][room.x+i],
                        placeCell = game.map[room.y+3][room.x+i];

                    game.tools.paintMapSymbol(guideCell, i+1);
                    game.tools.paintMapSymbolBgColor(guideCell, CONST.COLORS.BLUE);
                    game.tools.paintMapSymbolColor(guideCell, CONST.COLORS.WHITE);
                    game.tools.paintFloor(0,guideCell, game.tools.SOLID,[
                        { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:game.dungeon.floorColor },
                        CONST.TEXTURES.FONT[i+1]
                    ])

                    game.tools.paintMapSymbolBgColor(placeCell, CONST.COLORS.CYAN);
                    game.tools.paintFloor(0, placeCell, game.tools.SOLID,[
                        { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0, backgroundColor:game.dungeon.floorColor }
                    ])
                }

                // Protect the answers area, so the architect doesn't spawn there
                game.tools.setProtected({ x:room.x, y:room.y+2, width:room.width, height:2 }, true);

                let
                    walkableCells = game.tools.getWalkableCells({ x:room.x, y:room.y+1, width:room.width, height:1 }),
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
                                        text:"Anyway... You have satisfied the God of Time! Thank you!"
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
                                text:"How about reading some books with me?"
                            },{
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"I do it to worship the God of Time... but also to put my thoughts in order!"
                            },{
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"You can use my favorite places to read. Try it!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // Protect the cell, so the lever won't spawn there
                game.tools.setProtected(architectPosition, true);

                // --- Place the confirmation lever

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
                                text:"This lever will invoke the God of Time. Do you want to pull it?",
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
                            let
                                historyBooks = game.tools.getInventoryItemsFromRoom(room).filter(item=>item.isHistoryBook),
                                correct = true,
                                lastYear,
                                index = {};

                            for (let i=0;i<EVENTS;i++) {
                                currentAnswer = answer[i];
                                if (currentAnswer && !index[currentAnswer.bookId] && ((lastYear === undefined) || (currentAnswer.year >= lastYear)) ) {
                                    lastYear = currentAnswer.year;
                                    if (!index[currentAnswer.bookId])
                                        index[currentAnswer.bookId] = 1;
                                } else {
                                    correct = false;
                                    if (currentAnswer)
                                        index[currentAnswer.bookId] = 2;
                                }
                            }

                            historyBooks.forEach(item=>{
                                if (index[item.bookId] == 1)
                                    game.tools.setInventoryItemColor(item,CONST.ITEMCOLOR.ROOMITEM);
                                else
                                    game.tools.setInventoryItemColor(item,CONST.COLORS.RED);
                            });

                            done(correct);
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
                        hitPlayer:1+Math.floor(room.difficulty*3)
                    },{
                        if:{ else:true },
                        asContext:"room",
                        sumAttribute:"attempts",
                        byValue:1
                    },{
                        if:{ else:true },
                        dialogueSay:[
                            {
                                text:"The God of Time is not satisfied with your answer..."
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

                // --- Give the "set cell" card when the player enters the room

                let
                    cards = [];

                for (let i=0;i<EVENTS;i++) {
                    let
                        bookId = i+1,
                        event = room.random.removeElement(events).split("|"),
                        year = parseInt(event[0]);

                    game.tools.hintAddKeyValue(room, event[2], year);

                    calendarMetadata["Event "+i] = event[2]+" ("+year+")";

                    cards.push({
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        addInventoryItem:{
                            data:{
                                isHistoryBook:true,
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,
                                model:"default",
                                image:"book",
                                bookId:bookId,
                                character:bookId
                            },
                            events:{
                                onUse:[
                                    {
                                        dialogueSay:[
                                            {
                                                text:"This book is titled: \"Book "+bookId+": " + event[2]+" ("+event[1]+")\".\nIn small print it says: \""+event[3].trim()+"\"."
                                            }
                                        ]
                                    },{
                                        run:(game, context, done)=>{
                                            let
                                                position = game.tools.getRoomPosition(room);
                                                
                                            done(position && (position.roomY == 3))
                                        }
                                    },{
                                        if:{ and:true },
                                        dialogueSay:[
                                            {
                                                text:"Do you want to read it here?",
                                                options:[
                                                    {
                                                        id:"readIt",
                                                        value:true,
                                                        label:"Read It"
                                                    },{
                                                        id:"readIt",
                                                        value:false,
                                                        label:"Never mind"
                                                    }
                                                ]
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"answers",
                                            is:{ readIt:true }
                                        },
                                        run:(game, context, done)=>{
                                            let
                                                position = game.tools.getRoomPosition(room);

                                            game.tools.paintFloor(0, position, game.tools.SOLID,[
                                                { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0, backgroundColor:game.dungeon.floorColor },
                                                CONST.TEXTURES.FONT[bookId]
                                            ], true);

                                            game.tools.paintMapSymbol(position,bookId);

                                            answer[position.roomX] = { bookId:bookId, year:year };

                                            game.tools.playAudio("nogain1");
                                            game.tools.refreshScreen();
                                            done(true);

                                            if (CONST.DEBUG.showLogs)
                                                console.log(answer);
                                        }
                                    }
                                ]
                            }
                        }
                    });
                }

                room.calendarMetadata = calendarMetadata;

                game.tools.onEnter(room,cards);

                // --- Take back the "set cell" card when the player leaves the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);


            });

        }
    })
    
})();

