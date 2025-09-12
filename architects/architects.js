let ARCHITECTS=(function(){

    const
        NOVOICE_RESOURCE = false,
        NOVOICE_AUDIO = [ "beep1" ],
        PAYSENTENCE_DEFAULT = "Do you want to spend {architectPrice} Golden Coin to listen to this Architect?",
        CANTPAYSENTENCE_DEFAULT = "You don't have enough Golden Coins to talk with me. Come back later!",
        PLAQUES_NONE = [
            "\"Get ready!\"",
            "\"Do your best!\"",
            "\"All eyes on you!\"",
            "\"Bring it on!\"",
            "\"Can you do it?\"",
            "\"Do your best!\"",
            "\"Don't hold back!\"",
            "\"Game on!\"",
            "\"Give it a try!\"",
            "\"Give it all!\"",
            "\"Go for it!\"",
            "\"Here we go!\"",
            "\"Hit it!\"",
            "\"It's your turn!\"",
            "\"Keep going!\"",
            "\"Let's begin!\"",
            "\"Let's go!\"",
            "\"Let's see your best!\"",
            "\"Let's test you!\"",
            "\"Make it count!\"",
            "\"Make it happen!\"",
            "\"Now's the time!\"",
            "\"One more time!\"",
            "\"Own it!\"",
            "\"Prove yourself!\"",
            "\"Ready, set, go!\"",
            "\"Show me what you've got!\"",
            "\"Step into it!\"",
            "\"Step up!\"",
            "\"Time to shine!\"",
            "\"Try your luck!\"",
            "\"You got this!\""
        ],
        MISSING_DATA_ERRORS = [
            "MISSING DATA",
            "ARCHIVE DAMAGED",
            "ARCHIVE EMPTY",
            "ARCHIVE LOST",
            "DATA BLACKOUT",
            "DATA CORRUPTED",
            "DATA MISMATCH",
            "DATA NOT PRESENT",
            "DATABASE CORRUPT",
            "DATASTREAM BROKEN",
            "DATASTREAM VOID",
            "DOCUMENT NOT FOUND",
            "ENTRY ERROR",
            "INDEX EMPTY",
            "INDEX NOT FOUND",
            "INFO LOST",
            "INPUT FAILURE",
            "INVALID PATH",
            "LOGS MISSING",
            "MEMORY FAILURE",
            "MISSING FILE",
            "NO MATCH DETECTED",
            "NO SIGNAL",
            "NO TRACE FOUND",
            "NULL RESPONSE",
            "OUTPUT NULL",
            "PATH DEAD",
            "QUERY FAILED",
            "RECORD CORRUPT",
            "RECORD ERASED",
            "RECORD LOCKED",
            "RECORD NOT FOUND",
            "RECORD UNKNOWN",
            "REQUEST FAILED",
            "RESPONSE VOID",
            "SCAN FAILED",
            "SEARCH EMPTY",
            "SOURCE UNAVAILABLE",
            "SYSTEM TIMEOUT",
            "TRACE NOT FOUND",
        ],
        MISSING_DATA = {
            // --- Story rooms have no architects
            story:[],
            "story-entrance":[],
            "story-epilogue":[],
            "story-day1":[],
            // --- System rooms have no architects
            "run":[],
            debug:[],
            // --- There is Preuk here ;)
            "default":[],
            // --- Room missing data quotes:
            luck:[
                { text:"Luck is what happens when preparation meets opportunity.", by:"Seneca" },
                { text:"I am a great believer in luck, and I find the harder I work, the more I have of it.", by:"Thomas Jefferson" },
                { text:"Luck is a very thin wire between survival and disaster, and not many people can keep their balance on it.", by:"Hunter S. Thompson" },
                { text:"Luck is believing you're lucky.", by:"Tennessee Williams" },
                { text:"We must believe in luck. For how else can we explain the success of those we don't like?", by:"Jean Cocteau" },
                { text:"Chance favors the prepared mind.", by:"Louis Pasteur" },
                { text:"In the long run, you make your own luck - good, bad, or indifferent.", by:"Loretta Lynn" },
                { text:"With luck on your side, you can do without brains.", by:"Giordano Bruno" },
                { text:"Art depends on luck and talent.", by:"Francis Ford Coppola" },
                { text:"Happiness is a well-balanced combination of love, labour, and luck.", by:"Mary Wilson Little" }
            ],
            quiz:[
                { text:"To know what you know and what you do not know, that is true knowledge.", by:"Confucius" },
                { text:"Knowledge is power. Information is liberating. Education is the premise of progress, in every society, in every family.", by:"Kofi Annan" },
                { text:"Consider your origins: you were not made to live as brutes, but to follow virtue and knowledge.", by:"Dante Alighieri" },
                { text:"Human behavior flows from three main sources: desire, emotion, and knowledge.", by:"Plato" },
                { text:"Ignorance is the curse of God; knowledge is the wing wherewith we fly to heaven.", by:"William Shakespeare" },
                { text:"I prefer tongue-tied knowledge to ignorant loquacity.", by:"Marcus Tullius Cicero" },
                { text:"The only good is knowledge, and the only evil is ignorance.", by:"Herodotus" },
                { text:"Opinion is the medium between knowledge and ignorance.", by:"Plato" },
                { text:"The true sign of intelligence is not knowledge but imagination.", by:"Albert Einstein" },
                { text:"Perplexity is the beginning of knowledge.", by:"Khalil Gibran" },
            ],
            logic:[
                { text:"When dealing with people, remember you are not dealing with creatures of logic, but creatures of emotion.", by:"Dale Carnegie" },
                { text:"Logic is the beginning of wisdom, not the end.", by:"Leonard Nimoy" },
                { text:"Fear is a disease that eats away at logic and makes man inhuman.", by:"Marian Anderson" },
                { text:"Logic and mathematics are nothing but specialised linguistic structures.", by:"Jean Piaget" },
                { text:"A man is but the product of his thoughts. What he thinks, he becomes.", by:"Mahatma Gandhi" },
                { text:"Logic will get you from A to B. Imagination will take you everywhere.", by:"Albert Einstein" },
            ],
            arcade:[
                { text:"I've struggled a long time with survivin', but no matter what you have to find something to fight for.", by:"Joel" },
                { text:"Do you like hurting other people?", by:"Richard" },
                { text:"You have died of dysentery.", by:"The Oregon Trail" },
                { text:"What is a man but the sum of his memories? We are the stories we live! The tales we tell ourselves!", by:"Clay Kaczmarek" },
                { text:"It's more important to master the cards you're holding than to complain about the ones your opponents were dealt.", by:"Grimsley" },
                { text:"War is where the young and stupid are tricked by the old and bitter into killing each other.", by:"Niko Bellic" },
                { text:"War. War never changes. But men do, through the roads they walk.", by:"The narrator" },
                { text:"Hey! Listen!", by:"Navi" },
                { text:"What is a man? A miserable little pile of secrets.", by:"Dracula" },
                { text:"Life is all about resolve. Outcome is secondary.", by:"Waka" },
            ],
            memory:[
                { text:"The life of the dead is placed in the memory of the living.", by:"Marcus Tullius Cicero" },
                { text:"Time and memory are true artists; they remould reality nearer to the heart's desire.", by:"John Dewey" },
                { text:"Memory is deceptive because it is colored by today's events.", by:"Albert Einstein" },
                { text:"Without memory, there is no culture. Without memory, there would be no civilization, no society, no future.", by:"Elie Wiesel" },
                { text:"Memory is man's greatest friend and worst enemy.", by:"Gilbert Parker" },
                { text:"Nothing prevents happiness like the memory of happiness.", by:"Andre Gide" },
                { text:"The function of memory is not only to preserve, but also to throw away. If you remembered everything from your entire life, you would be sick.", by:"Umberto Eco" },
                { text:"Sweet is the memory of past troubles.", by:"Marcus Tullius Cicero" },
            ],
            special:[
                { text:"Maybe your weird is my normal. Who's to say?", by:"Nicki Minaj" },
                { text:"The more you embrace the weird crazy things about you, the more you find your tribe.", by:"Jinkx Monsoon" },
                { text:"Maybe love is just about finding the person you can be your weird self with.", by:"Matt Haig" },
                { text:"The secret to humor is surprise.", by:"Aristotle" },
                { text:"The secret of happiness is to admire without desiring.", by:"Carl Sandburg" },
            ]
        },
        ANONYMOUS_ARCHITECTS = {
            none:{
                isAnonymous:true,
                voiceAudio:NOVOICE_AUDIO,
                voiceResource:NOVOICE_RESOURCE,
                layout:{
                    name:"Architect Anonymous",
                    bottomDress:"shortCoat",
                    topDress:"monk",
                    shoes:"sandals"
                },
                paySentence:PAYSENTENCE_DEFAULT,
                cantPaySentence:CANTPAYSENTENCE_DEFAULT,
                plaques:PLAQUES_NONE
            }
        },
        ARCHITECTS = {
            ARNALDO:{
                at:[ "kesiev-drummachine" ],
                voiceAudio:NOVOICE_AUDIO,
                voiceResource:NOVOICE_RESOURCE,
                layout:{
                    name:"Architect Arnaldo",
                    bottomDress:"shortCoat",
                    topDress:"monk",
                    shoes:"sandals",
                    eyes:"glasses",
                    goatee:"shaved",
                    hair:"tuft"
                },
                paySentence:PAYSENTENCE_DEFAULT,
                cantPaySentence:CANTPAYSENTENCE_DEFAULT,
                plaques:PLAQUES_NONE,
            },
            KESIEV:{
                at:[ "kesiev-fifteen", "kesiev-lore-st" ],
                voiceAudio:[ "architect-kesiev-voice" ],
                voiceResource:{ type:"audio", id:"architect-kesiev-voice", title:"Architect KesieV voice", by:[ "KesieV" ], file:"architects/voices/kesiev", pitchStart:0.9, pitchRange: 0.3, volume:CONST.VOLUME.VOICE },
                layout:{
                    name:"Architect KesieV",
                    topDress:"monk",
                    shoes:"sandals",
                    eyes:"glasses",
                    mouth:"relaxed",
                    mustaches:"short",
                    goatee:"wide",
                    nose:"small",
                    hair:"shortTail"
                },
                paySentence:"Do you think it's worth spending {architectPrice} Golden Coin to hear one of the fifteen memories of this Architect?",
                cantPaySentence:CANTPAYSENTENCE_DEFAULT,
                plaques:[
                    "\"I always hated this game, but its code used to be on any programming book as it was an easy game to implement. You should be able to solve it in {moves} move(s) or less. Have fun.\"",
                    "\"Why fifteen? Why impose such a stringent limit on yourself?\"",
                    "\"Fun fact. This game is hateful.\"",
                    "\"Much to no one's surprise. Have fun, eh!\"",
                    "\"I'm sorry.\""
                ],
                sentences:[
                    "A sad one. I have rarely asked for anything. I have rarely gotten anything.",
                    "A happy one. I have never regretted the time I spent doing what I love.",
                    "A sad one. Don't trust anyone who tells you \"we're like family\". I regret it.",
                    "A happy one. Setting limits for myself taught me to love the little things.",
                    "A sad one. I fear that there will be only you, in this place and at that time.",
                    "A happy one. As a boy I drew on the train and gave the drawings away. Although they were terrible drawings, I will be eternally grateful to the strangers who asked for them.",
                    "A sad one. I committed to embracing those I respect in the things I make. That's all that's left of them.",
                    "A happy one. I feel safe in my happy memories. I have defended them by building on the sad memories.",
                    "A sad one. Sometimes it's good to give up on your dreams, especially when they coincide with the nightmares of those who support you.",
                    "A happy one. If you're playing this game and I haven't asked you to, thank you so much!",
                    "A sad one. My own hate and resentment are the only things that can chip away at my self-esteem.",
                    "A happy one. I have loved every moment I have taught someone. I remember my teachers fondly.",
                    "A sad one. Work is work. Life is life. The sooner you learn their ways of seducing and tricking you, the better.",
                    "A happy one. I love talking (civilly) with people who think differently. It's like a journey into the unknown.",
                    "A sad one. I'm sure no one is reading this sentence."
                ]
            },
            BIANCA:{
                at:[ "kesiev-history" ],
                voiceAudio:[ "architect-bianca-voice" ],
                voiceResource:{ type:"audio", id:"architect-bianca-voice", title:"Architect Bianca voice", by:[ "Bianca" ], file:"architects/voices/bianca", pitchStart:1, pitchRange: 0.2, volume:CONST.VOLUME.VOICE },
                layout:{
                    name:"Architect Bianca",
                    bottomDress:"shortCoat",
                    topDress:"monk",
                    shoes:"sandals",
                    eyes:"girlyGlasses",
                    hair:"tuftLong"
                },
                paySentence:PAYSENTENCE_DEFAULT,
                cantPaySentence:CANTPAYSENTENCE_DEFAULT,
                plaques:[
                    "\"I have a bad relationship with Time. It eludes me, and I crave it.\"",
                    "\"I feel a deep, primal bond with beings of the past and future. But my imagination can only graze them.\""
                ],
                sentences:[
                    "I constantly search for answers. But the questions always outnumber them.",
                    "I can't fight the awareness that doubt is the most honest way to uncover the truth.",
                    "I am the beings who build my boundaries, and I am the interactions with the world around me that expand them.",
                    "Plot-making is essential for the mind to impose meaning onto reality. But narrative addiction is a dangerous fog."
                ]
            },
            NINJOE:{
                at:[ "kesiev-race" ],
                voiceAudio:[ "architect-ninjoe-voice" ],
                voiceResource:{ type:"audio", id:"architect-ninjoe-voice", title:"Architect NinJoe voice", by:[ "NinJoe" ], file:"architects/voices/ninjoe", pitchStart:0.9, pitchRange: 0.3, volume:CONST.VOLUME.VOICE },
                layout:{
                    name:"Architect NinJoe",
                    bottomDress:"shortCoat",
                    topDress:"monk",
                    shoes:"sandals",
                    hair:"pulledLong",
                    eyes:"glasses",
                    nose:"pointy",
                    goatee:"longPointy",
                    mouth:"none"
                },
                paySentence:PAYSENTENCE_DEFAULT,
                cantPaySentence:CANTPAYSENTENCE_DEFAULT,
                plaques:PLAQUES_NONE,
            },
            MORPHEUS:{
                at:[ "kesiev-mastermind" ],
                voiceAudio:NOVOICE_AUDIO,
                voiceResource:NOVOICE_RESOURCE,
                layout:{
                    name:"Architect Morpheus",
                    bottomDress:"shortCoat",
                    topDress:"monk",
                    shoes:"sandals",
                    eyes:"blue",
                    hair:"buzz",
                    goatee:"shavedGood",
                    nose:"pointy"
                },
                paySentence:PAYSENTENCE_DEFAULT,
                cantPaySentence:CANTPAYSENTENCE_DEFAULT,
                plaques:PLAQUES_NONE,
            },
            GIUSEPPEC:{
                at:[ "kesiev-slots" ],
                voiceAudio:[ "architect-giuseppec-voice" ],
                voiceResource:{ type:"audio", id:"architect-giuseppec-voice", title:"Architect Giuseppe C voice", by:[ "Giuseppe C" ], file:"architects/voices/giuseppec", pitchStart:0.9, pitchRange: 0.3, volume:CONST.VOLUME.VOICE },
                layout:{
                    name:"Architect Giuseppe C.",
                    bottomDress:"shortCoat",
                    topDress:"monk",
                    shoes:"sandals",
                    eyes:"glasses",
                    mustaches:"wrinkles",
                    hair:"sides",
                    mouth:"wrinkles",
                    nose:"wide"
                },
                paySentence:PAYSENTENCE_DEFAULT,
                cantPaySentence:CANTPAYSENTENCE_DEFAULT,
                plaques:[
                    // Mi annoiano le feste di qualsiasi genere.
                    "I'm bored by parties of any kind.",
                    // Il lavoro di analista programmatore mi soddisfaceva molto.
                    "I was very satisfied with my work as a programmer analyst.",
                    // Ho grande commozione davanti al bello sino a lacrimare.
                    "I am so moved by beauty that I shed tears."                    
                ],
                sentences:[
                    // Desidero il benessere e la buona salute dei miei figli e nipoti.
                    "I wish for the well-being and good health of my children and grandchildren.",
                    // Adoro la figura dei miei genitori e ne sento la mancanza.
                    "\"I love my parents and I miss them.\"",
                    // I miei sport preferiti erano la pallavolo, la pesca subaquea, il biliardo e il ballo - in particolare il tango argentino.
                    "My favorite sports were volleyball, spearfishing, billiards, and dancing – especially Argentine tango.",
                    // Mi fa stare male l'avere debiti e non riuscire a risolvere i problemi che la vita ci da da affrontare.
                    "It makes me feel bad to have debt and not be able to solve the problems that life throws at us.",
                    // Ho scoperto che è bello vivere da solo, essere indipendente e in salute se non sei amato veramente da qualcuno.
                    "I've discovered that it's good to live alone, to be independent and healthy if you're not truly loved by someone.",
                    // Mi fa stare male non avere sufficienti soldi in tasca.
                    "It makes me feel bad not having enough money in my pocket."
                ]
            },
            MARIADL:{
                at:[ "kesiev-kitchen" ],
                voiceAudio:[ "architect-mariadl-voice" ],
                voiceResource:{ type:"audio", id:"architect-mariadl-voice", title:"Architect Maria DL voice", by:[ "Maria DL" ], file:"architects/voices/mariadl", pitchStart:0.9, pitchRange: 0.3, volume:CONST.VOLUME.VOICE },
                layout:{
                    name:"Architect Maria DL.",
                    bottomDress:"shortCoat",
                    topDress:"monk",
                    shoes:"sandals",
                    eyes:"rings",
                    mustaches:"wrinkles",
                    hair:"shortWave",
                    nose:"wide"
                },
                paySentence:PAYSENTENCE_DEFAULT,
                cantPaySentence:CANTPAYSENTENCE_DEFAULT,
                plaques:[
                    // La cucina è convivialità.
                    "\"Cooking is conviviality.\"",
                    // La cucina esprime benessere ai miei commensali. Ai miei figli.
                    "\"Cooking conveys well-being to my guests. To my children.\""
                ],
                sentences:[
                    // I miei genitori non volvevano che facessi quello che volevo. Non potevo fare niente di quello che volevo.
                    "My parents didn't want me to do what I wanted. I couldn't do anything I wanted.",
                    // Non ho finito la scuola e me ne pento. Ho pure provato a finirla da adulta ma non ci sono riuscita. A volte sogno di tenere degli esami...
                    "I didn't finish school, and I regret it. I even tried to finish it as an adult, but I couldn't. Sometimes I dream of taking exams...",
                    // Con il matrimonio pensavo di aver raggiunto gli obiettivi della mia vita. Ma non è così.
                    "With marriage, I thought I'd achieved my life's goals. But that's not the case.",
                    // Oggi mi sento realizzata come madre e conseguentemente come nonna. Facendo del mio meglio e per quello che posso fare.
                    "Today I feel fulfilled as a mother and, consequently, as a grandmother. Doing my best and doing what I can.",
                    // Oh, mia sorella Enza...
                    "Oh, my dear sister Enza...",
                    // A distanza di anni riconosco l'educazione dei miei genitori. Da giovane non la capivo.
                    "Years later, I recognize my parents' upbringing. When I was young, I didn't understand it.",
                    // Ho imparato a contare su me stessa e non su gli altri.
                    "I've learned to rely on myself and not on others."
                ]
            },
            PREUK:{
                at:[ "default-tomb" ],
                voiceAudio:[ "architect-preuk-voice" ],
                voiceResource:{ type:"audio", id:"architect-preuk-voice", title:"Architect Preuk voice", by:[ "Preuk" ], file:"architects/voices/preuk", pitchStart:1, pitchRange: 0.2, volume:CONST.VOLUME.VOICE },
                layout:{
                    name:"Architect Preuk",
                    bottomDress:"shortCoat",
                    topDress:"monk",
                    shoes:"sandals",
                    mustaches:"curvy",
                    goatee:"long",
                    nose:"small",
                    hair:"shortMessy"
                },
                paySentence:PAYSENTENCE_DEFAULT,
                cantPaySentence:CANTPAYSENTENCE_DEFAULT,
                plaques:[
                    "If it runs on a computer, it WILL crash at the most inconvenient time.",
                    "One might go faster alone, but we go further together.",
                    "418 I'm a teapot",
                    "Always maek sure not to laeve typios in yout games!1!"
                ],
                sentences:[
                    "Take this word, it's supposed to help.",
                    "It's getting late, you should go to bed.",
                    "Money can't buy happiness. But it sure does make life easier!",
                    "Bonjour, pour Op&#xE9;ra, je dois changer &#xE0; Ch&#xE2;telet?",
                    "Don't talk to me until I've had my morning coffee.",
                    "Help! I'm trapped in a videogame quotes genarator!"
                ]
            }
        };

    let
        list = [],
        byTombId = {};

    for (let k in ARCHITECTS) {
        let
            architect = ARCHITECTS[k];

        if (architect.at)
            architect.at.forEach(tombId=>{
                if (byTombId[tombId])
                    console.warn("Double achitect at",tombId,":",architect.layout.name,"and",byTombId[tombId].layout.name);
                else
                    byTombId[tombId] = architect;
            })

        if (!architect.isAnonymous)
            list.push(architect);
            
    }

    for (let k in MISSING_DATA)
        if (MISSING_DATA[k].length) {
            let
                architect = Tools.clone(ANONYMOUS_ARCHITECTS.none);

            architect.layout.special = k;
            ANONYMOUS_ARCHITECTS[k]=architect;
        }

    function glitchText(random, text) {
        let
            out = "";

        for (let i=0;i<text.length;i++) {
            let
                letter = text[i];

            if (random.integer(4) == 1)
                letter = letter.toLowerCase();
            if (random.integer(5) == 1)
                letter = "<span style='background-color:#fff;color:#f00'>"+letter+"</span>";

            out += letter;
        }

        return out;

    }

    function getMissingDataTag(tags) {
        for (let i=0;i<tags.length;i++)
            if (MISSING_DATA[tags[i]])
                return tags[i];
    }

    return {
        MISSING_DATA:MISSING_DATA,
        list:list,
        getArchitectRoomSentence:(game, room, architect)=>{
            if (architect.sentences)
                return {
                    isText:true,
                    by:architect.layout.name,
                    text:room.random.element(architect.sentences)
                };
            else {

                let
                    foundTag = getMissingDataTag(room.tomb.tags);

                if (!game.missingData)
                    game.missingData = {};

                if (foundTag) {
                    let
                        quote;

                    if (!game.missingData[foundTag])
                        game.missingData[foundTag] = { elements:MISSING_DATA[foundTag] };
                    
                    quote = room.random.bagPick(game.missingData[foundTag]);

                    return {
                        isMissingData:true,
                        by:glitchText(room.random, room.random.element(MISSING_DATA_ERRORS)),
                        text:"\""+quote.text+"\" - "+quote.by
                    };
                } else {
                    console.warn("No sentence for room",room,"architect",architect);
                    return { isMissing:true, by:"ERROR", text:"I AM ERROR" };
                }
            }
        },
        getAt:(tombId, tags)=>{
            if (byTombId[tombId])
                return byTombId[tombId];
            else {
                let
                    foundTag = getMissingDataTag(tags);

                if (foundTag && ANONYMOUS_ARCHITECTS[foundTag])
                    return ANONYMOUS_ARCHITECTS[foundTag];
                else
                    return ANONYMOUS_ARCHITECTS.none;
            }
        }
    }
    
}());