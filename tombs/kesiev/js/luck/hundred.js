(function(){

    const
        TOMB_ID = "kesiev-hundred",
        TOMB_TAGS = [ "tomb", "luck" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        PLAYERS = 3,
        CARDS_COUNT = 12,
        JACKPOT_SIZE = 7,
        JACKPOT_SCORE = 15,
        CARDCOUNTER_EMPTY = "There is a sign showing a table but it is almost illegible.",
        CARDCOUNTER_FULL = "There is a sign showing a table. It says: \"There are ",
        SENTENCES_PLAY = [
            "I'm giving it my all!",
            "I won't lose!",
            "This time I'll give it my all!",
            "I can't lose!"
        ],
        SENTENCES_WINNER = [
            "I'm winning!",
            "I'm the best!",
            "You will never defeat me!",
            "I'm a champion at this game!"
        ],
        SENTENCES_END = [
            "It was a great game!",
            "You did well!",
            "I still haven't quite figured out the rules... but I had fun!",
            "Good Game!"
        ];

    function mintDeck(random) {
        let
            stats = {},
            cards = [];

        for (let i=0;i<=CARDS_COUNT;i++) {
            let
                count = i || 1;

            stats[i] = count;

            for (let j=0;j<count;j++) {
                let
                    card = {
                        group:CONST.GROUP.ROOMITEM,
                        color:CONST.ITEMCOLOR.ROOMITEM,
                        counter:i,
                        cardId:i,
                        isHandCard:true,
                        isRegularCard:true,
                        cardValue:i
                    };

                if (i<10) {
                    card.model = "default";
                    card.character = i;
                } else
                    card.sprite = [
                        { image:"tombs/kesiev/images/items.png", imageX:i-10, imageY:0 }
                    ];
                    
                cards.push(card);

            }
        }

        [
            { count:1, id:"+2", priority:2, imageX:3, imageY:0, counter:"+2", isHandCard:true, isBonusCard:true, cardValue:2, color:CONST.COLORS.PURPLE },
            { count:1, id:"+4", priority:2, imageX:4, imageY:0, counter:"+4", isHandCard:true, isBonusCard:true, cardValue:4, color:CONST.COLORS.PURPLE },
            { count:1, id:"+6", priority:2, imageX:5, imageY:0, counter:"+6", isHandCard:true, isBonusCard:true, cardValue:6, color:CONST.COLORS.PURPLE },
            { count:1, id:"+8", priority:2, imageX:6, imageY:0, counter:"+8", isHandCard:true, isBonusCard:true, cardValue:8, color:CONST.COLORS.PURPLE },
            { count:1, id:"+10", priority:2, imageX:7, imageY:0, counter:"+10", isHandCard:true, isBonusCard:true, cardValue:10, color:CONST.COLORS.PURPLE },
            { count:1, id:"x2", priority:1, imageX:8, imageY:0, counter:"x2", isHandCard:true, isMultiplyCard:true, cardValue:2, color:CONST.COLORS.PURPLE },
            { count:3, id:"Lifesaver", priority:3, imageX:7, imageY:0, isLifesaverCard:true, color:CONST.COLORS.PURPLE },
            { count:3, id:"Flip 3", priority:3, imageX:7, imageY:0, isFlipCard:true, cardValue:3, color:CONST.COLORS.PURPLE },
            { count:3, id:"Block", priority:3, imageX:7, imageY:0, isBlockCard:true, color:CONST.COLORS.PURPLE }
        ].forEach(card=>{
            stats[card.id]=card.count;
            for (let i=0;i<card.count;i++)
                cards.push({
                    group:CONST.GROUP.ROOMITEM+card.priority,
                    color:card.color,
                    counter:card.counter,
                    cardId:card.id,
                    isHandCard:card.isHandCard,
                    isBonusCard:card.isBonusCard,
                    isMultiplyCard:card.isMultiplyCard,
                    isLifesaverCard:card.isLifesaverCard,
                    isFlipCard:card.isFlipCard,
                    isBlockCard:card.isBlockCard,
                    cardValue:card.cardValue,
                    sprite:[
                        { image:"tombs/kesiev/images/items.png", imageX:card.imageX, imageY:card.imageY }
                    ]
                });
        })

        random.shuffle(cards);

        return {
            cards:cards,
            stats:stats
        };

    }

    function updateInterface(game, room, state) {
        let
            winnerScore = 0,
            winner = 0;

        state.players.forEach((player,id)=>{
            let
                allScore = player.score + player.handScore,
                cardColor = CONST.ITEMCOLOR.ROOMITEM,
                cardScore = player.handScore,
                row = game.map[room.y+id+1],
                cell = row[room.x+1],
                score = player.score;

            game.tools.paintFloor(0, cell, game.tools.SOLID, [ { backgroundColor:CONST.COLORS.GRAY }, CONST.TEXTURES.FONT[id+1] ], true);
            game.tools.paintMapSymbol(cell,player.id);
            game.tools.paintMapSymbolBgColor(cell,CONST.COLORS.GRAY);

            for (let i=0;i<3;i++) {
                let
                    digit = score % 10,
                    cell = row[room.x+4-i];
                game.tools.paintFloor(0, cell, game.tools.SOLID, [ { backgroundColor:CONST.COLORS.WHITE }, CONST.TEXTURES.FONT[digit] ], true);
                game.tools.paintMapSymbol(cell,digit);
                game.tools.paintMapSymbolBgColor(cell,CONST.COLORS.WHITE);
                score=Math.floor(score/10);
            }

            if (player.inventoryCard) {
                if (player.isBusted) {
                    cardColor = CONST.COLORS.RED;
                    cardScore = "-";
                } else if (!player.isPlaying)
                    cardColor = CONST.COLORS.GRAY;
                else if (player.isSafe)
                    cardColor = CONST.COLORS.GREEN;

                game.tools.setInventoryItemCounter(player.inventoryCard, cardScore);
                game.tools.setInventoryItemColor(player.inventoryCard, cardColor);
            }

            if (allScore && (!winner || (allScore > winnerScore))) {
                winner = player;
                winnerScore = allScore;
            }

        })

        state.players.forEach((player,id)=>{
            if (player.architect) {
                switch (state.gameState) {
                    case 1:{
                        player.architect.sentence = "I have "+(player.score+player.handScore)+" pts. ";
                        if (player === winner)
                            player.architect.sentence += player.architect.winSentence;
                        else
                            player.architect.sentence += player.architect.playSentence;
                        break;
                    }
                    case 2:{
                        player.architect.sentence = player.architect.endSentence;
                        break;
                    }
                    default:{
                        player.architect.sentence = player.architect.defaultSentence;
                        break;
                    }   
                }   
            }
        });

        if (state.addCard)
            game.tools.setInventoryItemCounter(state.addCard, state.deck.cards.length);

        if (state.gameState == 2)
            room.cardCounterMessage = CARDCOUNTER_EMPTY;
        else {
            let
                items = [];

            for (let k in state.deck.stats)
                if (state.deck.stats[k])
                    items.push(state.deck.stats[k]+" "+k+" card"+(state.deck.stats[k] == 1 ? "" :"s"));

            room.cardCounterMessage = CARDCOUNTER_FULL+items.join(", ")+"\".";
        }

        game.tools.refreshScreen();
    }

    function startRound(game, room, state, first) {

        state.turn = 0;
        state.players.forEach(player=>{
            if (!player.isBusted)
                player.score += player.handScore;
            player.isPlaying = true;
            player.isSafe = false;
            player.isBusted = false;
            player.isJackpot = false;
            player.hand = [];
            player.handIndex = {};
            player.handScore = 0;
        });

        if (state.deck.cards.length) {

            game.tools.getInventoryItemsFromRoom(room).forEach(item=>{
                if ((item.cardId !== undefined) || item.isNewRoundCard || item.isAddCard || item.isStayCard)
                    game.tools.removeInventoryItem(item);
            });

            if (state.addCard)
                game.tools.addInventoryItem(room, state.addCard);
            
            if (state.stayCard)
                game.tools.addInventoryItem(room, state.stayCard);

            updateInterface(game, room, state);
            
            if (!first)
                game.tools.playAudio("kesiev-hundred-cardshuffle1");

        } else {

            updateInterface(game, room, state);

            let
                humanPlayer = state.players[0];

            state.players.sort((a,b)=>{
                if (a.score < b.score) return -1;
                else if (a.score > b.score) return 1;
                else return 0;
            })

            room.isSolved = true;

            game.tools.removeInventoryItemsFromRoom(room);
            game.tools.unlockRoomWithScore(room, state.players.indexOf(humanPlayer), state.players.length-1, ()=>{});

        }

    }

    function endRound(game, room, state) {    
        let
            newRound;

        updateInterface(game, room, state);

        game.tools.removeInventoryItem(state.addCard);
        game.tools.removeInventoryItem(state.stayCard);

        newRound = game.tools.addInventoryItem(room, {
            isNewRoundCard:true,
            group:CONST.GROUP.ROOMITEM+3,
            color:CONST.ITEMCOLOR.ROOMITEM,                                
            model:"default",
            image:"refresh"
        });
        game.tools.onUse(newRound,[
            {
                run:(game, context, done)=>{
                    startRound(game, room, state);
                    done();
                }
            }
        ]);
    }

    function dealCard(game, room, state, player) {
        let
            event = { player:player };

        if (state.deck.cards.length && !player.isBusted) {
            let
                card,
                score = 0,
                scoreBonus = 0,
                mulBonus = 1;

            card = event.card = state.deck.cards.pop();
            state.deck.stats[card.cardId]--;
            state.gameState = 1;

            if (card.isHandCard && player.handIndex[card.cardId])
                if (player.isSafe) {
                    player.isSafe = false;
                    event.hasDefended = true;
                } else {
                    player.handScore = 0;
                    player.isBusted = true;
                    player.isPlaying = false;
                    event.hasBusted = true;
                }

            if (!player.isBusted && !event.hasDefended) {

                player.handIndex[card.cardId] = true;

                if (card.isHandCard) {

                    let
                        regularCards = 0;

                    player.hand.push(card);

                    if (player.isHuman) {
                        game.tools.addInventoryItem(room, card);
                        game.tools.setInventoryItemAnimation(card, "bounce");
                    }

                    player.hand.forEach(card=>{
                        if (card.isRegularCard) {
                            regularCards++;
                            score += card.cardValue;
                        } else if (card.isBonusCard)
                            scoreBonus += card.cardValue;
                        else if (card.isMultiplyCard)
                            mulBonus = card.cardValue;
                    })

                    player.handScore = (score*mulBonus)+scoreBonus;

                    if (regularCards >= JACKPOT_SIZE) {
                        player.handScore+=JACKPOT_SCORE;
                        player.isJackpot = true;
                        event.gotJackpot = true;
                        state.players.forEach(player=>{
                            player.isPlaying = false;
                        })
                    }

                } else if (card.isLifesaverCard) {
                    player.isSafe = true;
                    event.gotLifesaver = true;
                } else
                    event.hasTargetCard = true;
            }

        }

        return event;

    }

    function stay(player) {
        player.isPlaying = false;
        return { player:player, stay:true };
    }

    function getPlayingPlayers(state) {
        return state.players.filter(player=>player.isPlaying);
    }

    function findAttackPlayer(state, me) {
        let
            targets = getPlayingPlayers(state).map(player=>{
                return { player:player, score:player === me ? -1 : player.score+player.handScore };
            });
        targets.sort((a,b)=>{
            if (a.score > b.score) return -1;
            else if (a.score < b.score) return 1;
            else return 0;
        });
        return targets[0].player;
    }

    function playCardAgainst(game, room, state, fromPlayer, card, player, log, force) {

        log.push({ player:fromPlayer, card:card, against:player, force:force });

        if (card.isBlockCard)
            player.isPlaying = false;

        if (card.isFlipCard)
            for (let i=0;i<card.cardValue;i++) {
                let
                    event = dealCard(game, room, state, player);

                log.push(event);

                if (player.isPlaying && event.hasTargetCard)
                    playCardAgainst(game, room, state, player, event.card, player, log, true);

                if (!player.isPlaying)
                    break;
            }

        return log;
    }

    function playLog(game, log, done) {
        let
            dialogue = [];

        log.forEach(event=>{
            if (event.endRound)
                dialogue.push({ text:"The round ends!" });
            else if (event.endGame)
                dialogue.push({ text:"The deck is empty... and the game ends!" });
            else if (event.gotJackpot)
                dialogue.push({ text:event.player.name+" hit the Jackpot and got "+JACKPOT_SCORE+" pts.!" });
            else if (event.hasBusted)
                dialogue.push({ text:event.player.name+" got another "+event.card.cardId+" card and busted!" });
            else if (event.hasDefended)
                dialogue.push({ text:event.player.name+" got another "+event.card.cardId+" card but the Lifesaver saved "+event.player.itLowcase+" from busting!" });
            else if (event.stay)
                dialogue.push({ text:event.player.name+" stayed with "+event.player.hand.length+" cards in hand and "+event.player.handScore+" pts." });
            else if (event.against)
                if (event.force)
                    dialogue.push({ text:event.player.name+" flipped a "+event.card.cardId+" card so it is played on "+event.player.self+"!" });
                else
                    dialogue.push({ text:event.player.name+" played a "+event.card.cardId+(event.against === event.player ? " card on "+event.player.self : " against "+event.against.nameLowcase)+"!" });
            else if (event.card && !event.card.isRegularCard)
                dialogue.push({ text:event.player.name+" got a "+event.card.cardId+" card!" });
        });

        if (dialogue.length)
            game.tools.dialogueSay(0, dialogue, done)
        else
            if (done) done();
    }

    function hitOrStay(player, state) {
        let
            riskRatio,
            riskyCards = 0;

        player.hand.forEach(card=>{
            if (card.isRegularCard)
                riskyCards+=state.deck.stats[card.cardId];
        });

        riskRatio = riskyCards/state.deck.cards.length;

        return riskRatio < player.riskLevel;
    }

    function nextTurn(game, room, state, log, pass) {
        if (!log)
            log = [];
        if (!pass)
            pass = 0;

        if (pass == state.players.length) {

            log.push({ endRound:true });
            endRound(game, room, state);

        } else if (state.deck.cards.length == 0) {

            state.gameState = 2;
            log.push({ endGame:true });
            state.players.forEach(player=>{
                player.isPlaying = false;
            });
            endRound(game, room, state);

        } else {
            let
                event,
                player;

            state.turn = (state.turn+1)%state.players.length;
            player = state.players[state.turn];

            if (player.isPlaying) {
                pass = 0;
                if (player.isHuman)
                    updateInterface(game, room, state);
                else {
                    if (player.isSafe || hitOrStay(player, state))
                        event = dealCard(game, room, state, player);
                    else
                        event = stay(player);

                    log.push(event);

                    if (player.isPlaying && event.hasTargetCard)
                        playCardAgainst(game, room, state, player, event.card, findAttackPlayer(state, player), log);                        

                    nextTurn(game, room, state, log, pass);
                }
            } else {
                pass++;
                nextTurn(game, room, state, log, pass);
            }
            
        }

        return log;
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Hundred Room",
        description:"Get the best score in a blackjack-like game against 2 Architects.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"Jazz Extravaganza", by:[ "Boo and Spin Dizzy" ], id:"kesiev-blackjack1",mod:"tombs/kesiev/audio/music/boo_-_jazz_extravaganza.xm", isSong:true},
            { type:"audio", id:"kesiev-hundred-carddeal1", title:"Card Deal SFX", by:[ "Kenney" ], file:"tombs/kesiev/audio/sfx/carddeal1" },
            { type:"audio", id:"kesiev-hundred-cardshuffle1", title:"Cards Shuffle SFX", by:[ "Signature Sounds" ], file:"tombs/kesiev/audio/sfx/cardshuffle1" },
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/items.png" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    music:"kesiev-blackjack1",
                    name:this.name,
                    author:this.byArchitect,
                    width:6,
                    height:PLAYERS+2,
                    isSolved:false,
                    isFirstEntrance:true
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                let
                    architects = ARCHITECTS.list.filter(architect=>(architect != ARCHITECT) && (architect.layout.head != "nobody")),
                    isGuest = false,
                    scoreboard = { x:room.x+1, y:room.y+1, width:room.width-2, height:room.height-2 },
                    hintRandom = room.random.clone(),
                    hintDeck = mintDeck(hintRandom),
                    state = {
                        gameState:0,
                        addCard:0,
                        stayCard:0,
                        turn:0,
                        deck:mintDeck(room.random),
                        players:[],
                    };

                // --- Create players

                for (let i=0;i<PLAYERS;i++) {
                    let
                        architect,
                        isHuman = i == 0,
                        name;

                    if (!isHuman) {
                        let
                            architectLayout,
                            architectDefaultSentence,
                            architectScript;
                        if (isGuest) {
                            architectDefaultSentence = "I'm not sure about the rules of this game... but let's play anyway!";
                            architectLayout = room.random.removeElement(architects).layout;
                            architectScript = [
                                {
                                    dialogueSay:[
                                        {
                                            by:"{name}",
                                            text:"{sentence}"
                                        }
                                    ]
                                },
                                { movePlayerBack:true },
                                { endScript:true }
                            ];
                        } else {
                            architectDefaultSentence = "Come on! Draw a card and let's start playing!";
                            architectLayout = ARCHITECT.layout;
                            architectScript = [
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
                                                    text:"Come on! That was a great game, wasn't it?"
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
                                            text:"{sentence}"
                                        }
                                    ]
                                },
                                { movePlayerBack:true },
                                { endScript:true }
                            ];
                            isGuest = true;
                        }
                        architect = game.tools.addNpc(room.x+1, room.y+1+i, Tools.clone(architectLayout));
                        architect.defaultSentence = architectDefaultSentence;
                        architect.winSentence = room.random.element(SENTENCES_WINNER);
                        architect.playSentence = room.random.element(SENTENCES_PLAY);
                        architect.endSentence = room.random.element(SENTENCES_END);
                        game.tools.onInteract(architect, architectScript);
                        name = architect.name;
                    }

                    state.players.push({
                        index:i,
                        id:i+1,
                        isHuman:isHuman,
                        architect:architect,
                        riskLevel:0.2+(i*0.1),
                        name:isHuman ? "You" : name, 
                        nameLowcase: isHuman ? "you" : name,
                        have:isHuman ? " You have ": name+" has ",
                        itHas:isHuman ? " You have ": "It has ",
                        it:isHuman ? "You" : "It",
                        itLowcase:isHuman ? "you" : "it",
                        self:isHuman ? "yourself" : "itself",
                        score:0,
                        handScore:0,
                        hand:[]
                    });
                }

                // --- Paint the scoreboard frame

                game.tools.paintFloor(0, room, game.tools.CHECKERBOARD, [
                    [
                        { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.DARKGREEN },
                    ],[
                        { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.GRAY },
                    ]
                ]);

                game.tools.setFloorPaintable(scoreboard, false);
                game.tools.setElementPaintable(scoreboard, false);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Start a new round

                startRound(game, room, state, true);

                // --- Restore the game cards when the player enters the room

                let
                    script = [];

                script.push({
                    if:{
                        asContext:"room",
                        is:{ isFirstEntrance:true }
                    },
                    run:(game, context, done)=>{

                        room.isFirstEntrance = false;

                        state.addCard = game.tools.addInventoryItem(room,{
                            isAddCard:true,
                            group:CONST.GROUP.ROOMITEM+3,
                            color:CONST.ITEMCOLOR.ROOMITEM,                                
                            model:"default",
                            image:"addCard",
                            counter:0
                        });

                        game.tools.onUse(state.addCard,[
                            { setInventoryItemAnimation:"bounce" },
                            {
                                run:(game, context, done)=>{

                                    done(true);

                                    let
                                        dialogue = [],
                                        event = dealCard(game, room, state, state.players[state.turn]);

                                    game.tools.playAudio("kesiev-hundred-carddeal1");

                                    updateInterface(game, room, state);

                                    if (event.gotJackpot)
                                        dialogue.push({ text:"You hit the Jackpot and got "+JACKPOT_SCORE+" pts.! Nice!" });
                                    else if (event.hasBusted)
                                        dialogue.push({ text:"You got another "+event.card.cardId+" card and busted!" });
                                    else if (event.hasDefended)
                                        dialogue.push({ text:"You got another "+event.card.cardId+" card but the Lifesaver saved you from busting!" });
                                    else if (event.gotLifesaver)
                                        dialogue.push({ text:"You got the Lifesaver card! It will protect you from busting!" });
                                    
                                    if (event.hasTargetCard) {

                                        let
                                            targets = getPlayingPlayers(state),
                                            sentence = "You got the "+event.card.cardId+" card! Who do you want to target?",
                                            options = targets.map(player=>{
                                                return {
                                                    id:"target",
                                                    value:player,
                                                    label:player.name+" ("+player.score+"+"+player.handScore+" pts.)"
                                                };
                                            });

                                        dialogue.push({
                                            text:sentence,
                                            options:options
                                        });
                                        
                                    }

                                    if (dialogue.length)

                                        game.tools.dialogueSay(0,dialogue,(answers)=>{
                                            if (answers && answers.target) {
                                                let
                                                    log = playCardAgainst(game, room, state, state.players[state.turn], event.card, answers.target, []);

                                                playLog(game, nextTurn(game, room, state, log));
                                            } else
                                                playLog(game, nextTurn(game, room, state));
                                        });

                                    else
                                        playLog(game, nextTurn(game, room, state));

                                }
                            }
                        ]);

                        state.stayCard = game.tools.addInventoryItem(room,{
                            isStayCard:true,
                            group:CONST.GROUP.ROOMITEM+4,
                            color:CONST.ITEMCOLOR.ROOMITEM,                                
                            model:"default",
                            sprite:[
                                { image:"tombs/kesiev/images/items.png", imageX:9, imageY:0 },
                            ]
                        });

                        game.tools.onUse(state.stayCard,[
                            {
                                run:(game, context, done)=>{

                                    done(true);

                                    game.tools.playAudio("mouseclick1");

                                    playLog(game, nextTurn(game, room, state,[ stay(state.players[state.turn]) ]));
                                }
                                
                            }
                        ]);

                        state.players.forEach(player=>{
                            let
                                inventoryCard = game.tools.addInventoryItem(room,{
                                    isPlayerCard:true,
                                    ofPlayer:player,
                                    group:CONST.GROUP.ROOMITEM+5,
                                    color:CONST.ITEMCOLOR.ROOMITEM,                                
                                    counter:player.handScore,
                                    sprite:[
                                        { image:"tombs/kesiev/images/items.png", imageX:0, imageY:1 },
                                        CONST.ITEMS.FONT[player.id]
                                    ],
                                    counter:0
                                });

                            game.tools.onUse(inventoryCard,[
                                { setInventoryItemAnimation:"bounce" },
                                {
                                    run:(game, context, done)=>{
                                        let
                                            sentence;

                                        sentence=player.have+player.handScore+" pts.";

                                        if (player.hand.length)
                                            sentence+=" and "+player.hand.length+" card(s) in hand: "+player.hand.map(card=>card.cardId).join(", ")+".";
                                        else
                                            sentence+=" and no cards in hand.";

                                        if (player.isJackpot)
                                            sentence += " "+player.it+" hit the Jackpot!";
                                        else if (player.isBusted)
                                            sentence += " "+player.it+" busted!";
                                        else if (player.isSafe)
                                            sentence += " "+player.itHas+" the Lifesaver card!";

                                        game.tools.dialogueSay(0,[
                                            { text:sentence }
                                        ],done);
                                        done(true);
                                    }
                                }
                            ]);

                            player.inventoryCard = inventoryCard;
                        });

                        updateInterface(game, room, state);
                        done(true);
                    }
                });

                script.push({
                    if:{ and:true },
                    endScript:true
                });

                script.push({
                    if:{
                        asContext:"room",
                        is:{ isSolved:false }
                    },
                    restoreInventoryItemsFromRoom:true
                });

                game.tools.onEnter(room,script);

                // --- Add the card counter board

                let
                    walkableWalls = game.tools.getWalkableWalls(room),
                    cardCounterPosition = room.random.element(walkableWalls);

                game.tools.addWallDecoration(0, cardCounterPosition, cardCounterPosition.side, game.tools.SOLID, [
                    {  isMenu:true, image:"tombs/kesiev/images/texture.png", imageX:1, imageY:4 }
                ]);

                game.tools.onBumpWall(cardCounterPosition.x, cardCounterPosition.y, cardCounterPosition.side, [
                    {
                        asContext:"room",
                        dialogueSay:[
                            {
                                text:"{cardCounterMessage}"
                            }
                        ]
                    }
                ]);

                // Avoid random decorations on the card counter
                game.tools.setWallPaintable(cardCounterPosition.x, cardCounterPosition.y, cardCounterPosition.side, false);

                // Protect the card counter area, so the architect doesn't spawn there
                game.tools.setProtected(cardCounterPosition.front, true);

                // --- Add hints

                let
                    sequence = [];

                for (let i=0;i<PLAYERS*3;i++)
                    sequence.push(hintDeck.cards.pop().cardId);

                game.tools.hintAddSequence(room, sequence);

                // --- Store the game cards when the player leaves the room

                game.tools.onLeave(room,[ { storeInventoryItemsFromRoom:true } ]);
                
            });

        }
    })
    
})();

