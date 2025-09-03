(function(){

    const
        TOMB_ID = "kesiev-accuse",
        TOMB_TAGS = [ "tomb", "logic" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        MIN_TESTIMONIES = 4,
        RANGE_TESTIMONIES = 3,
        ACCUSES = [
            "You want to accuse {{ who }}? It seems rather suspicious to me...",
            "Are you accusing {{ who }}? It seems like the right choice to me!",
            "It was definitely {{ who }}. Should we accuse him?",
            "{{ who }}. Let's accuse him!",
            "I'm pretty sure it was {{ who }}. What do you think?",
            "Are you accusing {{ who }}?",
            "It was {{ who }}! Let's accuse him!"
        ],
        SENTENCES = {
            culpritSelf:[
                "I'm the culprit!",
                "I'm behind all this!",
                "It was me!",
                "Come on, it was me!",
            ],
            culpritOther:[
                "The one to be punished is {{ who }}!",
                "There is {{ who }} behind all this!",
                "{{ who }} is the one you are looking for.",
                "I've the who you want: {{ who }}.",
            ],
            innocentOther:[
                "{{ who }} is not guilty!",
                "{{ who }} is not at fault.",
                "{{ who }} is not your target.",
                "It couldn't have been {{ who }}.",
            ],
            isTrue:[
                "{{ who }} is telling the truth.",
                "{{ who }} is sincere.",
                "{{ who }} is not telling lies.",
            ],
            isLie:[
                "{{ who }} is lying!",
                "{{ who }} is a dirty liar!",
                "Don't trust {{ who }}...",
                "{{ who }} tells lies...",
            ]
        };

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Guilty Room",
        description:"Find the guilty Architect crossing their testimonies.",
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
                    width:MIN_TESTIMONIES+RANGE_TESTIMONIES+2,
                    height:3,
                    attempts:1,
                    attemptsLimit:3,
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach((room,id)=>{

                // --- Create the case
                let
                    stage = { x:room.x+1, y:room.y+1, width:room.width-2, height:1 },
                    sentenceBags = {},
                    accusesBag = { elements:ACCUSES },
                    architects = ARCHITECTS.list.filter(architect=>(architect != ARCHITECT) && (architect.layout.head != "nobody")),
                    testimonies = Math.min(MIN_TESTIMONIES+Math.floor(RANGE_TESTIMONIES*room.difficulty), architects.length),
                    architectsById = {},
                    sentences = [],
                    isTruth = room.random.bool(),
                    culprit = room.random.integer(testimonies),
                    innocent,
                    hintSequence = [];

                do {
                    innocent = room.random.integer(testimonies);
                } while (innocent == culprit);

                for (let i=0;i<testimonies;i++) {
                    let
                        row;
                    if (i == 0) {
                        if (i == culprit)
                            if (isTruth)
                                row = { type:"culpritSelf" };
                            else
                                row = { type:"culpritOther", who:innocent }
                        else
                            if (isTruth)
                                row = { type:"culpritOther", who:culprit };
                            else
                                row = { type:"innocentOther", who:culprit };
                    } else if (i == testimonies-1) {
                        if (isTruth)
                            row = { type:"isTrue", who:i-1 };
                        else
                            row = { type:"isLie", who:i-1 };
                    } else {
                        if (room.random.bool())
                            row = { type:"isTrue", who:i-1 };
                        else {
                            isTruth = !isTruth;
                            row = { type:"isLie", who:i-1 };
                        }
                    }
                    row.id = i;
                    architectsById[i] = room.random.removeElement(architects);
                    hintSequence.push(architectsById[i].layout.name);
                    sentences.push(row);
                }

                game.tools.hintAddSequence(room, hintSequence);

                room.random.shuffle(sentences);

                
                // --- Add entrance plaques

                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Prepare the stage

                game.tools.paintFloor(0, stage, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);
                game.tools.paintMapSymbolBgColor(stage, game.dungeon.floorAccent);

                // --- Add the architects

                sentences.forEach((sentence,id)=>{
                    let
                        architect = game.tools.addNpc(stage.x+id, stage.y, Tools.clone(architectsById[sentence.id].layout)),
                        text;

                    if (!sentenceBags[sentence.type])
                        sentenceBags[sentence.type] = { elements:SENTENCES[sentence.type] };

                    text = room.random.bagPick(sentenceBags[sentence.type]);
                    if (sentence.who !== undefined)
                        text = text.replace(/\{\{ who \}\}/g, architectsById[sentence.who].layout.name );

                    game.tools.onInteract(architect,[
                        {
                            if:{
                                asContext:"room",
                                is:{ isSolved:true }
                            },
                            subScript:[
                                {
                                    dialogueSay:[
                                        {
                                            by:"{name}",
                                            text:"That was fun! Thank you so much!"
                                        }
                                    ]
                                },
                                { movePlayerBack:true },
                                { endScript:true }
                            ]
                        },{
                            dialogueSay:[     
                                {
                                    by:"{name}",
                                    text:text
                                }
                            ]
                        },
                        { movePlayerBack:true }
                    ]);
                })

                // Protect the stage, so the architect doesn't spawn there
                game.tools.setProtected(stage, true);

                // --- Add the architect

                let
                    walkableCells = game.tools.getWalkableCells(room),
                    architectPosition = room.random.element(walkableCells),
                    architect = game.tools.addNpc(architectPosition.x, architectPosition.y, Tools.clone(ARCHITECT.layout)),
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
                                            text:"Anyway... you've proven yourself to be a good detective!"
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
                                    text:"Something strange has happened here in the Tombs. I have gathered all the possible culprits here...",
                                },{
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"Do you want to accuse someone?",
                                    options:[
                                        {
                                            id:"accuse",
                                            value:true,
                                            label:"Yes"
                                        },{
                                            id:"accuse",
                                            value:false,
                                            label:"Maybe later"
                                        }
                                    ]
                                }
                            ]
                        },{
                            if:{
                                asContext:"answers",
                                is:{ accuse:false }
                            },
                            movePlayerBack:true
                        },{
                            if:{ and:true },
                            endScript:true
                        }
                    ];

                sentences.forEach(sentence=>{
                    let
                        accuse = game.random.bagPick(accusesBag).replace(/\{\{ who \}\}/g, architectsById[sentence.id].layout.name);

                    script.push({
                        if:{
                            asContext:"answers",
                            is:{ accuse:true }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:accuse,
                                options:[
                                    {
                                        id:"accuseIt",
                                        value:true,
                                        label:"Accuse!"
                                    },{
                                        id:"accuseIt",
                                        value:false,
                                        label:"Not yet"
                                    }
                                ]
                            }
                        ]
                    });
                    script.push({
                        if:{
                            asContext:"answers",
                            is:{ accuseIt:true }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"..."
                            }
                        ]
                    });
                    
                    if (sentence.id == culprit) {
                        script.push({
                            if:{ and:true },
                            asContext:"room",
                            unlockRoomWithAttempts:"attempts",
                            ofAttempts:"attemptsLimit"
                        });
                        script.push({
                            if:{ and:true },
                            asContext:"room",
                            setAttribute:"isSolved",
                            toValue:true
                        });
                        script.push({
                            if:{ and:true },
                            dialogueSay:[
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"Well done! You've found the culprit!"
                                }
                            ]
                        });
                    } else {
                        script.push({
                            if:{ and:true },
                            hitPlayer:2
                        });
                        script.push({
                            if:{ and:true },
                            asContext:"room",
                            sumAttribute:"attempts",
                            byValue:1
                        });
                        script.push({
                            if:{ and:true },
                            dialogueSay:[
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"Damn, it's not the culprit!"
                                }
                            ]
                        });
                    }

                    script.push({
                        if:{ and:true },
                        movePlayerBack:true
                    });

                    script.push({
                        if:{ and:true },
                        endScript:true
                    });

                });

                script.push({
                    dialogueSay:[
                        {
                            audio:ARCHITECT.voiceAudio,
                            by:"{name}",
                            text:"So what do we do now?"
                        }
                    ]
                });
                script.push({
                    movePlayerBack:true
                });

                game.tools.onInteract(architect, script);

            })
        }
        
    })
    
})();

