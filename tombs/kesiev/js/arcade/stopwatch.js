(function(){

    let
        TOMB_ID = "kesiev-stopwatch",
        TOMB_TAGS = [ "tomb", "arcade" ],
        ARCHITECT= ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        DIFFICULTY_LIMIT = 2000,
        STOPWATCHES = [ 5, 10, 15 ];

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Stop Room",
        description:"Stop a set of stopwatches as close to the required time as possible.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:3,
                    height:3,
                    isSolved:false,
                    isFirstEntrance:true,
                    attempts:-1000,
                    attemptsLimit:5000,
                    stopwatchesToGo:STOPWATCHES.length
                }
            ];
        },

        renderRooms:function(game, rooms) {

            rooms.forEach(room=>{

                room.attempts -= (1-room.difficulty)*DIFFICULTY_LIMIT;

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Add the Architect

                let
                    architect = game.tools.addNpc(room.x+1, room.y+1, Tools.clone(ARCHITECT.layout));

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
                                        text:"How time flies!"
                                    }
                                ]
                            },
                            { movePlayerBack:true },
                            { endScript:true }
                        ]
                    },{
                        if:{
                            asContext:"room",
                            is:{ stopwatchesToGo:0 }
                        },
                        asContext:"room",
                        unlockRoomWithAttempts:"attempts",
                        ofAttempts:"attemptsLimit"
                    },{
                        if:{ and:true },
                        asContext:"room",
                        removeInventoryItemsFromRoom:true
                    },{
                        if:{ and:true },
                        asContext:"room",
                        setAttribute:"isSolved",
                        toValue:true
                    },{
                        if:{ and:true },
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Thank you for your gifts! I'll keep them."
                            }
                        ]
                    },{
                        if:{ else:true },
                        dialogueSay:[     
                            {
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"It seems like time has challenged you!"
                            },{
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Give me the watches when you're finished."
                            }
                        ]
                    },
                    { movePlayerBack:true }
                ]);

                // --- Restore the "stopwatch" cards when the player enters the room

                let
                    script = [];

                STOPWATCHES.forEach(stopwatchtime=>{
                    script.push({
                        if:{
                            asContext:"room",
                            is:{ isFirstEntrance:true }
                        },
                        addInventoryItem:{
                            data:{
                                state:0,
                                group:CONST.GROUP.ROOMITEM,
                                color:CONST.ITEMCOLOR.ROOMITEM,                                
                                model:"default",
                                image:"stopwatch",
                                counter:stopwatchtime+"s"
                            },
                            events:{
                                onUse:[
                                    { setInventoryItemAnimation:"bounce" },
                                    {
                                        run:(game, context, done)=>{
                                            let
                                                result = true,
                                                time = (new Date()).getTime();
                                            
                                            switch (context.as.state) {
                                                case 0:{
                                                    context.as.startTime = time;
                                                    game.tools.setInventoryItemColor(context.as, CONST.COLORS.RED);
                                                    context.as.state++;
                                                    break;
                                                }
                                                case 1:{
                                                    let
                                                        delta = Math.abs((stopwatchtime*1000) - time + context.as.startTime);
                                                    if (CONST.DEBUG.showLogs)
                                                        console.log("DELTA",delta);
                                                    context.as.endTime = time;
                                                    room.attempts += delta;
                                                    game.tools.setInventoryItemColor(context.as, CONST.COLORS.GRAY);
                                                    context.as.state++;
                                                    context.room.stopwatchesToGo--;
                                                    break;
                                                }
                                                default:{
                                                    result = false;
                                                }
                                            }
                                            done(result);
                                        } 
                                    },{
                                        if:{ and:true },
                                        playAudio:{ sample:"mouseclick1" }
                                    },{
                                        if:{ else:true },
                                        dialogueSay:[
                                            {
                                                text:"It looks like this watch is stuck..."
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    });
                })

                script.push({
                    if:{ and:true },
                    setAttribute:"isFirstEntrance",
                    toValue:false
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

                game.tools.onEnter(room, script);


                // --- Store the "stopwatch" cards when the player leaves the room

                game.tools.onLeave(room,[ { storeInventoryItemsFromRoom:true } ]);

            })
        }
        
    })
    
})();

