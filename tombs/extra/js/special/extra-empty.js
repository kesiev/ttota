(function(){

    // Hey, welcome to the room code! You're coming from tombs/extra/index.js, right?
    //
    // This is the code for making very simple room, with an Architect that will
    // unlock it for you.
    //
    // There still isn't a true Tomb development manual ATM, sorry... but you can
    // have a look to the tombs/kesiev/js folder to see a lot of room examples!
    //
    // Let's see what's in a basic Tomb code... 

    const
        TOMB_ID = "extra-empty", // This is the tomb unique ID. I suggest using <YOURNICKNAME>-<TOMB NAME>
        TOMB_TAGS = [ "tomb", "special" ], // This tomb is marked with the SPECIAL tag and is in the "special" folder.
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS); // Ask the Tombs to give you a fitting architect for this tomb.

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The Empty Room", // Give your tomb a short and mysterious name.
        description:"An empty room to start making your custom room.", // Describe what happens here.
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "You!" ], // Add here your nickname. It will appear in the game credits automatically.

        minRooms:1, // How many rooms do you need for your Tomb?
        maxRooms:1, // Do you want a random amount of extra rooms? Add a higher number here or leave the same as minRooms.

        resources:[
            // List your tomb resources here. (music, graphics, sound effects, etc.)
            ARCHITECT.voiceResource // Keep this line here. It's the Architect voice sound effect.
        ],

        generateRooms:function(game, count) {

            // This code is run when your Tomb is scheduled to be added on a floor!
            //
            // "count" will tell how many rooms you're allowed to add, according to the minRooms and maxRooms
            // parameters we've seen before.
            //
            // Returns an array, whith one object for room listing some metadata.

            return [
                {
                    hasGold:true, // All Tombs gives some gold, so keep this line as is.
                    name:this.name, // Keep it as is.
                    author:this.byArchitect,  // Keep it as is.
                    width:3, // How wide is this room?
                    height:3, // How tall is this room?
                    isSolved:false // I suggest you to keep a flag that says if the room has been solved or not.
                }
            ];
        },

        renderRooms:function(game, rooms) {

            // This code is run when the rooms have been placed in the dungeon floor and they're ready
            // to be filled with your Tomb activities :)
            //
            // Let's iterate all the rooms one by one and fill them.

            rooms.forEach(room=>{

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Add the architect

                let
                    architect = game.tools.addNpc(room.x+1, room.y+1, Tools.clone(ARCHITECT.layout));

                // There are many ways to code interactions. The simpler one is using "events", which are
                // a list of objects telling the game what to do when a specific event happens.
                //
                // Have a look to the tombs/kesiev/js folder to see more examples!

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
                                        text:"Anyway... It's just an empty room!"
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
                                text:"Thank you for talking to me! I'll unlock this room for you!"
                            }
                        ]
                    },{
                        asContext:"room",
                        unlockRoom:true,
                    },{
                        asContext:"room",
                        setAttribute:"isSolved",
                        toValue:true
                    },
                    { movePlayerBack:true }
                ]);

            });

        }
    })
    
})();
