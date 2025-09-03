(function(){ 

    // --- The core gameplay rooms: a starting room and an ending room.

    const
        ENTRANCE_PATTERN = {
            center:{
                map:[
                    "...",
                    ".e.",
                    "..."
                ],
                elements:[
                    "...",
                    ".E.",
                    "..."
                ]
            }
        },
        EXIT_PATTERN = {
            center:{
                map:[
                    "...",
                    ".x.",
                    "..."
                ],
                elements:[
                    "...",
                    ".X.",
                    "..."
                ]
            }
        },
        PALETTE = {
             // --- Entrance
            "e":{
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:"&#x2261;",
                ceiling:[ [
                    "defaultCeilingTexture",
                    { image:"images/texture.png", imageX:5, imageY:1 }
                ] ],
                floor:[ [ "defaultFloorTexture" ] ],
            },
            "E": {
                model:"floorItem",
                image:"topStairs"
            },
            // --- Exit
            "x":{
                walls:[ 0, 0, 0, 0 ],
                mapSymbol:"&#x2261;",
                mapSymbolBgColor:CONST.COLORS.GREEN,
                ceiling:[ "defaultCeiling" ],
                floor:[ [
                    "defaultFloorTexture",
                    { image:"images/texture.png", imageX:5, imageY:1 }
                ] ],
            },
            "X": {
                isExit:true,
                model:"floorItem",
                image:"stairs"
            },
        };

    TOMBS.addTomb({

        isNoDifficulty:true, // Do not contribute to difficulty ramp

        id:"run",
        tags:[ "run" ],
        name:"The Run",
        byArchitect: CONST.CREDITS.ANONYMOUS,

        codeBy:[ "KesieV" ],

        minRooms:2,
        maxRooms:2,

        generateRooms:(game, count)=>{

            return [
                {
                    isEntrance:true,
                    entranceX:1,
                    entranceY:1,
                    width:3,
                    height:3
                },{
                    isExit:true,
                    width:3,
                    height:3
                }
            ];
    
        },

        renderRooms:(game, rooms)=>{
            rooms.forEach(room=>{
                let
                    assets;

                if (room.isEntrance)
                    assets = game.tools.blitPattern(0, room, ENTRANCE_PATTERN, PALETTE );
                else
                    assets = game.tools.blitPattern(0, room, EXIT_PATTERN, PALETTE );

                assets.elements.forEach(element=>{
                    if (element.isExit) {
                        game.tools.onInteract(element,[
                            {
                                dialogueSay:[
                                    {
                                        text:"Do you want to go down this ladder now and end this daily run?",
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
                                endRun:true
                            },{
                                if:{ else:true },
                                movePlayerBack:true
                            }
                        ]);
                    }
                })
            })
        }
    })    

})();

