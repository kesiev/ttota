(function(){

    const
        TOMB_ID = "kesiev-four",
        TOMB_TAGS = [ "tomb", "logic" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        WIN_SCORE = 10000,
        LOSE_SCORE = -10000,
        BOARD_WIDTH = 7,
        BOARD_HEIGHT = 6,
        PLAYERS = 2,
        PLAYERS_COLOR = [ CONST.COLORS.RED, CONST.COLORS.YELLOW ],
        EMPTY_COLOR = CONST.COLORS.BLACK,
        WIN_COLOR = CONST.COLORS.WHITE,
        MIN_DEPTH = 2,
        RANGE_DEPTH = 3;
    
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
            board = [];
        for (let i=0;i<boardHeight;i++)
            board.push([]);
        return {
            winLength:4,
            turn:0,
            players:players,
            boardWidth:boardWidth,
            boardHeight:boardHeight,
            board:board
        };
    }

    // Piece placement rules
    function placePiece(match, board, column, player) {
        for (let i=match.boardHeight-1;i>=0;i--)
            if (board[i][column] === undefined) {
                board[i][column] = player;
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

        for (let i=0;i<match.boardWidth;i++) {
            let
                tmpBoard = copyBoard(board);
            if (placePiece(match, tmpBoard, i, turn)) {
                let
                    nextMove;

                nextMove = evaluateMove(match, player, nextTurn, tmpBoard, depth-1, a, b);

                if (isMyTurn) {
                    if ((out.column === undefined) || (nextMove.score > out.score)) {
                        out.column = i;
                        out.score = nextMove.score;
                        a = nextMove.score;
                    }
                } else {
                    if ((out.column === undefined) || (nextMove.score < out.score)) {
                        out.column = i;
                        out.score = nextMove.score;
                        b = nextMove.score;
                    }
                }

                if (a >= b) return out;

            }
        }

        return out;

    }

    function renderMatch(game, room, match) {
        for (let y=0;y<match.boardHeight;y++) {
            for (let x=0;x<match.boardWidth;x++) {
                let
                    cell = game.map[room.y+y+1][room.x+x],
                    boardCell = match.board[y][x];
                
                game.tools.paintMapSymbol(cell, "&#x25CF;");
                game.tools.paintMapSymbolBgColor(cell, CONST.COLORS.BLUE);
                if (boardCell === undefined) {
                    game.tools.paintFloor(0, cell, game.tools.SOLID, [
                        { image:"tombs/kesiev/images/texture.png", imageX:6, imageY:7, backgroundColor:EMPTY_COLOR }
                    ], true);
                    game.tools.paintMapSymbolColor(cell, EMPTY_COLOR);
                } else {
                    game.tools.paintFloor(0, cell, game.tools.SOLID, [
                        { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:7, backgroundColor:PLAYERS_COLOR[boardCell] }
                    ], true);
                    game.tools.paintMapSymbolColor(cell, PLAYERS_COLOR[boardCell]);
                }
            }
        }
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Plastic Room",
        description:"The classic Connect puzzle game.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            { type:"audio", id:"kesiev-four-chip1", title:"Chip Lay SFX", by:[ "Kenney" ], file:"tombs/kesiev/audio/sfx/chip1" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:BOARD_WIDTH,
                    height:BOARD_HEIGHT+1,
                    isSolved:false,
                    score:0,
                    maxScore:Math.floor(BOARD_WIDTH*BOARD_HEIGHT/3)
                }
            ];
        },

        renderRooms:function(game, rooms) {

            // --- Reset the puzzle state

            rooms.forEach(room=>{

                let
                    playArea = { x:room.x, y:room.y+1, width:room.width, height:room.height-1},
                    architectArea = { x:room.x, y:room.y, width:room.width, height:1 },
                    depth = MIN_DEPTH+Math.floor(room.difficulty*RANGE_DEPTH),
                    match = newMatch(BOARD_WIDTH, BOARD_HEIGHT, PLAYERS);

                if (room.random.bool())
                    placePiece(match, match.board, room.random.integer(match.boardWidth), 1);

                renderMatch(game, room, match);
                game.tools.paintFloor(0, architectArea, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Add the architect

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
                                        text:"Anyway... It was an exciting challenge! Thanks!"
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
                                text:"Go ahead! Make your move!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);
                
                // --- Give the "move cell" card when the player enters the room

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
                                                winner,
                                                position = game.tools.getRoomPosition(playArea);

                                            if (position) {

                                                if (placePiece(match, match.board, position.roomX, 0)) {

                                                    room.score++;
                                                    result = 1;
                                                    winner = getWinner(match, match.board);

                                                    if (!winner) {
                                                        let
                                                            move = evaluateMove(match, 1, 1, match.board, depth);
                                                        if (move.column !== undefined) {
                                                            placePiece(match, match.board, move.column, 1);
                                                            winner = getWinner(match, match.board);
                                                        }
                                                    }

                                                    renderMatch(game, room, match);

                                                    if (winner) {
                                                        context.room.isSolved = true;
                                                        game.tools.removeInventoryItemsFromRoom(room);
                                                        if (winner.isWin) {
                                                            result = winner.player == 0 ? 3 : 4;
                                                            winner.cells.forEach(coord=>{
                                                                let
                                                                    cell = game.map[room.y+coord.y+1][room.x+coord.x];
                                                                game.tools.paintFloor(0, cell, game.tools.SOLID, [
                                                                    { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:7, backgroundColor:WIN_COLOR }
                                                                ], true);
                                                                game.tools.paintMapSymbolColor(cell, WIN_COLOR);
                                                            })
                                                        } else
                                                            result = 2;
                                                    }

                                                    game.tools.refreshScreen();
                                                }

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
                                            is:{ result:1 }
                                        },
                                        playAudio:{ sample:"kesiev-four-chip1" }
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
                                                text:"It ended in a draw!"
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
                                                text:"You win! Great game!"
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:4 }
                                        },
                                        asContext:"room",
                                        unlockRoomWithScore:"score",
                                        ofScore:"maxScore"
                                    },{
                                        if:{ and:true },
                                        dialogueSay:[
                                            {
                                                audio:ARCHITECT.voiceAudio,
                                                by:ARCHITECT.layout.name,
                                                text:"You lose!"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Take back the "move cell" card when the player exits the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);
                
            })
        }
    })
    
})();

