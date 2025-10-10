(function(){

    const
        TOMB_ID = "kesiev-trivia",
        TOMB_TAGS = [ "tomb", "quiz" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        BLINK_SPEED = 4,
        QUIZ_TOPICS = 2,
        QUIZ_TOPIC_QUESTIONS = 3,
        QUIZ_DIFFICULTY_QUESTION = 0.25,
        MAX_DIFFICULTY = 2,
        PALETTE = [ "RED", "GREEN", "BLUE", "YELLOW", "CYAN", "PURPLE" ],
        TOPICS=[
            { id:0, name:"Video Games" },
            { id:1, name:"General Knowledge" },
            { id:2, name:"Music" },
            { id:3, name:"Politics" },
            { id:4, name:"Science &amp; Nature" },
            { id:5, name:"Japanese Anime &amp; Manga" },
            { id:6, name:"Film" },
            { id:7, name:"Cartoon &amp; Animations" },
            { id:8, name:"Comics" },
            { id:9, name:"Computers" },
            { id:10, name:"Mathematics" },
            { id:11, name:"Books" },
            { id:12, name:"Sports" },
            { id:13, name:"Television" },
            { id:14, name:"History" },
            { id:15, name:"Geography" },
            { id:16, name:"Mythology" },
            { id:17, name:"Animals" },
            { id:18, name:"Science: Gadgets" },
            { id:19, name:"Vehicles" },
            { id:20, name:"Art" },
            { id:21, name:"Celebrities" },
            { id:22, name:"Board Games" },
            { id:23, name:"Musicals &amp; Theatres" }
        ];

    function paintRoom(game, room, color) {
        let texture = [
            { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:CONST.COLORS[color] }
        ];
        game.tools.paintCeiling(0, room, game.tools.SOLID, texture, true);
        game.tools.paintWalls(0, room, game.tools.SOLID, texture, true);
        game.tools.paintFloor(0, room, game.tools.SOLID, texture, true);
    }

    function resetRoom(game, room) {
        game.tools.paintCeiling(0, room, game.tools.SOLID, game.dungeon.defaultCeiling, true);
        game.tools.paintWalls(0, room, game.tools.SOLID, game.dungeon.defaultWall, true);
        game.tools.paintFloor(0, room, game.tools.SOLID, game.dungeon.defaultFloor, true);
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Show Room",
        description:"Answer to some trivia questions with increasing difficulty.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"data", id:"kesiev-trivia-data", title:"Trivia", license:"Creative Commons Attribution 4.0", by:[ "Open Trivia Database" ], file:"tombs/kesiev/data/trivia/trivia.txt" },
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            { type:"audio", title:"Timer SFX", by:[ "KesieV" ], id:"kesiev-trivia-timer1", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"whitenoise","attack":0.006,"sustain":0.012,"decay":0.006,"release":0.016,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"frequency":850,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0}},
            { type:"audio", title:"Timer SFX", by:[ "KesieV" ], id:"kesiev-trivia-timer2", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"whitenoise","attack":0.006,"sustain":0.012,"decay":0.006,"release":0.016,"frequency":445,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0}},
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:3,
                    height:3,
                    isSolved:false,
                    score:0,
                    maxScore:QUIZ_TOPIC_QUESTIONS*QUIZ_TOPICS,
                    mode:0,
                    palette:[],
                    question:0
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                database = {};

            LOADER.DATA["kesiev-trivia-data"].split("\n").forEach(line=>{
                let
                    split = line.trim().split("|");
                if (!database[split[0]])
                    database[split[0]] = {};
                if (!database[split[0]][split[1]])
                    database[split[0]][split[1]] = [];
                database[split[0]][split[1]].push({
                    question:split[2],
                    answer:split[3],
                    options:split.splice(4)
                })
            });

            rooms.forEach(room=>{

                let
                    calendarMetadata = {};

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- No floor/ceiling/wall decorations in the whole room

                game.tools.setEdgesPaintable(room, false);
                game.tools.setFloorPaintable(room, false);
                game.tools.setCeilingPaintable(room, false);

                // --- Prepare the quiz
                
                let
                    difficulty = Math.floor(MAX_DIFFICULTY*room.difficulty),
                    paletteBag = { elements:PALETTE },
                    topicsBag = { elements:TOPICS },
                    questionBags = {},
                    topics = [],
                    script = [
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
                                            text:"Well... see you next time!"
                                        }
                                    ]
                                },
                                { movePlayerBack:true },
                                { endScript:true }
                            ]
                        }
                    ];

                for (let i=0;i<QUIZ_TOPICS;i++)
                    room.palette.push(room.random.bagPick(paletteBag))

                for (let i=0;i<QUIZ_TOPICS;i++) {
                    let
                        topic = room.random.bagPick(topicsBag);
                    topics.push(topic);
                    questionBags[topic.id] = [];
                    for (let k in database[topic.id])
                        questionBags[topic.id][k]={ elements:database[topic.id][k] };
                }
                
                script.push({
                    stopMusic:true
                });

                script.push({
                    run:(game, context, done)=>{
                        paintRoom(game, room, "BLACK");
                        game.tools.refreshScreen();
                        done();
                    }
                });
                
                script.push({
                    dialogueSay:[
                        {
                            audio:ARCHITECT.voiceAudio,
                            by:"{name}",
                            text:"Here's a new participant! Today's topics are: "+topics.map(topic=>topic.name).join(" and ")+"!"
                        }
                    ]
                })

                script.push({
                    asContext:"room",
                    setAttribute:"mode",
                    toValue:true
                });

                for (let i=0;i<QUIZ_TOPIC_QUESTIONS;i++) {
                    topics.forEach((topic,tid)=>{
                        let
                            question = room.random.bagPick(questionBags[topic.id][Math.floor(difficulty)]),
                            options = [
                                {
                                    id:"isRight",
                                    value:true,
                                    label:question.answer
                                }
                            ];

                        calendarMetadata["Topic "+tid+" Question "+i] = question.question;
                        calendarMetadata["Topic "+tid+" Answer "+i] = question.answer;

                        difficulty+=QUIZ_DIFFICULTY_QUESTION;
                        if (difficulty > MAX_DIFFICULTY)
                            difficulty = MAX_DIFFICULTY;

                        question.options.forEach(option=>{
                            options.push({
                                id:"isRight",
                                value:false,
                                label:option
                            });
                        });

                        room.random.shuffle(options);

                        script.push({
                            dialogueSay:[
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:question.question,
                                    options:options
                                }
                            ]
                        });

                        script.push({
                            if:{
                                asContext:"answers",
                                is:{ isRight:true }
                            },
                            asContext:"room",
                            sumAttribute:"score",
                            byValue:1
                        });

                        script.push({
                            asContext:"room",
                            sumAttribute:"question",
                            byValue:1
                        });

                        game.tools.hintAddKeyValue(room, question.question, question.answer);

                    });

                }

                script.push({
                    run:(game, context, done)=>{
                        room.mode = false;
                        resetRoom(game, room);
                        game.tools.refreshScreen();
                        done();
                    }
                });

                script.push({
                    resetMusic:true
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

                 script.push({
                    dialogueSay:[
                        {
                            audio:ARCHITECT.voiceAudio,
                            by:"{name}",
                            text:"Here's your prize and thanks for participating!"
                        }
                    ]
                });

                script.push({ movePlayerBack:true });

                room.calendarMetadata = calendarMetadata;

                // --- Add the architect

                let
                    architect = game.tools.addNpc(room.x+1, room.y+1, Tools.clone(ARCHITECT.layout));

                game.tools.onInteract(architect, script);

                // --- Add the choreography

                room.onFrame = (game)=>{

                    if (room.mode) {
                        if (room.blinkTimer)
                            room.blinkTimer--;
                        else {
                            room.blink = !room.blink;
                            if (room.blink) {
                                paintRoom(game, room, "GRAY");
                                game.tools.playAudio("kesiev-trivia-timer2");
                            } else {
                                paintRoom(game, room, room.palette[room.question%room.palette.length]);
                                game.tools.playAudio("kesiev-trivia-timer1");
                            }
                            room.blinkTimer = BLINK_SPEED;
                        }
                    }
                    
                }

            });

        }
    })
    
})();

