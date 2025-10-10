(function(){

    const
        TOMB_ID = "kesiev-mastermind",
        TOMB_TAGS = [ "tomb", "logic" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        CODE_LENGTH = 4,
        ATTEMPTS = 10,
        PALETTE = [ "RED", "GREEN", "BLUE", "YELLOW", "CYAN", "PURPLE" ],
        TEXTURE_FLOOR = { image:"tombs/kesiev/images/texture.png", imageX:4, imageY:0, backgroundColor: CONST.COLORS.DARKRED },
        TEXTURE_INPUT = { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0 };

    function newAttempt(game, room) {
        let
            area;

        room.attempt++;

        area = { x:room.x, y:room.y+room.attempt, width:CODE_LENGTH, height:1 };

        game.tools.paintFloor(0, area, game.tools.SOLID, [ TEXTURE_FLOOR, TEXTURE_INPUT ], true);
        game.tools.paintMapSymbol(area, "?");
    }

    function evaluateAnswer(answer, correctAnswer) {
        let
            result = { black:0, white:0 },
            wrong = [],
            spares = [];

        if (CONST.DEBUG.showLogs)
            console.log(answer,correctAnswer);

        correctAnswer.forEach((color,id)=>{
            if (answer[id] == color)
                result.black++;
            else {
                wrong.push(answer[id]);
                if (!spares[color])
                    spares[color] = 1;
                else
                    spares[color]++;
            }
        });

        wrong.forEach(color=>{
            if (spares[color]) {
                result.white++;
                spares[color]--;
            }
        })

        return result;
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Mind Room",
        description:"The classic Mastermind deduction game.",
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
                    width:CODE_LENGTH+3,
                    height:ATTEMPTS,
                    attempt:-1,
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach((room,id)=>{

                let
                    blackFloor = Tools.clone(game.dungeon.defaultFloorTexture),
                    whiteFloor = Tools.clone(game.dungeon.defaultFloorTexture),
                    colorsPlaced = 0,
                    answer = [],
                    correctAnswer = [];

                blackFloor.backgroundColor = CONST.COLORS.GRAY;
                whiteFloor.backgroundColor = CONST.COLORS.WHITE;

                // --- Generate the correct answer

                for (let i=0;i<CODE_LENGTH;i++)
                    correctAnswer.push(room.random.elementIndex(PALETTE));

                room.calendarMetadata= { "Answer":correctAnswer.map(i=>PALETTE[i]).join(", ") };

                // --- Add hint

                for (let i=0;i<CODE_LENGTH-1;i++)
                    game.tools.hintAddSequence(room, [ PALETTE[correctAnswer[i]], PALETTE[correctAnswer[i+1]] ]);

                // --- Add entrance plaques

                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // Paint the "attempts" boxes
                game.tools.paintFloor(0, { x:room.x, y:room.y, width:CODE_LENGTH, height:room.height }, game.tools.SOLID, [ TEXTURE_FLOOR ]);

                // Paint the "right color at right position" boxes
                game.tools.paintFloor(0, { x:room.x+CODE_LENGTH, y:room.y, width:1, height:room.height }, game.tools.SOLID, [ blackFloor ]);

                // Paint the "right color at wrong position" boxes
                game.tools.paintFloor(0, { x:room.x+CODE_LENGTH+1, y:room.y, width:1, height:room.height }, game.tools.SOLID, [ whiteFloor ]);

                // Paint the Architect area
                game.tools.paintFloor(0, { x:room.x+CODE_LENGTH+2, y:room.y, width:1, height:room.height }, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);

                // --- Place the architect

                // Protect the board area, so the architect doesn't spawn there
                game.tools.setProtected({ x:room.x, y:room.y, width:CODE_LENGTH+2, height:room.height }, true);

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
                                        text:"That was quite a challenge of deduction, wasn't it?"
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
                                text:"What beautiful Developer Color cards you have there!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // --- Start the first attempt
                
                newAttempt(game, room);

                // --- Give the "color cards" cards when the player enters the room

                let
                    cards = [];

                PALETTE.forEach((color,id)=>{
                    cards.push({
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        addInventoryItem:{
                            data:{
                                colorId:id,
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.COLORS[color],
                                model:"default",
                                image:"push"
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                result = 0,
                                                position = game.tools.getRoomPosition(room);

                                            if ((position.roomY == room.attempt) && (position.roomX < CODE_LENGTH)) {
                                                game.tools.paintFloor(0, game.position, game.tools.SOLID, [
                                                    { backgroundColor:PALETTE[context.as.colorId] },
                                                    TEXTURE_INPUT
                                                ], true);
                                                game.tools.paintMapSymbolBgColor(game.position, PALETTE[context.as.colorId]);
                                                game.tools.paintMapSymbol(game.position, CONST.MAPSYMBOLS.FLOOR);
                                                if (answer[position.roomX] === undefined)
                                                    colorsPlaced++;
                                                answer[position.roomX] = context.as.colorId;
                                                game.tools.playAudio("nogain1");

                                                if (colorsPlaced == CODE_LENGTH) {
                                                    let
                                                        blackArea = { x:room.x+CODE_LENGTH, y:game.position.y, width:1, height:1 },
                                                        whiteArea = { x:room.x+CODE_LENGTH+1, y:game.position.y, width:1, height:1 },
                                                        evaluation = evaluateAnswer(answer, correctAnswer);

                                                    game.tools.addFloorDecoration(0, blackArea, game.tools.SOLID, [ CONST.TEXTURES.FONT[evaluation.black] ], true);
                                                    game.tools.addFloorDecoration(0, whiteArea, game.tools.SOLID, [ CONST.TEXTURES.FONT[evaluation.white] ], true);
                                                    game.tools.paintMapSymbol(blackArea, evaluation.black);
                                                    game.tools.paintMapSymbolBgColor(blackArea, CONST.COLORS.BLACK);
                                                    game.tools.paintMapSymbolColor(blackArea, CONST.COLORS.WHITE);
                                                    game.tools.paintMapSymbol(whiteArea, evaluation.white);

                                                    colorsPlaced = 0;
                                                    answer = [];

                                                    if (evaluation.black == CODE_LENGTH) {
                                                        room.isSolved = true;
                                                        result = 2;
                                                    } else if (room.attempt >= ATTEMPTS-1) {
                                                        room.isSolved = true;
                                                        result = 3;
                                                    } else {
                                                        game.tools.playAudio("lever1");
                                                        newAttempt(game, room);
                                                    }
                                                }

                                                game.tools.refreshScreen();
                                            } else
                                                result = 1;
                                            done(result);
                                        }  
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:1 }
                                        },
                                        dialogueSay:[
                                            {
                                                text:"It's a colored card..."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:2 }
                                        },
                                        asContext:"room",
                                        unlockRoom:true
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        removeInventoryItemsFromRoom:true
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:3 }
                                        },
                                        hitPlayer:3+Math.floor(room.difficulty*3)
                                    },{
                                        if:{ and:true },
                                        dialogueSay:[
                                            {
                                                text:"You've finished your attempts!"
                                            }
                                        ]
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        unlockRoomItemOnly:true
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        removeInventoryItemsFromRoom:true
                                    }
                                ]
                            }
                        }
                    });
                });

                game.tools.onEnter(room,cards);

                // --- Take back the "color cards" card when the player leaves the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);

            })
        }
        
    })
    
})();

