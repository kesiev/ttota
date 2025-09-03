(function(){

    const
        TOMB_ID = "kesiev-lore-dl",
        TOMB_TAGS = [ "tomb", "story" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        CHECKPOINT_ID = "s",
        ANIMATION_WAVE = [ { dy:1 }, { dy:1 }, 0, { dy:-1 }, { dy:-1 }, 0  ],
        SCENES = [
            {
                onRoomEnter:{ sumNextCheckpoint:1 },
                elements:[
                    { type:"potion", x:1, y:1 }
                ],
                plaques:[
                    "To your health!"
                ]
            },{
                onRoomEnter:{ sumNextCheckpoint:1 },
                elements:[
                    { type:"poison", x:1, y:1 }
                ],
                plaques:[
                    "To your health!"
                ]
            },{
                music:"kesiev-lore-dl1",
                roomColor:CONST.COLORS.GRAY,
                elements:[
                    {
                        type:"npc", imageX:0, imageY:5, x:1, y:1, animation:ANIMATION_WAVE,
                        name:"Dark Face",
                        audio:["kesiev-lore-dl-dark1"],
                        intro:[
                            "I am the Dark Face.",
                            "I care for the souls of the Architects who have been banished from this tomb.",
                            "I'm seeing... I'm seeing..."
                        ],
                        sentences:[
                            "...the soul of an Architect who secretly and silently sold someone else's dreams and hopes.",
                            "...the soul of a young Architect who ran away in the night stealing its self-esteem.",
                            "...the soul of an Architect that has been a mentor puppeteer.",
                            "...the souls of dozens of faceless gremlin Architects, who haunt dreams and nightmares.",
                            "...the soul of a supervising Architect, who stabs his assistant in the back and exiles him...",
                        ],
                        thenSumNextCheckpoint:1
                    }
                ]
            },{
                music:"kesiev-lore-dl1",
                roomColor:CONST.COLORS.WHITE,
                elements:[
                    {
                        type:"npc", imageX:0, imageY:6, x:1, y:1, animation:ANIMATION_WAVE,
                        name:"Light Face",
                        audio:["kesiev-lore-dl-light1"],
                        intro:[
                            "I am the Light Face.",
                            "I care for the souls of the Architects that are no longer here.",
                            "I'm seeing... I'm seeing..."
                        ],
                        sentences:[
                            "...the dark soul of an Architect, who shot with plastic rifles.",
                            "...the soul of an old rebellious Architect, forced into exile by the hypocrisy of his companions.",
                            "...the souls of dozens of faceless young Architects, both bored and grateful...",
                        ],
                        thenSumNextCheckpoint:-1
                    }
                ]
            }
        ]

    TOMBS.addTomb({

        isNoDifficulty:true, // Do not contribute to difficulty ramp
        
        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The &#x263B;&#x263A; Room",
        description:"Meet the Dark and Light Faces.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"audio", title:"System of Balls", by:[ "null1024" ], id:"kesiev-lore-dl1",mod:"tombs/kesiev/audio/music/system_of_balls.xm", isSong:true},
            { type:"image", title:"KesieV tombs GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/texture.png" },
            { type:"audio", title:"Dark Face voice", by:[ "KesieV" ], id:"kesiev-lore-dl-dark1", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"sine","attack":0.009,"sustain":0.016,"decay":0.009,"release":0.028,"frequency":190,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0} },
            { type:"audio", title:"Light Face voice", by:[ "KesieV" ], id:"kesiev-lore-dl-light1", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"sine","attack":0.009,"sustain":0.016,"decay":0.009,"release":0.028,"frequency":1525,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0} },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    name:this.name,
                    author:this.byArchitect,
                    width:3,
                    height:3
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
                    checkpoint = game.tools.getCheckpoint(room,CHECKPOINT_ID),
                    scene = SCENES[checkpoint];

                if (scene.music)
                    room.music = scene.music;

                if (scene.roomColor) {
                    game.tools.paintCeiling(0, room, game.tools.SOLID, [
                        {  image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:scene.roomColor }
                    ]);
                    game.tools.paintWalls(0, room, game.tools.SOLID, [
                        {  image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:scene.roomColor }
                    ]);
                    game.tools.paintFloor(0, room, game.tools.SOLID, [
                        {  image:"tombs/kesiev/images/texture.png", imageX:2, imageY:4, backgroundColor:scene.roomColor }
                    ]);
                    game.tools.setElementPaintable(room, false);
                    game.tools.setCeilingPaintable(room, false);
                    game.tools.setFloorPaintable(room, false);
                    game.tools.setEdgesPaintable(room, false);
                }

                if (scene.elements)
                    scene.elements.forEach(element=>{
                        switch (element.type) {
                            case "potion":{
                                game.tools.addHealingPotion(game.map[room.y+element.y][room.x+element.x]);
                                break;
                            }
                            case "poison":{
                                game.tools.addPoisonPotion(game.map[room.y+element.y][room.x+element.x]);
                                break;
                            }
                            case "npc":{
                                let
                                    script = [],
                                    dialogue = [],
                                    npc;

                                npc = game.tools.addElement(room.x+element.x,room.y+element.y, {
                                    sprite:[
                                        {image:"tombs/kesiev/images/texture.png", imageX:element.imageX, imageY:element.imageY, animation:element.animation }
                                    ]
                                }, true);

                                if (element.intro)
                                    element.intro.forEach(line=>{
                                        dialogue.push({
                                            audio:element.audio,
                                            by:element.name,
                                            text:line
                                        })
                                    });

                                if (element.sentences)
                                    dialogue.push({
                                        audio:element.audio,
                                        by:element.name,
                                        text:room.random.element(element.sentences)
                                    });

                                if (dialogue.length)
                                    script.push({ dialogueSay:dialogue });

                                if (element.thenSumNextCheckpoint) {
                                    script.push({ asContext:"room", unlockRoom:true });
                                    script.push({ asContext:"room", sumNextCheckpoint:{ id:CHECKPOINT_ID, value:element.thenSumNextCheckpoint }})
                                }

                                script.push({ movePlayerBack:true });

                                game.tools.onInteract(npc,script);
                                break;
                            }
                        }
                    })

                if (scene.plaques)
                    scene.plaques.forEach(plaque=>{
                        let
                            walkableWalls = game.tools.getWalkableWalls(room),
                            plaquePosition = room.random.element(walkableWalls);

                        if (plaquePosition) {

                            game.tools.addWallDecoration(0, plaquePosition, plaquePosition.side, game.tools.SOLID, [
                                {  isPlaque:true, image:"images/texture.png", imageX:2, imageY:1 }
                            ]);

                            game.tools.onBumpWall(plaquePosition.x, plaquePosition.y, plaquePosition.side, [
                            {
                                    dialogueSay:[
                                        {
                                            text:"A plaque says: \""+plaque+"\"."
                                        }
                                    ]
                                }
                            ]);

                            // Avoid random decorations on the lever
                            game.tools.setWallPaintable(plaquePosition.x, plaquePosition.y, plaquePosition.side, false);

                        }
                    })
                
                if (scene.onRoomEnter) {
                    let
                        script = [];

                    if (scene.onRoomEnter.sumNextCheckpoint) {
                        script.push({ asContext:"room", unlockRoom:true });
                        script.push({ asContext:"room", sumNextCheckpoint:{ id:CHECKPOINT_ID, value:scene.onRoomEnter.sumNextCheckpoint }});
                    }

                    game.tools.onEnter(room, script);
                }

            });

        }
    })
    
})();

