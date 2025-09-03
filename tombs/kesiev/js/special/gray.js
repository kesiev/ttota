(function(){

    const
        TOMB_ID = "kesiev-gray",
        TOMB_TAGS = [ "tomb", "special" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        CLAIMS = 5,
        ARCHITECT_MISSING={
            bottomDress:"shortCoat",
            topDress:"monk",
            shoes:"sandals",
            head:"nobody",
            eyes:"none",
            mouth:"none",
            nose:"none"
        },
        ARCHITECT_NAMES = [ "Architect &#x3B1;", "Architect &#x3B2;" ],
        ARCHITECT_SYMBOLS = [ "&#x3B1;", "&#x3B2;" ],
        CAGE_WALLS = [
            [ { image:"tombs/kesiev/images/texture.png", imageX:6, imageY:6 } ],
            [ { image:"tombs/kesiev/images/texture.png", imageX:6, imageY:6 } ],
            [ { image:"tombs/kesiev/images/texture.png", imageX:6, imageY:6 } ],
            [ { image:"tombs/kesiev/images/texture.png", imageX:6, imageY:6 } ]
        ],
        CAGE_CLOSED = [ { backgroundColor:CONST.COLORS.GRAY }],
        CAGE_OPEN = [ { backgroundColor:CONST.COLORS.BLACK }],
        SENTENCES = {
            base:[
                "{someone:capitalize} {claim}... {position:capitalize}{end}",
                "{claim:capitalize}... {position:capitalize}{end}",
                "\"{claim:capitalize}\". {involve:capitalize} {position:capitalize}{end}"
            ],
            someone:[
                "some people think that",
                "someone says that",
                "I've heard around that"
            ],
            involve:[
                "what do you think?",
                "mmh...",
                "well...",
                "come to think of it...",
                "I've heard it around.",
                "have you ever wondered?"
            ],
            end:[
                ".", "...", "!"
            ],
            iSee:[
                "So you think so...",
                "Oh, okay.",
                "Sure. I could have imagined that.",
                "It couldn't have been any other way.",
                "What an interesting answer...",
                "I understand."
            ],
            nothingMore:[
                "I think there is nothing else.",
                "I'd say we're done.",
                "Thanks for the chat!",
                "Now we know each other better! Thanks!",
                "It was a pleasure talking to you!"
            ],
            // --- Do not use right, wrong, agree, disagree here as it may sound confusing in some sentences :)
            agree:[
                "I think so",
                "It's obvious to me",
                "that's true",
                "it is true",
                "that's right"
            ],
            disagree:[
                "it is not so",
                "I'm not that sure",
                "I don't think so",
                "it doesn't seem true to me",
                "it is false"
            ]
        };

    function prepareSentence(random,sentence,placeholders) {
        return sentence.replace(/\{([^}]+)\}/g,(m,m1)=>{
            let
                parts = m1.split(":"),
                part;
            if (placeholders[parts[0]])
                part = placeholders[parts[0]];
            else if (SENTENCES[parts[0]])
                placeholders[parts[0]] = part = prepareSentence(random, random.element(SENTENCES[parts[0]]), placeholders);
            else
                console.warn("Missing part",parts[0]);

            if (parts[1] == "capitalize")
                return Tools.capitalize(part);
            else
                return part;
        })
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Gray Room",
        description:"Take a stand on some ethical or philosophical issue and eliminate one of the Architects.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            { type:"data", id:"kesiev-gray-data", title:"Claims", by:[ CONST.CREDITS.UNKNOWN ], file:"tombs/kesiev/data/claims/claims.txt" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:5,
                    height:3,
                    canBeSolved:false,
                    isRunning:true,
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                claims = LOADER.DATA["kesiev-gray-data"].split("\n").map(line=>line.trim());

            rooms.forEach(room=>{

                let
                    cages = [ game.map[room.y+1][room.x+1], game.map[room.y+1][room.x+3] ],
                    cagesArea = { x:room.x+1, y:room.y+1, width:3, height:1 },
                    score = [ 0, 0 ],
                    currentSentence = 0,
                    architects = [],
                    claimsBag = { elements:claims },
                    allClaims = [];

                for (let i=0;i<CLAIMS;i++) {
                    let
                        row = [],
                        claim = room.random.bagPick(claimsBag);

                    row.push(prepareSentence(room.random,room.random.element(SENTENCES.base),{ claim:claim, position:room.random.element(SENTENCES.agree) }));
                    row.push(prepareSentence(room.random,room.random.element(SENTENCES.base),{ claim:claim, position:room.random.element(SENTENCES.disagree) }));

                    room.random.shuffle(row);

                    allClaims.push(row);

                }

                // --- Add the cages

                cages.forEach((cage,pos)=>{
                    let
                        architect;

                    game.tools.setElementPaintable(cage, false);
                    game.tools.setFloorPaintable(cage,false);
                    game.tools.setCeilingPaintable(cage,false);
                    game.tools.setWallsPaintable(cage,false);
                    game.tools.setWalls(cage, CAGE_WALLS);
                    game.tools.paintFloor(0, cage, game.tools.SOLID, CAGE_CLOSED, true);
                    game.tools.paintCeiling(0, cage, game.tools.SOLID, CAGE_CLOSED, true);
                    game.tools.paintMapSymbol(cage, ARCHITECT_SYMBOLS[pos]);
                    game.tools.paintMapSymbolBgColor(cage, CONST.COLORS.GRAY);

                    architect = game.tools.addNpc(cage.x, cage.y, Tools.clone(ARCHITECT_MISSING));
                    architect.name = ARCHITECT_NAMES[pos];
                    architect.nothingMoreSentence = room.random.element(SENTENCES.nothingMore);
                    architect.currentSentence = allClaims[0][pos];

                    game.tools.onInteract(architect,[
                        {
                            if:{
                                asContext:"room",
                                is:{ isRunning:false }
                            },
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    text:"{nothingMoreSentence}"
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
                                    by:"{name}",
                                    text:"{currentSentence}",
                                    options:[
                                        {
                                            id:"agree",
                                            value:true,
                                            label:"Agree"
                                        },{
                                            id:"agree",
                                            value:false,
                                            label:"Disagree"
                                        }
                                    ]
                                }
                            ]
                        },{
                            run:(game, context, done)=>{
                                if (context.answers.agree)
                                    score[pos]++;
                                else
                                    score[(pos+1)%2]++;
                                context.as.iSeeSentence = room.random.element(SENTENCES.iSee);
                                currentSentence++;
                                if (allClaims[currentSentence]) {
                                    architects.forEach((architect,id)=>{
                                        architect.currentSentence = allClaims[currentSentence][id];
                                    })
                                } else {
                                    context.room.canBeSolved = true;
                                    context.room.isRunning = false;
                                }
                                done(true);
                            }
                        },{
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    text:"{iSeeSentence}"
                                }
                            ]
                        },{
                            movePlayerBack:true
                        }
                    ]);

                    architects.push(architect);
                });

                game.tools.setProtected(cagesArea, true);
                
                // --- Place the end lever

                let
                    walkableWalls = game.tools.getWalkableWalls(room),
                    leverPosition = room.random.element(walkableWalls);

                game.tools.addWallDecoration(0,leverPosition,leverPosition.side,game.tools.SOLID,[
                    {  isLever:true, image:"images/texture.png", imageX:3, imageY:1 }
                ]);

                game.tools.onBumpWall(leverPosition.x, leverPosition.y, leverPosition.side, [
                    {
                        if:{
                            asContext:"room",
                            is:{ canBeSolved:false }
                        },
                        dialogueSay:[
                            {
                                text:"This lever is stuck..."
                            }
                        ]
                    },{
                        if:{ and:true },
                        endScript:true,
                    },{
                        dialogueSay:[
                            {
                                text:"There is a lever. Do you want to pull it?",
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
                                loser = 0;
                            if (score[0] > score[1])
                                loser = 1;

                            game.tools.removeElement(architects[loser]);
                            game.tools.paintFloor(0, cages[loser], game.tools.SOLID, CAGE_OPEN, true);
                            game.map[cages[loser].y][cages[loser].x].isWall = true;
                            game.tools.paintMapSymbol(cages[loser], CONST.MAPSYMBOLS.FLOOR);
                            
                            done(room.score);
                        }
                    },{
                        asContext:"room",
                        unlockRoom:true
                    },{
                        asContext:"room",
                        setAttribute:"isSolved",
                        toValue:true
                    },{
                        asContext:"room",
                        setAttribute:"canBeSolved",
                        toValue:false
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

                // Protect the lever area, so the architect doesn't spawn there
                game.tools.setProtected(leverPosition.front, true);

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
                                        text:"Anyway... It's a tough job. But someone has to do it."
                                    }
                                ]
                            },
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        if:{
                            asContext:"room",
                            is:{ isRunning:true }
                        },
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Welcome to Create Your Own Architect! Talk to these two Architect prototypes!"
                            }
                        ]
                    },{
                        if:{ else:true },
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"The big moment has arrived!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);
                
            })
        }
        
    })
    
})();

