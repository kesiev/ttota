(function(){

    const
        TOMB_ID = "kesiev-blackjack",
        TOMB_TAGS = [ "tomb", "luck" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        TARGET = 21,
        ORDER = [ 
            {
                symbol:"2",
                label:"2"
            },{
                symbol:"3",
                label:"3"
            },{
                symbol:"4",
                label:"4"
            },{
                symbol:"5",
                label:"5"
            },{
                symbol:"6",
                label:"6"
            },{
                symbol:"7",
                label:"7"
            },{
                symbol:"8",
                label:"8"
            },{
                symbol:"9",
                label:"9"
            },{
                symbol:"T",
                label:"10"
            },{
                symbol:"J",
                label:"Jack"
            },{
                symbol:"Q",
                label:"Queen"
            },{
                symbol:"K",
                label:"King"
            },{
                symbol:"A",
                label:"Ace"
            }
        ],
        SUITS = [
            { id:"S", label:"Spades", character:"&#x2660;", htmlCharacter:"&#x2660;" },
            { id:"C", label:"Clubs", character:"&#x2663;", htmlCharacter:"&#x2663;" },
            { id:"H", label:"Hearts", character:"&#x2665;", htmlCharacter:"<span style='color:"+CONST.COLORS.RED+"'>&#x2665;</span>" },
            { id:"D", label:"Diamonds", character:"&#x2666;", htmlCharacter:"<span style='color:"+CONST.COLORS.RED+"'>&#x2666;</span>" }
        ];

    function mintDeck(random) {
        let
            deck = [];

        ORDER.forEach(value=>{
            SUITS.forEach(suit=>{
                deck.push({
                    isCard:true,
                    group:CONST.GROUP.ROOMITEM,
                    color:CONST.ITEMCOLOR.ROOMITEM,
                    counter:(value.symbol == "T" ? 10 : value.symbol)+suit.htmlCharacter,
                    model:"default",
                    character:suit.character,
                    code:value.symbol+suit.id,
                    label:value.label+" of "+suit.label,
                    hint:(value.symbol == "T" ? 10 : value.symbol)+suit.character
                });
            })
        })

        random.shuffle(deck);

        return deck;

    }

    function evalueateHand(hand) {
        let
            score = 0,
            aces = 0;

        hand.forEach(card=>{
            switch (card[0]) {
                case "A":{
                    score++;
                    aces++;
                    break;
                }
                case "T":
                case "J":
                case "Q":
                case "K":{
                    score+=10;
                    break;
                }
                default:{
                    score+=card[0]*1;
                }
            }
        });

        for (let i=0;i<aces;i++)
            if (score+10<=TARGET)
                score+=10;

        return score;

    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Black Room",
        description:"The classic Blackjack game.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"Jazz Extravaganza", by:[ "Boo and Spin Dizzy" ], id:"kesiev-blackjack1",mod:"tombs/kesiev/audio/music/boo_-_jazz_extravaganza.xm", isSong:true},
            { type:"audio", id:"kesiev-blackjack-carddeal1", title:"Card Deal SFX", by:[ "Kenney" ], file:"tombs/kesiev/audio/sfx/carddeal1" },
            { type:"audio", id:"kesiev-blackjack-cardshuffle1", title:"Cards Shuffle SFX", by:[ "Signature Sounds" ], file:"tombs/kesiev/audio/sfx/cardshuffle1" },
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    music:"kesiev-blackjack1",
                    name:this.name,
                    author:this.byArchitect,
                    width:3,
                    height:3,
                    gameState:0,
                    isFirstEntrance:true,
                    isSolved:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    ficheValue = Math.ceil(room.goldBudget/10);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Paint the room

                game.tools.paintFloor(0, room, game.tools.CHECKERBOARD, [
                    [
                        { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.BLUE },
                    ],[
                        { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.WHITE },
                    ]
                ]);

                // --- Add the architect

                let
                    architect = game.tools.addNpc(room.x+1, room.y+1, Tools.clone(ARCHITECT.layout));

                architect.playerScore = 0;

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
                                        text:"Well. I had fun! Thanks!"
                                    }
                                ]
                            },
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        dialogueSay:[
                            {
                                text:"Do you want to challenge {name} with your score of {playerScore}?",
                                options:[
                                    {
                                        id:"challengeIt",
                                        value:true,
                                        label:"Yes"
                                    },{
                                        label:"No",
                                        id:"challengeIt",
                                        value:false
                                    }
                                ]
                            }
                        ]
                    },{
                        if:{
                            asContext:"answers",
                            is:{ challengeIt:true }
                        },
                        run:(game, context, done)=>{
                            let
                                range = 2-Math.floor(room.difficulty*2),
                                playerScore = context.as.playerScore,
                                multiplier = 1,
                                result = 0,
                                score = 0,
                                log = [],
                                hand = [];

                            if (!room.deck)
                                room.deck = mintDeck(room.random);

                            context.as.payOut = 0;

                            do {
                                let
                                    newCard = room.deck.pop();
                                hand.push(newCard.code);
                                score=evalueateHand(hand);
                                if (score > TARGET) {
                                    result = 1;
                                    multiplier = 1.25;
                                    log.push({
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"A "+newCard.label+". My score is "+score+" and I've busted! You won {payOut} Golden Coins!"
                                    });
                                } else if ((score > playerScore) || ((score>10) && (score > playerScore-range)) || (score == TARGET)) {
                                    if ((score == TARGET) || (score>playerScore)) {
                                        result = 2;
                                        log.push({
                                            audio:ARCHITECT.voiceAudio,
                                            by:"{name}",
                                            text:"A "+newCard.label+"! My score is "+score+" and yours is "+playerScore+"... I won!"
                                        });
                                    } else {
                                        result = 1;
                                        log.push({
                                            audio:ARCHITECT.voiceAudio,
                                            by:"{name}",
                                            text:"A "+newCard.label+". My score is "+score+"... And I stay. You won {payOut} Golden Coins!"
                                        });
                                    }
                                } else
                                    log.push({
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"I've got a "+newCard.label+" and my score is "+score+". Let's draw another one..."
                                    })
                            } while (!result);

                            // --- Schedule the payout

                            if (result == 1)
                                context.as.payOut = Math.ceil(Math.abs(score-playerScore)*ficheValue*multiplier);
                            else
                                context.as.payOut = 0;

                            // --- Reset the game

                            room.deck = 0;
                            context.as.playerScore = 0;
                            game.tools.getInventoryItemsFromRoom(room).forEach(item=>{
                                if (item.isCard)
                                    game.tools.removeInventoryItem(item);
                                else if (item.isAddCard)
                                    game.tools.setInventoryItemCounter(item, 0);
                            })

                            game.tools.dialogueSay(context.as, log, ()=>{ done(result) });

                        }
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result:1 }
                        },
                        run:(game, context, done)=>{
                            game.tools.playerGainGold(room, context.as.payOut);
                            if (room.goldBudget <= 0)
                                room.isSolved = true;
                            done(true);
                        }
                    },{
                        if:{ and:true },
                        asContext:"room",
                        unlockRoomItemOnly:true
                    },{
                        if:{
                            asContext:"room",
                            is:{ isSolved:true }
                        },
                        asContext:"room",
                        removeInventoryItemsFromRoom:true
                    },
                    { movePlayerBack:true }
                ]);

                // --- Add hints

                let
                    hintRandom = room.random.clone(),
                    hintDeck = mintDeck(hintRandom),
                    sequence = [];

                for (let i=0;i<6;i++)
                    sequence.push(hintDeck.pop().hint);

                game.tools.hintAddSequence(room, sequence);

                // --- Restore the "blackjack" cards when the player enters the room. The first time, add the "add card" card.

                game.tools.onEnter(room,[
                    {
                        if:{
                            asContext:"room",
                            is:{ isFirstEntrance:true }
                        },
                        addInventoryItem:{
                            data:{
                                isAddCard:true,
                                group:CONST.GROUP.ROOMITEM+1,
                                color:CONST.ITEMCOLOR.ROOMITEM,                                
                                model:"default",
                                image:"addCard",
                                counter:0
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                result = 0,
                                                allCards,
                                                hand,
                                                score;
                                                
                                            if (!room.deck)
                                                room.deck = mintDeck(room.random);

                                            newCard = room.deck.pop();
                                            game.tools.addInventoryItem(room, newCard);
                                            allCards = game.tools.getInventoryItemsFromRoom(room).filter(card=>card.isCard);
                                            hand = allCards.map(card=>card.code);
                                            score = evalueateHand(hand);                                            
                                            context.as.score = score;
                                            context.as.lastCard = newCard.label;
                                            architect.playerScore = score;

                                            if (score > TARGET) {
                                                result = 1;
                                                game.tools.setInventoryItemCounter(context.as, 0);
                                                room.deck = 0;
                                                allCards.forEach(card=>{
                                                    game.tools.removeInventoryItem(card);
                                                })
                                            } else
                                                game.tools.setInventoryItemCounter(context.as, score);

                                            done(result);
                                        } 
                                    },{
                                        playAudio:{ sample:"kesiev-blackjack-carddeal1" }
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:1 }
                                        },
                                        dialogueSay:[
                                            {
                                                audio:ARCHITECT.voiceAudio,
                                                by:ARCHITECT.layout.name,
                                                text:"Oh, no! You got a {lastCard} and busted with {score}! You lost all of your cards..."
                                            }
                                        ]
                                    },{
                                        if:{ and:true },
                                        playAudio:{ sample:"kesiev-blackjack-cardshuffle1" }
                                    }
                                ]
                            }
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

                // --- Store the "blackjack" cards when the player leaves the room

                game.tools.onLeave(room,[ { storeInventoryItemsFromRoom:true } ]);
                
            });

        }
    })
    
})();

