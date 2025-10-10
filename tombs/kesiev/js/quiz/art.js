(function(){

    let
        TOMB_ID = "kesiev-art",
        TOMB_TAGS = [ "tomb", "quiz" ],
        ARCHITECT= ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        QUESTIONS = 5,
        OPTIONS_COUNT = 3,
        RIGHT_ANSWERS = [
            "I think so!",
            "Oh, right! You're right!",
            "How did I forget?!"
        ],
        WRONG_ANSWERS = [
            "I don't think so, you know?",
            "Are you sure?",
            "I don't think that's right..."
        ],
        SEE_ANSWER = [
            "It's a really interesting work.",
            "Certainly a remarkable work!",
            "A job really well done."
        ],
        QUESTION_INTRO = [
            "This work is one of my favorites!",
            "This is really not bad.",
            "It's remarkable, isn't it?"
        ],
        GALLERIES = [
            {
                center:{
                    map:[
                        "#......#",
                        "...SS...",
                        "..S##S..",
                        "..S##S..",
                        "...SS...",
                        "#......#",
                    ]
                }
            },{
                center:{
                    map:[
                        "........",
                        ".SSSSSS.",
                        ".S####S.",
                        ".S####S.",
                        ".SSSSSS.",
                        "........",
                    ]
                }
            },{
                center:{
                    map:[
                        "...SS...",
                        "...SS#..",
                        "..#SS#..",
                        "..#SS#..",
                        "..#SS...",
                        "...SS...",
                    ]
                }
            }
        ],
        GALLERY_PALETTE = {
            "#":{
                skipOnProtectedCell:true,
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                isWall:true,
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:false,
                isWallPaintable:[ true, true, true, true ],
                ceiling:[ "defaultCeiling" ],
                floor:[ "defaultFloor" ],
                walls:[
                    "defaultWall",
                    "defaultWall",
                    "defaultWall",
                    "defaultWall"
                ],
            },
             "S":{
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                isWallPaintable:false,
                ceiling:[ "defaultCeiling" ],
                floor:[ [ "defaultFloorAccentTexture" ] ],
                walls:[ 0, 0, 0, 0 ]
            }
        };

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Gallery Room",
        description:"Answer some questions about paintings.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            { type:"image", title:"Paintings GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/paintings.png"},
            { type:"data", id:"kesiev-art-data", title:"Paintings data", by:[ "KesieV" ], file:"tombs/kesiev/data/paintings/paintings.txt" },
            { type:"audio", title:"Blues Boy", by:[ "SoundGod" ], id:"kesiev-art-blues1",mod:"tombs/kesiev/audio/music/blues_boy.xm", isSong:true},
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    music:"kesiev-art-blues1",
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:GALLERIES[0].center.map[0].length,
                    height:GALLERIES[0].center.map.length,
                    isSolved:false,
                    questionsLeft:0,
                    score:0,
                    maxScore:0
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                database ={
                    painting:[],
                    artist:[],
                    genre:[],
                    style:[]
                };
                
            LOADER.DATA["kesiev-art-data"].split("\n").forEach(line=>{

                let
                    split = line.trim().split("|");

                database.painting.push({ imageX:split[0], imageY:split[1], artist:split[2], genre:split[3], style:split[4] });
                if (database.artist.indexOf(split[2]) == -1)
                    database.artist.push(split[2]);
                if (database.genre.indexOf(split[3]) == -1)
                    database.genre.push(split[3]);
                if (database.style.indexOf(split[4]) == -1)
                    database.style.push(split[4]);

            });

            rooms.forEach(room=>{

                let
                    calendarMetadata = {},
                    questionsDone = [],
                    questionTypesBag = { elements:[ { question:"What genre is this work?", key:"genre" } ] },
                    paintingsBag = { elements:database.painting };

                if (room.difficulty>0.3)
                    questionTypesBag.elements.push({ question:"What style is this work?", key:"style" });

                if (room.difficulty>0.6)
                    questionTypesBag.elements.push({ question:"Whose work is this?", key:"artist" });

                game.tools.blitPattern(0, room, room.random.element(GALLERIES), GALLERY_PALETTE );

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Add paintings
                
                 let
                    walkableWalls = game.tools.getWalkableWalls(room);

                for (let i=0;i<QUESTIONS;i++) {
                    let
                        painting = room.random.bagPick(paintingsBag),
                        paintingPosition = room.random.removeElement(walkableWalls),
                        questionType = room.random.bagPick(questionTypesBag),
                        trueOption = painting[questionType.key],
                        wrongBag = { elements: database[questionType.key] },
                        options = [
                            {
                                id:"isRight",
                                value:true,
                                label:trueOption,
                            }
                        ];

                    do {
                        let
                            option = room.random.bagPick(wrongBag);
                        if (option != trueOption)
                            options.push({
                                id:"isRight",
                                value:false,
                                label:option,
                            });
                    } while (options.length<OPTIONS_COUNT);

                    room.random.shuffle(options);

                    game.tools.hintAddKeyValue(room, (paintingPosition.x-room.x)+","+(paintingPosition.y-room.y), trueOption);

                    calendarMetadata["Painting "+i] = (paintingPosition.x-room.x)+","+(paintingPosition.y-room.y)+": "+trueOption;

                    room.maxScore++;
                    room.questionsLeft++;

                    game.tools.addWallDecoration(0, paintingPosition, paintingPosition.side, game.tools.SOLID, [
                        {  isPainting:true, image:"tombs/kesiev/images/paintings.png", imageX:painting.imageX, imageY:painting.imageY }
                    ]);

                    // Avoid random decorations on the painting
                    game.tools.setWallPaintable(paintingPosition.x, paintingPosition.y, paintingPosition.side, false);

                    // Avoid to spawn the architect in front of the painting
                    game.tools.setProtected(paintingPosition.front, true);

                    game.tools.onBumpWall(paintingPosition.x, paintingPosition.y, paintingPosition.side, [
                        {
                            run:(game, context, done)=>{
                                if (questionsDone[i])
                                    done(true);
                                else {
                                    questionsDone[i] = true;
                                    if (CONST.DEBUG.showLogs)
                                        console.log("PAINTING",painting);
                                    done(false);
                                }
                            }
                        },{
                            if:{ and:true },
                            dialogueSay:[
                                {
                                    text:room.random.element(SEE_ANSWER)
                                }
                            ]
                        },{
                            if:{ and:true },
                            endScript:true
                        },{
                            dialogueSay:[
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:ARCHITECT.layout.name,
                                    text:room.random.element(QUESTION_INTRO)+" "+questionType.question,
                                    options:options
                                }
                            ]
                        },{
                            if:{
                                asContext:"answers",
                                is:{ isRight:true }
                            },
                            asContext:"room",
                            sumAttribute:"score",
                            byValue:1
                        },{
                            if:{ and:true },
                            asContext:"room",
                            playerGainGold:2
                        },{
                            if:{ and:true },
                            dialogueSay:[
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:ARCHITECT.layout.name,
                                    text:room.random.element(RIGHT_ANSWERS)
                                }
                            ]
                        },{
                            if:{ else:true },
                            dialogueSay:[
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:ARCHITECT.layout.name,
                                    text:room.random.element(WRONG_ANSWERS)
                                }
                            ]
                        },{
                            asContext:"room",
                            sumAttribute:"questionsLeft",
                            byValue:-1
                        },{
                            if:{
                                asContext:"room",
                                is:{ questionsLeft:0 }
                            },
                            asContext:"room",
                            unlockRoomWithScore:"score",
                            ofScore:"maxScore"
                        },{
                            if:{ and:true },
                            asContext:"room",
                            setAttribute:"isSolved",
                            toValue:true
                        }
                    ]);
                    
                    if (!walkableWalls.length)
                        break;

                }

                room.calendarMetadata = calendarMetadata;

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
                                        text:"Anyway... I wanted to add something about modern art but..."
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
                                text:"Oh! Welcome! Feel free to check out my collection!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

            })
        }
        
    })
    
})();

