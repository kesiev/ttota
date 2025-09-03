(function(){

    const
        TOMB_ID = "kesiev-tic",
        TOMB_TAGS = [ "tomb", "memory" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        WIN_SCORE = 10000,
        LOSE_SCORE = -10000,
        BOARD_WIDTH = 3,
        BOARD_HEIGHT = 3,
        PLAYERS = 2,
        EMPTY_TEXTURE = { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:CONST.COLORS.WHITE },
        PLAYERS_TEXTURE = [
            { image:"tombs/kesiev/images/texture.png", imageX:1, imageY:8 },
            { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:8 }
        ],
        SIDES_POSITION = [
            { x:2, y:0 },
            { x:4, y:2 },
            { x:2, y:4 },
            { x:0, y:2 },
        ],
        PLAYERS_SYMBOLS = [ "O", "X" ],
        EMPTY_SYMBOL = " ",
        COLOR_SYMBOL = CONST.COLORS.GRAY,
        MODE_RANGE = 2,
        MODES = [
            { historyLength:9 },
            { historyLength:4 },
            { historyLength:2 },
            { historyLength:1 },
            { historyLength:4, rotations:[ 1 ] },
            { historyLength:2, rotations:[ 0, 1 ] },
            { historyLength:1, rotations:[ 1, 2 ] },
            { historyLength:1, rotations:[ 1, 2, 3 ] }
        ],
        DEPTH = 6;
        
        
    function getWinner(match, board) {

        let
            score = getBoardScores(match, board, 0, 0 );

        if (score.isWin) {
            let
                cells = [];
                
            for (let i=0;i<match.winLength;i++)
                cells.push({x:score.x+score.dx*i,y:score.y+score.dy*i});
            
            return {
                isWin:true,
                player:score.winner,
                cells:cells
            }
        } else if (isBoardFull(match,board))
            return {
                isTie:true
            }
        
    }

    function getCellScores(match, board, x, y, dx, dy, player, bonus) {

        let
            ox = x,
            oy = y,
            hasWinner = -1,
            scores = [];

        for (let i=0;i<match.players;i++)
            scores[i] = 0;

        for (let i=0;i<match.winLength;i++) {
            let
                cellPlayer = board[y][x];
            if (cellPlayer !== undefined) {
                scores[cellPlayer]++;
                if (scores[cellPlayer] == match.winLength)
                    hasWinner = cellPlayer;
            }
            x+=dx;
            y+=dy;
        }

        if (scores[player] == match.winLength)
            return { isWin:true, x:ox, y:oy, dx:dx, dy:dy, winner:player, score:WIN_SCORE+bonus };
        else if (hasWinner != -1)
            return { isWin:true, x:ox, y:oy, dx:dx, dy:dy, winner:hasWinner, score:LOSE_SCORE-bonus };
        else
            return scores[player]+bonus;
    }

    function getBoardScores(match, board, player, bonus) {

        let
            score,
            allScore = 0;

        for (let y=0;y<match.boardHeight;y++) {
            for (let x=0;x<match.boardWidth-match.winLength+1;x++) {
                score = getCellScores(match, board, x, y, 1, 0, player, bonus);
                if (score.isWin) return score;
                allScore += score;
            }            
        }

        for (let y=0;y<match.boardHeight-match.winLength+1;y++) {
            for (let x=0;x<match.boardWidth;x++) {
                score = getCellScores(match, board, x, y, 0, 1, player, bonus);
                if (score.isWin) return score;
                allScore += score;
            } 
        }

        for (let y=0;y<match.boardHeight-match.winLength+1;y++) {
            for (let x=0;x<match.boardWidth-match.winLength+1;x++) {
                score = getCellScores(match, board, x, y, 1, 1, player, bonus);
                if (score.isWin) return score;
                allScore += score;
            }            
        }

        for (let y=match.winLength-1;y<match.boardHeight;y++) {
            for (let x=0;x<match.boardWidth-match.winLength+1;x++) {
                score = getCellScores(match, board, x, y, 1, -1, player, bonus);
                if (score.isWin) return score;
                allScore += score;
            }            
        }

        return { score:allScore+bonus };
    }

    function isBoardFull(match, board) {
        for (let y=0;y<match.boardHeight;y++)
            for (let x=0;x<match.boardWidth;x++)
                if (board[y][x] === undefined)
                    return false;
        return true;
    }

    function isEvaluationEnded(match, score, board, depth) {
        if ((depth == 0) || score.isWin || isBoardFull(match, board))
            return true;
        return false;
    }

    function copyBoard(board) {
        return board.map(row=>row.slice());
    }

    // New match
    function newMatch(boardWidth, boardHeight, players) {
        let
            board = [],
            hidden = [];
        for (let i=0;i<boardHeight;i++) {
            hidden.push([]);
            board.push([]);
        }
        return {
            sides:[
                [ "defaultFloorTexture", { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:8 } ],
                [ "defaultFloorTexture", { image:"tombs/kesiev/images/texture.png", imageX:3, imageY:8 } ],
                [ "defaultFloorTexture", { image:"tombs/kesiev/images/texture.png", imageX:4, imageY:8 } ],
                [ "defaultFloorTexture", { image:"tombs/kesiev/images/texture.png", imageX:5, imageY:8 } ],
            ],
            winLength:3,
            turn:0,
            players:players,
            boardWidth:boardWidth,
            boardHeight:boardHeight,
            history:[],
            board:board,
            hidden:hidden
        };
    }

    // Piece placement rules
    function placePiece(match, board, x, y, player) {
        if (board[y][x] === undefined) {
            board[y][x] = player;
            return true;
        }
        return false;
    }

    // MinMax with alpha/beta pruning and depth evaluation
    function evaluateMove(match, player, turn, board, depth, a, b) {

        let
            score = getBoardScores(match, board, player, depth),
            isMyTurn = turn == player,
            nextTurn = (turn+1)%match.players;

        if (isEvaluationEnded(match, score, board, depth))
            return score;

        let
            out = { score:(isMyTurn ? LOSE_SCORE : WIN_SCORE)+depth };

        for (let x=0;x<match.boardWidth;x++)
            for (let y=0;y<match.boardHeight;y++) {
                let
                    tmpBoard = copyBoard(board);
                if (placePiece(match, tmpBoard, x, y, turn)) {
                    let
                        nextMove;

                    nextMove = evaluateMove(match, player, nextTurn, tmpBoard, depth-1, a, b);

                    if (isMyTurn) {
                        if ((out.x === undefined) || (nextMove.score > out.score)) {
                            out.x = x;
                            out.y = y;
                            out.score = nextMove.score;
                            a = nextMove.score;
                        }
                    } else {
                        if ((out.x === undefined) || (nextMove.score < out.score)) {
                            out.x = x;
                            out.y = y;
                            out.score = nextMove.score;
                            b = nextMove.score;
                        }
                    }

                    if (a >= b) return out;

                }
            }
        
        return out;

    }

    function managePlacePiece(game, room, match, x, y, player) {
        if (placePiece(match, match.board, x, y, player)) {
            match.history.push({ x:x, y:y });
            if (match.history.length > match.mode.historyLength) {
                let
                    position = match.history.shift();
                match.hidden[position.y][position.x] = true;
            }
            return true;
        }
    }

    function rotateArray(a) {
        return a.map((v, i)=>a.map(r=>r[i]).reverse());
    }

    function manageRotate(game, room, match) {
        let
            leaveSide = match.sides.pop();

        match.sides.unshift(leaveSide);
        match.board = rotateArray(match.board);
        match.hidden = rotateArray(match.hidden);
        match.history.forEach(position=>{
            let
                t = position.x;
            position.x = match.boardHeight - position.y - 1;
            position.y = t;
        });
    }

    function renderMatch(game, room, match) {
        for (let y=0;y<match.boardHeight;y++)
            for (let x=0;x<match.boardWidth;x++) {
                let
                    cell = game.map[room.y+y+1][room.x+x+1],
                    boardCell = match.board[y][x],
                    hiddenCell = match.hidden[y][x];

                game.tools.paintMapSymbolBgColor(cell, COLOR_SYMBOL);

                if (hiddenCell || (boardCell === undefined)) {
                    game.tools.paintFloor(0, cell, game.tools.SOLID, [ EMPTY_TEXTURE ], true);
                    game.tools.paintMapSymbol(cell, EMPTY_SYMBOL);
                } else {
                    game.tools.paintFloor(0, cell, game.tools.SOLID, [
                        EMPTY_TEXTURE,
                        PLAYERS_TEXTURE[boardCell]
                    ], true);
                    game.tools.paintMapSymbol(cell, PLAYERS_SYMBOLS[boardCell]);
                }
            }

        SIDES_POSITION.forEach((side,id)=>{
            game.tools.paintFloor(0, game.map[room.y+side.y][room.x+side.x], game.tools.SOLID, match.sides[id], true);
        })
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Unwinnable Room",
        description:"The classic Tic-Tac-Toe game but the board vanishes and spins.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            { type:"audio", id:"kesiev-tic-scratch1", title:"Scratch SFX", by:[ "AntumDeluge" ], file:"tombs/kesiev/audio/sfx/scratch1" },
            { type:"audio", id:"kesiev-tic-mechanic1", title:"Mechanic click SFX", by:[ "OwlishMedia" ], file:"tombs/kesiev/audio/sfx/mechanic1" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:BOARD_WIDTH+2,
                    height:BOARD_HEIGHT+2,
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            // --- Reset the puzzle state

            rooms.forEach(room=>{

                let
                    playArea = { x:room.x+1, y:room.y+1, width:room.width-2, height:room.height-2},
                    match = newMatch(BOARD_WIDTH, BOARD_HEIGHT, PLAYERS);

                match.mode = MODES[Math.floor(room.difficulty*(MODES.length-MODE_RANGE))+room.random.integer(MODE_RANGE)];
                
                if (room.random.bool())
                    managePlacePiece(game, room, match, room.random.integer(match.boardWidth),room.random.integer(match.boardHeight), 1)

                renderMatch(game, room, match);
                game.tools.setFloorPaintable(playArea,false);
                game.tools.setElementPaintable(playArea,false);
                game.tools.setProtected(playArea, true);
                
                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

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
                            game.tools.scriptArchitectPaidQuote(game,room, ARCHITECT),
                            {
                                dialogueSay:[
                                    {
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"Anyway... It's a really simple game, right?"
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
                                text:"Don't be afraid! Make your move!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);
                
                // --- Give the "place token" card when the player enters the room

                game.tools.onEnter(room,[
                    {
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        addInventoryItem:{
                            data:{
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,                                
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
                                                rotations = 0,
                                                winner,
                                                position = game.tools.getRoomPosition(playArea);

                                            if (position) {

                                                if (managePlacePiece(game, room, match, position.roomX, position.roomY, 0)) {

                                                    result = 1;
                                                    winner = getWinner(match, match.board);

                                                    if (!winner) {
                                                        
                                                        if (match.mode.rotations) {
                                                            rotations = room.random.element(match.mode.rotations);
                                                            for (let i=0;i<rotations;i++)
                                                                manageRotate(game, room, match);
                                                        }

                                                        let
                                                            move = evaluateMove(match, 1, 1, match.board, DEPTH);

                                                        if (move.x !== undefined) {
                                                            managePlacePiece(game, room, match, move.x, move.y, 1);
                                                            winner = getWinner(match, match.board);
                                                        }
                                                    }

                                                    renderMatch(game, room, match);

                                                    if (winner) {
                                                        context.room.isSolved = true;
                                                        game.tools.removeInventoryItemsFromRoom(room);
                                                        if (winner.isWin)
                                                            result = winner.player == 0 ? 3 : 4;
                                                        else
                                                            result = 2;
                                                    }

                                                    game.tools.playAudio(rotations ? "kesiev-tic-mechanic1" : "kesiev-tic-scratch1")

                                                    game.tools.refreshScreen();

                                                } else
                                                    result = 5;
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
                                                text:"Nothing seems to be happening..."
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
                                        dialogueSay:[
                                            {
                                                audio:ARCHITECT.voiceAudio,
                                                by:ARCHITECT.layout.name,
                                                text:"It ended in a draw, as I expected! Bravo!"
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:3 }
                                        },
                                        asContext:"room",
                                        unlockRoom:true
                                    },{
                                        if:{ and:true },
                                        dialogueSay:[
                                            {
                                                audio:ARCHITECT.voiceAudio,
                                                by:ARCHITECT.layout.name,
                                                text:"You win! But how is this possible?!"
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:4 }
                                        },
                                        hitPlayer:2
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        unlockRoomItemOnly:true
                                    },{
                                        if:{ and:true },
                                        dialogueSay:[
                                            {
                                                audio:ARCHITECT.voiceAudio,
                                                by:ARCHITECT.layout.name,
                                                text:"You lose!"
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:5 }
                                        },
                                        hitPlayer:1
                                    },{
                                        if:{ and:true },
                                        dialogueSay:[
                                            {
                                                audio:ARCHITECT.voiceAudio,
                                                by:ARCHITECT.layout.name,
                                                text:"The paper hurts your fingers. Did you make an illegal move?"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Take back the "place token" card when the player exits the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);
                
            })
        }
    })
    
})();

