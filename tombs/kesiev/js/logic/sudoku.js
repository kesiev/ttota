(function(){

    const
        TOMB_ID = "kesiev-sudoku",
        TOMB_TAGS = [ "tomb", "logic" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        PALETTE = [
            { background:CONST.COLORS.WHITE, foreground:CONST.COLORS.BLACK },
            { background:CONST.COLORS.CYAN, foreground:CONST.COLORS.BLACK },
            { background:CONST.COLORS.RED, foreground:CONST.COLORS.WHITE },
        ];

    // Adapted from: https://www.emanueleferonato.com/2015/06/23/pure-javascript-sudoku-generatorsolver/

    // given a sudoku cell, returns the row
    function returnRow(cell) {
        return Math.floor(cell / 9);
    }

    // given a sudoku cell, returns the column
    function returnCol(cell) {
        return cell % 9;
    }

    // given a sudoku cell, returns the 3x3 block
    function returnBlock(cell) {
        return Math.floor(returnRow(cell) / 3) * 3 + Math.floor(returnCol(cell) / 3);
    }

    // given a number, a row and a sudoku, returns true if the number can be placed in the row
    function isPossibleRow(number,row,sudoku) {
        for (let i=0; i<=8; i++)
            if (sudoku[row*9+i] == number)
                return false;

        return true;
    }

    // given a number, a column and a sudoku, returns true if the number can be placed in the column
    function isPossibleCol(number,col,sudoku) {
        for (let i=0; i<=8; i++)
            if (sudoku[col+9*i] == number)
                return false;
        return true;
    }

    // given a number, a 3x3 block and a sudoku, returns true if the number can be placed in the block
    function isPossibleBlock(number,block,sudoku) {
        for (let i=0; i<=8; i++)
            if (sudoku[Math.floor(block/3)*27+i%3+9*Math.floor(i/3)+3*(block%3)] == number)
                return false;

        return true;
    }

    // given a cell, a number and a sudoku, returns true if the number can be placed in the cell
    function isPossibleNumber(cell,number,sudoku) {
        let
            row = returnRow(cell),
            col = returnCol(cell),
            block = returnBlock(cell);

        return isPossibleRow(number,row,sudoku) && isPossibleCol(number,col,sudoku) && isPossibleBlock(number,block,sudoku);
    }

    // given a row and a sudoku, returns true if it's a legal row
    function isCorrectRow(row,sudoku) {
        let
            rightSequence = new Array(1,2,3,4,5,6,7,8,9),
            rowTemp= new Array();

        for (let i=0; i<=8; i++)
            rowTemp[i] = sudoku[row*9+i];

        rowTemp.sort();
        return rowTemp.join() == rightSequence.join();
    }

    // given a column and a sudoku, returns true if it's a legal column
    function isCorrectCol(col,sudoku) {
        let
            rightSequence = new Array(1,2,3,4,5,6,7,8,9),
            colTemp= new Array();

        for (let i=0; i<=8; i++)
            colTemp[i] = sudoku[col+i*9];

        colTemp.sort();

        return colTemp.join() == rightSequence.join();
    }

    // given a 3x3 block and a sudoku, returns true if it's a legal block 
    function isCorrectBlock(block,sudoku) {
        let
            rightSequence = new Array(1,2,3,4,5,6,7,8,9),
            blockTemp= new Array();

        for (let i=0; i<=8; i++)
            blockTemp[i] = sudoku[Math.floor(block/3)*27+i%3+9*Math.floor(i/3)+3*(block%3)];

        blockTemp.sort();

        return blockTemp.join() == rightSequence.join();
    }

    // given a sudoku, returns true if the sudoku is solved
    function isSolvedSudoku(sudoku) {
        for (let i=0; i<=8; i++)
            if (!isCorrectBlock(i,sudoku) || !isCorrectRow(i,sudoku) || !isCorrectCol(i,sudoku))
                return false;

        return true;
    }

    // given a cell and a sudoku, returns an array with all possible values we can write in the cell
    function determinePossibleValues(cell,sudoku) {
        let
            possible = new Array();

        for (let i=1; i<=9; i++)
            if (isPossibleNumber(cell,i,sudoku))
                possible.unshift(i);

        return possible;
    }

    // given an array of possible values assignable to a cell, returns a random value picked from the array
    function determineRandomPossibleValue(possible,cell,random) {
        let
            randomPicked = Math.floor(random.float() * possible[cell].length);

        return possible[cell][randomPicked];
    }

    // given a sudoku, returns a two dimension array with all possible values 
    function scanSudokuForUnique(sudoku) {
        let
            possible = new Array();

        for (let i=0; i<=80; i++)
            if (sudoku[i] == 0) {
                possible[i] = new Array();
                possible[i] = determinePossibleValues(i,sudoku);
                if (possible[i].length==0)
                    return false;
            }
        return possible;
    }

    // given an array and a number, removes the number from the array
    function removeAttempt(attemptArray,number) {
        let
            newArray = new Array();

        for (let i=0; i<attemptArray.length; i++)
            if (attemptArray[i] != number)
                newArray.unshift(attemptArray[i]);

        return newArray;
    }

    // given a two dimension array of possible values, returns the index of a cell where there are the less possible numbers to choose from
    function nextRandom(possible) {
        let
            max = 9,
            minChoices = 0;

        for (let i=0; i<=80; i++)
            if (possible[i]!=undefined)
                if ((possible[i].length<=max) && (possible[i].length>0)) {
                    max = possible[i].length;
                    minChoices = i;
                }

        return minChoices;
    }

    // given a sudoku, solves it
    function solve(sudoku,random) {
        let
            saved = new Array(),
            savedSudoku = new Array(),
            i=0,
            nextMove,
            whatToTry,
            attempt;

        while (!isSolvedSudoku(sudoku)) {
            i++;
            nextMove = scanSudokuForUnique(sudoku);
            if (nextMove == false) {
                nextMove = saved.pop();
                sudoku = savedSudoku.pop();
            }
            whatToTry = nextRandom(nextMove);
            attempt = determineRandomPossibleValue(nextMove,whatToTry,random);
            if (nextMove[whatToTry].length>1) {
                nextMove[whatToTry] = removeAttempt(nextMove[whatToTry],attempt);
                saved.push(nextMove.slice());
                savedSudoku.push(sudoku.slice());
            }
            sudoku[whatToTry] = attempt;
        }
    }

    // check if a sudoku is complete
    function isComplete(sudoku) {

        for (let i=0;i<81;i++)
            if (!sudoku[0])
                return false;

        return true;
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Pagoda Room",
        description:"The classic Sudoku puzzle game.",
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
                    width:9,
                    height:9,
                    isSolved:false,
                    attempts:1,
                    attemptsLimit:3
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach((room,id)=>{

                let
                    valid = false,
                    blanks = 5+Math.ceil(5*room.difficulty),
                    hintSequence = [],
                    validSudoku = [],
                    placedNumbers = [],
                    blankPos,
                    blanksLeft,
                    sudoku,
                    testSudoku;

                // --- Generate a valid sudoku

                do {
                    
                    for (let i=0;i<81;i++)
                        validSudoku[i]=0;
            
                    solve(validSudoku, room.random);
                    valid = isComplete(validSudoku);
            
                } while (!valid);

                // --- Creates a solvable sudoku

                do {

                    valid = false;
                    blanksLeft = blanks;
                    sudoku = validSudoku.slice();

                    do {
                        blankPos = Math.floor(room.random.float()*81);
                        if (sudoku[blankPos]) {
                            sudoku[blankPos] = 0;
                            blanksLeft--;
                        }
                    } while (blanksLeft);

                    testSudoku = sudoku.slice();
                    solve(testSudoku, room.random);
                    valid = isComplete(testSudoku);
                    
                } while (!valid);
               
                // --- Add entrance plaques

                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Paint the grid

                // Make sure no decorations on the floor

                game.tools.setFloorPaintable(room, false);
                game.tools.setElementPaintable(room, false);

                for (let i=0;i<81;i++) {
                    let
                        value = sudoku[i],
                        cell = game.map[room.y+Math.floor(i/9)][room.x+(i%9)],
                        colors = PALETTE[(Math.floor(i/27)+Math.floor((i%9)/3)) % 2];

                    if (value) {
                        game.tools.paintFloor(0, cell, game.tools.SOLID, [
                            { backgroundColor:colors.background },
                            CONST.TEXTURES.FONT[value]
                        ], true);
                        game.tools.paintMapSymbol(cell, value);
                        game.tools.paintMapSymbolColor(cell, colors.foreground);
                        game.tools.paintMapSymbolBgColor(cell, colors.background);
                    } else {
                        game.tools.paintFloor(0, cell, game.tools.SOLID, [
                            "defaultFloorTexture",
                            { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0, backgroundColor:game.dungeon.floorColor }
                        ], true);
                        game.tools.paintMapSymbolColor(cell, PALETTE[2].foreground);
                        game.tools.paintMapSymbolBgColor(cell, PALETTE[2].background);
                        game.tools.paintMapSymbol(cell, "?");
                        if (hintSequence.length < 3)
                            hintSequence.push(validSudoku[i]);
                        room.attempts--;
                    }
                    
                }

                room.attempts -= Math.floor((1-room.difficulty)*3);

                game.tools.hintAddSequence(room, hintSequence);

                // --- Prepare the architect positions

                let
                    walkableCells = game.tools.getWalkableCells(room),
                    architect,
                    architectPositions = [],
                    architectPosition;

                for (let i=0;i<3;i++)
                    architectPositions.push(room.random.removeElement(walkableCells));

                architectPosition = architectPositions[0];
                
                architect = game.tools.addNpc(architectPosition.x, architectPosition.y, Tools.clone(ARCHITECT.layout));
                architect.positions = architectPositions;
                architect.currentPosition = 0;
                room.architect = architect;
                
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
                                        text:"By the way... That's how it was solved, then!"
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
                                text:"Look at all those numbers! There are still some on that side..."
                            }
                        ]
                    },{
                        run:(game, context, done)=>{
                            let
                                position;

                            context.as.currentPosition = (context.as.currentPosition+1)%context.as.positions.length;
                            position = context.as.positions[context.as.currentPosition];

                            game.tools.moveElementAt(context.as, position.x, position.y);

                            game.tools.refreshScreen();

                            done(true);

                        }
                    }
                ]);

                // --- Give the "number cards" cards when the player enters the room

                let
                    cards = [];

                for (let i=1;i<10;i++)
                    cards.push({
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        addInventoryItem:{
                            data:{
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,
                                model:"default",
                                character:i
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                result = 0,
                                                position = game.tools.getRoomPosition(room),
                                                pos = position.roomX+(position.roomY*9);

                                            if (!sudoku[pos]) {
                                                let
                                                    isDone = true;

                                                placedNumbers[pos] = i;
                                                room.attempts++;

                                                game.tools.paintFloor(0, position.cell, game.tools.SOLID, [
                                                    "defaultFloorTexture",
                                                    { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0, backgroundColor:game.dungeon.floorColor },
                                                    CONST.TEXTURES.FONT[i]
                                                ], true);
                                                game.tools.paintMapSymbol(position.cell, i);
                                                game.tools.refreshScreen();

                                                for (let i=0;i<81;i++)
                                                    if (!sudoku[i] && (placedNumbers[i] != validSudoku[i])) {
                                                        isDone = false;
                                                        break;
                                                    }

                                                if (isDone)
                                                    result = 2;
                                                else
                                                    result = 1;
                                            }

                                            done(result);
                                        }  
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:0 }
                                        },
                                        dialogueSay:[
                                            {
                                                text:"There is a "+i+" on this card."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:1 }
                                        },
                                        playAudio:{ sample:"nogain1" }
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:2 }
                                        },
                                        asContext:"room",
                                        unlockRoomWithAttempts:"attempts",
                                        ofAttempts:"attemptsLimit"
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        setAttribute:"isSolved",
                                        toValue:true
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        removeInventoryItemsFromRoom:true
                                    }
                                ]
                            }
                        }
                    });

                game.tools.onEnter(room,cards);

                // --- Take back the "number cards" card when the player leaves the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);

            })
        }
        
    })
    
})();

