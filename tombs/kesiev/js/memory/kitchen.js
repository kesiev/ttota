(function(){

    const
        TOMB_ID = "kesiev-kitchen",
        TOMB_TAGS = [ "tomb", "memory" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        RECIPES = 5,
        REQUESTS = 4,
        MAX_INGREDIENTS = 6,
        TIME_LIMIT = 999,
        TIME_PER_REQUEST = 7,
        TIME_PER_INGREDIENT = 2,
        INGREDIENTS = [
            { id:0, name:"Olive Oil", descriptions:[ "oily", "green" ], color:CONST.COLORS.GREEN, decoration:{ image:"tombs/kesiev/images/texture.png", imageX:0, imageY:3 } },
            { id:1, name:"Onions", descriptions:[ "pungent", "purple" ], color:CONST.COLORS.PURPLE, decoration:{ image:"tombs/kesiev/images/texture.png", imageX:1, imageY:3 } },
            { id:2, name:"Tomatoes", descriptions:[ "juicy", "red" ], color:CONST.COLORS.RED, decoration:{ image:"tombs/kesiev/images/texture.png", imageX:2, imageY:3 } },
            { id:3, name:"Eggplant", descriptions:[ "spongy", "blue" ], color:CONST.COLORS.BLUE, decoration:{ image:"tombs/kesiev/images/texture.png", imageX:3, imageY:3 } },
            { id:4, name:"Sardines", descriptions:[ "salty", "cyan" ], color:CONST.COLORS.CYAN, decoration:{ image:"tombs/kesiev/images/texture.png", imageX:4, imageY:3 } },
            { id:5, name:"Lemon", descriptions:[ "acid", "yellow" ], color:CONST.COLORS.YELLOW, decoration:{ image:"tombs/kesiev/images/texture.png", imageX:5, imageY:3 } },
            { id:6, name:"Ricotta", descriptions:[ "milky", "white" ], color:CONST.COLORS.WHITE, decoration:{ image:"tombs/kesiev/images/texture.png", imageX:6, imageY:3 } },
            { id:7, name:"Peperoncino", descriptions:[ "spicy", "dark red" ], color:CONST.COLORS.DARKRED, decoration:{ image:"tombs/kesiev/images/texture.png", imageX:7, imageY:3 } },
        ];

    function nextRequest(room) {
        let
            request;

        room.currentRequest++;
        request = room.requests[room.currentRequest];

        if (CONST.DEBUG.showLogs)
            console.log(request);

        if (request) {
            room.architect.request = request;
            return true;
        } else
            return false;
    }

    function getTimestamp() {
        return (new Date()).getTime();
    };

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Mediterranean Room",
        description:"Keep in mind the recipes and bring the right ingredients to the architect as fast as you can.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"Clockworks", by:[ "Pherplexer" ], id:"kesiev-kitchen1",mod:"tombs/kesiev/audio/music/clockworks.xm", isSong:true},
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            { type:"data", id:"kesiev-sicilian-data", title:"Common sicilian syllabes", by:[ "KesieV" ], file:"tombs/kesiev/data/sicilian/sicilian.json" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:3,
                    height:5,
                    currentRequest:-1,
                    requests:[],
                    scoreLimit:10,
                    isSolved:false,
                    isRunning:false
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                syllabes = JSON.parse(LOADER.DATA["kesiev-sicilian-data"]);

            rooms.forEach(room=>{

                // --- Prepare the recipes

                let
                    estimatedTime = 0,
                    recipes = [],
                    allIngredients = Tools.clone(INGREDIENTS),
                    ingredientRounds = Math.ceil(INGREDIENTS.length*(1+room.difficulty*2)),
                    ingredientsBag = { elements:allIngredients },
                    boardBag = { elements:allIngredients },
                    recipesBag = { elements:recipes };

                for (let i=0;i<RECIPES;i++) {
                    let
                        recipe = { name:0, ingredients:[] },
                        name = "",
                        syllabesCount = 3+room.random.integer(3);

                    for (let j=0;j<syllabesCount;j++)
                        name += room.random.element(syllabes[j]);

                    recipe.name = Tools.capitalize(name);
                    recipes.push(recipe);
                }

                for (let i=0;i<ingredientRounds;i++) {
                    let
                        recipe = room.random.bagPick(recipesBag),
                        ingredient = room.random.bagPick(ingredientsBag);

                    recipe.ingredients.push(ingredient);
                }

                // --- Prepare the menu script

                let
                    recipesScript = [
                        {
                            text:"There is a handwritten recipe book page hanging on the wall. The recipes are..."
                        }
                    ];

                recipes.forEach(recipe=>{
                    recipesScript.push({
                        text:"&#x25CA; "+recipe.name+"\n\nIngredients: "+recipe.ingredients.map(ingredient=>ingredient.name).join(", ")+"."
                    })
                })

                // --- Prepare the requests

                let
                    hintRecipes = [],
                    hintIngredients = [];

                for (let i=0;i<REQUESTS;i++) {
                    let
                        recipe =  room.random.element(recipes);
                    room.requests.push(recipe);
                    estimatedTime += TIME_PER_REQUEST+(recipe.ingredients.length*TIME_PER_INGREDIENT);
                    hintRecipes.push(recipe.name);
                    if (i < 2)
                        recipe.ingredients.forEach(ingredient=>{
                            hintIngredients.push(ingredient.name);
                        })
                }

                game.tools.hintAddSequence(room, hintRecipes);
                game.tools.hintAddSequence(room, hintIngredients);

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Add the menu

                let
                    walkableWalls = game.tools.getWalkableWalls(room),
                    menuPosition = room.random.element(walkableWalls);

                game.tools.addWallDecoration(0, menuPosition, menuPosition.side, game.tools.SOLID, [
                    {  isMenu:true, image:"tombs/kesiev/images/texture.png", imageX:1, imageY:4 }
                ]);

                game.tools.onBumpWall(menuPosition.x, menuPosition.y, menuPosition.side, [
                    {
                        dialogueSay:recipesScript
                    }
                ]);

                // Avoid random decorations on the menu
                game.tools.setWallPaintable(menuPosition.x, menuPosition.y, menuPosition.side, false);

                // Protect the menu area, so the architect doesn't spawn there
                game.tools.setProtected(menuPosition.front, true);

                // --- Place the ingredients

                for (let x=0;x<3;x++)
                    for (let y=0;y<3;y++)
                        if ((x!=1)||(y!=1)) {
                            let
                                cell = game.map[room.y+y+1][room.x+x],
                                ingredient = room.random.bagPick(boardBag);

                            ingredient.cell = cell;

                            game.tools.paintFloor(0, cell, game.tools.SOLID, [
                                { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:0, backgroundColor:CONST.COLORS.WHITE },
                                ingredient.decoration
                            ]);

                            // --- Protect the ingredient area
                            game.tools.setProtected(cell, true);
                            game.tools.setElementPaintable(cell, false);

                        }

                // --- Add the architect area

                game.tools.paintFloor(0, { x:room.x, y:room.y, width:room.width, height:1 }, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);
                game.tools.paintFloor(0, { x:room.x, y:room.y+4, width:room.width, height:1 }, game.tools.SOLID, [ "defaultFloorAccentTexture" ]);

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
                            game.tools.scriptArchitectPaidQuote(game,room, ARCHITECT),
                            {
                                dialogueSay:[
                                    {
                                        audio:ARCHITECT.voiceAudio,
                                        by:"{name}",
                                        text:"Well... eating together is always nice, isn't it?"
                                    }
                                ]
                            },
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        if:{
                            asContext:"room",
                            is:{ isRunning:false }
                        },
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"How about helping me cook? Are you ready?",
                                options:[
                                    {
                                        id:"startIt",
                                        value:true,
                                        label:"Yes"
                                    },{
                                        id:"startIt",
                                        value:false,
                                        label:"Maybe later"
                                    }
                                ]
                            }
                        ]
                    },{
                        if:{
                            asContext:"answers",
                            is:{ startIt:true }
                        },
                        run:(game, context, done)=>{
                            let
                                ingredientPicker = game.tools.addInventoryItem(room, {
                                    group:CONST.GROUP.ROOMITEM+1,
                                    color:CONST.ITEMCOLOR.ROOMITEM,
                                    model:"default",
                                    image:"push"
                                });

                            game.tools.onUse(ingredientPicker,[
                                { setInventoryItemAnimation:"bounce" },
                                {
                                    run:(game, context, done)=>{
                                        let
                                            added = false,
                                            ingredients = game.tools.getInventoryItemsFromRoom(room).filter(item=>item.isIngredient);

                                        if (ingredients.length < MAX_INGREDIENTS)
                                            allIngredients.forEach(ingredient=>{
                                                if (ingredient.cell === game.position.cell) {
                                                    let
                                                        requested = room.architect.request.ingredients[ingredients.length],
                                                        next = room.architect.request.ingredients[ingredients.length+1],
                                                        isDone = !next,
                                                        isRight = requested && requested.id == ingredient.id,
                                                        sentence,
                                                        item;

                                                    if (isRight)
                                                        if (isDone)
                                                            sentence = "That should be it!";
                                                        else
                                                            sentence = "Maybe the next one should be something "+room.random.element(next.descriptions)+"...";
                                                    else
                                                        sentence = "Something's wrong...";

                                                    item = game.tools.addInventoryItem(room, {
                                                        isIngredient:true,
                                                        ingredientId:ingredient.id,
                                                        group:CONST.GROUP.ROOMITEM,
                                                        color:ingredient.color,
                                                        model:"default",
                                                        image:"pot"
                                                    });
                                                    game.tools.onUse(item,[{
                                                        dialogueSay:[
                                                            { text:sentence }
                                                        ]
                                                    }]);

                                                    added = true;
                                                }
                                            })

                                        if (added)
                                            game.tools.playAudio("equip1");
                                        else
                                            game.tools.playAudio("nogain1");

                                        done(true);
                                    }
                                }
                            ]);
                            
                            room.isRunning = true;
                            room.startTime = getTimestamp();

                            game.tools.playRoomNewMusic(room, "kesiev-kitchen1");

                            nextRequest(room);
                            done(true);
                        }
                    },{
                        if:{ and:true },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Very well... bring me the ingredients for the {request.name}!"
                            }
                        ]
                    },{
                        if:{ and:true },
                        movePlayerBack:true
                    },{
                        if:{ and:true },
                        endScript: true
                    },{
                        if:{
                            asContext:"room",
                            is:{ isRunning:true }
                        },
                        run:(game, context, done)=>{
                            let
                                result,
                                completed = true,
                                ingredients = game.tools.getInventoryItemsFromRoom(room).filter(item=>item.isIngredient);
                            if (ingredients.length == context.as.request.ingredients.length) {
                                ingredients.forEach((ingredient,id)=>{
                                    completed &= ingredient.ingredientId == context.as.request.ingredients[id].id;
                                })
                            } else
                                completed = false;

                            if (completed) {
                                if (nextRequest(room)) {
                                    game.tools.playerGainGold(room, 5);
                                    ingredients.forEach(ingredient=>{
                                        game.tools.removeInventoryItem(ingredient);
                                    })
                                    result = 1;
                                } else {
                                    let
                                        playTime = Math.floor((getTimestamp()-room.startTime)/1000);
                                    game.tools.removeInventoryItemsFromRoom(room);
                                    room.isRunning = false;
                                    room.isSolved = true;
                                    room.score = playTime - estimatedTime;
                                    if (playTime > TIME_LIMIT)
                                        context.as.playTime = "a lot of time";
                                    else
                                        context.as.playTime = playTime + " seconds";
                                    game.tools.cancelRoomMusic(room);
                                    result = 2;
                                }
                            } else {
                                game.tools.hitPlayer(1);
                                result = 0;
                            }
                            
                            done(result);
                        }
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result:0 }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"These are not the ingredients for {request.name}!"
                            }
                        ]
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result:1 }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Good job! Now I'm going to prepare {request.name}."
                            }
                        ]
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result:2 }
                        },
                        asContext:"room",
                        unlockRoomWithAttempts:"score",
                        ofAttempts:"scoreLimit"
                    },{
                        if:{
                            asContext:"lastRun",
                            is:{ result:2 }
                        },
                        dialogueSay:[
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Fantastic! It took us {playTime} but, in the end, lunch is ready!"
                            }
                        ]
                    },{
                        movePlayerBack:true
                    }
                ]);

                // Keep track of the architect
                room.architect = architect;

                // Protect the cell, so the lever won't spawn there
                game.tools.setProtected(architectPosition, true);

                // --- Add the trash can

                walkableCells = game.tools.getWalkableCells(room);
                
                let
                    trashCanPosition = room.random.element(walkableCells),
                    trashCan = game.tools.addElement(trashCanPosition.x, trashCanPosition.y, {
                        sprite:[
                            { image:"images/npc.png", imageX:1, imageY:0 },
                            { image:"tombs/kesiev/images/texture.png", imageX:0, imageY:4 },
                        ]
                    });

                game.tools.onInteract(trashCan,[
                    {
                        if:{
                            asContext:"room",
                            is:{ isRunning:true }
                        },
                        run:(game, context, done)=>{
                            let
                                ingredients = game.tools.getInventoryItemsFromRoom(room).filter(item=>item.isIngredient);
                            
                            ingredients.forEach(ingredient=>{
                                game.tools.removeInventoryItem(ingredient);
                            });

                            game.tools.playAudio("nogain1");
                            done(true);
                        }
                    },{
                        if:{ else:true },
                        dialogueSay:[     
                            {
                                text:"There is a common garbage bin here."
                            }
                        ]
                    },
                    {
                        if:{ else:true },
                        movePlayerBack:true
                    }
                ]);

                // --- Restore the "ingredient" cards when the player enters the room

                game.tools.onEnter(room,[ {
                    if:{
                        asContext:"room",
                        is:{ isSolved:false }
                    },
                    restoreInventoryItemsFromRoom:true
                } ]);

                // --- Store the "ingredient" cards when the player leaves the room

                game.tools.onLeave(room,[ { storeInventoryItemsFromRoom:true } ]);
                
            })

        }
        
    })
    
})();

