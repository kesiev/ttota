(function(){

    const
        TOMB_ID = "kesiev-dice",
        TOMB_TAGS = [ "tomb", "luck" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        SYMBOL = "&#x263B;",
        SCOREBOARD_WIDTH = 4,
        SCORE_MIN = 200,
        SCORE_RANGE = 200,
        DICE_COUNT = 6,
        ATTEMPTS = 10;
            
    function remove(hand,set) {
        let
            newset = hand.set.filter(dice=>{
                let
                    pos = set.indexOf(dice);
                if (pos!=-1) {
                    set.splice(pos,1);
                    return false;
                } else
                    return true;
            });

        if (set.length)
            return false;
        else {
            hand.set = newset;
            return true;
        }   
    }

    function evaluateHand(hand) {
        let
            score = 0,
            pairs = 0,
            pairsIndex = {},
            copy = { set:hand.slice() };

        for (let i=1;i<7;i++)
            for (let j=0;j<3;j++)
                if (remove(copy,[i,i])) {
                    pairs++;
                    pairsIndex[i]=true;
                }

        if ((pairs == 3)&&(Object.keys(pairsIndex).length>1))
            score+=150;
        else
            copy.set = hand.slice();
        
        if (remove(copy,[1,2,3,4,5,6])) score+=250;

        for (let i=1;i<7;i++) {
            if (remove(copy,[i,i,i,i,i,i])) score+=300;
            if (remove(copy,[i,i,i,i,i])) score+=200;
            if (remove(copy,[i,i,i,i])) score+=100;
            if (remove(copy,[i,i,i])) score+= i == 1 ? 100 : i*10;
        }

        for (let i=0;i<6;i++) {
            if (remove(copy,[5])) score+=5;
            if (remove(copy,[1])) score+=10;
        }

        return {
            score:score,
            left:copy.set
        };
        
    }

    function updateScore(game, room) {
        let
            score = room.scoreLeft;
            
        for (let i=0;i<room.width;i++) {
            let
                digit = score % 10,
                cell = game.map[room.y+1][room.x+room.width-i-1];
            game.tools.paintFloor(0, cell, game.tools.SOLID, [
                { image:"tombs/kesiev/images/texture.png", imageX:5, imageY:1, backgroundColor:CONST.COLORS.WHITE },
                CONST.TEXTURES.FONT[digit]
            ], true);
            game.tools.paintMapSymbol(cell,digit);
            score=Math.floor(score/10);
        }
    }

    function makeDiceCard(game, room, value) {
        let
            diceCard = game.tools.addInventoryItem(room,{
                isDice:true,
                isGame:true,
                isSelected:false,
                diceValue:value,
                group:CONST.GROUP.ROOMITEM,
                color:CONST.COLORS.GRAY,
                sprite:[
                    { image:"tombs/kesiev/images/items.png", imageX:1+value, imageY:1 },
                ]
            });

        game.tools.onUse(diceCard,[
            { setInventoryItemAnimation:"bounce" },
            {
                run:(game, context, done)=>{
                    let
                        hand,
                        handScore,
                        prevIsPayDebtItemSelectable = room.isPayDebtItemSelectable,
                        prevIsNewRollItemSelectable = room.isNewRollItemSelectable;

                    context.as.isSelected = !context.as.isSelected;
                    if (context.as.isSelected)
                        room.toSelect--;
                    else
                        room.toSelect++;
                    game.tools.setInventoryItemColor(context.as, context.as.isSelected ? CONST.COLORS.GREEN : CONST.COLORS.GRAY);

                    hand = game.tools.getInventoryItemsFromRoom(room).filter(item=>item.isSelected).map(item=>item.diceValue);
                    handScore = evaluateHand(hand);

                    room.isPayDebtItemSelectable = handScore.score && (handScore.left.length==0);
                    room.isNewRollItemSelectable = room.isPayDebtItemSelectable && !!room.toSelect;

                    if (room.isPayDebtItemSelectable)
                        room.bank = room.prevBank + handScore.score;
                    else
                        room.bank = room.prevBank;

                    if (prevIsNewRollItemSelectable != room.isNewRollItemSelectable) {
                        game.tools.setInventoryItemColor(room.newRollItem, room.isNewRollItemSelectable ? CONST.COLORS.GREEN : CONST.COLORS.RED);
                        game.tools.setInventoryItemAnimation(room.newRollItem, "bounce");
                    }
                    if (prevIsPayDebtItemSelectable != room.isPayDebtItemSelectable) {
                        game.tools.setInventoryItemColor(room.payDebtItem, room.isPayDebtItemSelectable ? CONST.COLORS.GREEN : CONST.COLORS.RED);
                        game.tools.setInventoryItemAnimation(room.payDebtItem, "bounce");
                    }

                    if (room.bankItem.counter != room.bank) {
                        game.tools.setInventoryItemCounter(room.bankItem, room.bank);
                        game.tools.setInventoryItemAnimation(room.bankItem, "bounce");
                    }

                    game.tools.playAudio("mouseclick1");
                    done();
                }
            }
        ])

        return diceCard;
    }

    function clearGame(game, room) {
        game.tools.getInventoryItemsFromRoom(room).forEach(item=>{
            if (item.isGame)
                game.tools.removeInventoryItem(item);
        });
    }

    function endRound(game, room) {
        room.gameState = 0;
        room.attemptsLeft--;
        game.tools.setInventoryItemCounter(room.newRoundItem, room.attemptsLeft);
        clearGame(game, room);
        if (!room.attemptsLeft)
            room.isSolved = true;
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Debt Room",
        description:"Reach the required score playing a classic dice game.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            { type:"audio", title:"Jazz Extravaganza", by:[ "Boo and Spin Dizzy" ], id:"kesiev-poker1",mod:"tombs/kesiev/audio/music/boo_-_jazz_extravaganza.xm", isSong:true},
            { type:"audio", id:"kesiev-dice-roll1", title:"Dice Roll SFX", by:[ "Kenney" ], file:"tombs/kesiev/audio/sfx/roll1" },
            { type:"audio", id:"kesiev-dice-cash1", title:"Cash Register SFX", by:[ "Modestas123123" ], file:"tombs/kesiev/audio/sfx/cash1" },
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/items.png" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    music:"kesiev-poker1",
                    name:this.name,
                    author:this.byArchitect,
                    width:SCOREBOARD_WIDTH,
                    height:3,
                    gameState:0,
                    isSolved:false,
                    isFirstEntrance:true
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    endgameSubScript = {
                       subScript:[
                            {
                                if:{
                                    asContext:"room",
                                    is:{ isSolved:true }
                                },
                                asContext:"room",
                                unlockRoomWithAttempts:"scoreLeft",
                                ofAttempts:"startingScore"
                            },{
                                if:{ and:true },
                                asContext:"room",
                                removeInventoryItemsFromRoom:true
                            }
                        ]
                    };

                room.startingScore = room.scoreLeft = SCORE_MIN+Math.floor(room.difficulty*SCORE_RANGE);
                room.attemptsLeft = ATTEMPTS;

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Paint the room

                game.tools.setProtected({ x:room.x, y:room.y+1, width:room.width, height:1 }, true);

                game.tools.paintFloor(0, room, game.tools.CHECKERBOARD, [
                    [
                        { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.PURPLE },
                    ],[
                        { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.WHITE },
                    ]
                ]);
                updateScore(game, room);

                // --- Restore "dice" cards when the player enters the room

                game.tools.onEnter(room,[
                    {
                        if:{
                            asContext:"room",
                            is:{ isFirstEntrance:true }
                        },
                        run:(game, context, done)=>{

                            room.isFirstEntrance = false;

                            room.newRoundItem = game.tools.addInventoryItem(room,{
                                group:CONST.GROUP.ROOMITEM+4,
                                color:CONST.ITEMCOLOR.ROOMITEM,
                                model:"default",
                                counter:room.attemptsLeft,
                                sprite:[
                                    { image:"tombs/kesiev/images/items.png", imageX:1, imageY:2 },
                                ]
                            });

                            game.tools.onUse(room.newRoundItem,[
                                {
                                    if:{
                                        asContext:"room",
                                        is:{ gameState:1 }
                                    },
                                    asContext:"room",
                                    dialogueSay:[
                                        {
                                            text:"You have {attemptsLeft} round(s) left to pay your {scoreLeft}"+SYMBOL+" debt! Use your dice and rolls wisely..."
                                        }
                                    ]
                                },{
                                    if:{
                                        asContext:"room",
                                        is:{ gameState:0 }
                                    },
                                    run:(game, context, done)=>{
                                        let
                                            hand;

                                        room.gameState = 1;
                                        room.handScore = 0;
                                        room.prevBank = 0;
                                        room.bank = 0;
                                        room.isNewRollItemSelectable = false;
                                        room.isPayDebtItemSelectable = false;
                                        room.toSelect = DICE_COUNT;

                                        clearGame(game, room);

                                        do {
                                            hand = [];
                                            for (let i=0;i<DICE_COUNT;i++)
                                                hand.push(1+room.random.integer(6));
                                        } while (!evaluateHand(hand).score);

                                        hand.forEach(dice=>{
                                            makeDiceCard(game, room, dice);
                                        });

                                        game.tools.playAudio("kesiev-dice-roll1");
                                        
                                        room.newRollItem = game.tools.addInventoryItem(room,{
                                            isGame:true,
                                            group:CONST.GROUP.ROOMITEM+1,
                                            color:CONST.COLORS.RED,                                
                                            model:"default",
                                            sprite:[
                                                { image:"tombs/kesiev/images/items.png", imageX:8, imageY:1 },
                                            ]
                                        });

                                        game.tools.onUse(room.newRollItem,[
                                            {
                                                if:{
                                                    asContext:"room",
                                                    is:{ isNewRollItemSelectable:false }
                                                },
                                                dialogueSay:[
                                                    { text:"You can't reroll your unselected dice now! Select a scoring set of dice and leave some dice unselected." }
                                                ]
                                            },{
                                                if:{ else:true },
                                                run:(game, context, done)=>{
                                                    let
                                                        result = 0,
                                                        toReroll = 0,
                                                        hand = [];

                                                    room.prevBank = room.bank;
                                                    room.bank = 0;

                                                    game.tools.getInventoryItemsFromRoom(room).forEach(item=>{
                                                        if (item.isDice) {
                                                            game.tools.removeInventoryItem(item, true);
                                                            if (!item.isSelected)
                                                                toReroll++;
                                                        }
                                                    });

                                                    room.toSelect = toReroll;

                                                    for (let i=0;i<toReroll;i++)
                                                        hand.push(1+room.random.integer(6));

                                                    game.tools.playAudio("kesiev-dice-roll1");
                                                    
                                                    if (evaluateHand(hand).score) {
                                                        hand.forEach(dice=>{
                                                            makeDiceCard(game, room, dice);
                                                        });
                                                        room.isNewRollItemSelectable = false;
                                                        room.isPayDebtItemSelectable = false;
                                                        game.tools.setInventoryItemColor(room.newRollItem, CONST.COLORS.RED);
                                                        game.tools.setInventoryItemColor(room.payDebtItem, CONST.COLORS.RED);
                                                    } else {
                                                        result = 1;
                                                        endRound(game, room);
                                                    }

                                                    done(result);
                                                }
                                            },{
                                                if:{
                                                    asContext:"lastRun",
                                                    is:{ result:1 }
                                                },
                                                dialogueSay:[
                                                    {
                                                        audio:ARCHITECT.voiceAudio,
                                                        by:ARCHITECT.layout.name,
                                                        text:"Oh no! You rolled a dice set that scores no points! You've lost all your "+SYMBOL+" in bank!"
                                                    }
                                                ]
                                            },{
                                                if:{ else:true },
                                                setInventoryItemAnimation:"bounce"
                                            },
                                            endgameSubScript
                                        ]);

                                        room.payDebtItem = game.tools.addInventoryItem(room,{
                                            isGame:true,
                                            group:CONST.GROUP.ROOMITEM+2,
                                            color:CONST.COLORS.RED,                                
                                            model:"default",
                                            sprite:[
                                                { image:"tombs/kesiev/images/items.png", imageX:9, imageY:1 },
                                            ]
                                        });

                                        game.tools.onUse(room.payDebtItem,[
                                            {
                                                if:{
                                                    asContext:"room",
                                                    is:{ isPayDebtItemSelectable:false }
                                                },
                                                dialogueSay:[
                                                    { text:"You can't pay your debt now! Select a scoring set of dice first." }
                                                ]
                                            },{
                                                if:{ else:true },
                                                run:(game, context, done)=>{
                                                    room.scoreLeft-=room.bank;
                                                    if (room.scoreLeft<=0) {
                                                        room.isSolved = true;
                                                        room.scoreLeft = 0;
                                                    }
                                                    updateScore(game, room);
                                                    game.tools.refreshScreen();
                                                    endRound(game, room);
                                                    game.tools.playAudio("kesiev-dice-cash1");
                                                    done(1);
                                                }
                                            },{
                                                if:{
                                                    asContext:"lastRun",
                                                    is:{ result:1 }
                                                },
                                                asContext:"room",
                                                dialogueSay:[
                                                    {
                                                        audio:ARCHITECT.voiceAudio,
                                                        by:ARCHITECT.layout.name,
                                                        text:"You paid {bank}"+SYMBOL+" to pay off your debt!"
                                                    }
                                                ]
                                            },endgameSubScript
                                        ]);

                                        room.bankItem = game.tools.addInventoryItem(room,{
                                            isGame:true,
                                            group:CONST.GROUP.ROOMITEM+3,
                                            color:CONST.ITEMCOLOR.ROOMITEM,
                                            model:"default",
                                            counter:room.bank,
                                            sprite:[
                                                { image:"tombs/kesiev/images/items.png", imageX:0, imageY:2 },
                                            ]
                                        });

                                        game.tools.onUse(room.bankItem,[
                                            {
                                                if:{
                                                    asContext:"room",
                                                    is:{ bank:0 }
                                                },
                                                dialogueSay:[
                                                    {
                                                        text:"You have no "+SYMBOL+" in bank. Select some dice and start earning!"
                                                    }
                                                ]
                                            },{
                                                if:{ else:true },
                                                asContext:"room",
                                                dialogueSay:[
                                                    {
                                                        text:"You have {bank}"+SYMBOL+" in bank. Is it time to pay your debt or risk rolling the remaining dice to earn more?"
                                                    }
                                                ]
                                            }
                                        ]);

                                        done(true);

                                    }
                                },{
                                    if:{ and:true },
                                    setInventoryItemAnimation:"bounce"
                                }
                            ]);

                            done(true);

                        }
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

                // --- Add the scoring table

                let
                    walkableWalls = game.tools.getWalkableWalls(room),
                    scoreTablePosition = room.random.element(walkableWalls);

                game.tools.addWallDecoration(0, scoreTablePosition, scoreTablePosition.side, game.tools.SOLID, [
                    {  isscoreTable:true, image:"tombs/kesiev/images/texture.png", imageX:1, imageY:4 }
                ]);

                game.tools.onBumpWall(scoreTablePosition.x, scoreTablePosition.y, scoreTablePosition.side, [
                    {
                        dialogueSay:[
                            { text:"On this sheet there is a table that illustrates some dice combinations." },
                            { text:"Ones: 10"+SYMBOL+" each.\nFives: 5"+SYMBOL+" each." },
                            { text:"Three Ones: 100"+SYMBOL+".\nThree 2-6: 20-60"+SYMBOL+"." },
                            { text:"Four of a kind: 100"+SYMBOL+".\nFive of a kind: 200"+SYMBOL+".\nSix of a kind: 300"+SYMBOL+"." },
                            { text:"Three pairs: 150"+SYMBOL+".\nOne to Six run: 250"+SYMBOL+"." },
                        ]
                    }
                ]);

                // Avoid random decorations on the table
                game.tools.setWallPaintable(scoreTablePosition.x, scoreTablePosition.y, scoreTablePosition.side, false);

                // Protect the table area, so the architect doesn't spawn there
                game.tools.setProtected(scoreTablePosition.front, true);

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
                                if:{
                                    asContext:"room",
                                    is:{ scoreLeft:0 }
                                },
                                dialogueSay:[
                                    {
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"Anyway... You had to work hard, but in the end, you paid off everything! Well done!"
                                    }
                                ]
                            },{
                                if:{ else:true },
                                dialogueSay:[
                                    {
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"Anyway... Sometimes, no matter how hard you try, you just need a stroke of luck."
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
                                text:"Come on, roll up your sleeves! There's a debt to pay!"
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // --- Store "dice" cards when the player leaves the room

                game.tools.onLeave(room,[ { storeInventoryItemsFromRoom:true } ]);

                // --- Add hints

                let
                    hintRandom = room.random.clone(),
                    sequence = [];

                for (let i=0;i<9;i++)
                    sequence.push(1+hintRandom.integer(6));

                game.tools.hintAddSequence(room, sequence);
                
            });

        }
    })
    
})();

