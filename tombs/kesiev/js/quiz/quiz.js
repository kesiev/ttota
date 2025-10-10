(function(){

    const
        TOMB_ID = "kesiev-quiz",
        TOMB_TAGS = [ "tomb", "quiz" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        QUESTIONS = [ "credits", "credits", "credits", "architect" ],
        QUESTIONOPTIONS = 3,
        CREDITSQUESTIONS = [ 
            {
                id:"music",
                text:"Who composed the \"{name}\" song?"
            },{
                id:"sounds",
                text:"Who made the \"{name}\" sound effect?"
            },{
                id:"graphics",
                text:"Who made the \"{name}\" graphics?"
            }
        ];

    function addWrongAnswers(room, list, options, count) {
        while (list.length < count) {
            let
                option;
            do {
                option = room.random.element(options);
            } while (list.indexOf(option)!=-1);
            list.push(option);
        }
    }
        
    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Blue Room",
        description:"Answer to some questions about this game credits and Architects.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:QUESTIONS.length+2,
                    height:3,
                    isSolved:false,
                    score:0,
                    errors:0,
                    isError:false,
                    maxScore:QUESTIONS.length
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                persons = [],
                architects = [],
                creditsquestionsBag = { elements:CREDITSQUESTIONS };

            [ "code", "music", "sounds", "data", "graphics" ].forEach(segment=>{
                TOMBS.credits[segment].forEach(entry=>{
                    if (persons.indexOf(entry.person) == -1)
                        persons.push(entry.person);
                })
            });

            ARCHITECTS.list.forEach(architect=>{
                architects.push(architect.layout.name);
            })

            rooms.forEach(room=>{

                let
                    calendarMetadata = {},
                    answers = [],
                    quizArea = { x:room.x+1, y:room.y+1, width:room.width-2, height:1 };

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);
                
                game.tools.paintFloor(0, quizArea, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);

                // Protect the answers area, so the architect doesn't spawn there
                game.tools.setProtected(quizArea, true);

                // --- Add the architect

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
                            game.tools.scriptArchitectPaidQuote(game, room, ARCHITECT),
                            {
                                dialogueSay:[
                                    {
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"Well, remember to study for the next test!"
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
                                text:"I hope you studied for today!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // Protect the cell, so the lever won't spawn there
                game.tools.setProtected(architectPosition, true);

                // --- Add questions

                QUESTIONS.forEach((question,id)=>{

                    let
                        element,
                        questionText,
                        questionAnswer,
                        questionOptions,
                        questionTeller,
                        endMessage,
                        showAudio,
                        dx = room.x+id+1,
                        dy = room.y+1,
                        cell = { x:dx, y:dy, width:1, height:1 };

                    game.tools.paintMapSymbolBgColor(cell, CONST.COLORS.RED);
                        
                    switch (question) {
                        case "credits":{
                            let
                                creditsQuestion = room.random.bagPick(creditsquestionsBag),
                                entry = TOMBS.credits[creditsQuestion.id],
                                person = room.random.element(entry),
                                name = room.random.element(person.line);

                            questionAnswer = person.person;

                            questionOptions = [ questionAnswer ];

                            addWrongAnswers(room, questionOptions, persons, QUESTIONOPTIONS);

                            questionOptions = questionOptions.map((name,id)=>{
                                return {
                                    id:"isRight",
                                    value:id==0,
                                    label:name
                                }
                            });
                            
                            room.random.shuffle(questionOptions);
                            
                            element = game.tools.addElement(dx, dy,{
                                model:"floorItem",
                                image:"bookStand"
                            });

                            showAudio = "sheet1";
                            questionText = creditsQuestion.text.replace("{name}", name.line);
                            endMessage = "There is a book with blank pages."
                            game.tools.hintAddKeyValue(room, name.line, person.person);
                            if (CONST.DEBUG.showLogs)
                                console.log("?",questionText,person.person ,questionOptions);

                            break;
                        }
                        case "architect":{
                            let
                                architect = room.random.element(ARCHITECTS.list.filter(architect=>architect.layout.head != "nobody"));

                            questionAnswer = architect.layout.name;

                            questionOptions = [ questionAnswer ];

                            addWrongAnswers(room, questionOptions, architects, QUESTIONOPTIONS);

                            questionOptions = questionOptions.map((name,id)=>{
                                return {
                                    id:"isRight",
                                    value:id==0,
                                    label:name
                                }
                            });

                            element = game.tools.addNpc(dx, dy, Tools.clone(architect.layout));

                            questionTeller = "???";
                            questionText = "Who am I?";
                            endMessage = "...";
                            game.tools.hintAddSentences(room, [ architect.layout.name ]);
                            if (CONST.DEBUG.showLogs)
                                console.log("A?",architect.layout.name,questionOptions);
                            break;
                        }
                    }

                    game.tools.onInteract(element,[
                        {
                            if:{
                                asContext:"room",
                                is:{ isSolved:true }
                            },
                            dialogueSay:[
                                {
                                    by:questionTeller,
                                    text:endMessage
                                }
                            ]
                        },{
                            if:{ and:true },
                            movePlayerBack:true
                        },{
                            if:{ and:true },
                            endScript:true,
                        },{
                            dialogueSay:[
                                {
                                    showAudio:showAudio,
                                    by:questionTeller,
                                    text:questionText,
                                    options:questionOptions
                                }
                            ]
                        },{
                            run:(game, context, done)=>{
                                answers[id]=context.answers.isRight;
                                done();
                            }
                        },{
                            as:cell,
                            paintFloor:{
                                pattern:game.tools.SOLID,
                                texture:[
                                    "defaultFloorAccentTexture",
                                    { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0 }
                                ],
                                force:true
                            }
                        },{
                            as:cell,
                            paintMapSymbolBgColor:CONST.COLORS.GREEN
                        },{ movePlayerBack:true }
                    ]); 

                    calendarMetadata["Question "+id] = questionText;
                    calendarMetadata["Answer "+id] = questionAnswer;

                })

                room.calendarMetadata = calendarMetadata;

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
                                text:"It's the moment of truth! Do you want to pull it?",
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
                            for (let i=0;i<QUESTIONS.length;i++)
                                if (answers[i])
                                    room.score++;
                                else
                                    room.errors++;

                            if (room.errors) {
                                game.tools.hitPlayer(room.errors+Math.floor(room.difficulty*2));
                                room.isError = true;
                            }

                            done(room.score);
                        }
                    },{
                        asContext:"room",
                        unlockRoomWithScore:"score",
                        ofScore:"maxScore"
                    },{
                        asContext:"room",
                        setAttribute:"isSolved",
                        toValue:true
                    },{
                        if:{
                            asContext:"room",
                            is:{ isError:true }
                        },
                        dialogueSay:[
                            {
                                text:"You made some mistakes..."
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

            });

        }
    })
    
})();

