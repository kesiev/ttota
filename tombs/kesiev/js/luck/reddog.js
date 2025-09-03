(function(){

    const
        TOMB_ID = "kesiev-reddog",
        TOMB_TAGS = [ "tomb", "luck" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        LIFE_TEXTURE = CONST.TEXTURES.FONT["&#x2665;"],
        ORDER = [ 
            {
                character:"2",
                value:2
            },{
                character:"3",
                value:3
            },{
                character:"4",
                value:4
            },{
                character:"5",
                value:5
            },{
                character:"6",
                value:6
            },{
                character:"7",
                value:7
            },{
                character:"8",
                value:8
            },{
                character:"9",
                value:9
            },{
                character:"T",
                value:10
            },{
                character:"J",
                value:11
            },{
                character:"Q",
                value:12
            },{
                character:"K",
                value:13
            },{
                character:"A",
                value:14
            }
        ],
        SUITS = [
            { character:"&#x2660;" },
            { character:"&#x2663;" },
            { character:"&#x2665;" },
            { character:"&#x2666;" }
        ];

    function mintDeck(random) {
        let
            deck = [];

        ORDER.forEach(order=>{
            SUITS.forEach(suit=>{
                deck.push({
                    suit:suit.character,
                    symbol:order.character,
                    value:order.value,
                    hint:order.character+suit.character
                });
            })
        })

        random.shuffle(deck);

        return deck;

    }

    function updateUi(game, room) {
        for (let i=0;i<3;i++) {

            // --- Cards

            if (room.ui.cards && room.ui.cards[i]) {
                let
                    card = room.ui.cards[i];
                game.tools.paintFloor(0, game.map[room.y+1][room.x+1+i], game.tools.SOLID, [
                    { backgroundColor:CONST.COLORS.WHITE },
                    CONST.TEXTURES.FONT[card.symbol]
                ], true);
                game.tools.paintFloor(0, game.map[room.y+2][room.x+1+i], game.tools.SOLID, [
                    { backgroundColor:CONST.COLORS.WHITE },
                    CONST.TEXTURES.FONT[card.suit]
                ], true);
            } else {
                game.tools.paintFloor(0, game.map[room.y+1][room.x+1+i], game.tools.SOLID, [
                    "defaultFloorTexture"
                ],true);
                game.tools.paintFloor(0, game.map[room.y+2][room.x+1+i], game.tools.SOLID, [
                    "defaultFloorTexture"
                ], true);
            }

            // --- Message

            if (room.ui.message && room.ui.message[i])
                game.tools.paintFloor(0, game.map[room.y+3][room.x+1+i], game.tools.SOLID, [
                    "defaultFloorTexture",
                    CONST.TEXTURES.FONT[room.ui.message[i]]
                ],true);
            else
                game.tools.paintFloor(0, game.map[room.y+3][room.x+1+i], game.tools.SOLID, [
                    "defaultFloorTexture"
                ],true);

            // --- Bet

            if (room.ui.bet && (i<room.ui.bet))
                game.tools.paintFloor(0, game.map[room.y+4][room.x+1+i], game.tools.SOLID, [
                    "defaultFloorTexture",
                    { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0 },
                    LIFE_TEXTURE
                ], true);
            else
                game.tools.paintFloor(0, game.map[room.y+4][room.x+1+i], game.tools.SOLID, [
                    "defaultFloorTexture",
                    { image:"tombs/kesiev/images/texture.png", imageX:7, imageY:0 }
                ], true);

        }

        game.tools.refreshScreen();

    }

    function run(game, room) {
        let
            result = 1;

        switch (room.gameState) {
            case 0:{ // Idle
                room.deck = mintDeck(room.random);
                room.ui = { message:["B","E","T"] };
                room.gameState++;
                break;
            }
            case 1:{ // Play
                if (room.ui.bet) {
                    let
                        card1 = room.deck.pop(),
                        card2 = room.deck.pop();

                    // --- Invert cards if not consecutive
                    if (card1.value > card2.value) {
                        let
                            t = card1;
                        card1 = card2;
                        card2 = t;
                    }

                    // --- Arrange the cards.
                    room.ui.diff = card2.value - card1.value;
                    room.ui.cards = [ card1, 0, card2 ];

                    // --- Store bet to bet again...
                    room.ui.prevBet = room.ui.bet;
                    room.ui.bet = 0;

                    switch (room.ui.diff) {
                        case 0:{
                            room.ui.message = [ "&#x2665;", "&#x2665;", "&#x2665;" ];
                            room.ui.payOut = 11;
                            break;
                        }
                        case 1:{
                            room.ui.message = [ "-", "-", "-" ];
                            room.gameState = -1;
                            break;
                        }
                        case 2:{
                            room.ui.message = [ "O", "N", "E" ];
                            room.ui.payOut = 5;
                            break;
                        }
                        case 3:{
                            room.ui.message = [ "T", "W", "O" ];
                            room.ui.payOut = 4;
                            break;
                        }
                        case 4:{
                            room.ui.message = [ "&#x25BA;", "3", "&#x25C4;" ];
                            room.ui.payOut = 2;
                            break;
                        }
                        case 12:{
                            room.ui.message = [ "1", "1", "-" ];
                            room.ui.payOut = 1;
                            break;
                        }
                        default:{
                            room.ui.message = [ "-", room.ui.diff-1, "-" ];
                            room.ui.payOut = 1;
                        }
                    }

                    room.gameState++;

                } else
                    result = 0;

                break;
            }
            case 2:{ // Bet again...?
                if (!room.ui.diff || room.ui.bet) {
                    let
                        card = room.deck.pop(),
                        victory;

                    room.ui.prevBet += room.ui.bet;
                    room.ui.cards[1] = card;

                    if (room.ui.diff)
                        victory = (card.value > room.ui.cards[0].value) && (card.value < room.ui.cards[2].value);
                    else
                        victory = card.value == room.ui.cards[0].value;

                    if (victory) {
                        game.tools.playerGainGold(room, room.ficheValue * room.ui.payOut * room.ui.prevBet);
                        game.tools.healPlayer(Math.ceil(room.ui.prevBet/2));
                        if (room.unlock)
                            result = 2;
                    } else
                        game.tools.hitPlayer(Math.ceil(room.ui.prevBet/2));

                    if (room.goldBudget <= 0)
                        room.isSolved = true;

                    room.gameState = 0;

                } else
                    result = 0;

                break;
            }
        }
        updateUi(game, room);
        return result;
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Barking Room",
        description:"The classic Red Dog luck game.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"Jazz Extravaganza", by:[ "Boo and Spin Dizzy" ], id:"kesiev-reddog1",mod:"tombs/kesiev/audio/music/boo_-_jazz_extravaganza.xm", isSong:true},
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    music:"kesiev-reddog1",
                    name:this.name,
                    author:this.byArchitect,
                    width:5,
                    height:5,
                    gameState:0,
                    isSolved:false,
                    ui:{}
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    bar = { x:room.x, y:room.y, width:room.width, height:1 },
                    betArea = { x:room.x+1, y:room.y+4, width:3, height:1 };


                room.ficheValue = Math.ceil(room.goldBudget/15);

                // --- Prepare the room

                game.tools.paintFloor(0, bar, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);

                game.tools.setFloorPaintable(room, false);
                game.tools.setElementPaintable(room, false);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Place the confirmation lever

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
                            is:{ isSolved:true }
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
                            done(run(game, room));
                        }
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result:1 }
                        },
                        wait:500
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result:2 }
                        },
                        asContext:"room",
                        unlockRoomItemOnly:true
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result:0 }
                        },
                        dialogueSay:[
                            {
                                text:"Nothing happened...?"
                            }
                        ]
                    },{
                        changeWallDecoration:{
                            area:leverPosition,
                            side:leverPosition.side,
                            id:"isLever",
                            values:{ imageX:3 }
                        },
                        refreshScreen:true
                    },{
                        if:{
                            asContext:"room",
                            is:{ isSolved:true }
                        },
                        asContext:"room",
                        removeInventoryItemsFromRoom:true
                    }
                ]);

                // Avoid random decorations on the lever
                game.tools.setWallPaintable(leverPosition.x, leverPosition.y, leverPosition.side, false);

                // Avoid to spawn the architect in front of the lever
                game.tools.setProtected(leverPosition.front, true);

                // --- Add the architect

                let
                    walkableCells = game.tools.getWalkableCells(bar),
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
                                        text:"Um... could you explain the rules of this game to me?"
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
                                text:"Oh... um. I don't remember the rules of this game anymore."
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // --- Give the "bet" card when the player enters the room

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
                                                isDone = false;
                                            switch (room.gameState) {
                                                case 1:
                                                case 2:{
                                                    let
                                                        position = game.tools.getRoomPosition(betArea);
                                                    if (position) {
                                                        room.ui.bet=position.roomX+1;
                                                        isDone = true;
                                                        updateUi(game, room);
                                                    }
                                                    break;
                                                }
                                            }
                                            done(isDone);
                                        }  
                                    },{
                                        if:{ and: true },
                                        playAudio:{ sample:"nogain1" }
                                    },{
                                        if:{ else:true },
                                        dialogueSay:[
                                            {
                                                text:"This item seems to be of no use..."
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

                // --- Add hints

                let
                    hintRandom = room.random.clone(),
                    hintDeck = mintDeck(hintRandom),
                    sequence = [];

                for (let i=0;i<3;i++)
                    sequence.push(hintDeck.pop().hint);

                game.tools.hintAddSequence(room, sequence);

                // --- Initialize the game

                run(game, room);
                
            });

        }
    })
    
})();

