(function(){

    const
        TOMB_ID = "kesiev-flags",
        TOMB_TAGS = [ "tomb", "quiz" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        QUESTIONS = 3,
        EXTRA_QUESTIONS = 3;

    function paintRoom(game, room, colors) {
        for (let i=0;i<18;i++) {
            let
                color = colors[i%colors.length],
                texture = { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:color },
                position = Math.floor(i/2),
                cell = game.map[room.y+Math.floor(position/3)][room.x+(position%3)];

            if (i%2) {
                game.tools.paintCeiling(0, cell, game.tools.SOLID, texture, true);
                game.tools.paintMapSymbolColor(cell, color);
                game.tools.paintMapSymbol(cell, "&#x2580;");
            } else {
                game.tools.paintMapSymbolBgColor(cell, color);
                game.tools.paintFloor(0, cell, game.tools.SOLID, texture, true);
            }
        }
        game.tools.refreshScreen();
    }

    function resetRoom(game, room) {
        game.tools.paintCeiling(0, room, game.tools.SOLID, game.dungeon.defaultCeiling, true);
        game.tools.paintFloor(0, room, game.tools.SOLID, game.dungeon.defaultFloor, true);
        game.tools.paintMapSymbolBgColor(room, 0);
        game.tools.paintMapSymbolColor(room, 0);
        game.tools.paintMapSymbol(room, CONST.MAPSYMBOLS.FLOOR);
        game.tools.refreshScreen();
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Flags Room",
        description:"Guess the flag from the colors.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"data", id:"kesiev-flags-data", title:"Flags data", by:[ CONST.CREDITS.UNKNOWN ], file:"tombs/kesiev/data/flags/flags.txt" },
            { type:"audio", title:"Phase SFX", by:[ "KesieV" ], id:"kesiev-flags-phase1", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"triangle","attack":0.021,"sustain":0.056,"decay":0.024,"release":0.052,"frequency":835,"pitch":0.002,"frequencyJump2onset":0.45,"frequencyJump2amount":-0.22,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0}},
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
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
                    phase:0
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                database = [];

            LOADER.DATA["kesiev-flags-data"].split("\n").forEach(line=>{
                let
                    split = line.trim().split("|");

                if (line.length)
                    database.push({
                        name:split[0],
                        colors:split.splice(1)
                    })
            });

            rooms.forEach(room=>{

                let
                    hintSequence = [],
                    phase = 0,
                    flagsBag = { elements: database },
                    questions = QUESTIONS + Math.floor(room.difficulty*EXTRA_QUESTIONS),
                    hintsCount = Math.ceil(questions/2);
                
                room.maxScore = questions;

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- No floor/ceiling/wall decorations in the whole room

                game.tools.setFloorPaintable(room, false);
                game.tools.setCeilingPaintable(room, false);
                game.tools.setElementPaintable(room, false);

                // --- Prepare the quiz
                
                let
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
                                            text:"Anyway, flags are so cool!"
                                        }
                                    ]
                                },
                                { movePlayerBack:true },
                                { endScript:true }
                            ]
                        }
                    ];

                for (let i=0;i<questions;i++) {
                    let
                        answer = room.random.bagPick(flagsBag),
                        options = [
                            {
                                id:"isRight",
                                value:true,
                                label:answer.name
                            }
                        ];

                    if (i<hintsCount)
                        hintSequence.push(answer.name);

                    for (let j=0;j<2;j++)
                        options.push({
                            id:"isRight",
                            value:false,
                            label:room.random.bagPick(flagsBag).name
                        });

                    room.random.shuffle(options);
                    
                    script.push({
                        if:{
                            asContext:"room",
                            is:{ phase:phase }
                        },
                        run:(game, context, done)=>{
                            context.answers=0;
                            paintRoom(game, room, answer.colors);
                            game.tools.playAudio("kesiev-flags-phase1");
                            done(true);
                        }
                    });

                    script.push({
                        if:{
                            asContext:"room",
                            is:{ phase:phase }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Have a look at these color and come back to me!"
                            }
                        ]
                    });

                    phase++;

                    script.push({
                        if:{
                            asContext:"room",
                            is:{ phase:phase }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Which flag do these colors belong to?",
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
                        if:{
                            asContext:"answers",
                            is:{ isRight:true }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"That's right! Well done!"
                            }
                        ]
                    });

                    script.push({
                        if:{
                            asContext:"answers",
                            is:{ isRight:false }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"I think the answer is not correct..."
                            }
                        ]
                    });

                }

                game.tools.hintAddSequence(room, hintSequence);

                script.push({
                    if:{
                        asContext:"room",
                        is:{ phase:phase }
                    },
                    run:(game, context, done)=>{
                        resetRoom(game, room);
                        game.tools.playAudio("kesiev-flags-phase1");
                        done(true);
                    }
                });
                
                script.push({
                    if:{
                        asContext:"room",
                        is:{ phase:phase }
                    },
                    asContext:"room",
                    unlockRoomWithScore:"score",
                    ofScore:"maxScore"
                });

                script.push({
                    if:{
                        asContext:"room",
                        is:{ phase:phase }
                    },
                    asContext:"room",
                    setAttribute:"isSolved",
                    toValue:true
                });

                script.push({
                    if:{
                        asContext:"room",
                        is:{ phase:phase }
                    },
                    dialogueSay:[
                        {
                            audio:ARCHITECT.voiceAudio,
                            by:"{name}",
                            text:"Well... I guess that's it! Thanks!"
                        }
                    ]
                });

                script.push({
                    asContext:"room",
                    sumAttribute:"phase",
                    byValue:1
                });

                script.push({ movePlayerBack:true });

                // --- Add the architect

                let
                    architect = game.tools.addNpc(room.x+1, room.y+1, Tools.clone(ARCHITECT.layout));

                game.tools.onInteract(architect, script);

            });

        }
    })
    
})();

