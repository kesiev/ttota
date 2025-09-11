(function(){

    const
        TOMB_ID = "kesiev-marquee",
        TOMB_TAGS = [ "tomb", "special" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        TESTS = [
            {
                text:"Hey, check this out! *** Today you have to aim to the STARS!",
                answer:["*"]
            },{
                text:"Move along, nothing to see here",
                answer:[" "]
            },{
                text:"The pirate Draxon Black was looking for the treasure",
                answer:["x"]
            },{
                text:"Be careful! FIRE IN THE HOLE!",
                answer:["O"]
            },{
                text:"Don't be a dromedary. Be a camel!",
                answer:["B"]
            },{
                text:"We are two little tips, squashed like sardines!",
                answer:["W","w"]
            },{
                text:"Hit no one: 11l.111.l11.11l.111.11l",
                answer:["l"]
            },{
                text:"You have to get why!",
                answer:["Y","y"]
            },{
                text:"It's between me & you",
                answer:["&"]
            },{
                text:"Get the ball! Ready?.............O",
                answer:["O"]
            }
        ];

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Marquee Corridor",
        description:"Hit the correct letter of a riddle scrolling on an in invisible marquee.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[ ARCHITECT.voiceResource ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:10,
                    height:1,
                    isSolved:false,
                    attempts:1,
                    attemptsLimit:3
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                bag = { elements:TESTS };

            rooms.forEach(room=>{

                let
                    test = room.random.bagPick(bag);

                room.calendarMetadata = test;

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
                                text:"Oops... I shouldn't be here. Sorry!"
                            }
                        ]
                    },
                    { removeElement:true, refreshScreen:true }
                ]);

                // --- Animate the marquee

                room.onFrame = (game)=>{
                    if (!room.isSolved) {
                        if ((room.textPosition === undefined) || (room.textPosition > test.text.length))
                            room.textPosition = -room.width;
                        for (let i=0;i<room.width;i++)
                            game.tools.paintMapSymbol(game.map[room.y][room.x+i], test.text[room.textPosition+i] || ".");
                        room.textPosition++;
                    }
                }

                // --- Give the "activate cell" card when the player enters the room

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
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                cell = game.map[game.position.y][game.position.x],
                                                success = test.answer.indexOf(cell.mapSymbol) != -1;
                                            room.isSolved = success;
                                            done(success);
                                        }  
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
                                    },{
                                        if:{ else:true },
                                        hitPlayer:1+Math.floor(room.difficulty*3)
                                    },{
                                        if:{ else:true },
                                        asContext:"room",
                                        sumAttribute:"attempts",
                                        byValue:1
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Take back the "move cell" card when the player exits the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);
                
            })
        }
        
    })
    
})();

