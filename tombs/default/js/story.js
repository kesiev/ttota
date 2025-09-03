(function(){ 

    // --- A basic first-person RPG framework built in TTOTsA

    const
        DECORATIONS_SCRATCHES = [
            { image:"images/decorations.png", imageX:0, imageY:0 },
            { image:"images/decorations.png", imageX:2, imageY:0 },
            { image:"images/decorations.png", imageX:3, imageY:0 },
            { image:"images/decorations.png", imageX:4, imageY:0 },
        ],
        ANIMATION_LAMP = [ 0, 0, 0, { dx:-101 }, { dx:-101 }, { dx:-101 } ],
        BOOKS = {
            lore:{
                books:[
                    [
                        "BOOK 1: The Legend of Architects",
                        "\"Long time ago, merchants and kings used to store their belongings in dungeons.\"",
                        "\"These intricate labyrinths could be traversed in a matter of minutes by those who knew their secrets...\"",
                        "\"...but they became deadly traps for adventurers and thieves thirsty for gold.\""
                    ],[
                        "BOOK 2: Living as an Architect",
                        "\"The Architects' Guild housed the tortuous minds of these dungeon designers.\"",
                        "\"Some of them were solitary and silent. Others were mischievous and noisy. They spent their entire lives designing safes and death machines.\"",
                        "\"For them it was just a diabolical game, for which they were paid handsomely. Becoming an Architect was the dream of every young scholar.\""
                    ],[
                        "BOOK 3: The Gift of the Goddess",
                        "\"The Goddess, on the day of the Golden Moon, decided to give her powers to a select few.\"",
                        "\"They banded together into a single guild, the Magic Guild. It didn't take long for it to become popular.\"",
                        "\"Many young people were drawn to the magical arts, and the ranks of the Architects' Guild began to dwindle. But the worst was yet to come...\""
                    ],[
                        "BOOK 4: The Dying Wizard",
                        "\"The most common spell among wizards was one that allowed them to hide objects within small parallel dimensions.\"",
                        "\"This spell was used to keep secret and dangerous books and potions away from evil rulers and dark wizards.\"",
                        "\"One day, a small merchant received the formula for this spell from a wounded wizard in exchange for healing...\""
                    ],[
                        "BOOK 5: A Merchant's Legacy",
                        "\"Many years later, the now old little merchant used the spell to hide all his gold in one of these small parallel dimensions.\"",
                        "\"His son and sole heir to the estate, joined him on his deathbed and shook his father's hand shortly before he passed away.\"",
                        "\"To his surprise, he discovered that his entire fortune had been magically transferred to a small parallel dimension of his own with the touch of his hand...\""
                    ],[
                        "BOOK 6: The Fall of the Architects",
                        "\"It didn't take the young wizard long to perfect his father's spell.\"",
                        "\"He made it easier to recite and even managed to include in the formula the amount of gold that was to be transferred.\"",
                        "\"There was no need to hide gold in dangerous dungeons anymore. There was no need for the Architects' Guild anymore...\""
                    ],[
                        "BOOK 7: The Tomb Of The Architects",
                        "\"Shortly thereafter, due to lack of funds, the Architects' Guild disbanded.\"",
                        "\"Their members began to disappear one after another. Today, we have no trace of them.\"",
                        "\"Legend has it that they gathered in a secret dungeon, to plan their own tomb...\""
                    ]
                ],
                onCompleteMessage:"Under the book you found a key.",
                onCompleteAddItem:{
                    data:{
                        isKey:true,
                        id: "key-2",
                        group:CONST.GROUP.KEY,
                        color:CONST.ITEMCOLOR.KEY,
                        model:"key",
                        shape: 2
                    },
                    events:{
                        onUse:[
                            {
                                if:{
                                    asContext:"cell",
                                    is:{
                                        isDoor:true,
                                        needsKey:2
                                    }
                                },
                                asContext:"cell",
                                openDoor:true
                            },{
                                if:{ and:true },
                                removeInventoryItem:true
                            },{
                                if:{
                                    else:true
                                },
                                dialogueSay:[
                                    {
                                        text:"A key with a "+CONST.KEY_NAMES[2]+"-shaped symbol."
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        }
        ENTRANCE_PATTERN = {
            center:{
                map:[
                    "_______________________________________________________",
                    "_______________________________________________________",
                    "_______________________________________________________",
                    "_______________________________________________________",
                    "_____________________________________vvvvvvvvvvvvvvvvvv",
                    "____________________________________>__________________",
                    "____________________________________>_P^^^^^^^^^^Z_P^^^",
                    "____________________________________>_<__________>_<___",
                    "____________________________________#I#__________>_<___",
                    "____________________________________#:#__________>_<___",
                    "__________________________________######_________>_####",
                    "__________________________________#....#vvv####vvJ_O..W",
                    "__________________________________#.:::.___----____X.x.",
                    "__________________________________#.:..#^^^####^^Z_O..W",
                    "__________________________________##:###_________>_####",
                    "___________________________________#:#___________>_<___",
                    "___________vvv_____vvv_____vvv___###:##__________>_<___",
                    "__________>___LvvvJ___LvvvJ___Lvv#..:.#__________J_L___",
                    "__________>_D_____________________.::.[_________>___<__",
                    "__________>___P^^^Z___P^^^Z___P^^#....#_________>___<__",
                    "___________Z_P_____^^^_____Z_P___######_________>___<__",
                    "_______vvvvJ_<_____________>_<___________________^^^___",
                    "______>______<_____________J_L_________________________",
                    "______>_P^^^^_____________>___<________________________",
                    "______>_<_________________>___<________________________",
                    "______J_L_________________>___<________________________",
                    "_____>___<_________________^^^_________________________",
                    "_____>___<_____________________________________________",
                    "_____>___<_________________###_________________________",
                    "______^^^______________________________________________",
                    "_______________________________________________________",
                    "_______________________________________________________",
                    "_______________________________________________________",
                    "_______________________________________________________",
                    "_______________________________________________________",
                ],
                elements:[
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                     k                 ",
                    "                                                       ",
                    "                                                      w",
                    "                                                     ! ",
                    "                                                      w",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                  b    ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "       b                                               ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                ],
                npcs:[
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                   M                   ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                 G                     ",
                    "                   F                                   ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                ]
            }
        },
        ENTRANCE_PALETTE = {
            "P":{
                isWall:true,
                isTransparent:true,
                walls:[
                    [ { image:"images/texture.png", imageX:0, imageY:4 } ],
                    0,
                    0,
                    [ { image:"images/texture.png", imageX:0, imageY:4 } ]
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ 0 ],
                floor:[ [ { image:"images/texture.png", imageX:7, imageY:0, backgroundColor:"#090" } ] ]
            },
            "Z":{
                isWall:true,
                isTransparent:true,
                walls:[
                    [ { image:"images/texture.png", imageX:0, imageY:4 } ],
                    [ { image:"images/texture.png", imageX:0, imageY:4 } ],
                    0,
                    0,
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ 0 ],
                floor:[ [ { image:"images/texture.png", imageX:7, imageY:0, backgroundColor:"#090" } ] ]
            },
            "L":{
                isWall:true,
                isTransparent:true,
                walls:[
                    0,
                    0,
                    [ { image:"images/texture.png", imageX:0, imageY:4 } ],
                    [ { image:"images/texture.png", imageX:0, imageY:4 } ],
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ 0 ],
                floor:[ [ { image:"images/texture.png", imageX:7, imageY:0, backgroundColor:"#090" } ] ]
            },
            "J":{
                isWall:true,
                isTransparent:true,
                walls:[
                    0,
                    [ { image:"images/texture.png", imageX:0, imageY:4 } ],
                    [ { image:"images/texture.png", imageX:0, imageY:4 } ],
                    0
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ 0 ],
                floor:[ [ { image:"images/texture.png", imageX:7, imageY:0, backgroundColor:"#090" } ] ]
            },
            "v":{
                isWall:true,
                isTransparent:true,
                walls:[
                    0,
                    0,
                    [ { image:"images/texture.png", imageX:0, imageY:4 } ],
                    0
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ 0 ],
                floor:[ [ { image:"images/texture.png", imageX:7, imageY:0, backgroundColor:"#090" } ] ]
            },
            "^":{
                isWall:true,
                isTransparent:true,
                walls:[
                    [ { image:"images/texture.png", imageX:0, imageY:4 } ],
                    0,
                    0,
                    0
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ 0 ],
                floor:[ [ { image:"images/texture.png", imageX:7, imageY:0, backgroundColor:"#090" } ] ]
            },
            ">":{
                isWall:true,
                isTransparent:true,
                walls:[
                    0,
                    [ { image:"images/texture.png", imageX:0, imageY:4 } ],
                    0,
                    0
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ 0 ],
                floor:[ [ { image:"images/texture.png", imageX:7, imageY:0, backgroundColor:"#090" } ] ]
            },
            "<":{
                isWall:true,
                isTransparent:true,
                walls:[
                    0,
                    0,
                    0,
                    [ { image:"images/texture.png", imageX:0, imageY:4 } ]
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ 0 ],
                floor:[ [ { image:"images/texture.png", imageX:7, imageY:0, backgroundColor:"#090" } ] ]
            },
            "#":{
                isWall:true,
                decorations:"scratches",
                walls:[
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#00f" } ] ],
                floor:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#ccc" } ] ],
            },
            "O":{
                isWall:true,
                walls:[
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" }, { brightness:CONST.BRIGHTNESS.LAMP, dy:-9, image:"images/decorations.png", imageX:1, imageY:3, animation: ANIMATION_LAMP } ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" }, { brightness:CONST.BRIGHTNESS.LAMP, dy:-9, image:"images/decorations.png", imageX:1, imageY:3, animation: ANIMATION_LAMP } ],
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#00f" } ] ],
                floor:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#ccc" } ] ],
            },
            "[":{
                logic:{
                    type:"message",
                    side:3,
                    text:"The sign says: \"The Last Outpost\"."
                },
                isWall:true,
                walls:[
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                    [
                        { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" },
                        { image:"images/texture.png", imageX:2, imageY:1 },
                    ],
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#00f" } ] ],
                floor:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#ccc" } ] ],
            },
            "I":{
                logic:{
                    type:"lever",
                    side:0,
                    text:"Something moved in the outpost...",
                    openAtDx:0,
                    openAtDy:2
                },
                isWall:true,
                walls:[
                    [
                        { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" },
                        { isLever:true, image:"images/texture.png", imageX:3, imageY:1 },
                    ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#00f" } ] ],
                floor:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#ccc" } ] ],
            },
            ".":{
                decorations:"scratches",
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                ceiling:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#00f" } ] ],
                floor:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#ccc" } ] ],
            },
            "-":{
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                ceiling:[ 0 ],
                floor:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#ccc" } ] ],
            },
            ":":{
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                ceiling:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#00f" } ] ],
                floor:[ [ { image:"images/texture.png", imageX:2, imageY:0, backgroundColor:"#f00" } ] ],
            },
            "_":{
                decorations:"grass",
                sounds:{ walk: [ "leaves1" ] },
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:" ",
                ceiling:[ 0 ],
                floor:[ [ { image:"images/texture.png", imageX:7, imageY:0, backgroundColor:"#090" } ] ]
            },
            "D":{
                logic:{
                    onDig:{
                        message:"Looks like you dug something up. How lucky!",
                        addAtDx:1,
                        addAtDy:0,
                        addElement:{
                            logic:{
                                type:"keyPart",
                                keyId:1,
                                keyParts:2
                            },
                            model:"floorItem",
                            image:"keyPart"
                        }
                    }
                },
                sounds:{ walk: [ "leaves1" ] },
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:" ",
                ceiling:[ 0 ],
                floor:[ [
                    { image:"images/texture.png", imageX:7, imageY:0, backgroundColor:"#090" },
                    { image:"images/texture.png", imageX:0, imageY:1 }
                ] ]
            },
            "X":{
                isWall:true,
                isDoor:true,
                needsKey:1,
                mapSymbol:CONST.MAPSYMBOLS.DOOR,
                walls:[
                    [
                        { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" },
                        "defaultDoorTexture",
                        { image:"images/texture.png", imageX:1, imageY:2 }
                    ],
                    [
                        { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" },
                        "defaultDoorTexture",
                        { image:"images/texture.png", imageX:1, imageY:2 }
                    ],
                    [
                        { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" },
                        "defaultDoorTexture",
                        { image:"images/texture.png", imageX:1, imageY:2 }
                    ],
                    [
                        { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" },
                        "defaultDoorTexture",
                        { image:"images/texture.png", imageX:1, imageY:2 }
                    ]
                ],
                ceiling:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#00f" } ] ],
                floor:[ [ { image:"images/texture.png", imageX:2, imageY:0, backgroundColor:"#f00" } ] ],
            },
            "x":{
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                ceiling:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#00f" } ] ],
                floor:[ [
                    { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#ccc" },
                    { image:"images/texture.png", imageX:5, imageY:1 }
                ] ],
            },
            
            "b": {
                logic:{
                    type:"coinsBag",
                    coins:3
                },
                model:"floorItem",
                image:"bag"
            },
            "!": {
                logic:{
                    type:"exit",
                    message:"Do you want to go down this ladder?"
                },
                model:"floorItem",
                image:"stairs"
            },
            "k": {
                logic:{
                    type:"keyPart",
                    keyId:1,
                    keyParts:2
                },
                model:"floorItem",
                image:"keyPart"
            },
            "G":{
                logic:{
                    type:"payWall",
                    message:"Hey, you ragamuffin. The area is too dangerous and I can't let you go any further.",
                    request:"Do you want to bribe the guard with Golden Coins?",
                    onPayMessage:"Well. If you want to die, go ahead!",
                    price:1
                },
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
            "F":{
                logic:{
                    type:"npc",
                    messages:[
                        "Darn. I have come all this way for nothing.",
                        "For a poor man like me, what is the point of going to seek riches if you need gold to get in?"
                    ]
                },
                name:"Farmer",
                bottomDress:"pants",
                topDress:"farmer",
                shoes:"shoes",
                hair:"shortMessy",
                eyes:"sad",
                nose:"big",
                mouth:"sad"
            },
            "M":{
                logic:{
                    type:"merchant",
                    beforeSelling:"You don't look like you're from around here. You're probably also looking for some buried treasure near this forgotten dungeon.",
                    afterSelling: "Good luck with your digging!",
                    message:"I can rent a shovel for 4 Golden Coins. Are you interested?",
                    soldMessage:"Thank you!",
                    price:4,
                    item: {
                        data:{
                            id: "shovel",
                            group:CONST.GROUP.ROOMITEM,
                            color:CONST.ITEMCOLOR.ROOMITEM,
                            model:"default",
                            image:"shovel"
                        },
                        events:{
                            onUse:[
                                {
                                    run:(game, context, done)=>{
                                        let
                                            cell = game.map[game.position.y][game.position.x];

                                        if (!cell.isDigged && cell.logic && cell.logic.onDig) {

                                            cell.isDigged = true;
                                            game.tools.removeFloorLayer(cell, cell.floor[0].length-1);
                                            game.tools.refreshScreen();
                                            game.tools.playAudio("dig1");

                                            if (cell.logic.onDig.addElement) {
                                                let element = game.tools.addElement(
                                                    game.position.x+cell.logic.onDig.addAtDx,
                                                    game.position.y+cell.logic.onDig.addAtDy,
                                                    cell.logic.onDig.addElement
                                                );
                                                addElementLogic(game, element);
                                            }

                                            if (cell.logic.onDig.message)
                                                game.tools.dialogueSay(0, [
                                                    {
                                                        text:cell.logic.onDig.message
                                                    }
                                                ], ()=>{
                                                    done(true);
                                                });
                                            else
                                                done(true);

                                        } else done(false);
                                    }  
                                },{
                                    if:{ else: true },
                                    dialogueSay:[
                                        {
                                            text:"A shovel. Maybe you can use it to dig somewhere..."
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                },
                name:"Merchant",
                bottomDress:"equipmentPants",
                topDress:"fancy",
                shoes:"boots",
                hair:"hat",
                mustaches:"longBeard"
            },
            "W":{
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                walls:[0,0,0,0],
                ceiling:[
                    [
                        { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#00f" },
                        { brightness:CONST.BRIGHTNESS.LAMP, image:"images/texture.png", imageX:0, imageY:3, animation:ANIMATION_LAMP }
                    ]
                ],
                floor:[ 
                    [
                        { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#ccc" },
                        { brightness:CONST.BRIGHTNESS.LAMP, image:"images/texture.png", imageX:0, imageY:3, animation:ANIMATION_LAMP }
                    ]
                ]
            },
            "w":{
                brightness:CONST.BRIGHTNESS.LAMP,
                image:"lamp"
            },
            "E":{
                logic:{
                    type:"ending",
                    song:"anonymous-entrance-night2",
                    messages:[
                        "Well! What do you think?",
                        "Come on... I wanted to add to the game a short story that was more explicit about its theme.",
                        "It may not be a masterpiece of narrative... but I still gave it my all.",
                        "I did it for you too, you know? I wanted it to be a story that you'd like... at least a little.",
                        "I did all this so that we could meet here and now!",
                        "Well.",
                        "...",
                        "I have nothing smart to say you right now. How embarrassing!",
                        "...",
                        "Oh, hey!",
                        "How cool was it when you showed up with that colorful sprite?",
                        "It's a dagger from the public domain Flare Item Variation set made by the artist Mumu.",
                        "Then I've said...",
                        "*COUGH COUGH*",
                        "If you kill me WE'LL BECOME IMPORTANT!",
                        "Ah! Ah! Come on. We make a cute couple.",
                        "...",
                        "Alright. The story is over... and It's really chilly out here.",
                        "Let's go back to our usual Tombs, okay?",
                        "Thank you so much for playing!"
                    ]
                },
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
            "i":{
                logic:{
                    type:"message",
                    side:0,
                    text:"I think you won't need this lever anymore..."
                },
                isWall:true,
                walls:[
                    [
                        { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" },
                        { image:"images/texture.png", imageX:4, imageY:1 },
                    ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                    [ { image:"images/texture.png", imageX:0, imageY:0, backgroundColor:"#ccc" } ],
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#00f" } ] ],
                floor:[ [ { image:"images/texture.png", imageX:3, imageY:0, backgroundColor:"#ccc" } ] ],
            },
        },
        DAY1_PATTERN = {
            center:{
                map:[
                    "  #.#  ",
                    "###O###",
                    ".......",
                    ".......",
                    ".......",
                    ".......",
                    ".......",
                    ".......",
                    ".......",
                    ".......",
                    ".......",
                    "###-###",
                    " #...# ",
                    " #.s.# ",
                    " #...# ",
                ],
                elements:[
                    "       ",
                    "       ",
                    "A     A",
                    "       ",
                    " B   B ",
                    "       ",
                    "B  B  B",
                    "       ",
                    " B   B ",
                    "       ",
                    "A     A",
                    "       ",
                    "       ",
                    "   S   ",
                    "       ",
                ],
                npcs:[
                    "   K   ",
                    "       ",
                    "       ",
                    "       ",
                    "       ",
                    "       ",
                    "       ",
                    "       ",
                    "       ",
                    "       ",
                    "       ",
                    "       ",
                    "       ",
                    "       ",
                    "       ",
                ]
            }
        },
        DAY1_PALETTE = {
            "#":{
                isWall:true,
                isWallPaintable:[ true, true, true, true ],
                walls:[
                    [ "defaultWallTexture" ],
                    [ "defaultWallTexture" ],
                    [ "defaultWallTexture" ],
                    [ "defaultWallTexture" ]
                ],
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                ceiling:[ [ "defaultCeilingTexture" ] ],
                floor:[ [ "defaultFloorTexture" ] ],
            },
            ".":{
                walls:[ 0, 0, 0, 0 ],
                isElementPaintable:true,
                isFloorPaintable:true,
                isCeilingPaintable:true,
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                ceiling:[ [ "defaultCeilingTexture" ] ],
                floor:[ [ "defaultFloorTexture" ] ],
            },
            "-":{
                isWall:true,
                isDoor:true,
                walls:[ 
                    [ "defaultWallTexture", "defaultDoorTexture" ],
                    [ "defaultWallTexture", "defaultDoorTexture" ],
                    [ "defaultWallTexture", "defaultDoorTexture" ],
                    [ "defaultWallTexture", "defaultDoorTexture" ]
                ],
                mapSymbol:CONST.MAPSYMBOLS.DOOR,
                ceiling:[ [ "defaultCeilingTexture" ] ],
                floor:[ [ "defaultFloorTexture" ] ],
            },
            "O":{
                isWall:true,
                isDoor:true,
                needsKey:2,
                walls:[ 
                    [ "defaultWallTexture", "defaultDoorTexture", { image:"images/texture.png", imageX:2, imageY:2 } ],
                    [ "defaultWallTexture", "defaultDoorTexture", { image:"images/texture.png", imageX:2, imageY:2 } ],
                    [ "defaultWallTexture", "defaultDoorTexture", { image:"images/texture.png", imageX:2, imageY:2 } ],
                    [ "defaultWallTexture", "defaultDoorTexture", { image:"images/texture.png", imageX:2, imageY:2 } ]
                ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                ceiling:[ [ "defaultCeilingTexture" ] ],
                floor:[ [ "defaultFloorTexture" ] ],
            },
            "s":{
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                ceiling:[ [
                    "defaultCeilingTexture",
                    { image:"images/texture.png", imageX:5, imageY:1 }
                ] ],
                floor:[ [ "defaultFloorTexture" ] ],
            },
            "S": {
                model:"floorItem",
                image:"topStairs"
            },
            "B": {
                logic:{
                    type:"book",
                    book:"lore"
                },
                name:"Dusty tome",
                model:"floorItem",
                image:"bookStand"
            },
            "A":{
                logic:{
                    type:"comment",
                    messages:[
                        "There is an old statue of a figure in a robe.",
                        "The inscription on the pedestal says \"The Last Architect\"."
                    ]
                },
                model:"floorItem",
                size:"large",
                image:"statueArchitect"
            },
            "K":{
                logic:{
                    type:"script",
                    script:[
                        {
                            lockMovement:true
                        },{
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    text:"Well. I think that should be enough, right?",
                                },{
                                    by:"{name}",
                                    text:"I can never tell when a game's story is good enough or not. I hope I got it right this time.",
                                },{
                                    by:"{name}",
                                    text:"Oh, I'm sorry. I didn't introduce myself..."
                                }
                            ]
                        },{
                            setAttribute:"name",
                            toValue:"Architect KesieV"
                        },{
                            stopMusic:true
                        },{
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    text:"I am KesieV, one of the Architects who decided to build his tomb here.",
                                },{
                                    by:"{name}",
                                    text:"The \"tomb\" name is a bit unfortunate but it is cool for a dungeon, right? To be honest, I don't know if I'm already dead or not so this may actually be my tomb, as for the other Architects here.",
                                },{
                                    by:"{name}",
                                    text:"I don't think it matters. And I also think I've bored you too much. It's time for me to roll up my sleeves and start setting the real game up..."
                                }
                            ]
                        },{
                            startGameBreak:true
                        },{
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    text:"First, let's fix this dialogue box. It's not \"architect\" enough...",
                                }
                            ]
                        },{
                            fixDialogueBox:true
                        },{
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    text:"Perfect!",
                                },{
                                    by:"{name}",
                                    text:"It's just to make it look a little more retro. We like this kind of stuff.",
                                },{
                                    by:"{name}",
                                    text:"Then, let's fix the game name.",
                                },{
                                    by:"{name}",
                                    text:"Don't worry. It's just to make it more honest. It won't affect the game, promise.",
                                }
                            ]
                        },{
                            fixTitle:true
                        },{
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    text:"There you have it. See? Just a little tweak.",
                                },{
                                    by:"{name}",
                                    text:"...",
                                },{
                                    by:"{name}",
                                    text:"Oh, right. One last tip.",
                                },{
                                    by:"{name}",
                                    text:"Architects are strange people. They have a unique sense of \"beautiful\" and \"fun\"."
                                },{
                                    by:"{name}",
                                    text:"They may love boring, cryptic, frustrating, painful, or just plain flashy stuff."
                                },{
                                    by:"{name}",
                                    text:"Sometimes they don't even have a real sense of aesthetics. Or they have one... Let's say... niche."
                                },{
                                    by:"{name}",
                                    text:"Long story short... Don't trust what Architects do. Especially in their spare time.",
                                },{
                                    by:"{name}",
                                    text:"See you down there!",
                                }
                            ]
                        },{
                            unlockMovement:true
                        },{
                            resetFixedGame:true
                        }
                    ]
                },
                name:"???",
                bottomDress:"shortCoat",
                topDress:"monk",
                shoes:"sandals",
                eyes:"glasses",
                mouth:"relaxed",
                mustaches:"short",
                goatee:"wide",
                nose:"small",
                hair:"shortTail"
            }
        },
        EPILOGUE_PATTERN = {
            center:{
                map:[
                    "_______________________________________________________",
                    "_______________________________________________________",
                    "_______________________________________________________",
                    "_______________________________________________________",
                    "_____________________________________vvvvvvvvvvvvvvvvvv",
                    "____________________________________>__________________",
                    "____________________________________>_P^^^^^^^^^^Z_P^^^",
                    "____________________________________>_<__________>_<___",
                    "____________________________________#i#__________>_<___",
                    "____________________________________#:#__________>_<___",
                    "__________________________________###.##_________>_####",
                    "__________________________________#....#vvv####vvJ_O..W",
                    "__________________________________#.:::.___----_____...",
                    "__________________________________#.:..#^^^####^^Z_O..W",
                    "__________________________________##:###_________>_####",
                    "___________________________________#:#___________>_<___",
                    "___________vvv_____vvv_____vvv___###:##__________>_<___",
                    "__________>___LvvvJ___LvvvJ___Lvv#..:.#__________J_L___",
                    "__________>_______________________.::.[_________>___<__",
                    "__________>___P^^^Z___P^^^Z___P^^#....#_________>___<__",
                    "___________Z_P_____^^^_____Z_P___######_________>___<__",
                    "_______vvvvJ_<_____________>_<___________________^^^___",
                    "______>______<_____________J_L_________________________",
                    "______>_P^^^^_____________>___<________________________",
                    "______>_<_________________>___<________________________",
                    "______J_L_________________>___<________________________",
                    "_____>___<_________________^^^_________________________",
                    "_____>___<_____________________________________________",
                    "_____>___<_________________###_________________________",
                    "______^^^______________________________________________",
                    "_______________________________________________________",
                    "_______________________________________________________",
                    "_______________________________________________________",
                    "_______________________________________________________",
                    "_______________________________________________________",
                ],
                elements:[
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                      w",
                    "                                                       ",
                    "                                                      w",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                ],
                npcs:[
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                            E                          ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                    "                                                       ",
                ]
            }
        };

    let
        booksStatus;
        

    function addElementLogic(game, element) {
        if (element.logic)
            switch (element.logic.type) {
                case "book":{
                     game.tools.onInteract(element,[
                        {
                            run:(game, context, done)=>{
                                if (element.bookId === undefined) {
                                    if (booksStatus[element.logic.book] === undefined)
                                        booksStatus[element.logic.book] = 0;
                                    else
                                        booksStatus[element.logic.book]++;
                                    element.bookId = booksStatus[element.logic.book];
                                }

                                let
                                    book = BOOKS[element.logic.book],
                                    script = [],
                                    isCompleted = !element.done && (element.bookId >= book.books.length-1);

                                book.books[element.bookId].forEach(line=>{
                                    script.push(
                                        {
                                            showAudio:"sheet1",
                                            by:element.name,
                                            text:line
                                        });
                                });

                                if (isCompleted)
                                    script.push({
                                        text:book.onCompleteMessage
                                    });

                                game.tools.dialogueSay(0, script, ()=>{
                                    if (isCompleted) {
                                        let
                                            newItem = game.tools.addInventoryItem(0, book.onCompleteAddItem.data);
                                        game.tools.onUse(newItem, book.onCompleteAddItem.events.onUse);
                                        game.tools.playAudio("equip1");
                                    }
                                    element.done = true;
                                    game.tools.movePlayerBack();
                                });
                                
                                done(true);
                            }
                        }
                    ]);
                    break;
                }
                case "exit":{
                    game.tools.onInteract(element,[
                        {
                            dialogueSay:[
                                {
                                    text:element.logic.message,
                                    options:[
                                        {
                                            id:"leave",
                                            value:true,
                                            label:"Yes"
                                        },{
                                            label:"No"
                                        }
                                    ]
                                }
                            ]
                        },{
                            if:{
                                asContext:"answers",
                                is:{ leave:true }
                            },
                            runNextStory:true
                        },{
                            if:{ else:true },
                            movePlayerBack:true
                        }
                    ]);
                    break;
                }
                case "coinsBag":{
                    game.tools.onInteract(element,[
                        {
                            dialogueSay:[     
                                {
                                    text:"You have found a bag. It contains {logic.coins} Golden Coins."
                                }
                            ]    
                        },{
                            asContext:"room",
                            playerGainGold:element.logic.coins
                        },
                        { removeElement:true, refreshScreen:true }
                    ]);
                    break;
                }
                case "keyPart":{
                    game.tools.onInteract(element,[
                        {
                            run:(game, context, done)=>{
                                let
                                    keyId = "key-"+element.logic.keyId,
                                    partId = keyId+"-part",
                                    item = game.tools.getInventoryItem(partId),
                                    ownedParts = item ? item.counter : 0;

                                if (ownedParts) {
                                    ownedParts++;
                                    if (ownedParts>=element.logic.keyParts) {
                                        game.tools.removeInventoryItem(item);
                                        let
                                            newItem = game.tools.addInventoryItem(0, {
                                                isKey:true,
                                                id: keyId,
                                                group:CONST.GROUP.KEY,
                                                color:CONST.ITEMCOLOR.KEY,
                                                model:"key",
                                                shape:element.logic.keyId
                                            });
                                        game.tools.onUse(newItem,[
                                            {
                                                if:{
                                                    asContext:"cell",
                                                    is:{
                                                        isDoor:true,
                                                        needsKey:element.logic.keyId
                                                    }
                                                },
                                                asContext:"cell",
                                                openDoor:true
                                            },{
                                                if:{ and:true },
                                                removeInventoryItem:true
                                            },{
                                                if:{
                                                    else:true
                                                },
                                                dialogueSay:[
                                                    {
                                                        text:"A key with a "+CONST.KEY_NAMES[element.logic.keyId]+"-shaped symbol."
                                                    }
                                                ]
                                            }
                                        ]);
                                        game.tools.playAudio("equip1");
                                        game.tools.dialogueSay(0, [
                                            {
                                                text:"You completed the "+Tools.capitalize(CONST.KEY_NAMES[element.logic.keyId])+" Key!"
                                            }
                                        ], ()=>{
                                            done(true);
                                        });
                                    } else {
                                        game.tools.setInventoryItemCounter(item, ownedParts);
                                        game.tools.dialogueSay(0, [
                                            {
                                                text:"You got another Key Part!"
                                            }
                                        ], ()=>{
                                            done(true);
                                        });
                                        game.tools.playAudio("equip1");
                                    }
                                } else {
                                    let
                                        newItem = game.tools.addInventoryItem(0, {
                                            id: partId,
                                            group:CONST.GROUP.KEYPART,
                                            counter:1,
                                            of: element.logic.keyParts,
                                            color:CONST.ITEMCOLOR.KEY,
                                            model:"default",
                                            image:"brokenKey"
                                        });
                                    game.tools.onUse(newItem,[
                                        {
                                            dialogueSay:[
                                                {
                                                    text:"Some pieces of a key. They don't look very useful now."
                                                }
                                            ]
                                        }
                                    ]);
                                    game.tools.dialogueSay(0, [
                                        {
                                            text:"You got a Key Part!"
                                        }
                                    ], ()=>{
                                        done(true);
                                    });
                                    game.tools.playAudio("equip1");
                                }
                            }
                        },
                        { removeElement:true, refreshScreen:true }
                    ]);
                    break;
                }
                case "merchant":{
                    game.tools.onInteract(element,[
                        {
                            if:{ is:{ sold:true }},
                            dialogueSay:[     
                                {
                                    by:"{name}",
                                    text:element.logic.afterSelling
                                }
                            ]    
                        },{
                            if:{ and:true },
                            movePlayerBack:true
                        },{
                            if:{ and:true },
                            endScript:true,
                        },{
                            dialogueSay:[     
                                {
                                    by:"{name}",
                                    text:element.logic.beforeSelling
                                }
                            ]    
                        },{
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    text:element.logic.message,
                                    options:[
                                        {
                                            id:"buy",
                                            value:true,
                                            label:"Yes"
                                        },{
                                            label:"No"
                                        }
                                    ]
                                }
                            ]
                        },{
                            if:{
                                asContext:"answers",
                                is:{ buy:true },
                            },
                            subScript:[
                                {
                                    if:{
                                        cantPay:element.logic.price
                                    },
                                    dialogueSay:[     
                                        {
                                            text:"You don't have enough Golden Coins..."
                                        }
                                    ]
                                },{
                                    if:{ else:true },
                                    addInventoryItem:element.logic.item
                                },{
                                    if:{ else:true },
                                    playerPayGold:element.logic.price
                                },{
                                    if:{ else:true },
                                    setAttribute:"sold",
                                    toValue:true
                                },{
                                    if:{ else:true },
                                    dialogueSay:[     
                                        {
                                            by:"{name}",
                                            text:element.logic.soldMessage
                                        }
                                    ]
                                }
                            ]
                        },{
                            movePlayerBack:true
                        }
                    ]);
                    break;
                }
                case "payWall":{
                    game.tools.onInteract(element,[
                        {
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    text:element.logic.message
                                }
                            ]
                        },{
                            if:{
                                canPay:element.logic.price
                            },
                            dialogueSay:[
                                {
                                    text:element.logic.request,
                                    options:[
                                        {
                                            id:"pay",
                                            value:true,
                                            label:"Yes"
                                        },{
                                            label:"No"
                                        }
                                    ]
                                }
                            ]
                        },{
                            if:{
                                asContext:"answers",
                                is:{ pay:true }
                            },
                            playerPayGold:element.logic.price
                        },{
                            if:{ and:true },
                            dialogueSay:[     
                                {
                                    by:"{name}",
                                    text:element.logic.onPayMessage
                                }
                            ]
                        },{
                            if:{ and:true },
                            removeElement:true,
                            refreshScreen:true
                        },{
                            if:{ else:true },
                            movePlayerBack:true
                        }
                    ]);
                    break;
                }
                case "npc":{
                    let
                        script = [];

                    element.logic.messages.forEach(message=>{
                        script.push({
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    text:message
                                }
                            ]
                        });
                    });

                    script.push({ movePlayerBack:true });
                    game.tools.onInteract(element, script);
                    break;
                }
                case "ending":{
                    let
                        script = [
                            {
                                playMusic:"anonymous-entrance-night2"
                            }
                        ];

                    element.logic.messages.forEach(message=>{
                        script.push({
                            dialogueSay:[
                                {
                                    by:"{name}",
                                    text:message
                                }
                            ]
                        });
                    });

                    script.push({ goToCredits:true });
                    game.tools.onInteract(element, script);
                    break;
                }
                case "comment":{
                    let
                        script = [];

                        element.logic.messages.forEach(message=>{
                        script.push({
                            dialogueSay:[
                                {
                                    text:message
                                }
                            ]
                        });
                    });

                    script.push({ movePlayerBack:true });
                    game.tools.onInteract(element, script);
                    break;
                }
                case "script":{
                    game.tools.onInteract(element, element.logic.script);
                    break;
                }
            }
    }

    function addCellLogic(game, room, x, y) {
        let
            cell = game.map[y][x];

        if (cell.logic)
            switch (cell.logic.type) {
                case "message":{
                    game.tools.onBumpWall(x,y,cell.logic.side,[
                        {
                            as:room,
                            dialogueSay:[
                                {
                                    text:cell.logic.text
                                }
                            ]
                        }
                    ]);
                    break;
                }
                case "lever":{
                    let
                        openCell = game.map[cell.logic.openAtDy + y][cell.logic.openAtDx + x];

                    game.tools.onBumpWall(x,y,cell.logic.side,[
                        {
                            if:{ is:{ isPulled:true } },
                            dialogueSay:[
                                {
                                    text:"This lever is stuck..."
                                }
                            ]
                        },{
                            if:{ and:true },
                            endScript:true,
                        },{
                            dialogueSay:[
                                {
                                    text:"There is a lever on the wall. Do you want to pull it?",
                                    options:[
                                        {
                                            id:"pull",
                                            value:true,
                                            label:"Yes"
                                        },
                                        {
                                            label:"No"
                                        }
                                    ]
                                }
                            ]
                        },{
                            if:{
                                asContext:"answers",
                                is:{ pull:true }
                            },
                            changeWallDecoration:{
                                area:cell,
                                side:cell.logic.side,
                                id:"isLever",
                                values:{ imageX:4 }
                            },
                            refreshScreen:true
                        },{
                            if:{ and:true },
                            setAttribute:"isPulled",
                            toValue:true,
                        },{
                            if:{ and:true },
                            playAudio:{ sample:"lever1" }
                        },{
                            if:{ and:true },
                            run:(game, context, done)=>{
                                game.tools.removeWalls(openCell);
                                openCell.isWall = false;
                                done(true);
                            }
                        },{
                            if:{ and:true },
                            dialogueSay:[
                                {
                                    text:cell.logic.text
                                }
                            ]
                        }
                    ]);
                    break;
                }
            }
    }

    function renderRooms(game, rooms, pattern, palette) {
        booksStatus = {};

        rooms.forEach(room=>{

            // --- Forces a Golden Coins budget for the room

            room.goldBudget = 1000;

            // --- Draw the dungeon

            let
                assets = game.tools.blitPattern(0, room, pattern, palette );

            // --- Assign logic to tiles

            for (let x=room.x;x<room.x+room.width;x++)
                for (let y=room.y;y<room.y+room.height;y++) {
                    let
                        cell = game.map[y][x];

                    addCellLogic(game, room, x, y);

                    switch (cell.decorations) {
                        case "grass":{
                            if (room.random.integer(10)<4)
                                game.tools.addElement(x,y, {
                                    sprite:[
                                        {dy:-9, image:"images/decorations.png", imageX:4, imageY:3 }
                                    ]
                                }, true);
                            if (room.random.integer(10)<2)
                                cell.floor[0].push({ image:"images/decorations.png", imageX:1, imageY:0 });
                            break;
                        }
                        case "scratches":{
                            if (cell.floor[0])
                                if (room.random.integer(10)<4)
                                    cell.floor[0].push(room.random.element(DECORATIONS_SCRATCHES));
                            cell.walls.forEach(wall=>{
                                if (wall && (wall.length == 1) && room.random.integer(10)<3)
                                        wall.push(room.random.element(DECORATIONS_SCRATCHES));
                            })                                    
                            break;
                        }
                    }
                }

            // --- Add logic to elements

            assets.elements.forEach(element=>{
                addElementLogic(game, element);
            })

            assets.npcs.forEach(npc=>{
                addElementLogic(game, npc);
            })

        })
    }

    TOMBS.addTomb({

        id:"anonymous-entrance",
        tags:[ "story-entrance" ],
        name:"The Entrance",
        byArchitect:CONST.CREDITS.ANONYMOUS,

        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        generateRooms:(game, count)=>{

            return [
                {
                    isEntrance:true,
                    entranceX:28,
                    entranceY:25,
                    name:this.name,
                    author:this.byArchitect,
                    width:ENTRANCE_PATTERN.center.map[0].length,
                    height:ENTRANCE_PATTERN.center.map.length
                }
            ];
    
        },

        renderRooms:(game, rooms)=>{
            renderRooms(game, rooms, ENTRANCE_PATTERN, ENTRANCE_PALETTE);
        }
    })    

    TOMBS.addTomb({

        id:"anonymous-day1",
        tags:[ "story-day1" ],
        name:"The Lost Tomb",
        byArchitect:CONST.CREDITS.ANONYMOUS,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        generateRooms:(game, count)=>{

            return [
                {
                    isEntrance:true,
                    entranceX:3,
                    entranceY:13,
                    name:this.name,
                    author:this.byArchitect,
                    width:DAY1_PATTERN.center.map[0].length,
                    height:DAY1_PATTERN.center.map.length
                }
            ];
    
        },

        renderRooms:(game, rooms)=>{
            renderRooms(game, rooms, DAY1_PATTERN, DAY1_PALETTE);
        }
    })

    TOMBS.addTomb({

        id:"anonymous-epilogue",
        tags:[ "story-epilogue" ],
        name:"The Lost Tomb",
        byArchitect:CONST.CREDITS.ANONYMOUS,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", id:"anonymous-entrance-night1", title:"Crickets SFX", by:[ "Wolfgang_" ], file:"tombs/default/audio/sfx/night1" },
            { type:"audio", title:"My Street", by:[ CONST.CREDITS.UNKNOWN ], id:"anonymous-entrance-night2",mod:"tombs/default/audio/music/my_street.xm", isSong:true},
        ],

        generateRooms:(game, count)=>{

            return [
                {
                    isEntrance:true,
                    entranceX:53,
                    entranceY:12,
                    entranceDirection:3,
                    name:this.name,
                    author:this.byArchitect,
                    width:EPILOGUE_PATTERN.center.map[0].length,
                    height:EPILOGUE_PATTERN.center.map.length
                }
            ];
    
        },

        renderRooms:(game, rooms)=>{
            renderRooms(game, rooms, EPILOGUE_PATTERN, ENTRANCE_PALETTE);
        }
    })
})();

