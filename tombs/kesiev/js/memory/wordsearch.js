(function(){

    const
        TOMB_ID = "kesiev-wordsearch",
        TOMB_TAGS = [ "tomb", "memory" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        ITEM_ID = TOMB_ID+"-marker",
        ROOM_WIDTH = 8,
        ROOM_HEIGHT = 8,
        LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        MIN_WORDSPERLENGTH = 2,
        RANGE_WORDSPERLENGTH = 3,
        MAX_ATTEMPTS = 20;

    function generateScheme(random, words, width, height) {

        let
            hints = [],
            missing = [],
            placed = [],
            result = [],
            found = [];

        for (let i = 0; i < height; i++) {
            result.push([]);
            found.push([]);
        }

        words.sort((a, b) => {
            if (a.length > b.length) return 1;
            else if (a.length < b.length) return -1;
            else return 0;
        });

        for (let i = 0; i < words.length; i++) {
            let
                attempts = 0,
                word = words[i];

            while (attempts < MAX_ATTEMPTS) {
                let
                    direction = random.integer(4),
                    bounds = getBounds(word.length, direction, width, height);

                if (bounds.x2 < 0 || bounds.y2 < 0 || bounds.y2 < bounds.y1 || bounds.x2 < bounds.x1) {
                    missing.push(words[i]);
                    break;
                }

                let
                    x = ox = random.integer(bounds.x2 - bounds.x1) + bounds.x1,
                    y = oy = random.integer(bounds.y2 - bounds.y1) + bounds.y1,
                    placeable = true,
                    count = 0;

                for (let l = 0; l < word.length; l++) {
                    let
                        char = result[y][x];

                    if (char) {
                        if (char != word[l]) {
                            placeable = false;
                            break;
                        } else
                            count++;
                    }
                    y += bounds.dy;
                    x += bounds.dx;
                }

                if (!placeable || count >= word.length) {
                    attempts++;
                    continue;
                }

                x = ox;
                y = oy;
                for (let l = 0; l < word.length; l++) {
                    result[y][x] = word[l];
                    y += bounds.dy;
                    x += bounds.dx;
                }

                hints.push({ word:words[i], x:ox, y:oy });
                placed.push(words[i]);
                break;
            }
            if (attempts >= MAX_ATTEMPTS) missing.push(words[i]);
        }

        for (let y = 0; y < height; y++)
            for (let x = 0; x < width; x++)
                if (!result[y][x])
                    result[y][x] = random.element(LETTERS);

        return {
            result: result,
            found: found,
            hints: hints,
            missing: missing,
            placed: placed
        };
    }

    function getBounds(len, direction, width, height) {
        let
            dx = dy = x1 = y1 = 0,
            x2 = width - 1,
            y2 = height - 1;
        switch (direction) {
            case 0: {
                dx = 1;
                dy = -1;
                x2 = width - len;
                y1 = len - 1;
                break;
            }
            case 1: {
                dx = 1;
                x2 = width - len;
                break;
            }
            case 2: {
                dy = 1;
                dx = 1;
                y2 = height - len;
                x2 = width - len;
                break;
            }
            case 3: {
                dy = 1;
                y2 = height - len;
                break;
            }
        }
        return {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            dx: dx,
            dy: dy
        }
    }

    function drawScheme(game, room, scheme) {
        let
            answer = "",
            marker,
            markerPos = [];

        if (room.isMarking) {
            let
                destination = game.tools.getRoomPosition(room),
                x1 = room.isMarking.roomX,
                y1 = room.isMarking.roomY,
                x2 = destination.roomX,
                y2 = destination.roomY,
                dx = x2-x1,
                dy = y2-y1,
                adx = 0, ady = 0, al = 0;

            if ((dy<0) && (dx>0) && (dx == -dy)) {
                adx = 1;
                ady = -1;
                al = dx;
            } else if ((dx>0) && (dy == 0)) {
                adx = 1;
                al = dx;
            } else if ((dx>0) && (dy>0) && (dx == dy)) {
                adx = 1;
                ady = 1;
                al = dx;
            } else if ((dx == 0) && (dy>0)) {
                ady = 1;
                al = dy;
            }
            
            marker = [];
            for (let i=0;i<scheme.result.length;i++)
                marker.push([]);

            for (let i=0;i<=al;i++) {
                markerPos.push({ x:x1, y:y1 });
                answer += scheme.result[y1][x1];
                marker[y1][x1] = true;
                x1 += adx;
                y1 += ady;
            }
        }

        for (let y=0;y<scheme.result.length;y++)
            for (let x=0;x<scheme.result[y].length;x++) {
                let
                    cell = game.map[room.y+y][room.x+x],
                    color = marker && marker[y][x] ? CONST.COLORS.CYAN : scheme.found[y][x] ? CONST.COLORS.GREEN : CONST.COLORS.WHITE;

                game.tools.paintFloor(0, cell, game.tools.SOLID, [
                    { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:color },
                    CONST.TEXTURES.FONT[scheme.result[y][x]]
                ], true);

                game.tools.paintMapSymbolBgColor(cell, color);

                if (scheme.paintMap)
                    game.tools.paintMapSymbol(cell, scheme.result[y][x]);
            }

        return {
            answer:answer,
            markerPos:markerPos
        };
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Hidden Room",
        description:"The classic Word Search game.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"data", id:"kesiev-wordsearch-data", title:"Common words list", by:[ CONST.CREDITS.UNKNOWN ], file:"tombs/kesiev/data/wordsearch/words.txt" },
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:ROOM_WIDTH,
                    height:ROOM_HEIGHT,
                    isSolved:false,
                    isMarking:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                wordsByLength = [];

            LOADER.DATA["kesiev-wordsearch-data"].split("\n").forEach(word=>{
                word = word.trim();
                if (word.length) {
                    if (!wordsByLength[word.length])
                        wordsByLength[word.length] = [];

                    wordsByLength[word.length].push(word);
                }
            });
            
            rooms.forEach((room,id)=>{

                let
                    wordsPerLength = MIN_WORDSPERLENGTH+Math.floor(room.difficulty*RANGE_WORDSPERLENGTH),
                    words = [],
                    scheme;

                wordsByLength.forEach(set=>{
                    let
                        bag = { elements:set };
                    
                    for (let i=0;i<wordsPerLength;i++)
                        words.push(room.random.bagPick(bag));
                });

                scheme =  generateScheme(room.random,words, ROOM_WIDTH, ROOM_HEIGHT);
                scheme.paintMap = room.difficulty < 0.5;
                scheme.hints.forEach(hint=>{
                    game.tools.hintAddCoordinates(room, hint.word, hint.x, hint.y);
                });

                game.tools.setFloorPaintable(room, false);

                drawScheme(game, room, scheme);

                // --- Add entrance plaques

                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Add the words list

                let
                    walkableWalls = game.tools.getWalkableWalls(room),
                    wordsListPosition = room.random.element(walkableWalls);

                game.tools.addWallDecoration(0, wordsListPosition, wordsListPosition.side, game.tools.SOLID, [
                    {  isscoreTable:true, image:"tombs/kesiev/images/texture.png", imageX:1, imageY:4 }
                ]);

                game.tools.onBumpWall(wordsListPosition.x, wordsListPosition.y, wordsListPosition.side, [
                    {
                        if:{
                            asContext:"room",
                            is:{ isSolved:true }
                        },
                        dialogueSay:[
                            { text:"There should have been a list of words but instead there is an empty table." }
                        ]
                    },{
                        if:{ and:true },
                        endScript:true
                    },{
                        run:(game, context, done)=>{
                            room.wordsLeft = scheme.placed.join(", ");
                            done(true);
                        }
                    },{
                        asContext:"room",
                        dialogueSay:[
                            { text:"There is a list of words: \"{wordsLeft}\"." }
                        ]
                    }
                ]);

                // Avoid random decorations on the table
                game.tools.setWallPaintable(wordsListPosition.x, wordsListPosition.y, wordsListPosition.side, false);

                // Protect the table area, so the architect doesn't spawn there
                game.tools.setProtected(wordsListPosition.front, true);

                // --- Give the "marker" card when the player enters the room

                game.tools.onEnter(room,[
                    {
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        addInventoryItem:{
                            data:{
                                id:ITEM_ID,
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
                                                markerItem = game.tools.getInventoryItem(ITEM_ID);
                                            if (room.isMarking) {
                                                game.tools.setInventoryItemColor(markerItem, CONST.ITEMCOLOR.ROOMITEM);
                                                room.isMarking = false;
                                            } else {
                                                game.tools.setInventoryItemColor(markerItem, CONST.COLORS.GREEN);
                                                room.isMarking = game.tools.getRoomPosition(room);
                                            }
                                            drawScheme(game, room, scheme);
                                            game.tools.refreshScreen();
                                            done(true);
                                        }  
                                    },{
                                        playAudio:{ sample:"mouseclick1" }
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Prepare the architect positions

                let
                    walkableCells = game.tools.getWalkableCells(room),
                    architectPositions = [];

                for (let i=0;i<2;i++)
                    architectPositions.push(room.random.removeElement(walkableCells));

                // --- Take back the "marker" card when the player exits the room

                game.tools.onLeave(room,[
                    {
                        run:(game, context, done)=>{
                            room.isMarking = false;
                            drawScheme(game, room, scheme);
                            game.tools.refreshScreen();
                            done(true);
                        }
                    },
                    { removeInventoryItemsFromRoom:true }
                ]);

                // --- Check the input word

                game.tools.onMove(room,[
                    {
                        run:(game, context,done)=>{
                            let
                                result = false;

                            if (room.isMarking) {
                                let
                                    marker = drawScheme(game, room, scheme),
                                    found = scheme.placed.indexOf(marker.answer);

                                if (found != -1) {
                                    let
                                        markerItem = game.tools.getInventoryItem(ITEM_ID);

                                    result = true;
                                    scheme.placed.splice(found,1);
                                    game.tools.setInventoryItemColor(markerItem, CONST.ITEMCOLOR.ROOMITEM);
                                    marker.markerPos.forEach(coord=>{
                                        scheme.found[coord.y][coord.x] = true;
                                    });
                                    room.isMarking = false;
                                    room.foundWord = marker.answer;
                                    drawScheme(game, room, scheme);

                                    if (scheme.placed.length)
                                        result = 1;
                                    else
                                        result = 2;
                                }

                                game.tools.refreshScreen();
                            }

                            done(result);
                        }
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result:1 }
                        },
                        playerGainGold:2
                    },{
                        if:{ and:true },
                        dialogueSay:[
                            {
                                text:"You found the word {foundWord}!"
                            }
                        ]
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result:2 }
                        },
                        unlockRoom:true
                    },{
                        if:{ and:true },
                        setAttribute:"isSolved",
                        toValue:true
                    },{
                        if:{ and:true },
                        removeInventoryItemsFromRoom:true
                    },{
                        if:{ and:true },
                        run:(game, context, done)=>{
                            let
                                architect;
                            architectPositions.forEach(architectPosition=>{
                                if (!architect && ((architectPosition.x != game.position.x) || (architectPosition.y != game.position.y))) {
                                    architect = game.tools.addNpc(architectPosition.x, architectPosition.y, Tools.clone(ARCHITECT.layout));
                                    game.tools.onInteract(architect,[
                                        game.tools.scriptArchitectPaidQuote(game, room, ARCHITECT),
                                        {
                                            dialogueSay:[
                                                {
                                                    audio:ARCHITECT.voiceAudio,
                                                    by:"{name}",
                                                    text:"Anyway... Sorry for the delay! I was looking for some words, but they were all here!"
                                                }
                                            ]
                                        },
                                        { movePlayerBack:true },
                                        { endScript:true }
                                    ]);
                                    game.tools.refreshScreen();
                                }
                            });
                            done();
                        }
                    }
                ]);

            })
        }
        
    })
    
})();

