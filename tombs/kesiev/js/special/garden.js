(function(){

    const
        TOMB_ID = "kesiev-garden",
        TOMB_TAGS = [ "tomb", "special" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        CHECKPOINT_ID = "s",
        FLOWER_MIN_HEIGHT = 25,
        FLOWER_MAX_HEIGHT = 95,
        FLOWER_TYPES = [
            { size:0, id:"tallest", label:"one of the tallest flower" },
            { size:-2, id:"smallest", label:"one of the smallest flower" }
        ],
        SIZES_DELTA = [ 0, -1, -1, -2, -2 ],
        ANIMATIONS = [
            [ 0, 0, { dy:-1}, { dy:-1}, { dy:1 }, { dy:1 } ],
            [ { dy:-1}, { dy:-1}, 0, { dy:1 }, { dy:1 }, 0 ],
            [ { dy:-1}, 0, { dy:-1}, 0, { dy:1 }, { dy:1 } ],
        ],
        TOOLS = [
            {
                verb:"water",
                suggestion:"I think next time it would be better to water {flower}...",
                x:1, y:1,
                element:{
                    sprite:[
                        { image:"images/npc.png", imageX:1, imageY:0 },
                        { image:"tombs/kesiev/images/texture.png", imageX:2, imageY:6}
                    ]
                },
                item:{
                    group:CONST.GROUP.ROOMITEM,
                    color:CONST.ITEMCOLOR.ROOMITEM,
                    model:"default",
                    image:"wateringCan",
                    toolDescription:"It's a watering can.",
                    onFlowerUseAsk:"Do you want to water this flower?",
                    onUseSay:"You got your feet wet. What a relief!"
                },
                onPickAsk:"Do you want to get the watering can?"
            },{
                verb:"fertilize",
                suggestion:"Maybe next time you should fertilize {flower}...",
                x:3, y:1,
                element:{
                    sprite:[
                        { image:"images/npc.png", imageX:1, imageY:0 },
                        { image:"tombs/kesiev/images/texture.png", imageX:3, imageY:6}
                    ]
                },
                item:{
                    group:CONST.GROUP.ROOMITEM,
                    color:CONST.ITEMCOLOR.ROOMITEM,
                    model:"default",
                    image:"fertilizer",
                    toolDescription:"It's a bag of fertilizer.",
                    onFlowerUseAsk:"Do you want to fertilize this flower?",
                    onUseSay:"A pungent smell comes out of this bag!"
                },
                onPickAsk:"Do you want to get the bag of fertilizer?"
            },{
                verb:"prune",
                suggestion:"How about pruning {flower} next time?",
                x:1, y:3,
                element:{
                    sprite:[
                        { image:"images/npc.png", imageX:1, imageY:0 },
                        { image:"tombs/kesiev/images/texture.png", imageX:4, imageY:6}
                    ]
                },
                item:{
                    group:CONST.GROUP.ROOMITEM,
                    color:CONST.ITEMCOLOR.ROOMITEM,
                    model:"default",
                    image:"shears",
                    toolDescription:"They are shears.",
                    onFlowerUseAsk:"Do you want to prune this flower a little?",
                    onUseSay:"The blades look really sharp!"
                },
                onPickAsk:"Do you want to get the shears?"
            }
        ],
        ROOM_SIZE = 5;

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Blooming Corridor",
        description:"Remember what you've to do to keep the flowers from game to game.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png"},
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:ROOM_SIZE,
                    height:ROOM_SIZE,
                    isFirstEntrance:true,
                    isSolved:false,
                    score:0,
                    maxScore:2
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                // --- Prepare the garden

                let
                    heightBag = { elements:SIZES_DELTA },
                    animationsBag = { elements:ANIMATIONS },
                    checkpoint = Tools.clone(game.tools.getCheckpoint(room,CHECKPOINT_ID)) || { grow:0, verb:0, type:0 };
                    
                for (let i=0;i<ROOM_SIZE;i++)
                    for (let j=0;j<ROOM_SIZE;j++)
                        if ((!i || !j || (i==ROOM_SIZE-1)) || (j==ROOM_SIZE-1)) {
                            let
                                cell = game.map[room.y+j][room.x+i],
                                size = room.random.bagPick(heightBag),
                                animation = room.random.bagPick(animationsBag),
                                height = Math.min(FLOWER_MIN_HEIGHT+checkpoint.grow+size,FLOWER_MAX_HEIGHT),
                                flower = game.tools.addElement(cell.x, cell.y, {
                                    sprite:[
                                        { image:"images/npc.png", imageX:3, imageY:0 },
                                        { image:"tombs/kesiev/images/texture.png", imageX:1, imageY:5, dy:-height-1, animation:animation },
                                        { image:"tombs/kesiev/images/texture.png", imageX:1, imageY:7 },
                                    ]
                                });
                            flower.isGardenElement = true;
                            flower.isFlower = true;
                            flower.flowerHeight = height;
                            flower.flowerSize = size;
                            game.tools.setElementPaintable(cell, false);
                            game.tools.paintMapSymbol(cell, "&#x2663;");
                            game.tools.paintMapSymbolColor(cell, CONST.COLORS.GREEN);
                        };

                // --- Add the tools

                TOOLS.forEach(tool=>{
                    let
                        cell = game.map[room.y+tool.y][room.x+tool.x],
                        element = game.tools.addElement(cell.x, cell.y, Tools.clone(tool.element));

                    element.isGardenElement = true;
                    element.isTool = true;
                    element.onPickAsk = tool.onPickAsk;
                    element.inventoryItem = tool.item;
                    element.onFlowerVerb = tool.verb;
                })

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Add the architect

                let
                    architect = game.tools.addNpc(room.x+3, room.y+3, Tools.clone(ARCHITECT.layout));

                game.tools.onInteract(architect,[
                    {
                        if:{
                            asContext:"room",
                            is:{ isSolved:true }
                        },
                        subScript:[
                            game.tools.scriptArchitectPaidQuote(game, room, ARCHITECT),
                            {
                                run:(game, context, done)=>{
                                    let
                                        suggestion,
                                        flowerType;
                                    TOOLS.forEach(tool=>{
                                        if (tool.verb == checkpoint.verb)
                                            suggestion = tool.suggestion;
                                    });
                                    FLOWER_TYPES.forEach(type=>{
                                        if (type.id == checkpoint.type)
                                            flowerType = type;
                                    })
                                    suggestion = suggestion.replace("{flower}", flowerType.label);
                                    game.tools.dialogueSay(context.as,[
                                        {
                                            audio:ARCHITECT.voiceAudio,
                                            by:"{name}",
                                            text:suggestion
                                        }
                                    ], (answers)=>{
                                        done(true);
                                    });
                                }
                            },
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Mmm. These plants need some care..."
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // --- Restore the "gardening" cards when the player enters the room. The first time, add the "gardening" cards.

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
                                image:"push"
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                element = game.tools.getElementsAt(game.position.x, game.position.y).list.filter(element=>element.isGardenElement)[0];

                                            if (element) {
                                                if (element.isFlower)
                                                    game.tools.dialogueSay(0,[
                                                        {
                                                            text:"This flower is "+element.flowerHeight+" pixels tall."
                                                        }
                                                    ], (answers)=>{
                                                        done(true);
                                                    });
                                                else if (element.isTool)
                                                    game.tools.dialogueSay(0,[
                                                        {
                                                            text:element.onPickAsk,
                                                            options:[
                                                                {
                                                                    id:"pick",
                                                                    value:true,
                                                                    label:"Yes"
                                                                },{
                                                                    id:"pick",
                                                                    value:false,
                                                                    label:"Leave it there"
                                                                }
                                                            ]
                                                        }
                                                    ], (answers)=>{
                                                        if (answers.pick) {
                                                            // -- Drop the current item
                                                            game.tools.getInventoryItemsFromRoom(room).filter(item=>{
                                                                if (item.isTool) {
                                                                    game.tools.addElement(game.position.x, game.position.y, item.toolElement);
                                                                    game.tools.removeInventoryItem(item);
                                                                }
                                                            })
                                                            // -- Pick the new item
                                                            let
                                                                newItem = game.tools.addInventoryItem(room, Tools.clone(element.inventoryItem));
                                                            newItem.toolElement = element;
                                                            newItem.onFlowerVerb = element.onFlowerVerb;
                                                            newItem.isTool = true;
                                                            game.tools.onUse(newItem,[
                                                               {
                                                                    run:(game, context, done)=>{
                                                                        let
                                                                            element = game.tools.getElementsAt(game.position.x, game.position.y).list.filter(element=>element.isGardenElement)[0];

                                                                        if (element && element.isFlower) {
                                                                            game.tools.dialogueSay(0,[
                                                                                {
                                                                                    text:newItem.onFlowerUseAsk,
                                                                                    options:[
                                                                                        {
                                                                                            id:"doIt",
                                                                                            value:true,
                                                                                            label:"Yes"
                                                                                        },{
                                                                                            id:"doIt",
                                                                                            value:false,
                                                                                            label:"Not now"
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            ], (answers)=>{
                                                                                if (answers.doIt) {
                                                                                    let
                                                                                        flowerType;

                                                                                    FLOWER_TYPES.forEach(type=>{
                                                                                        if (type.size == element.flowerSize)
                                                                                            flowerType = type.id;
                                                                                    });

                                                                                    if (!checkpoint.verb || ((checkpoint.verb == newItem.onFlowerVerb) && (checkpoint.type == flowerType))) {
                                                                                        let
                                                                                            nextTool = room.random.element(TOOLS),
                                                                                            nextType = room.random.element(FLOWER_TYPES);

                                                                                        context.room.score = 2;
                                                                                        checkpoint.verb = nextTool.verb;
                                                                                        checkpoint.type = nextType.id;
                                                                                        if (checkpoint.grow < FLOWER_MAX_HEIGHT)
                                                                                            checkpoint.grow++;
                                                                                        game.tools.setNextCheckpoint(room,CHECKPOINT_ID,checkpoint);
                                                                                    } else
                                                                                        context.room.score = 1;

                                                                                    done(1);
                                                                                } else
                                                                                    done(0);
                                                                                
                                                                            });
                                                                        } else
                                                                            done(2);
                                                                    }
                                                                },{
                                                                    if:{
                                                                        asContext:"lastRun",
                                                                        is:{ result:1 }
                                                                    },
                                                                    asContext:"room",
                                                                    unlockRoomWithScore:"score",
                                                                    ofScore:"maxScore"
                                                                },{
                                                                    if:{ and:true },
                                                                    asContext:"room",
                                                                    setAttribute:"isSolved",
                                                                    toValue:true
                                                                },{
                                                                    if:{ and:true },
                                                                    asContext:"room",
                                                                    removeInventoryItemsFromRoom:true
                                                                },{
                                                                    if:{
                                                                        asContext:"lastRun",
                                                                        is:{ result:2 }
                                                                    },
                                                                    dialogueSay:[     
                                                                        {
                                                                            text:newItem.onUseSay
                                                                        }
                                                                    ]
                                                                }      
                                                            ]);
                                                            game.tools.removeElement(element);
                                                            game.tools.refreshScreen();
                                                        }
                                                        done(true);
                                                    });
                                                else
                                                    element = false;
                                            }
                                            if (!element)
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

                // --- Store the "gardening" cards when the player leaves the room

                game.tools.onLeave(room,[ { storeInventoryItemsFromRoom:true } ]);

            })
        }
        
    })
    
})();

