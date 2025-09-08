(function(){

    const
        TOMB_ID = "kesiev-lore-st",
        TOMB_TAGS = [ "tomb", "story" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        CHECKPOINT_ID = "s",
        ITEM_ID = TOMB_ID+":"+CHECKPOINT_ID,
        CHARACTERS = {
            architect:ARCHITECT.layout,
            farmer:{
                isFake:true,
                name:"Farmer",
                bottomDress:"pants",
                topDress:"farmer",
                shoes:"shoes",
                hair:"shortMessy",
                eyes:"sad",
                nose:"big",
                mouth:"sad"
            },
            merchant:{
                isFake:true,
                name:"Merchant",
                bottomDress:"equipmentPants",
                topDress:"fancy",
                shoes:"boots",
                hair:"hat",
                mustaches:"longBeard"
            },
            guard:{
                isFake:true,
                name:"Guard",
                bottomDress:"darkPants",
                topDress:"armor",
                shoes:"greaves",
                hair:"none",
                eyes:"helmet",
                nose:"none",
                mouth:"relaxed",
                hands:"pike"
            },
            darkitect:{
                name:"???",
                bottomDress:"shortCoat",
                topDress:"darkitect",
                shoes:"sandals",
                head:"darkitect",
                eyes:"none"
            }
        },
        MATERIALS = {
            floor:{
                grass:{
                    walkSounds:[ "leaves1" ],
                    texture:[ [ { image:"images/texture.png", imageX:7, imageY:0, backgroundColor:"#090" } ] ],
                    decorations:[
                        { probability:4, element: [ {dy:-9, image:"images/decorations.png", imageX:4, imageY:3 } ]},
                        { probability:2, decoration:{ image:"images/decorations.png", imageX:1, imageY:0 } }
                    ]
                }
            },
            ceiling:{
                none:{
                    texture:[ 0 ],
                }
            }
        },
        SPECIALROOMS = [
            {
                addHealingPotion:true,
                onEnter:{
                    gotoNextScene:true,
                    unlockRoom:true
                }
            },{
                addPoisonPotion:true,
                onEnter:{
                    gotoNextScene:true,
                    unlockRoom:true
                }
            },{
                element:{
                    name:"Statue",
                    model:"floorItem",
                    size:"large",
                    image:"statueArchitect"
                },
                ifNotItem:{
                    unlockRoom:true,
                    randomDialogue:[
                        [ { isNarrator:true, text:"The inscription on the pedestal says \"Yet Another Architect\"." } ],
                        [ { isNarrator:true, text:"The inscription on the pedestal says \"A Bald Man\"." } ],
                        [ { isNarrator:true, text:"The inscription on the pedestal says \"To Assets Recycling\"." } ],
                        [ { isNarrator:true, text:"The inscription on the pedestal says \"Seth Alwaysman\"." } ],
                        [ { isNarrator:true, text:"The inscription on the pedestal says \"#CCC\"." } ],
                        [ { isNarrator:true, text:"The inscription on the pedestal says \"In Memory of All the Placeholders\"." } ],
                    ]
                }
            },{
                element:{
                    name:"Dusty tome",
                    model:"floorItem",
                    image:"bookStand"
                },
                ifNotItem:{
                    unlockRoom:true,
                    randomDialogue:[
                        [ { isNarrator:true, showAudio:"sheet1", text:"It's a card game manual. Wizards fight by shooting spells from breaches!" } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"It's a black book full of drawings. Some of them are cute but you can tell the author is an amateur." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"It's an amateur comic that has a hedgehog as the main character. It seems that the magazine that could have published it closed shortly after." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"It's a nonsense song lyrics. A verse says \"Don't Try This At Home / Le Matrick de Fayardon\"." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"This appears to be a transcript of a board game-themed talk given for a video game event." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"There are some squared sheets, which have grids and numbers. On one of them there is a pear-shaped pattern." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"There are some school reports of a student. The grades reported are sufficiently above the passing grade - nothing special." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"Is there a long description... of how the blast furnace works?" } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"There are pages and pages of code." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"There is a draft of a cyberpunk novel, signed by a woman. It has a style similar to the classics of literature. Strange." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"The pages are almost all torn. On one corner you can still read: \"Makes Tech An Art\"." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"There is some code written in Turbo Pascal. An image shows a screen very similar to that of Windows 95." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"There's an article about an old amateur mobile game where you trap enemies in bubbles." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"There are some letters... in comics? The protagonist seems to be some kind of scarecrow." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"There are some pretty crude comics and jokes that aren't funny. Includes a happy birthday greeting." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"On each page, a boy and a girl appear running on a small planet." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"It looks like material prepared by a master for a role-playing session." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"Is this a manual on how to become a clown...? On the last page it says: \"If you don't try, you'll need it. DL\"." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"It's a photo album. A group of guys are playing at a wedding, while the bride and groom throw... a wool watermelon into the audience?" } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"There is a book of old train tickets that serves as a bookmark. It looks like it is from an old Italian railway." } ],
                        [ { isNarrator:true, showAudio:"sheet1", text:"They look like scattered notes. The phrase \"The map is not the territory\" appears frequently." } ],
                    ]
                }
            }
        ],
        SCENES = [
            // --- Potion rooms.
            [
                {
                    addHealingPotion:true,
                    onEnter:{
                        gotoNextScene:true,
                        unlockRoom:true
                    }
                },{
                    addPoisonPotion:true,
                    onEnter:{
                        gotoNextScene:true,
                        unlockRoom:true
                    }
                }
            ],
            // --- Merchant & Farmer enter the dungeon.
            [
                {
                    music:0,
                    floor:"grass",
                    ceiling:"none",
                    character:"merchant",
                    ifNotItem:{
                        unlockRoom:true,
                        gotoNextScene:true,
                        changeNpc:{ eyes:"default" },
                        dialogue:[
                            { text:"Where did that guy go?" },
                            { isNarrator:true, text:"You apologize for losing the shovel..." },
                            { text:"Uh, shovel? Oh, yeah. Don't worry, I know where it went." },
                            { text:"..." },
                            { text:"So this is the real Architects' Tomb?" },
                            { changeNpc:{ eyes:"shady" }, text:"Good... Good..." },
                        ]
                    }
                },{
                    music:0,
                    floor:"grass",
                    ceiling:"none",
                    character:"farmer",
                    changeNpc:{ mouth:"default", eyes:"default" },
                    ifNotItem:{
                        unlockRoom:true,
                        gotoNextScene:true,
                        dialogue:[
                            { text:"Hey, buddy! Thanks for leaving the shovel at the entrance!" },
                            { text:"I had to dig a bit but I finally made it to the first floor." },
                            { changeNpc:{ eyes:"shady" }, text:"Enough chit-chat, let's go make some Gold!" }
                        ]
                    }
                }
            ],
            // --- Farmer is worried, Guard is on player's track
            [
                {
                    music:0,
                    floor:"grass",
                    ceiling:"none",
                    character:"farmer",
                    ifNotItem:{
                        unlockRoom:true,
                        giveQuestItem:{
                            notification:"You got a broken shovel.",
                            image:"brokenShovel",
                            name:"A broken shovel",
                            description:"It's probably no longer of any use. It belongs to the Merchant."
                        },
                        dialogue:[                            
                            { changeNpc:{ eyes:"surprised"}, text:"Oh! You scared me..." },
                            { changeNpc:{ eyes:"sad"}, text:"..." },
                            { text:"Here, take it back. This thing weighs a lot and is of no use to me anymore." },
                            { text:"..." },
                            { changeNpc:{ eyes:"thinking"}, text:"I have to find something else to defend myself with or I'm dead..." }
                        ]
                    },
                    ifItem:{
                        dialogue:[
                            { changeNpc:{ eyes:"thinking"}, text:"I have to survive... This is my only chance!" }
                        ]
                    }
                },{
                    music:0,
                    floor:"grass",
                    ceiling:"none",
                    character:"guard",
                    ifNotItem:{
                        dialogue:[                            
                            { text:"Mmmh..." }
                        ]
                    },
                    ifItem:{
                        removeQuestItem:true,
                        removeCharacterAt:[ 0 ],
                        unlockRoom:true,
                        gotoNextScene:true,
                        dialogue:[
                            { text:"Bad timing, you damned thief!" },
                            { text:"Oh! Is this the shovel you stole? Did you even break it?" },
                            { text:"That merchant will be very angry... the jail awaits you, my friend!" },
                            { text:"Stay here. I'm looking for a way out of here." }
                        ]
                    }
                }
            ],
            // --- Merchant is lost, Guard is scared
            [
                {
                    music:0,
                    floor:"grass",
                    ceiling:"none",
                    character:"merchant",
                    changeNpc:{ eyes:"thinking" },
                    ifNotItem:{
                        unlockRoom:true,
                        dialogue:[                            
                            { text:"How... how can I..." }
                        ]
                    },
                    ifItem:{
                        gotoNextScene:true,
                        dialogue:[
                            { changeNpc:{ eyes:"surprised"}, text:"Oh... is that my shovel?" },
                            { changeNpc:{ eyes:"thinking"}, text:"..." },
                            { changeNpc:{ eyes:"surprised"}, text:"How is that possible?" },
                            { changeNpc:{ eyes:"thinking"}, text:"..." },
                        ]
                    }
                },{
                    music:0,
                    floor:"grass",
                    ceiling:"none",
                    character:"guard",
                    ifNotItem:{
                        unlockRoom:true,
                        giveQuestItem:{
                            notification:"You got the broken shovel again.",
                            image:"brokenShovel",
                            name:"A broken shovel",
                            description:"Is it really cursed?"
                        },
                        dialogue:[                            
                            { text:"I can't find the exit..." },
                            { text:"This shovel... is it cursed? HAVE YOU CURSED ME?" },
                            { text:"Go away, you DAMN SORCERER!" }
                        ]
                    },
                    ifItem:{
                        dialogue:[
                            { text:"GO! AWAY!" }
                        ]
                    }
                }
            ],
            // --- Darkitect appear, Farmer is paniking
            [
                {
                    music:0,
                    floor:"grass",
                    ceiling:"none",
                    character:"darkitect",
                    changeNpc:{ mouth:"sad" },
                    ifNotItem:{
                        unlockRoom:true,
                        gotoNextScene:true,
                        dialogue:[
                            { text:"..." },
                            { text:"It's you... So I managed to get back..." },
                            { text:"..." },
                            { changeNpc:{ mouth:"default" }, text:"Interesting." }
                        ]
                    }
                },{
                    music:0,
                    floor:"grass",
                    ceiling:"none",
                    character:"farmer",
                    changeNpc:{ eyes:"thinking" },
                    ifNotItem:{
                        unlockRoom:true,
                        gotoNextScene:true,
                        dialogue:[
                            { text:"Please! You have to help me!" },
                            { text:"I can't get out of here!" },
                            { changeNpc:{ eyes:"surprised" }, text:"I can't get OUT OF THIS ROOM!" }
                        ]
                    }
                }
            ],
            // --- Farmer is exhausted, Architect appears
            [
                {
                    music:0,
                    floor:"grass",
                    ceiling:"none",
                    character:"farmer",
                    changeNpc:{ eyes:"thinking" },
                    ifNotItem:{
                        unlockRoom:true,
                        changeNpc:{ eyes:"surprised" },
                        dialogue:[
                            { text:"Please... I don't want the gold anymore... I want to go home!" }
                        ]
                    },
                    ifItem:{
                        unlockRoom:true,
                        removeQuestItem:true,
                        removeCharacterAt:[ 1 ],
                        changeNpc:{ eyes:"surprised" },
                        gotoNextScene:true,
                        dialogue:[
                            { text:"W... what is this?" },
                            { text:"Should I drink it? Will it help me?" }
                        ]
                    }
                },{
                    music:0,
                    character:"architect",
                    ifNotItem:{
                        unlockRoom:true,
                        giveQuestItem:{
                            notification:"You got a purple potion.",
                            image:"debugPotion",
                            name:"A purple potion",
                            description:"Since when is it possible to keep potions in the inventory?"
                        },
                        dialogue:[
                            { text:"Hey! Look who's back!" },
                            { text:"I was looking for you. It seems like the tutorial NPCs followed you into these tombs..." },
                            { text:"Well. Anyone can find themselves having to fix a bug or two." },
                            { text:"Since this dungeon is randomly genearated, it's hard for me to know when they'll reappear." },
                            { text:"Keep this potion. Give it to them and we'll sort this out. Have fun!" },
                        ]
                    },
                    ifItem:{
                        dialogue:[
                            { text:"Thanks for your contribution to this open source project!" }
                        ]
                    }
                }
            ],
            // --- Architect gives another task, no NPC is around
            [
                {
                    music:0,
                    character:"architect",
                    ifNotItem:{
                        unlockRoom:true,
                        giveQuestItem:{
                            notification:"You got another purple potion.",
                            image:"debugPotion",
                            name:"A purple potion",
                            description:"Apparently this is to fix bugs in this game."
                        },
                        dialogue:[
                            { text:"Thanks so much for the little job last time! Here's another potion!" },
                            { text:"Keep up the good work, champ!" }
                        ]
                    },
                    ifItem:{
                        dialogue:[
                            { text:"Keep up the good work, champ!" }
                        ]
                    }
                },{
                    onEnter:{
                        gotoNextScene:true,
                        unlockRoom:true
                    }
                }
            ],
            // --- Darkitect reveal its plan, Architect attempt another task
            [
                {
                    music:0,
                    floor:"grass",
                    ceiling:"none",
                    character:"darkitect",
                    changeNpc:{ mouth:"sad" },
                    ifNotItem:{
                        unlockRoom:true,
                        dialogue:[
                            { text:"He's a liar." },
                            { text:"A religious fanatic, full of lies." },
                            { text:"He wants to bury us all. He wants us to be forgotten!" },
                            { changeNpc:{ eyes:"thinking"}, text:"He just wants to kill us all. We have to do something!" }
                        ]
                    }
                },{
                    music:0,
                    character:"architect",
                    ifNotItem:{
                        unlockRoom:true,
                        giveQuestItem:{
                            notification:"You got another purple potion.",
                            image:"debugPotion",
                            name:"A purple potion",
                            description:"You should give it to someone..."
                        },
                        removeCharacterAt:[ 0 ],
                        gotoNextScene:true,
                        dialogue:[
                            { text:"Oops... I miscalculated last time. Here's a new vial." },
                            { text:"This time I'm sure there's someone to give it to!" },
                            { text:"Go ahead, champ!" }
                        ]
                    },
                    ifItem:{
                        dialogue:[
                            { text:"This time it's for real!" }
                        ]
                    }
                }
            ],
            // --- Architect is thinking, Farmer is gone missing
            [
                {
                    music:0,
                    character:"architect",
                    ifNotItem:{
                        unlockRoom:true,
                        dialogue:[
                            { text:"..." }
                        ]
                    }
                },{
                    music:0,
                    floor:"grass",
                    ceiling:"none",
                    character:"farmer",
                    changeNpc:{ eyes:"none", mouth:"none", nose:"none" },
                    ifNotItem:{
                        unlockRoom:true,
                        removeCharacterAt:[ 1 ],
                        gotoNextScene:true,
                        dialogue:[
                            { isNarrator:true, text:"Entity FARMER forgotten." }
                        ]
                    }
                }
            ],
            // --- Architect is thinking, Darkitect gives a final weapon
            [
                {
                    music:0,
                    character:"architect",
                    changeNpc:{ eyes:"thinking" },
                    ifNotItem:{
                        unlockRoom:true,
                        dialogue:[
                            { text:"..." }
                        ]
                    },
                    ifItem:{
                        goBackToIntro:true,
                        gotoNextScene:true,
                        music:"kesiev-lore-st-music1",
                        dialogue:[
                            { text:"Good. Good. So was this all a plan against me?" },
                            { text:"Against us?" },
                            { text:"What do you have there? What are all those colors and shades?" },
                            { text:"Are you... seriously going to use that detailed sprite against me?" },
                            { text:"Are you going to stab an Architect in his last refuge?" },
                            { text:"..." },
                            { changeNpc:{ eyes:"surprised" }, text:"..." },
                            { text:"HA HA HA! YOU ARE SO DELUDED!"},
                            { text:"If you kill me WE WILL BECOME IMPORTANT!" },
                            { text:"EVERYONE WILL REMEMBER ME AS..." },
                            { text:"...THE ARCHITECT KILLED IN HIS GRAVE!" },
                            { changeNpc:{ eyes:"default" }, text:"And you... you too..." },
                            { changeNpc:{ eyes:"shady" }, text:"HA HA! Everyone will remember YOU as the CORPSE MURDERER!" },
                            { text:"Go on... do it..." },
                            { changeNpc:{ eyes:"surprised" }, text:"IT WAS WHAT WE ALWAYS WANTED!" },
                            { text:"DO IT!" }
                        ]
                    }
                },{
                    music:0,
                    floor:"grass",
                    ceiling:"none",
                    character:"darkitect",
                    ifNotItem:{
                        unlockRoom:true,
                        giveQuestItem:{
                            notification:"You got DAGGER.png",
                            image:"trueDagger",
                            name:"A DAGGER.png",
                            description:"That's what it is."
                        },
                        dialogue:[
                            { text:"Here. Kill him." },
                            { text:"See you outside." }
                        ]
                    },
                    ifItem:{
                        changeNpc:{ eyes:"thinking", mouth:"sad" },
                        dialogue:[
                            { text:"Do it. Now." }
                        ]
                    }
                }
            ],
            // --- The Special Rooms are spawned
            [
                { isSpecialRoom:true },
                { isSpecialRoom:true }
            ]
        ];

    function paint(game, room, area, side, material) {
        let
            materialData = MATERIALS[side][material];

        if (materialData)
            for (let x=0;x<area.width;x++)
                for (let y=0;y<area.height;y++) {
                    let
                        cell = game.map[area.y+y][area.x+x];
                    if (materialData.walkSounds)
                        game.tools.paintData(cell, { sounds:{ walk: materialData.walkSounds } });
                    if (materialData.texture) {
                        switch (side) {
                            case "floor":{
                                game.tools.paintFloor(0, cell, game.tools.SOLID, materialData.texture);
                                break;
                            }
                            case "ceiling":{
                                game.tools.paintCeiling(0, cell, game.tools.SOLID, materialData.texture);
                                break;
                            }
                        }
                    }
                    if (materialData.decorations)
                        materialData.decorations.forEach(decoration=>{
                            if (!decoration.probability || (room.random.integer(10)<decoration.probability)) {
                                if (decoration.element)
                                    game.tools.addElement(cell.x,cell.y, { sprite:decoration.element }, true);
                                if (decoration.decoration) {
                                    switch (side) {
                                        case "floor":{
                                            cell.floor[0].push(decoration.decoration);
                                            break;
                                        }
                                        case "ceiling":{
                                            cell.ceiling[0].push(decoration.decoration);
                                            break;
                                        }
                                    }
                                }
                            }
                        })
                }

    }

    function assignNpcEvents(checkpoint, game, room, script, npc, npcs, condition, goahead, data) {

        let
            audio = npc.isFake ? [ "beep1" ] : 0,
            setFake = npc.isFake,
            dialogue = data.dialogue;

        if (data.randomDialogue)
            dialogue = room.random.element(data.randomDialogue);

        if (data.music)
            script.push({
                if:condition,
                playMusic:data.music
            });

        if (data.changeNpc)
            script.push({
                if:condition,
                changeNpc:data.changeNpc
            });

        if (dialogue) {
            let
                lines = [];

            dialogue.forEach(line=>{
                lines.push({
                    npc:npc,
                    changeNpc:line.changeNpc,
                    showAudio:line.showAudio,
                    audio:audio,
                    setFake:setFake,
                    by:line.isNarrator ? 0 : "{name}",
                    text:line.text
                })
            });
            
            script.push({
                if:condition,
                dialogueSay:lines
            });
        }

        if (data.giveQuestItem) {
            script.push({
                if:condition,
                run:(game, context, done)=>{
                    let
                        item = game.tools.addInventoryItem(room,{
                            id:ITEM_ID,
                            group:CONST.GROUP.ROOMITEM,
                            color:CONST.ITEMCOLOR.ROOMITEM,     
                            model:"default",
                            image:data.giveQuestItem.image
                        });

                    game.tools.onUse(item,[
                        {
                            dialogueSay:[ { text:data.giveQuestItem.name+". "+data.giveQuestItem.description } ]
                        },{
                            playAudio:{ sample:"mouseclick1" }
                        }
                    ]);

                    game.tools.playAudio("equip1");
                    done(goahead);
                }
            })
            script.push({
                if:condition,
                dialogueSay:[ { unsetFake:true, text:data.giveQuestItem.notification } ]
            })
        }

        if (data.removeQuestItem) {
            script.push({
                if:condition,
                run:(game, context, done)=>{
                    let
                        item = game.tools.getInventoryItem(ITEM_ID);

                    if (item) {
                        game.tools.removeInventoryItem(item);
                        game.tools.playAudio("equip1");
                    }
                    done(goahead);
                }
            })
        }

        if (data.removeCharacterAt) {
            script.push({
                if:condition,
                run:(game, context, done)=>{
                    data.removeCharacterAt.forEach(id=>{
                        let
                            npc = npcs[id];
                        if (npc)
                            game.tools.removeElement(npc);
                    })
                    game.tools.refreshScreen();
                    done(goahead);
                }
            })
        }

        if ((data.gotoNextScene) && SCENES[checkpoint+1])
            script.push({
                if:condition,
                asContext:"room",
                setNextCheckpoint:{
                    id:CHECKPOINT_ID,
                    value:checkpoint+1
                }
            });
        
        if (data.unlockRoom)
            script.push({
                if:condition,
                asContext:"room",
                unlockRoom:true
            })

        if (data.thenChangeNpc)
            script.push({
                if:condition,
                changeNpc:data.thenChangeNpc
            });

        if (data.goBackToIntro)
            script.push({
                if:condition,
                goBackToIntro:true
            });

    }

    TOMBS.addTomb({

        isNoDifficulty:true, // Do not contribute to difficulty ramp

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Story Room",
        description:"Continue The Tomb Of The Architects story.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:2,
        maxRooms:2,

        resources:[
            { type:"audio", volume:1, title:"Electronic 2-off", by:[ "Markus6166" ], id:"kesiev-lore-st-music1",mod:"tombs/kesiev/audio/music/markus6166_-_electronic_2-off.xm", isSong:true},
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    name:this.name,
                    author:this.byArchitect,
                    width:3,
                    height:3
                },{
                    name:this.name,
                    author:this.byArchitect,
                    width:3,
                    height:3
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                npcs = [];

            rooms.forEach((room,id)=>{
                let
                    checkpoint = game.tools.getCheckpoint(room,CHECKPOINT_ID) || 0,
                    currentScene = SCENES[checkpoint],
                    currentRoomScene = currentScene[id],
                    center = game.map[room.y+1][room.x+1],
                    npc = 0;

                if (currentRoomScene.isSpecialRoom)
                    currentRoomScene = room.random.element(SPECIALROOMS);

                // --- No plaque for these rooms, as they are "outside the game"

                // --- Apply graphics

                if (currentRoomScene.floor)
                    paint(game, room, room, "floor", currentRoomScene.floor);
                
                if (currentRoomScene.ceiling)
                    paint(game, room, room, "ceiling", currentRoomScene.ceiling);

                game.tools.setFloorPaintable(room, false);
                game.tools.setCeilingPaintable(room, false);
                game.tools.setElementPaintable(room, false);

                if (currentRoomScene.music !== undefined)
                    room.music = currentRoomScene.music;

                if (currentRoomScene.addHealingPotion)
                    game.tools.addHealingPotion(center);
                
                if (currentRoomScene.addPoisonPotion)
                    game.tools.addPoisonPotion(center);

                if (currentRoomScene.onEnter) {
                    let
                        events = [];

                    if ((currentRoomScene.onEnter.gotoNextScene) && SCENES[checkpoint+1])
                        events.push({
                            asContext:"room",
                            setNextCheckpoint:{
                                id:CHECKPOINT_ID,
                                value:checkpoint+1
                            }
                        });

                    if (currentRoomScene.onEnter.unlockRoom)
                        events.push({
                            asContext:"room",
                            unlockRoom:true
                        })

                    if (events.length)
                        game.tools.onEnter(room,events);
                    
                }

                if (currentRoomScene.character)
                    npc = game.tools.addNpc(center.x, center.y, Tools.clone(CHARACTERS[currentRoomScene.character]));

                if (currentRoomScene.element)
                    npc = game.tools.addElement(center.x, center.y, Tools.clone(currentRoomScene.element), true);

                if (npc) {
                    let
                        script = [
                            {
                                run:(game, context, done)=>{
                                    let
                                        item = game.tools.getInventoryItem(ITEM_ID);
                                    done(!!item);
                                }
                            }
                        ];

                    npcs[id] = npc;

                    if (currentRoomScene.changeNpc)
                        game.tools.changeNpc(npc, currentRoomScene.changeNpc);

                    if (currentRoomScene.ifItem)
                        assignNpcEvents(checkpoint, game, room, script, npc, npcs, { and:true }, true, currentRoomScene.ifItem);

                    if (currentRoomScene.ifNotItem)
                        assignNpcEvents(checkpoint, game, room, script, npc, npcs, { else:true }, false, currentRoomScene.ifNotItem);

                    script.push({ movePlayerBack:true });

                    game.tools.onInteract(npc, script);
                    
                }

            });

        }
    })
    
})();

