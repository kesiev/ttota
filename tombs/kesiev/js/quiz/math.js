(function(){

    const
        TOMB_ID = "kesiev-math",
        TOMB_TAGS = [ "tomb", "quiz" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        QUIZ_TYPES = [
            { type:"sum", symbol:"+", n1:"n1", n2:"n2", answer:"n3" },
            { type:"sum", symbol:"-", n1:"n3", n2:"n2", answer:"n1" },
            { type:"sum", symbol:"+", n1:"n1", answer:"n2", n3:"n3" },
            { type:"sum", symbol:"-", n1:"n3", answer:"n2", n3:"n1" },
            { type:"sum", symbol:"+", answer:"n1", n2:"n2", n3:"n3" },
            { type:"sum", symbol:"-", answer:"n3", n2:"n2", n3:"n1" },
            { type:"mul", symbol:"X", n1:"n1", n2:"n2", answer:"n3" },
            { type:"mul", symbol:":", n1:"n3", n2:"n2", answer:"n1" },
            { type:"mul", symbol:"X", n1:"n1", answer:"n2", n3:"n3" },
            { type:"mul", symbol:":", n1:"n3", answer:"n2", n3:"n1" },
            { type:"mul", symbol:"X", answer:"n1", n2:"n2", n3:"n3" },
            { type:"mul", symbol:":", answer:"n3", n2:"n2", n3:"n1" }
        ],
        QUIZ_IDLE = { n1:0, n2:0, n3:0, symbol:"+" },
        DIGITS = 3,
        MAX_LIMIT = Math.pow(10,DIGITS)-1,
        RANGE_ATTEMPTS = 4,
        MIN_QUIZZES = 3,
        RANGE_QUIZZES = 3;

    function printNumber(game, x, y, number, digits) {
        let
            row = game.map[y],
            cell;

        for (let i=0;i<digits;i++) {
            cell = cell = row[x+digits-i-1];

            if (number === undefined) {
                game.tools.paintFloor(0, cell, game.tools.SOLID, [ { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0, backgroundColor:CONST.COLORS.WHITE } ], true);
                game.tools.paintMapSymbol(cell," ");
                game.tools.paintMapSymbolBgColor(cell,CONST.COLORS.GRAY);
                cell.isInput = true;
                delete cell.digit;
            } else {
                let
                    digit = number % 10;
                game.tools.paintFloor(0, cell, game.tools.SOLID, [ { backgroundColor:CONST.COLORS.WHITE }, CONST.TEXTURES.FONT[digit] ], true);
                game.tools.paintMapSymbol(cell,digit);
                game.tools.paintMapSymbolBgColor(cell,CONST.COLORS.WHITE);
                cell.isInput = false;
                number=Math.floor(number/10);
            }
        }
    }

    function printQuiz(game, room, quiz, areas) {
        game.tools.paintMapSymbol(areas.symbol, quiz.symbol);
        game.tools.paintFloor(0, areas.symbol, game.tools.SOLID, [ { backgroundColor:CONST.COLORS.WHITE }, CONST.TEXTURES.FONT[quiz.symbol] ], true);
        game.tools.paintMapSymbol(areas.equal, "=");
        game.tools.paintFloor(0, areas.equal, game.tools.SOLID, [ { backgroundColor:CONST.COLORS.WHITE }, CONST.TEXTURES.FONT["="] ], true);
        game.tools.paintMapSymbol(areas.line, "&#x2500;");
        game.tools.paintFloor(0, areas.line, game.tools.SOLID, [ { image:"tombs/kesiev/images/texture.png", imageX:5, imageY:6, backgroundColor:CONST.COLORS.WHITE } ], true);
        game.tools.paintFloor(0, areas.corner, game.tools.SOLID, [ { backgroundColor:CONST.COLORS.WHITE } ], true);
        printNumber(game, room.x, room.y+1, quiz.n1, DIGITS);
        printNumber(game, room.x, room.y+2, quiz.n2, DIGITS);
        printNumber(game, room.x, room.y+4, quiz.n3, DIGITS);
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Show Room",
        description:"Answer to some math quizzes.",
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
                    width:DIGITS+1,
                    height:5,
                    currentQuiz:0,
                    isStarted:false,
                    isSolved:false,
                    attempts:0,
                    attemptsLimit:0
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    areas = {
                        bar:{ x:room.x, y:room.y, width:room.width, height:1},
                        quiz:{ x:room.x, y:room.y+1, width:DIGITS+1, height:4},
                        symbol:{ x:room.x+DIGITS, y:room.y+1, width:1, height:1 },
                        equal:{ x:room.x+DIGITS, y:room.y+2, width:1, height:1 },
                        line:{ x:room.x, y:room.y+3, width:3, height:1 },
                        corner:{ x:room.x+DIGITS, y:room.y+3, width:1, height:2 }
                    },
                    quizCount = MIN_QUIZZES+Math.floor(RANGE_QUIZZES*room.difficulty),
                    quizTypes = Math.floor(QUIZ_TYPES.length*room.difficulty),
                    numberLimit = DIGITS*room.difficulty/quizCount,
                    numberLimits = [],
                    quizzes = [],
                    hintSequence = [],
                    hintsCount = Math.ceil(quizCount/2);

                for (let i=0;i<DIGITS;i++) {
                    let
                        min = i ? Math.pow(10,i) : 0,
                        max = Math.pow(10,i+1)-1,
                        result = Math.min(max+1,MAX_LIMIT);
                    
                    numberLimits.push({
                        min:min,
                        max:max,
                        range:max-min,
                        rangeMul:Math.floor(Math.sqrt(result)),
                        result:result,
                        resultRange:result-min
                    });
                }

                for (let i=0;i<quizCount;i++) {
                    let
                        limitId = Math.floor(i*numberLimit),
                        limits = numberLimits[limitId],
                        quizType = QUIZ_TYPES[room.random.integer(quizTypes)],
                        values = {},
                        answer;

                    switch (quizType.type) {
                        case "sum":{
                            values.n1 = limits.min+room.random.integer(limits.range-limits.min);
                            values.n2 = limits.min+room.random.integer(limits.resultRange-values.n1);
                            values.n3 = values.n1+values.n2;
                            break;
                        }
                        case "mul":{
                            values.n1 = room.random.integer(limits.rangeMul) || 1;
                            values.n2 = room.random.integer(Math.floor(limits.result/values.n1)) || 1;
                            values.n3 = values.n1*values.n2;
                            break;
                        }
                    }

                    answer = values[quizType.answer];
                    quizzes.push({ symbol:quizType.symbol, n1:values[quizType.n1], n2:values[quizType.n2], n3:values[quizType.n3], answer:answer, limits:limits });

                    if (hintSequence.length < hintsCount)
                        hintSequence.push(answer);
                }

                room.attempts = -DIGITS * quizCount;
                room.attemptsLimit = Math.floor((1-room.difficulty)*RANGE_ATTEMPTS);

                game.tools.hintAddSequence(room, hintSequence);

                // --- Disable decorations on the quiz

                game.tools.setFloorPaintable(areas.quiz, false);
                game.tools.setElementPaintable(areas.quiz, false);

                // --- Draw the Architect bar

                game.tools.paintFloor(0, areas.bar, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);

                // --- Print the idle quiz

                printQuiz(game, room, QUIZ_IDLE, areas);

                // --- Add the architect

                let
                    walkableCells = game.tools.getWalkableCells(areas.bar),
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
                                        text:"Well, some quizzes were quite difficult..."
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
                                text:"This floor reminds me of something from the past..."
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // Protect the cell, so the lever won't spawn there
                game.tools.setProtected(architectPosition, true);

                // --- Place the game start lever

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
                            is:{ isStarted:true }
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
                                text:"You see some gears right behind the lever. Do you want to pull it?",
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

                            for (let i=0;i<10;i++) {
                                let
                                    digitItem = game.tools.addInventoryItem(room, {
                                        group:CONST.GROUP.ROOMITEM,
                                        color:CONST.ITEMCOLOR.ROOMITEM,
                                        model:"default",
                                        character:i
                                    });
                                game.tools.onUse(digitItem,[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                refresh,
                                                result = 0,
                                                cell = game.map[game.position.y][game.position.x];

                                            if (cell.isInput) {
                                                let
                                                    digit,
                                                    answer = quizzes[room.currentQuiz].answer,
                                                    digitValue = 1,
                                                    inputAnswer = 0;

                                                game.tools.paintFloor(0, cell, game.tools.SOLID, [
                                                    { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0, backgroundColor:CONST.COLORS.WHITE },
                                                    CONST.TEXTURES.FONT[i]
                                                ], true);
                                                game.tools.paintMapSymbol(cell,i);
                                                cell.digit = i;

                                                refresh = true;
                                                context.room.attempts++;

                                                for (let i=DIGITS-1;i>=0;i--) {
                                                    digit = game.map[game.position.y][room.x+i].digit;
                                                    if (digit === undefined) {
                                                        inputAnswer = -1;
                                                        break;
                                                    } else {
                                                        inputAnswer += digitValue*digit;
                                                        digitValue*=10;
                                                    }
                                                }

                                                if (inputAnswer == answer) {
                                                    room.currentQuiz++;
                                                    if (room.currentQuiz >= quizzes.length) {
                                                        printQuiz(game, room, QUIZ_IDLE, areas);
                                                        result = 3;
                                                    } else {
                                                        printQuiz(game, room, quizzes[room.currentQuiz], areas);
                                                        if (CONST.DEBUG.showLogs)
                                                            console.log("QUIZ",quizzes[room.currentQuiz]);
                                                        result = 2;
                                                    }
                                                }
                                                
                                            } else
                                                result = 1;

                                            if (refresh)
                                                game.tools.refreshScreen();

                                            done(result);
                                        }
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:0 }
                                        },
                                        playAudio:{ sample:"nogain1" }
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:1 }
                                        },
                                        dialogueSay:[     
                                            {
                                                text:"Nothing happens..."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:2 }
                                        },
                                        playAudio:{ sample:"lever1" }
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:3 }
                                        },
                                        asContext:"room",
                                        setAttribute:"isSolved",
                                        toValue:true
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        removeInventoryItemsFromRoom:true
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        unlockRoomWithAttempts:"attempts",
                                        ofAttempts:"attemptsLimit"
                                    }
                                ]);
                            }

                            if (CONST.DEBUG.showLogs)
                                console.log("QUIZ",quizzes[room.currentQuiz]);

                            printQuiz(game, room, quizzes[room.currentQuiz], areas);

                            done(true);
                        }
                    },{
                        wait:500
                    },{
                        asContext:"room",
                        setAttribute:"isStarted",
                        toValue:true
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

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Restore the "ingredient" cards when the player enters the room

                game.tools.onEnter(room,[ {
                    if:{
                        asContext:"room",
                        is:{ isSolved:false }
                    },
                    restoreInventoryItemsFromRoom:true
                } ]);

                // --- Store the "ingredient" cards when the player leaves the room

                game.tools.onLeave(room,[ { storeInventoryItemsFromRoom:true } ]);

            });

        }
    })
    
})();

