(function(){

    const
        TOMB_ID = "kesiev-samegame",
        TOMB_TAGS = [ "tomb", "logic" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        ROOM_WIDTH = 5,
        ROOM_HEIGHT = 5,
        EMPTY_COLOR = { backgroundColor:CONST.COLORS.GRAY };
        COLORS = [ {
            image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0,
            backgroundColor:CONST.COLORS.RED
        }, {
            image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0,
            backgroundColor:CONST.COLORS.GREEN
        }, {
            image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0,
            backgroundColor:CONST.COLORS.BLUE
        } ];

    function generateMatch(random, w, h, nc) {

        let
            isFailed = false,
            grid = Array(h * w),
            wh = w * h,
            tc = nc + 1,
            i, j, k, c, x, y, pos, n,
            list = Array(wh + w),
            grid2 = Array(wh),
            ok,
            failures = 0;

        do {

            for (i = 0; i < wh; i++)
                grid[i] = 0;
            j = 2 + (wh % 2);
            c = 1 + random.integer(nc);
            if (j <= w) {
                for (i = 0; i < j; i++)
                    grid[(h - 1) * w + i] = c;
            } else {
                for (i = 0; i < j; i++)
                    grid[(h - 1 - i) * w] = c;
            }

            while (1) {
                n = 0;

                if (!grid[wh - 1]) {

                    for (i = 0; i < w; i++) {
                        list[n++] = wh + i;
                        if (!grid[(h - 1) * w + i])
                            break;
                    }
                }

                for (i = 0; i < w; i++) {
                    if (!grid[(h - 1) * w + i])
                        break;

                    if (grid[i] != 0)
                        continue;

                    for (j = h; j-- > 0;) {
                        list[n++] = j * w + i;
                        if (!grid[j * w + i])
                            break;
                    }
                }

                if (!n)
                    break;

                while (n-- > 0) {
                    let
                        dirs = Array(4),
                        ndirs, dir;

                    i = random.integer(n + 1);
                    pos = list[i];
                    list[i] = list[n];

                    x = pos % w;
                    y = Math.floor(pos / w);

                    grid2 = [...grid];

                    if (y == h) {

                        for (i = w - 1; i > x; i--)
                            for (j = 0; j < h; j++)
                                grid2[j * w + i] = grid2[j * w + (i - 1)];

                        for (j = 0; j < h; j++)
                            grid2[j * w + x] = 0;

                        y--;
                    }

                    for (i = 0; i + 1 <= y; i++)
                        grid2[i * w + x] = grid2[(i + 1) * w + x];

                    let
                        wrongcol = Array(4),
                        nwrong = 0;

                    if (x > 0)
                        wrongcol[nwrong++] = grid2[y * w + (x - 1)];
                    if (x + 1 < w)
                        wrongcol[nwrong++] = grid2[y * w + (x + 1)];
                    if (y > 0)
                        wrongcol[nwrong++] = grid2[(y - 1) * w + x];
                    if (y + 1 < h)
                        wrongcol[nwrong++] = grid2[(y + 1) * w + x];

                    for (i = j = 0;; i++) {
                        let
                            pos = -1,
                            min = 0;
                        if (j > 0)
                            min = wrongcol[j - 1];
                        for (k = i; k < nwrong; k++)
                            if (wrongcol[k] > min &&
                                (pos == -1 || wrongcol[k] < wrongcol[pos]))
                                pos = k;
                        if (pos >= 0) {
                            let
                                v = wrongcol[pos];
                            wrongcol[pos] = wrongcol[j];
                            wrongcol[j++] = v;
                        } else
                            break;
                    }
                    nwrong = j;

                    if (nwrong == nc)
                        continue;

                    c = 1 + random.integer(nc - nwrong);
                    for (i = 0; i < nwrong; i++) {
                        if (c >= wrongcol[i])
                            c++;
                        else
                            break;
                    }

                    grid2[y * w + x] = tc;

                    ndirs = 0;
                    if (x > 0 &&
                        grid2[y * w + (x - 1)] != c &&
                        !grid2[x - 1] &&
                        (y + 1 >= h || grid2[(y + 1) * w + (x - 1)] != c) &&
                        (y + 1 >= h || grid2[(y + 1) * w + (x - 1)] != 0) &&
                        (x <= 1 || grid2[y * w + (x - 2)] != c))
                        dirs[ndirs++] = -1;
                    if (x + 1 < w &&
                        grid2[y * w + (x + 1)] != c &&
                        !grid2[x + 1] &&
                        (y + 1 >= h || grid2[(y + 1) * w + (x + 1)] != c) &&
                        (y + 1 >= h || grid2[(y + 1) * w + (x + 1)] != 0) &&
                        (x + 2 >= w || grid2[y * w + (x + 2)] != c))
                        dirs[ndirs++] = +1;
                    if (y > 0 &&
                        !grid2[x] &&
                        (x <= 0 || grid2[(y - 1) * w + (x - 1)] != c) &&
                        (x + 1 >= w || grid2[(y - 1) * w + (x + 1)] != c)) {

                        dirs[ndirs++] = 0;
                        dirs[ndirs++] = 0;
                    }

                    if (!ndirs)
                        continue;

                    dir = dirs[random.integer(ndirs)];

                    for (i = 0; i + 1 <= y; i++)
                        grid2[i * w + x + dir] = grid2[(i + 1) * w + x + dir];
                    grid2[y * w + x + dir] = tc;

                    let
                        nerrs = 0,
                        nfix = 0;
                    k = 0;
                    for (i = 0; i < w; i++) {
                        if (!grid2[(h - 1) * w + i]) {
                            if (h % 2)
                                nfix++;
                            continue;
                        }
                        for (j = 0; j < h && !grid2[j * w + i]; j++);
                        if (!j) {

                            if (k % 2)
                                nerrs++;
                            k = 0;
                        } else {
                            k += j;
                        }
                    }
                    if (k % 2)
                        nerrs++;
                    if (nerrs > nfix)
                        continue;

                    let
                        x1, x2, y1, y2,
                        ok = true,
                        fillstart = -1,
                        ntc = 0;

                    for (x1 = x2 = 0; x2 < w; x2++) {
                        let
                            usedcol = false;

                        for (y1 = y2 = h - 1; y2 >= 0; y2--) {
                            if (grid2[y2 * w + x2] == tc) {
                                ntc++;
                                if (fillstart == -1)
                                    fillstart = y2 * w + x2;
                                if ((y2 + 1 < h && grid2[(y2 + 1) * w + x2] == c) ||
                                    (y2 - 1 >= 0 && grid2[(y2 - 1) * w + x2] == c) ||
                                    (x2 + 1 < w && grid2[y2 * w + x2 + 1] == c) ||
                                    (x2 - 1 >= 0 && grid2[y2 * w + x2 - 1] == c)) {
                                    ok = false;
                                }
                                continue;
                            }
                            if (!grid2[y2 * w + x2])
                                break;
                            usedcol = true;
                            if (grid2[y2 * w + x2] != grid[y1 * w + x1]) {
                                ok = false;
                            }
                            y1--;
                        }

                        if (usedcol) {
                            while (y1 >= 0) {
                                if (grid[y1 * w + x1] != 0) {
                                    ok = false;
                                }
                                y1--;
                            }
                        }

                        if (!ok)
                            break;

                        if (usedcol)
                            x1++;

                        i = j = 0;
                        list[i++] = fillstart;
                        while (j < i) {
                            k = list[j];
                            x = k % w;
                            y = Math.floor(k / w);
                            j++;

                            grid2[k] = c;

                            if (x > 0 && grid2[k - 1] == tc)
                                list[i++] = k - 1;
                            if (x + 1 < w && grid2[k + 1] == tc)
                                list[i++] = k + 1;
                            if (y > 0 && grid2[k - w] == tc)
                                list[i++] = k - w;
                            if (y + 1 < h && grid2[k + w] == tc)
                                list[i++] = k + w;
                        }
                    }

                    grid = [...grid2];
                    break;
                }

                if (n < 0)
                    break;
            }

            ok = true;
            for (i = 0; i < wh; i++)
                if (!grid[i]) {
                    ok = false;
                    failures++;
                    break;
                }

            /*
            if (failures > 100) {
                isFailed = true;
                break;
            }
            */

        } while (!ok);

        return {
            isFailed: isFailed,
            grid: grid,
            width: w,
            height: h
        };
    }

    function setCellAt(match, x, y, value) {
        return match.grid[y * match.width + x] = value;
    }

    function getCellAt(match, x, y) {
        if ((x > -1) && (x < match.width) && (y > -1) && (y < match.height))
            return match.grid[y * match.width + x];
        else
            return 0;
    }

    function floodFill(match, x, y, selected) {
        if (!selected) {
            selected = {
                count: 0,
                area: []
            };
            for (let i = 0; i < match.height; i++)
                selected.area.push([]);
        }

        if (!selected.area[y][x]) {

            selected.count++;
            selected.area[y][x] = true;

            let
                color = getCellAt(match, x, y);

            if (getCellAt(match, x + 1, y) == color)
                floodFill(match, x + 1, y, selected);

            if (getCellAt(match, x - 1, y) == color)
                floodFill(match, x - 1, y, selected);

            if (getCellAt(match, x, y + 1) == color)
                floodFill(match, x, y + 1, selected);

            if (getCellAt(match, x, y - 1) == color)
                floodFill(match, x, y - 1, selected);

        }

        return selected;
    }

    function remove(game, room, match, x, y) {
        let
            lostPoints = 0,
            isLost = true,
            isWon = true,
            isDone = false,
            selected;


        if (getCellAt(match, x, y)) {

            selected = floodFill(match, x, y);

            if (selected.count > 1) {

                isDone = true;

                for (let y = 0; y < match.height; y++)
                    for (let x = 0; x < match.width; x++) {
                        if (selected.area[y][x]) {
                            for (let y1 = y; y1 > 0; y1--)
                                setCellAt(match, x, y1, getCellAt(match, x, y1 - 1));
                            setCellAt(match, x, 0, 0);
                        }
                    }

                for (let x = 0; x < match.width; x++) {
                    let
                        isColumnEmpty = true;
                    for (let y = 0; y < match.height; y++)
                        isColumnEmpty &= getCellAt(match, x, y) == 0;
                    if (isColumnEmpty) {
                        let
                            isMoved = false;
                        for (let y1 = 0; y1 < match.height; y1++) {
                            for (let x1 = x; x1 < match.width; x1++) {
                                let
                                    cell = getCellAt(match, x1 + 1, y1);
                                setCellAt(match, x1, y1, cell);
                                if (cell)
                                    isMoved = true;
                            }
                            setCellAt(match, match.width - 1, y1, 0);
                        }
                        if (isMoved)
                            x--;
                        else
                            break;
                    }
                }
            }

            for (let y = 0; y < match.height; y++)
                for (let x = 0; x < match.width; x++) {
                    if (getCellAt(match, x, y)) {
                        isWon = false;
                        if (floodFill(match, x, y).count > 1)
                            isLost = false;
                        else
                            lostPoints++;
                    }
                }

            drawMatch(game, room, match);

        }

        return {
            isDone:isDone,
            isWon:isWon,
            isLost:isLost,
            lostPoints:lostPoints
        }
    }

    function drawMatch(game, room, match) {
        for (let y = 0; y < match.height; y++)
            for (let x = 0; x < match.width; x++) {
                let
                    cell = game.map[room.y+y][room.x+x],
                    color = getCellAt(match, x, y),
                    texture = color ? COLORS[color-1] : EMPTY_COLOR;

                game.tools.paintFloor(0, cell, game.tools.SOLID, texture, true);

                if (room.paintMap)
                    game.tools.paintMapSymbolBgColor(cell, texture.backgroundColor);
            }
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Renovation Room",
        description:"The classic Samegame puzzle game.",
        byArchitect:ARCHITECT.layout.name,

        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"Architect KesieV's tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
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
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    match = generateMatch(room.random, ROOM_WIDTH, ROOM_HEIGHT, COLORS.length);

                room.paintMap = room.difficulty < 0.5;

                game.tools.setFloorPaintable(room, false);
                game.tools.setElementPaintable(room, false);
                drawMatch(game, room, match);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Prepare the architect positions

                let
                    walkableCells = game.tools.getWalkableCells(room),
                    architectPositions = [];

                for (let i=0;i<2;i++)
                    architectPositions.push(room.random.removeElement(walkableCells));
                
                // --- Give the "activate cell" card when the player enters the room

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
                                                position = game.tools.getRoomPosition(room),
                                                removed = remove(game, room, match, position.roomX, position.roomY);

                                            if (removed.isDone) {
                                                if (removed.isWon) {
                                                    context.room.isSolved = true;
                                                    result = 2;
                                                } else if (removed.isLost) {
                                                    context.room.isSolved = true;
                                                    game.tools.hitPlayer(removed.lostPoints);
                                                    result = 3;
                                                } else
                                                    result = 1;
                                            }

                                            if (context.room.isSolved) {
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
                                                                        text:"Anyway... I was looking for a way to remove these tiles... but you took care of it! Thanks!"
                                                                    }
                                                                ]
                                                            },
                                                            { movePlayerBack:true },
                                                            { endScript:true }
                                                        ]);
                                                        game.tools.refreshScreen();
                                                    }
                                                });

                                                game.tools.removeInventoryItemsFromRoom(room);
                                            }

                                            drawMatch(game, room, match);
                                            game.tools.refreshScreen();

                                            done(result);
                                        }  
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:0 }
                                        },
                                        dialogueSay:[     
                                            {
                                                text:"Nothing happens..."
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:1 }
                                        },
                                        asContext:"room",
                                        playerGainGold:2
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:2 }
                                        },
                                        asContext:"room",
                                        unlockRoom:true
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:3 }
                                        },
                                        asContext:"room",
                                        unlockRoomItemOnly:true
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

