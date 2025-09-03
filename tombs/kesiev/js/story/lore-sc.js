(function(){

    const
        TOMB_ID = "kesiev-lore-sc",
        TOMB_TAGS = [ "tomb", "story" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        CHECKPOINT_ID = "s",
        SCARECROW = {
            name:"The Scarecrow",
            model:"planted",
            bottomDress:"scarecrow",
            topDress:"tshirt",
            shoes:"scarecrow",
            head:"scarecrow",
            eyes:"none",
            mouth:"none",
            nose:"none"
        }
        DIALOGUES = [
            [
                "Oh, hi! I'm the Scarecrow, thank you for finding me!",
                "I've been living in this dungeon long before the Architects arrived...",
                "...and yet, very few people know of my existence!",
                "I'm very good at hiding in the past, eh eh.",
                "Well, I know these dungeons like the back of my hand. I'll tell you how they were built!",
                "But not now. Don't worry: unlike many other characters who live here, my sentences are not randomly selected from a list.",
                "Make sure you talk to me and get out of here alive. Next time you meet me I'll have something new for you!",
                "See you soon!"
            ],[
                "A large part of the games in these rooms are inspired by old video games...",
                "Specifically, they are inspired by the \"type-in\" games, which were very popular in the 80s.",
                "Their source code was published in magazines, and to play them you had to transcribe them into your computer.",
                "It was quite a pain... but many old Architects learned to program this way!"
            ],[
                "Do you know ASCII graphics video game ZZT?",
                "Wikipedia states that it is a 1991 action-adventure puzzle video game and game creation system developed and published by Potomac Computer Systems for MS-DOS.",
                "It also says that, in that game, players control a smiley face to battle various creatures and solve puzzles in different grid-based boards in a chosen world.",
                "Looking at the map, I wouldn't rule out that ZZT was also an inspiration for this game."
            ],[
                "Many of the games in these rooms are inspired by board games or other types of pastimes.",
                "These can be shortened versions, full conversions, and more! And, when the games aren't directly inspired by games of the genre...",
                "...they work or behave in a similar way! All this to respect a design guideline and a plot element...",
                "The Architects' Tombs are traps whose rules were known only to their clients. For everyone else, they're like board games without a manual."
            ],[
                "Getting back to type-in games... There's another design feature this game shares with them.",
                "Since type-in games had to be typed by hand, their listings tended to be quite short. How did they do it?",
                "Sometimes through amazing programming tricks... but much more often by sacrificing graphics. Sometimes to the point of making the game incomprehensible.",
                "Several rooms in this dungeon are inspired by this flaw: part of the challenge is decoding the interface!"
            ],[
                "Many of the Architects that live here are inspired by real people. But I think you get it from some of their names.",
                "The Founding Architect was the first to invite them. He offered them a single invitation to the project, significantly limiting reminders.",
                "Some of them slowly handed all the required contributions, some others faded away leaving the Founding Architect very little to work on..."
            ],[
                "Speaking of the Architects who live in these tombs...",
                "You've probably noticed several missing data errors in this game, especially when you talk to them.",
                "Well, some Architects didn't provide enough data to be transferred to the tombs. They didn't provide firsthand data.",
                "That's why the Tombs have replaced their messages with a special selection of quotes, in the hope that one day the real data will be recovered..."
            ],[
                "You will surely have met the Anonymous Architects several times. They are used to wearing many hats.",
                "They are the backbone of these tombs and take care of the rooms abandoned by the original Architects.",
                "They claim that, one day, their original creator will return to care for them. And, indeed, it has happened at least once..."
            ],[
                "There is a room where the souls of Architects who do not find a place in the tombs, are protected by 2 guardians.",
                "In my opinion, deciding who to exile and who not is a bit presumptuous of the Founding Architect...",
                "...but I think he did it more to bury the most painful memories.",
                "Keeping them here, won't it instead preserve its memory? Wouldn't it be better to let them fade into the past?"
            ],[
                "This game is, unofficially, the \"video game\" version of a procedural print-and-play game developed in 2021.",
                "Many of the design principles are the same... and the run intro screen is very similar to the one of that game!",
                "This probably happened because of the the Founding Architect obsession with metagame, which is in many of his works.",
                "Well... like many of his latest works, this game also mixes ideas coming from his previous works into a single game."
            ],[
                "The main reason this game exists is because the Founding Architect... is getting old.",
                "While looking for a new game to play on his phone, he discovered that he now prefers slow, varied experiences.",
                "Where has his arcade soul gone?",
                "Anyway, the world is big and no need is truly unique... I hope this game will be useful to you too!"
            ],[
                "The Founding Architect says this game is a Roguelike Ludocrawler... but why?",
                "This game truly is a Roguelike Dungeon Crawler... but this genre often implies certain expectations: intricate labyrinths, bloody fights, dozens of weapons, etc.",
                "This game, however, links several games together in a single dungeon. The dungeon is there, the crawling is there... but not what that implies.",
                "There's an older game developed with the same philosophy: Lazy Jones from 1984. The Founding Architect says it has the same problem!",
                "It's listed on Wikipedia as a platformer... But to be honest, the platforming is very limited and only serves to transition from one game to another!"
            ],[
                "This game was meant to be minimal... in fact the entire engine was supposed to be implemented in just a few lines of code!",
                "Then, due to several rewritings due to browser compatibility issues, the addition of mobile support, and the introduction of new features, the project grew.",
                "What features? Well, neither the story nor the music were planned. Hell, even the Architects concept were added along the way!",
                "Projects like this tend to get out of hand quickly and grow unexpectedly. It's an interesting way to spark creativity and find new challenges, right?"
            ],[
                "Projects by the Founding Architect often have a long README file explaining all the technical and design choices.",
                "Well... I'm that README!",
                "I wonder who these notes are really written for. The Founding Architect never hears of anyone reading them...",
                "It probably thinks there IS someone but has never had any comment to share. Or that there will be someone in the future..."
            ],[
                "The engine that moves these Tombs was written from scratch, as it happens for many other pet-projects of the Founding Architect.",
                "I've never understood the point of reinventing the wheel every time, especially if the results are like these.",
                "Probably for him, part of the fun in making these games is in building what moves them.",
                "...but I don't think that's the right way to make a game for others. Is this the decision that forces us to live here, practically unknown to everyone?"
            ],[
                "This game is designed as a Fantasy Console that runs multiple games at the same time!",
                "The engine that moves the rooms imposes some technical limits, in terms of size, colors, movement, interactions, etc.",
                "The rooms are all implemented following these rules, ruled by a development kit... although sometimes they allow themselves some liberties."
            ],[
                "The reason this game is set in a tomb is... well. Because it's a classic fantasy adventure setting.",
                "It's the perfect (and cliched) place to set a random maze game. But since the introduction of the Architects and the storyline, things have changed...",
                "One of the Architects commented that the concept was quite 'sad' but the initial motivation worked well as a device to lighten the mood.",
                "Then some of the Architects started having fun proposing ideas for their own rooms... and the matter disappeared into the fog.",
            ],[
                "The lore of many games is made up of important people. Great fallen kings, brave warriors whose deeds are remembered for generations...",
                "It is a realistic and plausible choice: it is much more likely to find artifacts that name known people and...",
                "...the more artifacts are found on those people, the easier it is to reconstruct their deeds.",
                "The people who live in these Tombs have not accomplished deeds recognized by the masses. They are people who have lived the best they could and whose names are known only to a handful of individuals.",
                "You probably won't be able to reconstruct their lore - at least, not now. But you will know that they were real and existed. These tombs are an ark for all the others."
            ],[
                "Speaking of the ark. Most of the third party assets used to create this game are licensed under CC0 or Public Domain...",
                "...but you can find the original author names on the game credits when possible.",
                "There are several reasons for this choice and there is an annoying room in these Tombs made specifically to explain it.",
                "I think you will recognize it immediately: its name refers to a puzzle adventure game released in 2025, in the midst of the development of this game."
            ],[
                "The Founding Architect finds highly elaborate creepypastas to be an interesting art form - especially video game-themed ones like Petscop.",
                "The idea that a person locks their fears, traumas, and the souls of loved and hated people into an incomprehensible video game...",
                "...and that they fight the fourth wall to escape or they regretfully accept their role as a simple reminder, is both frightening and romantic.",
                "Perhaps, unconsciously, this game was also influenced by that art form."
            ],[
                "Well... that's all for now.",
                "If I have anything else to tell you, I will not fail to do so!",
                "Have a good trip!"
            ]
        ];

    TOMBS.addTomb({

        isNoDifficulty:true, // Do not contribute to difficulty ramp

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Scarecrow Room",
        description:"Learn the design guidelines and key decisions of the Tomb.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"Relaxing", by:[ "Andreas Viklund" ], id:"kesiev-lore-sc-music1",mod:"tombs/kesiev/audio/music/relaxing.xm", isSong:true},
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            { type:"audio", title:"Scarecrow voice", by:[ "KesieV" ], id:"kesiev-lore-sc1", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"breaker","attack":0.015,"sustain":0.032,"limit":0.248,"decay":0.015,"release":0.076,"frequency":535,"pitch":0.0019,"bitCrush":0,"bitCrushSweep":0,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0} },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    name:this.name,
                    author:this.byArchitect,
                    width:3,
                    height:3,
                    music:"kesiev-lore-sc-music1"
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                // --- Add entrance plaques

                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Setup the room

                let
                    dialogue = [],
                    checkpoint = game.tools.getCheckpoint(room,CHECKPOINT_ID),
                    currentDialogue = DIALOGUES[checkpoint] || DIALOGUES[0],
                    nextCheckpoint =  DIALOGUES[checkpoint+1] ? checkpoint+1 : checkpoint,
                    scarecrow = game.tools.addNpc(room.x+1, room.y+1, Tools.clone(SCARECROW));

                currentDialogue.forEach(line=>{
                    dialogue.push({
                        audio:["kesiev-lore-sc1"],
                        by:"{name}",
                        text:line
                    })
                });

                game.tools.onInteract(scarecrow,[
                    {
                        dialogueSay:dialogue
                    },{
                        asContext:"room",
                        setNextCheckpoint:{
                            id:CHECKPOINT_ID,
                            value:nextCheckpoint
                        }
                    },{
                        asContext:"room",
                        unlockRoom:true
                    },{ movePlayerBack:true }
                ])
            });       
        }
    })
    
})();

