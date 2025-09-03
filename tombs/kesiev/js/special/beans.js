(function(){

    const
        TOMB_ID = "kesiev-beans",
        TOMB_TAGS = [ "tomb", "special" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        CHECKPOINT_ID = "s",
        ROOM_WIDTH = 4,
        ROOM_HEIGHT = 4,
        ATTEMPTS = 3,
        MIN_BEANS = 10,
        MAX_BEANS = 99,
        GAP_BEANS = MAX_BEANS - MIN_BEANS,
        INPUT_SPACE = { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:CONST.COLORS.WHITE },
        IMAGE_BEANS = 38,
        SENTENCES = {
            higher:[
                "There are more than {number}!",
                "I think {number} is a bit too low...",
                "That's not right. There are more than {number} beans!"
            ],
            lower:[
                "There are less than {number} of them!",
                "I think {number} is a bit too high...",
                "That's not right. There are less than {number} beans!"
            ],
            exact:[
                "Wow! You guessed it!",
                "Exactly! Well done!",
                "Well done! There are {number} beans in the jar!"
            ]
        };

    function newJar(game, room) {
        let
            solution = MIN_BEANS+room.random.integer(GAP_BEANS+1);
        game.tools.setNextCheckpoint(room,CHECKPOINT_ID,solution);
        return solution;            
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Beans Room",
        description:"Guess how many beans there are in a jar.",
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
                    width:ROOM_WIDTH,
                    height:ROOM_HEIGHT,
                    attempts:ATTEMPTS,
                    score:1,
                    maxScore:2,
                    isSolved:false,
                    isCompleted:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    inputArea = { x:room.x+1, y:room.y+2, width:2, height:1 },
                    specialArea = { x:room.x+1, y:room.y+1, width:2, height:1 },
                    jar,
                    solution = game.tools.getCheckpoint(room,CHECKPOINT_ID);

                if (!solution)
                    solution = newJar(game, room);

                // --- Paint the floor

                game.tools.paintFloor(0, specialArea, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);
                game.tools.paintFloor(0, inputArea, game.tools.SOLID, [ INPUT_SPACE ])

                // --- Add the beans jar

                jar = game.tools.addElement(room.x+2, room.y+1, { sprite:[
                    { image:"tombs/kesiev/images/texture.png", imageX:1, imageY:10, dy:IMAGE_BEANS-Math.floor(IMAGE_BEANS/GAP_BEANS*(solution-MIN_BEANS)) },
                    { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:9 },
                ] }, true);

                game.tools.onInteract(jar,[
                        {
                            if:{
                                asContext:"room",
                                is:{ isCompleted:true }
                            },
                            dialogueSay:[
                                {
                                    text:"There really are "+solution+" beans in this jar! How lucky!"
                                }
                            ]
                        },{
                            if:{ else:true },
                            dialogueSay:[
                                {
                                    text:"In this jar there are some big colorful beans..."
                                }
                            ]
                        },
                        { movePlayerBack:true }
                    ]);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

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
                            game.tools.scriptArchitectPaidQuote(game, room, ARCHITECT),
                            {
                                dialogueSay:[
                                    {
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"Well, see you next time!"
                                    }
                                ]
                            },
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        run:(game, context, done)=>{
                            let
                                isValidNumber = true,
                                inputNumber = 0;

                            for (let x=0;x<inputArea.width;x++) {
                                let
                                    cell = game.map[inputArea.y][inputArea.x+x],
                                    power = Math.pow(10, inputArea.width-x-1);
                                if (cell.inputDigit == undefined)
                                    isValidNumber = false;
                                else
                                    inputNumber += cell.inputDigit*power;
                            }

                            if (isValidNumber) {
                                context.as.inputNumber = inputNumber;
                                done(true);
                            } else
                                done(false);
                        }
                    },{
                        if:{ else:true },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Try to guess how many colored beans are in this jar, come on!"
                            }
                        ]
                    },{
                        if:{ else:true },
                        movePlayerBack:true
                    },{
                        if:{ else:true },
                        endScript:true
                    },{
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Do you think there are {inputNumber} beans in this jar?",
                                options:[
                                    {
                                        id:"startIt",
                                        value:true,
                                        label:"Yes"
                                    },{
                                        id:"startIt",
                                        value:false,
                                        label:"Let me think about it..."
                                    }
                                ]
                            }
                        ]
                    },{
                        if:{
                            asContext:"answers",
                            is:{ startIt:false }
                        },
                        movePlayerBack:true
                    },{
                        if:{ and:true },
                        endScript:true
                    },{
                        run:(game, context, done)=>{
                            let
                                answer;

                            if (context.as.inputNumber == solution) {

                                newJar(game, room);
                                context.room.score = context.room.maxScore;
                                context.room.isSolved = true;
                                context.room.isCompleted = true;
                                answer = room.random.element(SENTENCES.exact);

                            } else {

                                context.room.attempts--;

                                if (!context.room.attempts)
                                    context.room.isSolved = true;
                                
                                if (context.as.inputNumber > solution)
                                    answer = room.random.element(SENTENCES.lower);
                                else
                                    answer = room.random.element(SENTENCES.higher);

                                context.as.attemptsSentence = context.room.attempts + " " + (context.room.attempts == 1 ? "attempt" : "attempts");

                            }

                            context.as.answer = answer.replace("{number}", context.as.inputNumber);

                            done();
                                    
                        }
                    },{
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"{answer}"
                            }
                        ]
                    },{
                        if:{
                            asContext:"room",
                            is:{ isSolved:true }
                        },
                        subScript:[
                            {
                                asContext:"room",
                                unlockRoomWithScore:"score",
                                ofScore:"maxScore"
                            },{
                                asContext:"room",
                                removeInventoryItemsFromRoom:true  
                            },{
                                if:{
                                    asContext:"room",
                                    is:{ isCompleted:true }
                                },
                                dialogueSay:[
                                    {
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"I'll prepare a new jar for next time, okay? It'll be harder!"
                                    }
                                ]
                            },{
                                if:{ else:true },
                                dialogueSay:[
                                    {
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"This time you've finished all your attempts... but next time I'll come back with the same jar and you can try again!"
                                    }
                                ]
                            }
                        ]
                    },{
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"You still have {attemptsSentence}... try again!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);
                
                // --- Give the "number cards" cards when the player enters the room

                let
                    cards = [];

                for (let i=0;i<10;i++)
                    cards.push({
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        addInventoryItem:{
                            data:{
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,
                                model:"default",
                                character:i
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                position = game.tools.getRoomPosition(inputArea);

                                            if (position) {
                                                game.position.cell.inputDigit = i;
                                                game.tools.paintFloor(0, game.position.cell, game.tools.SOLID,[
                                                    INPUT_SPACE,
                                                    CONST.TEXTURES.FONT[i]
                                                ],true);
                                                game.tools.refreshScreen();
                                                done(true);
                                            } else
                                                done(false);
                                        }  
                                    },{
                                        if:{ and:true },
                                        playAudio:{ sample:"nogain1" }
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
                    });

                game.tools.onEnter(room,cards);

                // --- Take back the "number cards" card when the player leaves the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);

            });

        }
    })
    
})();

