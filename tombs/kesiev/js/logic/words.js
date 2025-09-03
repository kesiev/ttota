(function(){

    const
        TOMB_ID = "kesiev-words",
        TOMB_TAGS = [ "tomb", "logic" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        TEXTURE_FLOOR = { image:"tombs/kesiev/images/texture.png", imageX:4, imageY:0, backgroundColor: CONST.COLORS.DARKRED },
        TEXTURE_INPUT = { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0 },
        WORD_LENGTH = 5,
        ATTEMPTS = 6,
        LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
        STATUS_COLORS = [ CONST.COLORS.RED, CONST.COLORS.YELLOW, CONST.COLORS.GREEN ];

    function newAttempt(game, room) {
        let
            area;

        room.attempt++;

        area = { x:room.x, y:room.y+room.attempt, width:WORD_LENGTH, height:1 };

        game.tools.paintFloor(0, area, game.tools.SOLID, [ TEXTURE_FLOOR, TEXTURE_INPUT ], true);
        game.tools.paintMapSymbol(area, "?");
    }

    function evaluateAnswer(answer, correctAnswer) {
        let
            availableLetters = [],
            result = {
                correct:0,
                letters:{},
                statuses:[]
            };

        answer.forEach((letter,pos)=>{
            if (letter == correctAnswer[pos]) {
                result.correct++;
                result.letters[letter] = 2;
                result.statuses[pos] = 2;
            } else
                availableLetters.push(correctAnswer[pos]);
        })

        answer.forEach((letter,pos)=>{
            if (!result.statuses[pos]) {
                let
                    status,
                    found = availableLetters.indexOf(letter);
                if (found == -1)
                    status = 0;
                else {
                    availableLetters[found] = 0;
                    status = 1;
                }
                result.statuses[pos] = status;
                result.letters[letter] = Math.max(result.letters[letter] || 0, status);
            }
        });

        return result;
    }

    function paintLetter(game, position, answerPosition, letter, answer) {
        game.tools.paintFloor(0, position, game.tools.SOLID, [
            { backgroundColor:CONST.COLORS.WHITE },
            TEXTURE_INPUT,
            CONST.TEXTURES.FONT[letter]
        ], true);
        game.tools.paintMapSymbol(position, letter);
        answer[answerPosition] = letter;
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Traffic Room",
        description:"The classic guess-the-word game.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"data", id:"kesiev-word-data", title:"Short words list", by:[ CONST.CREDITS.UNKNOWN ], file:"tombs/kesiev/data/words/words.txt" },
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:WORD_LENGTH+1,
                    height:ATTEMPTS,
                    isFirstEntrance:true,
                    isSolved:false,
                    attempt:-1
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach((room,id)=>{

                // --- Prepare the quiz

                let
                    correctLetters = [],
                    correctAnswer = room.random.element(LOADER.DATA["kesiev-word-data"].split("\n").map(word=>word.trim()));

                // --- Add hints

                game.tools.hintAddSentences(room, correctAnswer.split(""));

                // --- Draw the board

                let
                    architectArea = { x:room.x+WORD_LENGTH, y:room.y, width:1, height:ATTEMPTS},
                    playArea = { x:room.x, y:room.y, width:WORD_LENGTH, height:ATTEMPTS};

                game.tools.paintFloor(0, playArea, game.tools.SOLID, [ TEXTURE_FLOOR ]);
                game.tools.paintFloor(0, architectArea, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);

                // --- Add the Architect

                let
                    walkableCells = game.tools.getWalkableCells(architectArea),
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
                                        text:"Anyway... today the word was hard to guess!"
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
                                text:"What beautiful cards you have there! Are you learning the alphabet?"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // --- Add entrance plaques

                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Restore the "letter" cards when the player enters the room. The first time, add the "letter" card.

                let
                    cards = [{
                        setAttribute:"isFirstEntrance",
                        toValue:false
                    }],
                    answer = [],
                    lettersPlaced = 0;

                LETTERS.forEach(letter=>{
                    cards.push({
                        addInventoryItem:{
                            data:{
                                id:"letter-"+letter,
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,
                                model:"default",
                                character:letter,
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                result = 0,
                                                position = game.tools.getRoomPosition(room);

                                            if ((position.roomY == room.attempt) && (position.roomX < WORD_LENGTH)) {

                                                if (answer[position.roomX] === undefined)
                                                    lettersPlaced++;
                                                paintLetter(game, game.position, position.roomX, letter, answer);
                                                game.tools.playAudio("nogain1");

                                                if (lettersPlaced == WORD_LENGTH) {
                                                    let
                                                        evaluation = evaluateAnswer(answer, correctAnswer);

                                                    evaluation.statuses.forEach((status,id)=>{
                                                        let
                                                            color = STATUS_COLORS[status],
                                                            cell = game.map[game.position.y][room.x+id];

                                                        game.tools.paintFloor(0, cell, game.tools.SOLID, [
                                                            { backgroundColor:color },
                                                            TEXTURE_INPUT,
                                                            CONST.TEXTURES.FONT[answer[id]]
                                                        ], true);

                                                        game.tools.paintMapSymbolBgColor(cell, color);

                                                        if (status == 2)
                                                            correctLetters[id] = correctAnswer[id];
                                                    })

                                                    for (let k in evaluation.letters) {
                                                        let
                                                            item = game.tools.getInventoryItem("letter-"+k),
                                                            status = evaluation.letters[k];
                                                        if (status)
                                                            game.tools.setInventoryItemColor(item, STATUS_COLORS[status]);
                                                        else
                                                            game.tools.removeInventoryItem(item);
                                                    }

                                                    lettersPlaced = 0;
                                                    answer = [];

                                                    if (evaluation.correct == WORD_LENGTH) {
                                                        room.isSolved = true;
                                                        result = 2;
                                                    } else if (room.attempt >= ATTEMPTS-1) {
                                                        room.isSolved = true;
                                                        result = 3;
                                                    } else {
                                                        game.tools.playAudio("lever1");
                                                        newAttempt(game, room);
                                                        for (let i=0;i<WORD_LENGTH;i++)
                                                            if (correctLetters[i]) {
                                                                lettersPlaced++;
                                                                paintLetter(game, game.map[game.position.y+1][room.x+i], i, correctAnswer[i], answer);
                                                            }
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
                                                text:"It's a letter card..."
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

                game.tools.onEnter(room,[
                    {
                        if:{
                            asContext:"room",
                            is:{ isFirstEntrance:true }
                        },
                        subScript:cards
                    },{
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        restoreInventoryItemsFromRoom:true
                    }
                ]);

                // --- Store the "gardening" cards when the player leaves the room

                game.tools.onLeave(room,[ { storeInventoryItemsFromRoom:true } ]);

                // --- Start the first attempt
                
                newAttempt(game, room);


            })
        }
        
    })
    
})();

