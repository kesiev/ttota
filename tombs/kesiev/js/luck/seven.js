(function(){

    const
        TOMB_ID = "kesiev-seven",
        TOMB_TAGS = [ "tomb", "luck" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        TEXTURE_SELECTED = { backgroundColor:CONST.COLORS.GREEN },
        TEXTURE_SELECTABLE = { backgroundColor:CONST.ITEMCOLOR.ROOMITEM },
        GRID_WIDTH = 5,
        GRID_HEIGHT = 10,
        TOTAL_MATCH = 7,
        REROLLS = 5,
        HAND_SIZE = 2,
        BOTTOM_ROWS = 1,
        MIN_COMPLETION = 0.2,
        RANGE_COMPLETION = 0.4;

    function drawDie(game, room, match, x, y) {
        let
            value = match.grid[y][x];
            cell = game.map[room.y+y][room.x+x],
            isSelected = match.selectedGrid[y][x],
            isSelectable = y >= room.height-BOTTOM_ROWS;

        if (value) {
            game.tools.paintMapSymbol(cell, value);
            game.tools.paintMapSymbolBgColor(cell, isSelected ? TEXTURE_SELECTED.backgroundColor : isSelectable ? TEXTURE_SELECTABLE.backgroundColor : CONST.COLORS.TRANSPARENT);
            game.tools.paintFloor(0, cell, game.tools.SOLID, [
                isSelected ? TEXTURE_SELECTED : isSelectable ? TEXTURE_SELECTABLE : "defaultFloorTexture",
                { image:"tombs/kesiev/images/texture.png", imageX:1+value, imageY:9 }
            ], true);
        } else {
            game.tools.paintMapSymbol(cell, CONST.MAPSYMBOLS.FLOR);
            game.tools.paintMapSymbolBgColor(cell, CONST.COLORS.TRANSPARENT);
            game.tools.paintFloor(0, cell, game.tools.SOLID, [
                isSelectable ? TEXTURE_SELECTABLE : "defaultFloorTexture"
            ], true);
        }
        
    }

    function checkMatch(game, room, match) {
        let
            isGridDropped = false;

        if (match.selectedTotal == TOTAL_MATCH) {
            let
                isGridSelected = false;

            for (let y=0;y<room.height;y++)
                for (let x=0;x<room.width;x++) {
                    if (match.selectedGrid[y][x]) {
                        for (let y1=y;y1>0;y1--)
                            match.grid[y1][x] = match.grid[y1-1][x];
                        match.grid[0][x] = 0;
                        isGridSelected = true;
                        match.selectedGrid[y][x] = 0;
                        room.score++;
                    }
                }

            if (isGridSelected) {
                isGridDropped = true;
                drawMatch(game, room, match);
                game.tools.playAudio("kesiev-seven-roll1");
            }

            game.tools.getInventoryItemsFromRoom(room).forEach(item=>{
                if (item.isSelected) {
                    game.tools.removeInventoryItem(item, true);
                    game.tools.addInventoryItem(room,{
                        isEmpty:true,
                        group:CONST.GROUP.ROOMITEM+1,
                        color:CONST.COLORS.GRAY
                    }, null, true);
                }
            });

            match.selectedTotal = 0;

        }

        return isGridDropped;
    }

    function makeDiceCard(game, room, match, value) {
        let
            diceCard = game.tools.addInventoryItem(room,{
                isDice:true,
                isSelected:false,
                diceValue:value,
                group:CONST.GROUP.ROOMITEM,
                color:CONST.ITEMCOLOR.ROOMITEM,
                sprite:[
                    { image:"tombs/kesiev/images/items.png", imageX:1+value, imageY:1 },
                ]
            });

        game.tools.onUse(diceCard,[
            { setInventoryItemAnimation:"bounce" },
            {
                run:(game, context, done)=>{
                    context.as.isSelected = !context.as.isSelected;
                    if (context.as.isSelected)
                        match.selectedTotal+=value;
                    else
                        match.selectedTotal-=value;

                    game.tools.setInventoryItemColor(context.as, context.as.isSelected ? CONST.COLORS.GREEN : CONST.ITEMCOLOR.ROOMITEM);
                    game.tools.playAudio("mouseclick1");
                    checkMatch(game, room, match);
                    done();
                }
            }
        ])

        return diceCard;
    }


    function drawMatch(game, room, match) {
        for (let y=0;y<room.height;y++)
            for (let x=0;x<room.width;x++)
                drawDie(game, room, match, x, y);
        game.tools.refreshScreen();
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Seven Room",
        description:"Clear the dice by creating groups of dice that add up to 7, using the top row and the dice in your hand.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            { type:"audio", id:"kesiev-seven-roll1", title:"Dice Roll SFX", by:[ "Kenney" ], file:"tombs/kesiev/audio/sfx/roll1" },
            { type:"audio", title:"Jazz Extravaganza", by:[ "Boo and Spin Dizzy" ], id:"kesiev-seven1",mod:"tombs/kesiev/audio/music/boo_-_jazz_extravaganza.xm", isSong:true},
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/items.png" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    music:"kesiev-seven1",
                    name:this.name,
                    author:this.byArchitect,
                    width:GRID_WIDTH,
                    height:GRID_HEIGHT,
                    isSolved:false,
                    isFirstEntrance:true,
                    score:0,
                    maxScore:0
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    match = {
                        rerolls:REROLLS,
                        selectedTotal:0,
                        selectedGrid:[],
                        grid:[]
                    };

                for (let y=0;y<room.height;y++) {
                    let
                        row = [];
                    match.grid.push(row);
                    match.selectedGrid.push([]);

                    for (let x=0;x<room.width;x++)
                        row.push(1+room.random.integer(6));

                }

                room.maxScore = Math.floor((GRID_WIDTH * GRID_HEIGHT * (MIN_COMPLETION+room.difficulty*RANGE_COMPLETION)));

                game.tools.setElementPaintable(room, false);
                game.tools.setFloorPaintable(room, false);
                drawMatch(game, room, match);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Prepare the architect positions

                let
                    walkableCells = game.tools.getWalkableCells(room),
                    architectPositions = [];

                for (let i=0;i<2;i++) {
                    let
                        position = room.random.removeElement(walkableCells);
                    architectPositions.push(position);
                    game.tools.setProtected(position, true);
                }

                // --- Restore the "dice and select cell" cards when the player enters the room.

                game.tools.onEnter(room,[
                    {
                        if:{
                            asContext:"room",
                            is:{ isFirstEntrance:true }
                        },
                        run:(game, context, done)=>{
                            let
                                newRollItem,
                                selectCellItem;

                            for (let i=0;i<HAND_SIZE;i++)
                                makeDiceCard(game, room, match, 1+room.random.integer(6));

                            newRollItem = game.tools.addInventoryItem(room,{
                                group:CONST.GROUP.ROOMITEM+2,
                                color:CONST.ITEMCOLOR.ROOMITEM,                                
                                model:"default",
                                counter:match.rerolls,
                                sprite:[
                                    { image:"tombs/kesiev/images/items.png", imageX:8, imageY:1 },
                                ]
                            });
                            
                            game.tools.onUse(newRollItem,[
                                { setInventoryItemAnimation:"bounce" },
                                {
                                    run:(game, context, done)=>{
                                        let
                                            rerolls = 0,
                                            emptySlots = [],
                                            filledSlots = [];

                                        if (match.rerolls) {

                                            match.rerolls--;
                                            game.tools.setInventoryItemCounter(context.as, match.rerolls);

                                            game.tools.getInventoryItemsFromRoom(room).forEach(item=>{
                                                if (item.isDice)
                                                    filledSlots.push(item);
                                                else if (item.isEmpty)
                                                    emptySlots.push(item);
                                            });

                                            if (emptySlots.length) {
                                                // Reroll empty slots
                                                rerolls = emptySlots.length;
                                                emptySlots.forEach(die=>{
                                                    game.tools.removeInventoryItem(die, true);
                                                });

                                            } else {
                                                // Reroll all dice
                                                rerolls = filledSlots.length;
                                                filledSlots.forEach(die=>{
                                                    if (die.isSelected)
                                                        match.selectedTotal-=die.diceValue;
                                                    game.tools.removeInventoryItem(die, true);
                                                });
                                            }

                                            for (let i=0;i<rerolls;i++)
                                                makeDiceCard(game, room, match, 1+room.random.integer(6));

                                            game.tools.playAudio("kesiev-seven-roll1");

                                            done(true);

                                        } else
                                            done(false);
                                    }
                                },{
                                    if:{ else:true },
                                    asContext:"room",
                                    unlockRoomWithScore:"score",
                                    ofScore:"maxScore"
                                },{
                                    if:{ else:true },
                                    asContext:"room",
                                    removeInventoryItemsFromRoom:true
                                },{
                                    if:{ else:true },
                                    run:(game, context, done)=>{
                                        let
                                            architect;
                                        architectPositions.forEach(architectPosition=>{
                                            if (!architect && ((architectPosition.x != game.position.x) || (architectPosition.y != game.position.y))) {
                                                architect = game.tools.addNpc(architectPosition.x, architectPosition.y, Tools.clone(ARCHITECT.layout));
                                                game.tools.onInteract(architect,[
                                                    game.tools.scriptArchitectPaidQuote(game,room, ARCHITECT),
                                                    {
                                                        dialogueSay:[
                                                            {
                                                                audio:ARCHITECT.voiceAudio,
                                                                by:"{name}",
                                                                text:"Anyway... Thanks for picking up some of my dropped dice!"
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

                            selectCellItem = game.tools.addInventoryItem(room,{
                                group:CONST.GROUP.ROOMITEM+3,
                                color:CONST.ITEMCOLOR.ROOMITEM,                                
                                model:"default",
                                image:"push"
                            });

                            game.tools.onUse(selectCellItem,[
                                { setInventoryItemAnimation:"bounce" },
                                {
                                    run:(game, context, done)=>{
                                        let
                                            position = game.tools.getRoomPosition(room);

                                        if (position && (position.roomY >= room.height-BOTTOM_ROWS)) {
                                            let
                                                value = match.grid[position.roomY][position.roomX];

                                            if (value) {
                                                match.selectedGrid[position.roomY][position.roomX] = !match.selectedGrid[position.roomY][position.roomX];
                                                if (match.selectedGrid[position.roomY][position.roomX])
                                                    match.selectedTotal += value;
                                                else
                                                    match.selectedTotal -= value;

                                                if (!checkMatch(game, room, match)) {
                                                    drawDie(game, room, match, position.roomX, position.roomY);
                                                    game.tools.refreshScreen();
                                                    game.tools.playAudio("mouseclick1");
                                                }
                                                done(true);

                                            } else
                                                done(false);
                                        } else
                                            done(false);

                                    }
                                },{
                                    if:{ else:true },
                                    dialogueSay:[     
                                        {
                                            text:"Nothing happens..."
                                        }
                                    ]
                                }
                            ]);

                            done(true);
                        }
                    },{
                        if:{ and:true },
                        setAttribute:"isFirstEntrance",
                        toValue:false
                    },{
                        if:{ and:true },
                        endScript:true
                    },{
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
                        restoreInventoryItemsFromRoom:true
                    }
                ]);

                // --- Store the "dice and select cell" cards when the player leaves the room

                game.tools.onLeave(room,[ { storeInventoryItemsFromRoom:true } ]);

            });

        }
    })
    
})();

