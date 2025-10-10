(function(){

    const
        TOMB_ID = "kesiev-world",
        TOMB_TAGS = [ "tomb", "quiz" ],
        ARCHITECT = ARCHITECTS.getAt(TOMB_ID, TOMB_TAGS),
        MAP_WIDTH = 10,
        MAP_HEIGHT = 5,
        ATTEMPTS_LIMIT = 2,
        QUESTIONS = 3;

    function getMapCoords(lat, lon, mapWidth, mapHeight) {
        return {
            x: parseInt((lon + 180.0) * (mapWidth / 360.0)),
            y: parseInt(((lat * -1.0) + 90.0) * (mapHeight / 180.0))
        }
    }

    function nextQuestion(room) {
        let
            question;

        room.currentQuestion++;
        question = room.questions[room.currentQuestion];

        if (question) {
            room.solutionX = room.x+question.x;
            room.solutionY = room.y+question.y;
            room.placeName = question.placeName;
            room.architect.placeName = question.placeName;
            return true;
        } else
            return false;
    }

    TOMBS.addTomb({

        id:TOMB_ID,
        tags:TOMB_TAGS,
        name:"The World Room",
        description:"Find some places on a world map.",
        byArchitect:ARCHITECT.layout.name,
        
        codeBy:[ "KesieV" ],

        minRooms:1,
        maxRooms:1,

        resources:[
            { type:"image", title:"World Map GFX", by:[ "KesieV" ], file:"tombs/kesiev/images/worldmap.png"},
            // From: https://simplemaps.com/data/world-cities
            { type:"data", id:"kesiev-map-data", title:"Basic World Cities DB subset", license:"Creative Commons Attribution 4.0", by:[ "Simplemaps" ], file:"tombs/kesiev/data/map/map.txt" },
            ARCHITECT.voiceResource
        ],

        generateRooms:function(game, count) {
            return [
                {
                    hasGold:true,
                    name:this.name,
                    author:this.byArchitect,
                    width:MAP_WIDTH,
                    height:MAP_HEIGHT,
                    isSolved:false,
                    currentQuestion:-1,
                    questions:[],
                    attempts:1,
                    attemptsLimit:ATTEMPTS_LIMIT
                }
            ];
        },

        renderRooms:function(game, rooms) {

            let
                places = LOADER.DATA["kesiev-map-data"].split("\n");

            rooms.forEach(room=>{

                // --- Prepare the question

                let
                    calendarMetadata = {};
                    placesSequence = [],
                    questionsCount = QUESTIONS+Math.floor(room.difficulty*QUESTIONS/2);

                for (let i=0;i<questionsCount;i++) {
                    let
                        place = room.random.element(places).split("|"),
                        mapCoords = getMapCoords(place[1]*1, place[2]*1, MAP_WIDTH, MAP_HEIGHT );

                    calendarMetadata["Place "+i+" Name"]=place[0];
                    calendarMetadata["Place "+i+" URL"]="https://www.openstreetmap.org/?mlat="+place[1]+"&mlon="+place[2]+"#map=9/"+place[1]+"/"+place[2];
                    calendarMetadata["Place "+i+" Coord"]=mapCoords.x+","+mapCoords.y;

                    game.tools.hintAddCoordinates(room, place[0], mapCoords.x, mapCoords.y);

                    placesSequence.push(place[0]);

                    room.questions.push({
                        placeName:place[0],
                        x:mapCoords.x,
                        y:mapCoords.y
                    });
                }

                game.tools.hintAddSequence(room, placesSequence);

                // --- Add solutions to calendar

                room.calendarMetadata = calendarMetadata;

                // --- Add entrance plaques
                
                room.quote = room.random.element(ARCHITECT.plaques);
                game.tools.addPlaques(room);

                // --- Draw the room

                for (let x=0;x<MAP_WIDTH;x++)
                    for (let y=0;y<MAP_HEIGHT;y++)
                        game.tools.paintFloor(0, { x:room.x+x, y:room.y+y, width:1, height:1 }, game.tools.SOLID,[ { image:"tombs/kesiev/images/worldmap.png", imageX:x, imageY:y } ]);

                // Do not allow random elements on the whole room
                game.tools.setElementPaintable(room, false);

                // --- Prepare the architect positions

                let
                    walkableCells = game.tools.getWalkableCells(room),
                    architect,
                    architectPositions = [],
                    architectPosition;

                for (let i=0;i<3;i++)
                    architectPositions.push(room.random.removeElement(walkableCells));

                architectPosition = architectPositions[0];
                
                architect = game.tools.addNpc(architectPosition.x, architectPosition.y, Tools.clone(ARCHITECT.layout));
                architect.positions = architectPositions;
                architect.currentPosition = 0;
                room.architect = architect;
                
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
                                        text:"Well... You really know your stuff, huh!"
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
                                text:"I was wondering... where is {placeName}?"
                            },{
                                audio:ARCHITECT.voiceAudio,
                                by:"{name}",
                                text:"Oh, sorry... I'll get out of the way."
                            }
                        ]
                    },{
                        run:(game, context, done)=>{
                            let
                                position;

                            context.as.currentPosition = (context.as.currentPosition+1)%context.as.positions.length;
                            position = context.as.positions[context.as.currentPosition];

                            game.tools.moveElementAt(context.as, position.x, position.y);
                            
                            game.tools.refreshScreen();

                            if (CONST.DEBUG.showLogs)
                                console.log("ANSWER", room.solutionX-room.x, room.solutionY-room.y);

                            done(true);

                        }
                    }
                ]);

                // --- Give the "select cell" card when the player enters the room

                game.tools.onEnter(room,[
                    {
                        if:{
                            asContext:"room",
                            is:{ isSolved:false }
                        },
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
                                            if ((game.position.x == context.room.solutionX) && (game.position.y == context.room.solutionY)) {
                                                if (nextQuestion(context.room)) {
                                                    if (CONST.DEBUG.showLogs)
                                                        console.log("ANSWER", room.solutionX-room.x, room.solutionY-room.y);
                                                    done(1);
                                                } else
                                                    done(2);
                                            } else {
                                                context.room.attempts++;
                                                done(0);
                                            }
                                        }  
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:0 }
                                        },
                                        hitPlayer:1
                                    },{
                                        if:{ and:true },
                                        dialogueSay:[
                                            {
                                                text:"The floor beneath your feet starts to burn!"
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:1 }
                                        },
                                        asContext:"room",
                                        playerGainGold:2
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        dialogueSay:[     
                                            {
                                                audio:ARCHITECT.voiceAudio,
                                                by:ARCHITECT.layout.name,
                                                text:"Well done! Now... where is {placeName}?"
                                            }
                                        ]
                                    },{
                                        if:{
                                            asContext:"lastRun",
                                            is:{ result:2 }
                                        },
                                        asContext:"room",
                                        setAttribute:"isSolved",
                                        toValue:true
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        unlockRoomWithAttempts:"attempts",
                                        ofAttempts:"attemptsLimit"
                                    },{
                                        if:{ and:true },
                                        asContext:"room",
                                        removeInventoryItemsFromRoom:true
                                    }
                                ]
                            }
                        }
                    }
                ]);

                // --- Take back the "select cell" card when the player exits the room

                game.tools.onLeave(room,[ { removeInventoryItemsFromRoom:true } ]);

                // --- Starts the first question 

                nextQuestion(room);

            });

        }
    })
    
})();

