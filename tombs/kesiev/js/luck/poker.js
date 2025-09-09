(function(){

    const
        TOMB_ID = "kesiev-poker",
        TOMB_TAGS = [ "tomb", "luck" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        ORDER = [ "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A" ],
        SUITS = [
            { id:"S", character:"&#x2660;", htmlCharacter:"&#x2660;" },
            { id:"C", character:"&#x2663;", htmlCharacter:"&#x2663;" },
            { id:"H", character:"&#x2665;", htmlCharacter:"<span style='color:"+CONST.COLORS.RED+"'>&#x2665;</span>" },
            { id:"D", character:"&#x2666;", htmlCharacter:"<span style='color:"+CONST.COLORS.RED+"'>&#x2666;</span>" }
        ],
        RANKS = [
            0,
            { rank:"Royal Flush", payout:10 },
            { rank:"Straight Flush", payout:9 },
            { rank:"Four of Kind", payout:8 },
            { rank:"Full House", payout:7 },
            { rank:"Flush", payout:6 },
            { rank:"Straight", payout:5 },
            { rank:"Three of Kind", payout:4 },
            { rank:"Two Pairs", payout:3 },
            { rank:"One Pair", payout:2 },
            { rank:"High Hand", payout:1 },
        ];

    function count(c, a) {
        c[a] = (c[a] || 0) + 1;
        return c;
    }

    function evaluateHand(cards) {
        let
            faces = cards.map(a => String.fromCharCode([77 - ORDER.indexOf(a[0])])).sort(),
            suits = cards.map(a => a[1]).sort(),
            counts = faces.reduce(count, {}),
            duplicates = Object.values(counts).reduce(count, {}),
            flush = suits[0] === suits[4],
            first = faces[0].charCodeAt(0),
            lowStraight = faces.join("") === "AJKLM",
            straight,
            rank;

        faces[0] = lowStraight ? "N" : faces[0]
        straight = lowStraight || faces.every((f, index) => f.charCodeAt(0) - first === index);

        rank =
            (lowStraight && 1) ||
            (flush && straight && 2) ||
            (duplicates[4] && 3) ||
            (duplicates[3] && duplicates[2] && 4) ||
            (flush && 5) ||
            (straight && 6) ||
            (duplicates[3] && 7) ||
            (duplicates[2] > 1 && 8) ||
            (duplicates[2] && 9) ||
            10

        return RANKS[rank];
    }

    function mintDeck(random) {
        let
            deck = [];

        ORDER.forEach(value=>{
            SUITS.forEach(suit=>{
                deck.push({
                    isFlipped:false,
                    group:CONST.GROUP.ROOMITEM,
                    color:CONST.ITEMCOLOR.ROOMITEM,
                    counter:(value == "T" ? 10 : value)+suit.htmlCharacter,
                    model:"default",
                    character:suit.character,
                    code:value+suit.id,
                    hint:(value == "T" ? 10 : value)+suit.character
                });
            })
        })

        random.shuffle(deck);

        return deck;

    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Dealer Room",
        description:"The classic Poker game.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"Jazz Extravaganza", by:[ "Boo and Spin Dizzy" ], id:"kesiev-poker1",mod:"tombs/kesiev/audio/music/boo_-_jazz_extravaganza.xm", isSong:true},
            { type:"audio", id:"kesiev-poker-carddeal1", title:"Card Deal SFX", by:[ "Kenney" ], file:"tombs/kesiev/audio/sfx/carddeal1" },
            { type:"audio", id:"kesiev-poker-cardshuffle1", title:"Cards Shuffle SFX", by:[ "Signature Sounds" ], file:"tombs/kesiev/audio/sfx/cardshuffle1" },
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    music:"kesiev-poker1",
                    name:this.name,
                    author:this.byArchitect,
                    width:3,
                    height:3,
                    gameState:0,
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    ficheValue = Math.ceil(room.goldBudget/20);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Paint the room

                game.tools.paintFloor(0, room, game.tools.CHECKERBOARD, [
                    [
                        { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.RED },
                    ],[
                        { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.WHITE },
                    ]
                ]);

                // --- Add the architect

                let
                    architect = game.tools.addNpc(room.x+1, room.y+1, Tools.clone(ARCHITECT.layout));

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
                                        text:"Well. It was a great game!"
                                    }
                                ]
                            },
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        // --- New game
                        if:{
                            asContext:"room",
                            is:{ gameState:0 }
                        },
                        playAudio:{ sample:"kesiev-poker-cardshuffle1" }
                    },{
                       if:{ and:true },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Here, take it!"
                            }
                        ]
                    },{
                        if:{ and:true },
                        run:(game, context, done)=>{
                            game.tools.removeInventoryItemsFromRoom(room, true);

                            room.deck = mintDeck(room.random);
                            room.gameState = 1;
                            for (let i=0;i<5;i++) {
                                let
                                    card = game.tools.addInventoryItem(room, room.deck.pop());

                                game.tools.onUse(card,[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        if:{
                                            is:{ isPlayed:true }
                                        },
                                        endScript:true
                                    },{
                                        run:(game, context, done)=>{
                                            context.as.isFlipped = !context.as.isFlipped;
                                            game.tools.setInventoryItemColor(context.as, context.as.isFlipped ? CONST.COLORS.GRAY : CONST.ITEMCOLOR.ROOMITEM);
                                            done(true);
                                        }
                                    },{
                                        playAudio:{ sample:"kesiev-poker-carddeal1" }
                                    }
                                ]);
                            }

                            done(true);
                        }
                    },{
                        if:{ and:true },
                        movePlayerBack:true
                    },{
                        if:{ and:true },
                        endScript:true
                    },{
                        // --- Change cards
                        if:{
                            asContext:"room",
                            is:{ gameState:1 }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Let me see..."
                            }
                        ]
                    },{
                        if:{ and:true },
                        run:(game, context, done)=>{
                            let
                                evaluation,
                                cardsChanged = 0,
                                hand = [],
                                cards = game.tools.getInventoryItemsFromRoom(room);

                            cards.forEach((card,id)=>{
                                if (card.isFlipped) {
                                    game.tools.removeInventoryItem(card);
                                    card = game.tools.addInventoryItem(room, room.deck.pop());
                                    cardsChanged++;
                                }
                                card.isPlayed = true;
                                hand.push(card.code);
                            });

                            context.as.isCardsChanged = cardsChanged > 0;
                            context.as.cardsChanged = cardsChanged;

                            evaluation = evaluateHand(hand);
                            context.as.rank = evaluation.rank;

                            context.as.gainedGold = evaluation.payout*ficheValue;
                            
                            if (room.goldBudget)
                                room.gameState = 0;
                            else
                                room.isSolved = true;

                            done(true);
                        }
                    },{
                        if:{
                            is:{
                                isCardsChanged:true
                            }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Here you are your {cardsChanged} new cards..."
                            }
                        ]
                    },{
                        run:(game, context, done)=>{
                            game.tools.playerGainGold(room, context.as.gainedGold);
                            done(true);
                        }
                    },{
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"You got {rank}! You won {gainedGold} Golden Coins."
                            },
                        ]
                    },{
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Thank you for playing!"
                            }
                        ]
                    },{
                        asContext:"room",
                        unlockRoomItemOnly:true
                    },
                    { movePlayerBack:true }
                ]);

                // --- Add hints

                let
                    hintRandom = room.random.clone(),
                    hintDeck = mintDeck(hintRandom),
                    sequence = [];

                for (let i=0;i<9;i++)
                    sequence.push(hintDeck.pop().hint);

                game.tools.hintAddSequence(room, sequence);

                // --- Restore the "poker" cards when the player enters the room

                game.tools.onEnter(room,[ {
                    if:{
                        asContext:"room",
                        is:{ isSolved:false }
                    },
                    restoreInventoryItemsFromRoom:true
                } ]);

                // --- Store the "poker" cards when the player leaves the room

                game.tools.onLeave(room,[ { storeInventoryItemsFromRoom:true } ]);
                
            });

        }
    })
    
})();

