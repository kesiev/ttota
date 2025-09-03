(function(){

    const
        TOMB_ID = "default-tomb",
        TOMB_TAGS = [ "default" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        ANIMATION_LAMP = [ 0, 0, 0, { dx:-101 }, { dx:-101 }, { dx:-101 } ],
        MODELS = [
            {
                minWidth:4,
                minHeight:3,
                rangeWidth:3,
                rangeHeight:3,
                mulRangeWidth:2,
                mulRangeHeight:2,
                pattern:{
                    center:{
                        map:[
                            "# ##",
                            "    ",
                            "### ",
                            "    ",
                            "# ##",
                            "    ",
                            " ###",
                            "    "
                        ]
                    }
                }
            },{
                minWidth:4,
                minHeight:4,
                rangeWidth:2,
                rangeHeight:2,
                mulRangeWidth:3,
                mulRangeHeight:3,
                pattern:{
                    center:{
                        map:[
                            "#   # # ",
                            "# # # # ",
                            "  #   # ",
                            "# # #   ",
                        ]
                    }
                }
            },{
                minWidth:5,
                minHeight:5,
                rangeWidth:3,
                rangeHeight:3,
                mulRangeWidth:2,
                mulRangeHeight:2,
                pattern:{
                    topLeft:{
                        map:[
                            "# ",
                            "  "
                        ]
                    },
                    topRight:{
                        map:[
                            " #",
                            "  "
                        ]
                    },
                    bottomLeft:{
                        map:[
                            "  ",
                            "# "
                        ]
                    },
                    bottomRight:{
                        map:[
                            "  ",
                            " #"
                        ]
                    },
                    top:{
                        map:[
                            "_",
                            " "
                        ]
                    },
                    bottom:{
                        map:[
                            " ",
                            "_"
                        ]
                    },
                    left:{
                        map:[
                            "_ "
                        ]
                    },
                    right:{
                        map:[
                            " _"
                        ]
                    },
                    center:{
                        map:[
                            "# ",
                            " L"
                        ],
                        npcs:[
                            "  ",
                            "  "
                        ],
                        elements:[
                            "  ",
                            " ^"
                        ]
                    }
                }
            }
        ],
        PALETTE = {
            "^":{
                image:"lamp"
            },
            "#":{
                skipOnProtectedCell:true,
                mapSymbol:CONST.MAPSYMBOLS.WALL,
                isWall:true,
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:false,
                isWallPaintable:[ true, true, true, true ],
                walls:[
                    "defaultWall",
                    "defaultWall",
                    "defaultWall",
                    "defaultWall"
                ],
                ceiling:[ 0 ],
                floor:[ 0 ]
            },
            "_":{
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                walls:[0,0,0,0],
                isElementPaintable:true,
                isFloorPaintable:false,
                isCeilingPaintable:true,
                isWallPaintable:[ true, true, true, true ],
                ceiling:[
                    "defaultCeiling"
                ],
                floor:[ 
                    [
                        { image:"images/texture.png", imageX:2, imageY:0, backgroundColor:{ _:"floorAccent"} }
                    ]
                ]
            },
            "L":{
                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                walls:[0,0,0,0],
                isElementPaintable:false,
                isFloorPaintable:false,
                isCeilingPaintable:false,
                isWallPaintable:[ true, true, true, true ],
                ceiling:[
                    [
                        "defaultCeilingTexture",
                        { image:"images/texture.png", imageX:0, imageY:3, animation:ANIMATION_LAMP }
                    ]
                ],
                floor:[ 
                    [
                        "defaultFloorTexture",
                        { image:"images/texture.png", imageX:0, imageY:3, animation:ANIMATION_LAMP }
                    ]
                ]
            },
        };

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Architects Tomb",
        byArchitect: ARCHITECT.layout.name,

        codeBy:[ "KesieV" ],

        minRooms:4,
        maxRooms:1000,

        resources:[
            { type:"image", title:"Default tombs GFX", by:[ "KesieV" ], file:"tombs/default/images/texture.png" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {

            let
                modelsBag = { elements:MODELS },
                rooms = [];
                
            for (let i=0;i<count;i++) {
                let
                    model = game.random.bagPick(modelsBag);

                rooms.push({
                    name:"The Regular Dungeon Room",
                    author:this.byArchitect,
                    model:model,
                    width:model.minWidth+game.random.integer(model.rangeWidth)*model.mulRangeWidth,
                    height:model.minHeight+game.random.integer(model.rangeHeight)*model.mulRangeHeight
                });

            }

            return rooms;
    
        },

        renderRooms:function(game, rooms) {

            let
                architectAt = rooms[0].random.integer(10)<4 ? 0 : game.random.element(rooms);

            rooms.forEach(room=>{

                let
                    walkableCells,
                    npcCell,
                    npc;

                // --- Add plaques

                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Add dungeon layout

                if (room.model.pattern) {

                    game.tools.blitPattern({
                        floorAccent:game.dungeon.floorAccent
                    }, room, room.model.pattern, PALETTE);

                }

                // --- Add a free key

                walkableCells = game.tools.getWalkableCells(room);
                npcCell = room.random.removeElement(walkableCells);

                if (room === architectAt) {

                    npc = game.tools.addNpc(npcCell.x, npcCell.y,Tools.clone(ARCHITECT.layout));

                    game.tools.onInteract(npc,[
                        {
                            dialogueSay:[
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"I'm the Battle System Architect. I hope you enjoy a good fight! Have fun!"
                                },{
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"..."
                                },{
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"Welp. There is no battle system in this game. Nothing to fight here. Instead, take this."
                                }
                            ]    
                        },{
                            asContext:"room",
                            unlockRoom:true,
                        },
                        game.tools.scriptArchitectPaidQuote(game, room, ARCHITECT, true),
                        {
                            dialogueSay:[     
                                {
                                    audio:ARCHITECT.voiceAudio,
                                    by:"{name}",
                                    text:"Goodbye!"
                                }
                            ]    
                        },{ removeElement:true, refreshScreen:true }
                    ]);

                    if (room.random.integer(10) < 3) {
                        game.tools.hintAddDecoration(room, [
                            {
                                decoration:[
                                    { image:"tombs/default/images/texture.png", imageX:0, imageY:0 }
                                ]
                            }
                        ])
                    }
                        
                } else {

                    npc = game.tools.addNpc(npcCell.x, npcCell.y, {
                        model:"chest",
                        shadow:"large",
                        chest:"closed"
                    });

                    game.tools.onInteract(npc,[
                        {
                            changeNpc:{
                                model:"chest",
                                shadow:"large",
                                chest:"open"        
                            }
                        },{
                            asContext:"room",
                            unlockRoom:true,
                        },{ removeElement:true, refreshScreen:true }
                    ]);

                }                

                // --- Add a healing potion on later rooms

                if (room.difficulty > 0.5)
                    game.tools.addHealingPotion(room.random.removeElement(walkableCells));

            })
        }
    })

    TOMBS.addTomb({

        id:TOMB_ID+"-debug",
        tags:[ "debug" ],
        name:"The Architects (Debug) Tomb",
        byArchitect: ARCHITECT.layout.name,

        codeBy:[ "KesieV" ],

        minRooms:4,
        maxRooms:1000,

        generateRooms:function(game, count) {

            let
                rooms = [];

            for (let i=0;i<count;i++) {
                rooms.push({
                    width:5,
                    height:5
                });
            }

            return rooms;
    
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                game.tools.onEnter(room,[
                    { unlockRoom:true }
                ])

            });

        }
    })

    TOMBS.addTomb({

        id:"debug-render",
        tags:[ "debug" ],
        name:"The Architects (Render testing) Tomb",
        byArchitect: ARCHITECT.layout.name,

        codeBy:[ "KesieV" ],

        minRooms:4,
        maxRooms:1000,

        generateRooms:function(game, count) {

            let
                rooms = [];

            for (let i=0;i<count;i++) {
                rooms.push({
                    width:5,
                    height:5
                });
            }

            return rooms;
    
        },

        renderRooms:function(game, rooms) {

            const
                TESTS=[
                    [
                        {
                            at:"floor",
                            x:2, y:2, width:1, height:1,
                            texture:[
                                [
                                    { backgroundColor:CONST.COLORS.WHITE },
                                    CONST.TEXTURES.FONT["R"]
                                ]
                            ]
                        },{
                            at:"ceiling",
                            x:2, y:2, width:1, height:1,
                            texture:[
                                [
                                    { backgroundColor:CONST.COLORS.WHITE },
                                    CONST.TEXTURES.FONT["R"]
                                ]
                            ]
                        },{
                            at:"walls",
                            x:1, y:1, width:3, height:3,
                            texture:[
                                [
                                    CONST.TEXTURES.FONT["R"]
                                ]
                            ]
                        },{
                            at:"walls",
                            x:0, y:0, width:5, height:5,
                            texture:[
                                [
                                    { backgroundColor:CONST.COLORS.WHITE },
                                    CONST.TEXTURES.FONT["R"]
                                ]
                            ]
                        }
                    ],[
                        {
                            at:"floor",
                            x:2, y:2, width:1, height:1,
                            texture:[
                                [
                                    { backgroundColor:CONST.COLORS.WHITE },
                                    CONST.TEXTURES.FONT["&#x2191;"]
                                ]
                            ]
                        },{
                            at:"ceiling",
                            x:2, y:2, width:1, height:1,
                            texture:[
                                [
                                    { backgroundColor:CONST.COLORS.WHITE },
                                    CONST.TEXTURES.FONT["&#x2191;"]
                                ]
                            ]
                        },{
                            at:"walls",
                            x:1, y:1, width:3, height:3,
                            texture:[
                                [
                                    CONST.TEXTURES.FONT["&#x2191;"]
                                ]
                            ]
                        },{
                            at:"walls",
                            x:0, y:0, width:5, height:5,
                            texture:[
                                [
                                    { backgroundColor:CONST.COLORS.WHITE },
                                    CONST.TEXTURES.FONT["&#x2191;"]
                                ]
                            ]
                        }
                    ],[
                        {
                            at:"floor",
                            x:2, y:2, width:1, height:1,
                            texture:[
                                [
                                    { backgroundColor:CONST.COLORS.WHITE },
                                    CONST.TEXTURES.FONT["&#x2192;"]
                                ]
                            ]
                        },{
                            at:"ceiling",
                            x:2, y:2, width:1, height:1,
                            texture:[
                                [
                                    { backgroundColor:CONST.COLORS.WHITE },
                                    CONST.TEXTURES.FONT["&#x2192;"]
                                ]
                            ]
                        },{
                            at:"walls",
                            x:1, y:1, width:3, height:3,
                            texture:[
                                [
                                    CONST.TEXTURES.FONT["&#x2192;"]
                                ]
                            ]
                        },{
                            at:"walls",
                            x:0, y:0, width:5, height:5,
                            texture:[
                                [
                                    { backgroundColor:CONST.COLORS.WHITE },
                                    CONST.TEXTURES.FONT["&#x2192;"]
                                ]
                            ]
                        }
                    ]
                ];

            function blitTest(game, room, id) {
                game.tools.paintFloor(0, room, game.tools.SOLID, game.dungeon.defaultFloorTexture, true);
                game.tools.paintCeiling(0, room, game.tools.SOLID, game.dungeon.defaultCeilingTexture, true);
                game.tools.paintWalls(0, room, game.tools.SOLID, game.dungeon.defaultWallTexture, true);

                TESTS[id].forEach(blit=>{
                    let
                        area = { x:blit.x+room.x, y:blit.y+room.y, width:blit.width, height:blit.height };

                    switch (blit.at) {
                        case "floor":{
                            game.tools.paintFloor(0, area, game.tools.SOLID, blit.texture, true);
                            break;
                        }
                        case "ceiling":{
                            game.tools.paintCeiling(0, area, game.tools.SOLID, blit.texture, true);
                            break;
                        }
                        case "walls":{
                            game.tools.paintWalls(0, area, game.tools.SOLID, blit.texture, true);
                            break;
                        }
                    }

                })
            }

            rooms.forEach(room=>{

                room.currentBlitTest = -1;

                game.tools.setFloorPaintable(room, false);
                game.tools.setCeilingPaintable(room, false);
                game.tools.setElementPaintable(room, false);
                game.tools.setEdgesPaintable(room, false);

                game.tools.onEnter(room,[
                    {
                        addInventoryItem:{
                            data:{
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,
                                model:"default",
                                image:"push"
                            },
                            events:{
                                onUse:[
                                    {
                                        run:(game, context, done)=>{
                                            room.currentBlitTest = (room.currentBlitTest+1)%TESTS.length;
                                            blitTest(game, room, room.currentBlitTest);
                                            game.tools.playAudio("nogain1");
                                            done(true);
                                        }  
                                    }
                                ]
                            }
                        }
                    },{
                        addInventoryItem:{
                            data:{
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,
                                model:"default",
                                image:"pot"
                            },
                            events:{
                                onUse:[
                                    {
                                        dialogueSay:[{
                                            text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam turpis mauris, tempor non posuere sit amet, elementum in lacus. Etiam et porta elit. Mauris ut elit pharetra, venenatis massa quis, sodales erat. Suspendisse potenti. Suspendisse bibendum elit at ipsum molestie mollis. Aliquam erat volutpat. Pellentesque in volutpat justo, sit amet lobortis augue. Donec blandit dui eu luctus posuere. Nunc interdum mollis purus, ac aliquam risus dignissim sit amet. Praesent at tortor dictum, dignissim massa eget, suscipit mauris. Nam at dapibus lorem, in dictum nibh.",
                                            options:[
                                                {
                                                    id:"test",
                                                    value:1,
                                                    label:"Quisque et dignissim erat. Nulla non sem varius, sagittis risus ut, fermentum massa."
                                                },{
                                                    id:"test",
                                                    value:2,
                                                    label:"Integer condimentum libero sed felis varius suscipit."
                                                }
                                            ]
                                        }]
                                    }
                                ]
                            }
                        }
                    },{
                        addInventoryItem:{
                            data:{
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.COLORS.RED,
                                model:"default",
                                image:"pot"
                            },
                            events:{
                                onUse:[
                                    {
                                        dialogueSay:[{
                                            text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam turpis mauris, tempor non posuere sit amet, elementum in lacus. Etiam et porta elit. Mauris ut elit pharetra, venenatis massa quis, sodales erat. Suspendisse potenti. Suspendisse bibendum elit at ipsum molestie mollis. Aliquam erat volutpat. Pellentesque in volutpat justo, sit amet lobortis augue. Donec blandit dui eu luctus posuere. Nunc interdum mollis purus, ac aliquam risus dignissim sit amet. Praesent at tortor dictum, dignissim massa eget, suscipit mauris. Nam at dapibus lorem, in dictum nibh.",
                                            options:[
                                                {
                                                    id:"test",
                                                    value:1,
                                                    label:"Quisque et."
                                                },{
                                                    id:"test",
                                                    value:2,
                                                    label:"Ipsum dolor."
                                                },{
                                                    id:"test",
                                                    value:3,
                                                    label:"Integer condimentum."
                                                },{
                                                    id:"test",
                                                    value:4,
                                                    label:"Consectetur adipiscing."
                                                },{
                                                    id:"test",
                                                    value:5,
                                                    label:"Etiam et porta."
                                                },{
                                                    id:"test",
                                                    value:6,
                                                    label:"Nullam turpis."
                                                }
                                            ]
                                        }]
                                    }
                                ]
                            }
                        }
                    },{
                        addInventoryItem:{
                            data:{
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.COLORS.GREEN,
                                model:"default",
                                image:"pot"
                            },
                            events:{
                                onUse:[
                                    {
                                        dialogueSay:[{
                                            text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam turpis mauris, tempor non posuere sit amet, elementum in lacus. Etiam et porta elit. Mauris ut elit pharetra, venenatis massa quis, sodales erat. Suspendisse potenti. Suspendisse bibendum elit at ipsum molestie mollis. Aliquam erat volutpat. Pellentesque in volutpat justo, sit amet lobortis augue. Donec blandit dui eu luctus posuere. Nunc interdum mollis purus, ac aliquam risus dignissim sit amet. Praesent at tortor dictum, dignissim massa eget, suscipit mauris. Nam at dapibus lorem, in dictum nibh. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam turpis mauris, tempor non posuere sit amet, elementum in lacus. Etiam et porta elit. Mauris ut elit pharetra, venenatis massa quis, sodales erat. Suspendisse potenti. Suspendisse bibendum elit at ipsum molestie mollis. Aliquam erat volutpat. Pellentesque in volutpat justo, sit amet lobortis augue. Donec blandit dui eu luctus posuere. Nunc interdum mollis purus, ac aliquam risus dignissim sit amet. Praesent at tortor dictum, dignissim massa eget, suscipit mauris. Nam at dapibus lorem, in dictum nibh. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam turpis mauris, tempor non posuere sit amet, elementum in lacus. Etiam et porta elit. Mauris ut elit pharetra, venenatis massa quis, sodales erat. Suspendisse potenti. Suspendisse bibendum elit at ipsum molestie mollis. Aliquam erat volutpat. Pellentesque in volutpat justo, sit amet lobortis augue. Donec blandit dui eu luctus posuere. Nunc interdum mollis purus, ac aliquam risus dignissim sit amet. Praesent at tortor dictum, dignissim massa eget, suscipit mauris. Nam at dapibus lorem, in dictum nibh. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam turpis mauris, tempor non posuere sit amet, elementum in lacus. Etiam et porta elit. Mauris ut elit pharetra, venenatis massa quis, sodales erat. Suspendisse potenti. Suspendisse bibendum elit at ipsum molestie mollis. Aliquam erat volutpat. Pellentesque in volutpat justo, sit amet lobortis augue. Donec blandit dui eu luctus posuere. Nunc interdum mollis purus, ac aliquam risus dignissim sit amet. Praesent at tortor dictum, dignissim massa eget, suscipit mauris. Nam at dapibus lorem, in dictum nibh.",
                                            options:[
                                                {
                                                    id:"test",
                                                    value:1,
                                                    label:"Quisque et."
                                                },{
                                                    id:"test",
                                                    value:2,
                                                    label:"Ipsum dolor."
                                                },{
                                                    id:"test",
                                                    value:3,
                                                    label:"Integer condimentum."
                                                },{
                                                    id:"test",
                                                    value:4,
                                                    label:"Consectetur adipiscing."
                                                },{
                                                    id:"test",
                                                    value:5,
                                                    label:"Etiam et porta."
                                                },{
                                                    id:"test",
                                                    value:6,
                                                    label:"Nullam turpis."
                                                }
                                            ]
                                        }]
                                    }
                                ]
                            }
                        }
                    },{
                        addInventoryItem:{
                            data:{
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.COLORS.YELLOW,
                                model:"default",
                                image:"pot"
                            },
                            events:{
                                onUse:[
                                    {
                                        dialogueSay:[
                                            {
                                                text:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam turpis mauris, tempor non posuere sit amet, elementum in lacus."
                                            },
                                            {
                                                text:"Etiam et porta elit. Mauris ut elit pharetra, venenatis massa quis, sodales erat. Suspendisse potenti."
                                            },
                                            {
                                                text:"Suspendisse bibendum elit at ipsum molestie mollis. Aliquam erat volutpat. Pellentesque in volutpat justo."
                                            },
                                            {
                                                text:"Sit amet lobortis augue. Donec blandit dui eu luctus posuere. Nunc interdum mollis purus, ac aliquam risus dignissim sit amet. Praesent at tortor dictum, dignissim massa eget, suscipit mauris. Nam at dapibus lorem, in dictum nibh. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam turpis mauris, tempor non posuere sit amet, elementum in lacus. Etiam et porta elit. Mauris ut elit pharetra, venenatis massa quis, sodales erat. Suspendisse potenti. Suspendisse bibendum elit at ipsum molestie mollis. Aliquam erat volutpat. Pellentesque in volutpat justo, sit amet lobortis augue. Donec blandit dui eu luctus posuere. Nunc interdum mollis purus, ac aliquam risus dignissim sit amet. Praesent at tortor dictum, dignissim massa eget, suscipit mauris. Nam at dapibus lorem, in dictum nibh. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam turpis mauris, tempor non posuere sit amet, elementum in lacus. Etiam et porta elit. Mauris ut elit pharetra, venenatis massa quis, sodales erat. Suspendisse potenti. Suspendisse bibendum elit at ipsum molestie mollis. Aliquam erat volutpat. Pellentesque in volutpat justo, sit amet lobortis augue. Donec blandit dui eu luctus posuere. Nunc interdum mollis purus, ac aliquam risus dignissim sit amet. Praesent at tortor dictum, dignissim massa eget, suscipit mauris. Nam at dapibus lorem, in dictum nibh. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam turpis mauris, tempor non posuere sit amet, elementum in lacus. Etiam et porta elit. Mauris ut elit pharetra, venenatis massa quis, sodales erat. Suspendisse potenti. Suspendisse bibendum elit at ipsum molestie mollis. Aliquam erat volutpat. Pellentesque in volutpat justo, sit amet lobortis augue. Donec blandit dui eu luctus posuere. Nunc interdum mollis purus, ac aliquam risus dignissim sit amet. Praesent at tortor dictum, dignissim massa eget, suscipit mauris. Nam at dapibus lorem, in dictum nibh."
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Take back the "color cards" card when the player leaves the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);

            });

        }
    })
    
})();

