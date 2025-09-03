(function(){

    const
        TOMB_ID = "kesiev-details",
        TOMB_TAGS = [ "tomb", "memory" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        ROOM_SIZE = 5,
        EASY_LIMIT = 4,
        NORMAL_LIMIT = 10,
        HARD_LIMIT = 15,
        OPTIONS_RANGE = [ -4, -3, -2, -1, 1, 2, 3, 4 ],
        QUESTIONS = [
            [ "easy", "normal", "hard", "veryhard" ],
            [ "easy", "normal", "hard", "veryhard" ],
            [ "normal", "easy", "hard", "veryhard" ],
            [ "hard" , "normal", "easy", "veryhard" ]
        ],
        ELEMENTS = [
            [
                [
                    { order:0, layer:{ backgroundColor:CONST.COLORS.RED }, yesLabels:[ "with red color" ], noLabels:[ "not red colored"] },
                    { order:0, layer:{ backgroundColor:CONST.COLORS.GREEN }, yesLabels:[ "with green color" ], noLabels:[ "not green colored"] },
                    { order:0, layer:{ backgroundColor:CONST.COLORS.YELLOW }, yesLabels:[ "with yellow color" ], noLabels:[ "not yellow colored" ] },
                    { order:0, layer:{ backgroundColor:CONST.COLORS.BLUE }, yesLabels:[ "with blue color" ], noLabels:[ "not blue colored" ] }
                ]
            ],[
                [
                    { order:1, yesLabels:[ "with no outline" ], noLabels:[ ] },
                    { order:1, layer:{ image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0 }, yesLabels:[ "with outline" ], noLabels:[ ] },
                ]
            ],[
                [
                    { order:2, layer:CONST.TEXTURES.FONT["A"], yesLabels:[ "with a letter", "with A", "without a number", "without a symbol" ], noLabels:[ "without A" ] },
                    { order:2, layer:CONST.TEXTURES.FONT["B"], yesLabels:[ "with a letter", "with B", "without a number", "without a symbol" ], noLabels:[ "without B" ] },
                    { order:2, layer:CONST.TEXTURES.FONT["C"], yesLabels:[ "with a letter", "with C", "without a number", "without a symbol" ], noLabels:[ "without C" ] },
                    { order:2, layer:CONST.TEXTURES.FONT["D"], yesLabels:[ "with a letter", "with D", "without a number", "without a symbol" ], noLabels:[ "without D" ] },
                ],[
                    { order:2, layer:CONST.TEXTURES.FONT["1"], yesLabels:[ "with a number", "with 1", "without a letter", "without a symbol" ], noLabels:[ "without 1" ] },
                    { order:2, layer:CONST.TEXTURES.FONT["2"], yesLabels:[ "with a number", "with 2", "without a letter", "without a symbol" ], noLabels:[ "without 2" ] },
                    { order:2, layer:CONST.TEXTURES.FONT["3"], yesLabels:[ "with a number", "with 3", "without a letter", "without a symbol" ], noLabels:[ "without 3" ] },
                    { order:2, layer:CONST.TEXTURES.FONT["4"], yesLabels:[ "with a number", "with 4", "without a letter", "without a symbol" ], noLabels:[ "without 4" ] },
                ],[
                    { order:2, layer:CONST.TEXTURES.FONT["&#x2660;"], yesLabels:[ "with a symbol", "with &#x2660;", "without a number", "without a letter" ], noLabels:[ "without &#x2660;" ] },
                    { order:2, layer:CONST.TEXTURES.FONT["&#x2663;"], yesLabels:[ "with a symbol", "with &#x2663;", "without a number", "without a letter" ], noLabels:[ "without &#x2663;" ] },
                    { order:2, layer:CONST.TEXTURES.FONT["&#x2665;"], yesLabels:[ "with a symbol", "with &#x2665;", "without a number", "without a letter" ], noLabels:[ "without &#x2665;" ] },
                    { order:2, layer:CONST.TEXTURES.FONT["&#x2666;"], yesLabels:[ "with a symbol", "with &#x2666;", "without a number", "without a letter" ], noLabels:[ "without &#x2666;" ] },
                ]
            ]
        ];

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Detailed Room",
        description:"Memorize the room and answer to questions.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

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
                    isSolved:false,
                    score:0,
                    maxScore:0
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach((room,id)=>{

                // --- Prepare the room symbols

                let
                    elementsCount = Math.ceil(ELEMENTS.length*room.difficulty*0.75) || 1,
                    elementsBag = { elements:ELEMENTS },
                    roomElements = [];

                for (let i=0;i<elementsCount;i++) {
                    let
                        elements = room.random.bagPick(elementsBag),
                        elementBag = { elements:elements },
                        variety = 2+Math.floor(room.difficulty*(elements.length-2)),
                        list = [];

                    for (let j=0;j<variety;j++) {
                        let
                            subElements = room.random.bagPick(elementBag),
                            subBag = { elements:subElements },
                            subVariety = 2+Math.floor(room.difficulty*(subElements.length-2)),
                            subList = [];

                        for (let q=0;q<subVariety;q++)
                            subList.push(room.random.bagPick(subBag));

                        list.push(subList);

                    }
                    
                    roomElements.push(list);

                }


                // --- Paint the room

                let
                    answers = {};

                for (let i=0;i<ROOM_SIZE;i++)
                    for (let j=0;j<ROOM_SIZE;j++) {
                        let
                            cell = game.map[room.y+i][room.x+j],
                            layers = [],
                            texture = [
                                "defaultFloorTexture"
                            ];

                        roomElements.forEach(sets=>{
                            let
                                set = room.random.element(sets),
                                element = room.random.element(set),
                                addedLabels = {};

                            layers.push(element);

                            sets.forEach(elms=>{
                                elms.forEach(e=>{
                                    let
                                        list;
                                    if (e == element)
                                        list = e.yesLabels;
                                    else
                                        list = e.noLabels;

                                    list.forEach(label=>{
                                        if (!addedLabels[label]) {
                                            addedLabels[label] = true;
                                            if (!answers[label])
                                                answers[label] = 0;
                                            answers[label]++;
                                        }
                                    })
                                })
                                
                            })

                            
                        });

                        layers.sort((a,b)=>{
                            if (a.order > b.order) return 1;
                            else if (a.order < b.order) return -1;
                            else return 0;
                        });

                        layers.forEach(layer=>{
                            if (layer.layer)
                                texture.push(layer.layer);
                        });

                        game.tools.paintFloor(0,cell, game.tools.SOLID, texture, true);

                    }

                // --- No floor decorations in the whole room

                game.tools.setFloorPaintable(room, false);
                game.tools.setElementPaintable(room, false);

                // --- Prepare the questions

                let
                    questions = {};

                for (let k in answers) {
                    let
                        difficulty,
                        answer = answers[k],
                        optionsBag = { elements:OPTIONS_RANGE },
                        options = [ answer ];

                    if (answers[k]<=EASY_LIMIT)
                        difficulty = "easy";
                    else if (answers[k]<=NORMAL_LIMIT)
                        difficulty = "normal";
                    else if (answers[k]<=HARD_LIMIT)
                        difficulty = "hard";
                    else
                        difficulty = "veryhard";

                    do {
                        let
                            option = answer+room.random.bagPick(optionsBag);

                        if ((option >=0) && (options.indexOf(option) == -1))
                            options.push(option);
                    } while (options.length<3);

                    room.random.shuffle(options);

                    if (!questions[difficulty])
                        questions[difficulty] = [];
                    questions[difficulty].push({
                        text:"How many tiles "+k+" were in the room?", answer:answer, options:options
                    });
                }

                // --- Prepare the script

                let
                    script = [
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
                                            text:"Well... This room was really messy, wasn't it?"
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
                                    text:"Hey! Have you taken a look at the mess in this room?",
                                    options:[
                                        {
                                            id:"isReady",
                                            value:true,
                                            label:"Yes"
                                        },{
                                            id:"isReady",
                                            value:false,
                                            label:"Not yet"
                                        }
                                    ]
                                }
                            ]
                        },{
                            if:{
                                asContext:"answers",
                                is:{ isReady:false }
                            },
                            movePlayerBack:true
                        },{
                            if:{ and:true },
                            endScript:true
                        },{
                            run:(game, context, done)=>{
                                game.tools.paintFloor(0, room, game.tools.SOLID,[ "defaultFloorTexture" ], true);
                                game.tools.playAudio("nogain1");
                                game.tools.refreshScreen();
                                done(true);
                            }
                        },{
                            dialogueSay:[
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"Very good! Let's do some cleaning!"
                                }
                            ]
                        }
                    ];

                QUESTIONS.forEach(set=>{
                    let
                        question;

                    set.forEach(difficulty=>{
                        if (!question && questions[difficulty] && questions[difficulty].length)
                            question = room.random.removeElement(questions[difficulty]);
                    });

                    if (question) {
                        let
                            options = [];

                        room.maxScore++;

                        game.tools.hintAddKeyValue(room, question.text, question.answer);

                        question.options.forEach(option=>{
                            let
                                isRight = option == question.answer;
                                
                            options.push({
                                id:"isRight",
                                value:isRight,
                                label:option
                            })
                        });
                        script.push({
                            dialogueSay:[
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:question.text,
                                    options:options
                                }
                            ]
                        })
                        script.push({
                            if:{
                                asContext:"answers",
                                is:{ isRight:true }
                            },
                            dialogueSay:[
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"Correct! Very good!"
                                }
                            ]
                        });
                        script.push({
                            if:{ and:true },
                            asContext:"room",
                            sumAttribute:"score",
                            byValue:1
                        });
                        script.push({
                            if:{ else:true },
                            dialogueSay:[
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"That's wrong, sorry!"
                                }
                            ]
                        });
                    }
                });

                script.push({
                    asContext:"room",
                    dialogueSay:[
                        {
                            audio:ARCHITECT.voiceAudio,
                            by:ARCHITECT.layout.name,
                            text:"You gave {score} correct answers. Here's a prize!"
                        }
                    ]
                });

                script.push({
                    if:{
                        asContext:"room",
                        is:{ score:0 }
                    },
                    hitPlayer:2
                });

                script.push({
                    asContext:"room",
                    unlockRoomWithScore:"score",
                    ofScore:"maxScore"
                });
                
                script.push({
                    asContext:"room",
                    setAttribute:"isSolved",
                    toValue:true
                });

                script.push({ movePlayerBack:true });
                    
                // --- Add entrance plaques

                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Add the architect

                let
                    walkableCells = game.tools.getWalkableCells(room),
                    architectPosition = room.random.element(walkableCells),
                    architect = game.tools.addNpc(architectPosition.x, architectPosition.y, Tools.clone(ARCHITECT.layout));

                game.tools.onInteract(architect,script);

            })
        }
        
    })
    
})();

