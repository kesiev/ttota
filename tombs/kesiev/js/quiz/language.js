(function(){

    const
        TOMB_ID = "kesiev-language",
        TOMB_TAGS = [ "tomb", "quiz" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        SQUARE_SIZE = 3,
        OPTIONS = 4,
        QUESTIONS = [
            { x:1, y:1 },
            { x:3, y:1, fromBag:true },
            { x:1, y:3, fromBag:true },
            { x:3, y:3, fromBag:true }
        ],
        SENTENCES_SOLVED = [
            "It was fun!",
            "I had no idea what I was saying!",
            "I should come back to this room more often!",
            "It's nice and cool in here!"
        ],
        LANGUAGES = [
            {
                id:0,
                question:[
                    "Hey, ciao! Come si traduce \"{word}\" in Italiano?",
                    "Scusami... ho una domanda. Come si tradice \"{word}\" in Italiano?",
                    "Potresti dirmi come si dice \"{word}\" in Italiano?"
                ],
                wrong:[
                    "...Ma ne sei sicuro?",
                    "Non sembra giusto...",
                    "...Davvero?"
                ],
                right:[
                    "Molto bene, grazie!",
                    "Oh, giusto! Grazie!",
                    "Hai ragione, grazie!"
                ],
                done:[
                    "Grazie per l'aiuto!",
                    "Grazie per il suggerimento!",
                    "Grazie mille!"
                ]
            },{
                id:1,
                question:[
                    "Hey, hi! How do you say \"{word}\" in English?",
                    "Excuse me... I have a question. How do you say \"{word}\" in English?",
                    "Could you tell me how to say \"{word}\" in English?"
                ],
                wrong:[
                    "...Are you sure?",
                    "It doesn't seem right...",
                    "...Really?"
                ],
                right:[
                    "Very good, thanks!",
                    "Oh, right! Thanks!",
                    "You're right, thanks!"
                ],
                done:[
                    "Thanks for the help!",
                    "Thanks for the tip!",
                    "Thanks a lot!"
                ]
            },{
                id:2,
                question:[
                    "Salut! Comment dit-on \"{word}\" en Fran&#xE7;ais?",
                    "Excusez-moi... J'ai une question. Comment dit-on \"{word}\" en Fran&#xE7;ais?",
                    "Pourriez-vous m'expliquer comment dit-on \"{word}\" en Fran&#xE7;ais?"
                ],
                wrong:[
                    "...&#xCA;tes-vous s&#xFB;r?",
                    "&#xC7;a ne semble pas juste...",
                    "...Tu le pense vraiment?"
                ],
                right:[
                    "Tr&#xE8;s bien, merci!",
                    "Ah oui! Merci!",
                    "Tu as raison, merci!"
                ],
                done:[
                    "Merci pour l'aide!",
                    "Merci pour le conseil!",
                    "Merci beaucoup!"
                ]
            },{
                id:3,
                question:[
                    "Hallo! Wie sagt man \"{word}\" auf Deutsch?",
                    "Entschuldigung... Ich habe eine Frage. Wie sagt man \"{word}\" auf Deutsch?",
                    "K&#xF6;nnten Sie mir sagen, wie man \"{word}\" auf Deutsch sagt?"
                ],
                wrong:[
                    "...Bist du sicher?",
                    "Das scheint nicht richtig zu sein...",
                    "...Wirklich?"
                ],
                right:[
                    "Sehr gut, danke!",
                    "Oh, richtig! Danke!",
                    "Du hast Recht, danke!"
                ],
                done:[
                    "Danke f&#xFC;r die Hilfe!",
                    "Danke f&#xFC;r den Tipp!",
                    "Vielen Dank!"
                ]
            },{
                id:4,
                question:[
                    "&#xA1;Hola! &#xBF;C&#xF3;mo se dice \"{word}\" en espa&#xF1;ol?",
                    "Disculpe... Tengo una pregunta. &#xBF;C&#xF3;mo se dice \"{word}\" en espa&#xF1;ol?",
                    "&#xBF;Podr&#xED;a decirme c&#xF3;mo se dice \"{word}\" en espa&#xF1;ol?"
                ],
                wrong:[
                    "...&#xBF;Est&#xE1; seguro?",
                    "No me parece correcto...",
                    "...&#xBF;En serio?"
                ],
                right:[
                    "&#xA1;Muy bien, gracias!",
                    "&#xA1;Ah, cierto! &#xA1;Gracias!",
                    "Tienes raz&#xF3;n, gracias!"
                ],
                done:[
                    "&#xA1;Gracias por la ayuda!",
                    "&#xA1;Gracias por el consejo!",
                    "&#xA1;Muchas gracias!"
                ]
            }
        ];
        
    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Plaza Room",
        description:"Help some Architect tourists with their translation questions.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"Village At Morning SFX", by:[ "iluppai" ], id:"kesiev-language-square1", file:"tombs/kesiev/audio/music/square1", isSong:true},
            { type:"audio", title:"Mouse click SFX", by:[ "OwlishMedia" ], id:"mouseclick1", file:"audio/sfx/mouseclick1" },
            { type:"data", id:"kesiev-language-data", title:"Multi-language words list", by:[ CONST.CREDITS.UNKNOWN ], file:"tombs/kesiev/data/language/language.txt" },
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    music:"kesiev-language-square1",
                    width:SQUARE_SIZE+2,
                    height:SQUARE_SIZE+2,
                    isSolved:false,
                    score:0
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                architects = ARCHITECTS.list.filter(architect=>(architect != ARCHITECT) && (architect.layout.head != "nobody")),
                words = LOADER.DATA["kesiev-language-data"].split("\n").map(word=>word.trim().split("|"));

            rooms.forEach(room=>{

                let
                    plazaArea = { x:room.x+1, y:room.y+1, width:room.width-2, height:room.height-2 },
                    fountainArea = { x:room.x+2, y:room.y+2, width:1, height:1 },
                    fountain,
                    wordsBag = { elements:words },
                    architectsBag = { elements:architects },
                    languagesBag = { elements:LANGUAGES },
                    roomLanguagesCount = 2+Math.floor((LANGUAGES.length-2)*room.difficulty),
                    roomLanguages = [],
                    languagesLeft = [],
                    answerPrize = Math.ceil(room.goldBudget/QUESTIONS.length);

                for (let i=0;i<roomLanguagesCount;i++)
                    roomLanguages.push(room.random.bagPick(languagesBag));

                // --- Draw the plaza

                game.tools.paintFloor(0, plazaArea, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);
                game.tools.paintCeiling(0, room, game.tools.SOLID, [ { image:"tombs/kesiev/images/texture.png", imageX:5, imageY:7 } ]);
                fountain = game.tools.addElement(fountainArea.x, fountainArea.y,{
                    sprite:[
                        { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:7, animation:[ 0, { dx:-101 }, { dx:-202 }, 0, { dx:-101 }, { dx:-202 } ]}
                    ]
                });
                game.tools.setElementPaintable(fountainArea,false);

                game.tools.onInteract(fountain,[
                    {
                        dialogueSay:[
                            { text:"The sky is painted on the ceiling and the village noises are just a looping sound coming from this fountain but..." },
                            { text:"...its gushing water gives you the feeling of truly being outside!" }
                        ]
                    },{ movePlayerBack:true }
                ])

                // --- Add the architects

                room.questionsLeft = QUESTIONS.length;

                QUESTIONS.forEach(question=>{
                    let
                        languages = [],
                        word = room.random.bagPick(wordsBag),
                        audio,
                        solvedScript,
                        architect,
                        model,
                        options = [],
                        wordToGuess,
                        answer;

                    while (languages.length < 2) {
                        if (languagesLeft.length == 0)
                            languagesLeft = roomLanguages.filter(language=>languages.indexOf(language) == -1);
                        languages.push(room.random.removeElement(languagesLeft));
                    }

                    wordToGuess = word[languages[1].id];
                    answer = word[languages[0].id];

                    options.push({
                        id:"isRight",
                        value:true,
                        label:answer
                    });

                    while (options.length < OPTIONS)
                        options.push({
                            id:"isRight",
                            value:false,
                            label:room.random.bagPick(wordsBag)[languages[0].id]
                        });

                    game.tools.hintAddKeyValue(room, wordToGuess, answer);

                    room.random.shuffle(options);

                    if (question.fromBag) {
                        model = room.random.bagPick(architectsBag).layout;
                        solvedScript =  {
                            if:{
                                asContext:"room",
                                is:{ isSolved:true }
                            },
                            subScript:[
                                {
                                    dialogueSay:[
                                        {
                                            by:"{name}",
                                            audio:audio,
                                            text:room.random.element(SENTENCES_SOLVED),
                                        }
                                    ]
                                },
                                { movePlayerBack:true },
                                { endScript:true }
                            ]
                        };
                    } else {
                        audio = ARCHITECT.voiceAudio;
                        model = ARCHITECT.layout;
                        solvedScript =  {
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
                                            text:"Well... there are a lot of languages spoken in the world, right?"
                                        }
                                    ]
                                },
                                { movePlayerBack:true },
                                { endScript:true }
                            ]
                        };
                    }

                    architect = game.tools.addNpc(room.x+question.x, room.y+question.y, Tools.clone(model));

                    game.tools.onInteract(architect,[
                        solvedScript,{
                            if:{
                                is:{ isDone:true }
                            },
                            subScript:[
                                {
                                    dialogueSay:[
                                        {
                                            by:"{name}",
                                            audio:audio,
                                            text:room.random.element(languages[0].done),
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
                                    audio:audio,
                                    text:room.random.element(languages[0].question).replace(/\{word\}/g, wordToGuess),
                                    options:options
                                }
                            ]
                        },{
                            if:{
                                asContext:"answers",
                                is:{ isRight:true }
                            },
                            asContext:"room",
                            playerGainGold:answerPrize
                        },{
                            if:{ and:true },
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    audio:audio,
                                    text:room.random.element(languages[0].right)
                                }
                            ]
                        },{
                            if:{ and:true },
                            asContext:"room",
                            sumAttribute:"score",
                            byValue:1
                        },{
                            if:{ else:true },
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    audio:audio,
                                    text:room.random.element(languages[0].wrong)
                                }
                            ]
                        },{
                            setAttribute:"isDone",
                            toValue:true
                        },{
                            asContext:"room",
                            sumAttribute:"questionsLeft",
                            byValue:-1
                        },{
                            if:{
                                asContext:"room",
                                is:{ questionsLeft: 0 }
                            },
                            subScript:[
                                {
                                    asContext:"room",
                                    setAttribute:"isSolved",
                                    toValue:true
                                },{
                                    if:{
                                        asContext:"room",
                                        is:{ score: 0 }
                                    },
                                    hitPlayer:2
                                },{
                                    asContext:"room",
                                    unlockRoomItemOnly:true
                                }
                            ]
                        },{ movePlayerBack:true }
                    ])
                })

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);
                
            });

        }
    })
    
})();

