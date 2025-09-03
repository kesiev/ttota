let CORE = (function(){

    const
        DEFAULT_RESOURCES = [
            // --- Graphics
            { type:"image", title:"Core GFX", by:[ "KesieV" ], file:"images/decorations.png" },
            { type:"image", title:"Core GFX", by:[ "KesieV" ], file:"images/texture.png" },
            { type:"image", title:"Core GFX", by:[ "KesieV" ], file:"images/elements.png" },
            { type:"image", title:"Core GFX", by:[ "KesieV" ], file:"images/items.png" },
            { type:"image", title:"Core GFX", by:[ "KesieV" ], file:"images/npc.png" },
            { type:"image", title:"Core GFX", by:[ "KesieV" ], file:"images/skybox.png" },
            { type:"image", title:"Core GFX", by:[ "KesieV" ], file:"images/text.png" },
            { type:"image", title:"Core GFX", by:[ "KesieV" ], file:"images/item-text.png" },
            { type:"image", title:"Core GFX", by:[ "KesieV" ], file:"images/tutorial/step-continue.svg" },
            { type:"image", title:"Core GFX", by:[ "KesieV" ], file:"images/tutorial/step-move.svg" },
            { type:"image", title:"Core GFX", by:[ "KesieV" ], file:"images/tutorial/step-buttons.svg" },
            { type:"image", title:"Core GFX", by:[ "KesieV" ], file:"images/tutorial/step-items.svg" },

            { type:"image", title:"Logo", by:[ "KesieV" ], file:"images/logo/thetombofthe.svg" },
            { type:"image", title:"Logo", by:[ "KesieV" ], file:"images/logo/architects.svg" },
            { type:"image", title:"Logo", by:[ "KesieV" ], file:"images/logo/maze.svg" },
            { type:"image", title:"Logo", by:[ "KesieV" ], file:"images/logo/software.svg" },
            
            // --- Sound effects
            { type:"audio", title:"Walking SFX", by:[ "kddekadenz" ], id:"walk1", file:"audio/sfx/walk1", pitchStart:0.8, pitchRange: 0.4, volume:0.7 },
            { type:"audio", title:"Walking SFX", by:[ "kddekadenz" ], id:"walk2", file:"audio/sfx/walk1", pitchStart:0.8, pitchRange: 0.4, volume:0.7 },
            { type:"audio", title:"Walking SFX", by:[ "kddekadenz" ], id:"walk3", file:"audio/sfx/walk3", pitchStart:0.8, pitchRange: 0.4, volume:0.7 },
            { type:"audio", title:"Walking SFX", by:[ "kddekadenz" ], id:"leaves1", file:"audio/sfx/leaves1", pitchStart:0.9, pitchRange: 0.2 },
            { type:"audio", title:"Stamp SFX", by:[ "I.fekry" ], id:"stamp1", file:"audio/sfx/stamp1" },
            { type:"audio", title:"Lever SFX", by:[ "OwlishMedia" ],id:"lever1", file:"audio/sfx/lever1", pitchStart:0.8, pitchRange: 0.4 },
            { type:"audio", title:"Moving rock SFX", by:[ "rubberduck" ], id:"moverock1", file:"audio/sfx/moverock1", pitchStart:0.9, pitchRange: 0.2 },
            { type:"audio", title:"Door open SFX", by:[ "Kenney" ], id:"dooropen1", file:"audio/sfx/dooropen1", pitchStart:0.8, pitchRange: 0.4 },
            { type:"audio", title:"Equip SFX", by:[ "artisticdude" ], id:"equip1", file:"audio/sfx/equip1", volume:0.5, pitchStart:0.8, pitchRange: 0.4 },
            { type:"audio", title:"Mouse click SFX", by:[ "OwlishMedia" ], id:"mouseclick1", file:"audio/sfx/mouseclick1" },
            { type:"audio", title:"Keyboard typing SFX", by:[ "Unicaegames" ], id:"keypress1", file:"audio/sfx/keypress1", pitchStart:0.9, pitchRange: 0.2, volume:0.7 },
            { type:"audio", title:"Keyboard typing SFX", by:[ "Unicaegames" ], id:"keypress2", file:"audio/sfx/keypress2", pitchStart:0.9, pitchRange: 0.2, volume:0.7 },
            { type:"audio", title:"Keyboard typing SFX", by:[ "Unicaegames" ], id:"keypress3", file:"audio/sfx/keypress3", pitchStart:0.9, pitchRange: 0.2, volume:0.7 },
            { type:"audio", title:"Death SFX", by:[ "Iwan Gabovitch" ], id:"death1", file:"audio/sfx/death1", pitchStart:0.9, pitchRange: 0.2 },
            { type:"audio", title:"Pain SFX", by:[ "Iwan Gabovitch" ],id:"pain1", file:"audio/sfx/pain1", pitchStart:0.9, pitchRange: 0.2 },
            { type:"audio", title:"Coin SFX", by:[ "artisticdude" ], id:"gaingold1", file:"audio/sfx/gaingold1", pitchStart:0.9, pitchRange: 0.2 },
            { type:"audio", title:"Payment SFX", by:[ "artisticdude" ], id:"losegold1", file:"audio/sfx/losegold1", pitchStart:0.9, pitchRange: 0.2 },
            { type:"audio", title:"No gain SFX", by:[ "OwlishMedia" ], id:"nogain1", file:"audio/sfx/nogain1", pitchStart:0.9, pitchRange: 0.2 },
            { type:"audio", title:"Cure SFX", by:[ "Someoneman" ], id:"cure1", file:"audio/sfx/cure1", volume:0.4 },
            { type:"audio", title:"Thermal printer SFX", by:[ "twisterad3" ], id:"printer1", file:"audio/sfx/printer1" },
            { type:"audio", title:"Thermal printer SFX", by:[ "twisterad3" ], id:"printerend1", file:"audio/sfx/printerend1" },
            { type:"audio", title:"Thermal printer SFX", by:[ "twisterad3" ], id:"printerload1", file:"audio/sfx/printerload1" },
            { type:"audio", title:"Shovel SFX", by:[ "themightyglider" ], id:"dig1", file:"audio/sfx/dig1", pitchStart:0.9, pitchRange: 0.2 },
            { type:"audio", title:"Chime confirm SFX", by:[ "MouseBYTE" ], id:"confirm1", file:"audio/sfx/confirm1", volume:0.3 },
            { type:"audio", title:"Sheet SFX", by:[ "Voltiment555" ], id:"sheet1", file:"audio/sfx/sheet1", volume:0.3 },
            { type:"audio", title:"Fake confirm SFX", by:[ "KesieV" ], id:"beep1", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"sine","attack":0.012,"sustain":0.016,"decay":0.012,"release":0.02,"frequency":595,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0}},
            { type:"audio", title:"Fake option SFX", by:[ "KesieV" ], id:"beep2", volume:CONST.VOLUME.NOISESFX, noise:{"wave":"sine","attack":0.012,"sustain":0.016,"decay":0.012,"release":0.02,"frequency":715,"bitCrush":0,"bitCrushSweep":0,"limit":0.6,"tremoloFrequency":0,"tremoloDepth":0,"frequencyJump1onset":0,"frequencyJump1amount":0,"frequencyJump2onset":0,"frequencyJump2amount":0,"pitch":0}},

            // --- Music
            { type:"audio", title:"Sleepy Snow", by:[ "Drozerix" ], id:"mystery1",mod:"audio/music/drozerix_-_sleepy_snow.xm", isSong:true},
            { type:"audio", title:"Caverns of Time", by:[ "Dragonking" ], id:"mystery2",mod:"audio/music/caverns_of_time.xm", isSong:true},
            { type:"audio", title:"Raspberry Jam", by:[ CONST.CREDITS.UNKNOWN ], id:"title1",mod:"audio/music/raspberry_jam.xm", isSong:true},
            { type:"audio", title:"Mustard brandwqerase", by:[ CONST.CREDITS.UNKNOWN ], id:"success1",mod:"audio/music/which_brand_of_mustard_shall_i_buy.xm", isSong:true},
        ],
        DUNGEON_WALLTEXTURES = [
            { image:"images/texture.png", imageX:1, imageY:0 },
            { image:"images/texture.png", imageX:4, imageY:0 },
            { image:"images/texture.png", imageX:5, imageY:0 },
            { image:"images/texture.png", imageX:6, imageY:0 },
        ],
        DUNGEON_FLOORCEILINGTEXTURES = [
            { image:"images/texture.png", imageX:0, imageY:0 },
            { image:"images/texture.png", imageX:2, imageY:0 },
            { image:"images/texture.png", imageX:3, imageY:0 },
            { image:"images/texture.png", imageX:4, imageY:0 },
            { image:"images/texture.png", imageX:5, imageY:0 },
        ],
        DUNGEON_COLORS = [
            "GREEN", "BLUE", "PURPLE"
        ],
        DUNGEON_WALLDECORATIONS=[
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:0, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:1, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:2, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:3, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:4, imageY:0 } },

            { randomX:true, texture:{ dy:-9, image:"images/decorations.png", imageX:0, imageY:2 } },
            { randomX:true, texture:{ dy:-9, image:"images/decorations.png", imageX:1, imageY:2 } },
            { randomX:true, texture:{ dy:-9, image:"images/decorations.png", imageX:2, imageY:2 } },
            { randomX:true, texture:{ dy:-9, image:"images/decorations.png", imageX:3, imageY:2 } },
            { randomX:true, texture:{ dy:-9, image:"images/decorations.png", imageX:4, imageY:2 } },
            { texture:{ dy:-9, image:"images/decorations.png", imageX:5, imageY:2 } },
            { texture:{ dy:-9, image:"images/decorations.png", imageX:6, imageY:2 } },
            { randomX:true, texture:{ dy:-9, image:"images/decorations.png", imageX:7, imageY:2 } },

            { randomX:true, texture:{ dy:-9, image:"images/decorations.png", imageX:0, imageY:3 } },
            { texture:{ dy:-9, image:"images/decorations.png", imageX:1, imageY:3, animation: [ 0, 0, 0, { dx:-101 }, { dx:-101 }, { dx:-101 } ] } },
        ],
        DUNGEON_FLOORDECORATIONS=[
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:0, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:1, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:2, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:3, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:4, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:5, imageY:0 } }, 
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:6, imageY:0 } },

            { texture:{ dy:-9, image:"images/decorations.png", imageX:5, imageY:2 } },
        ],
        DUNGEON_CEILINGDECORATIONS=[
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:0, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:1, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:2, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:3, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:4, imageY:0 } },
            { randomX:true, randomY:true, texture:{ image:"images/decorations.png", imageX:5, imageY:0 } }, 

            { texture:{ dy:-9, image:"images/decorations.png", imageX:5, imageY:2 } },
        ],
        DUNGEON_ELEMENTDECORATIONS=[
            { randomX:true, texture:{ dy:-9, image:"images/decorations.png", imageX:3, imageY:3 } },
            { randomX:true, texture:{ dy:-9, image:"images/decorations.png", imageX:4, imageY:3 } },
            { randomX:true, texture:{ dy:-9, image:"images/decorations.png", imageX:5, imageY:3 } },
            { randomX:true, texture:{ dy:-9, image:"images/decorations.png", imageX:6, imageY:3 } },
        ];
        KEYS_ALL = 6,
        ROOM_GOLD_BUDGET_BASE = 10,
        ROOM_GOLD_BUDGET_DISTANCE = 10,
        TOMB_NAMES = [
            0,
            [
                "The {adjectives:0} {places:0}",
                "The {places:0} of {nouns:0}"
            ],[
                "The {adjectives:1} {places:0}",
                "The {places:0} of {nouns:1}"
            ],[
                "The {adjectives:1} {places:0} of {nouns:2}",
                "The {adjectives:1} {places:0} of {adjectives:2}",
                "The {places:0} of the {adjectives:1} {nouns:2}",
                "The {nouns:1} of the {adjectives:2} {places:0}"
            ]
        ];
        
    let
        audio;

    function generate(menu, audio, loading, done, progress, loader, isDebug) {

        let            
            items=[],
            rooms=[],
            map=[],
            dungeon,
            random,
            roomDifficulty = 0,
            game = {},
            dungeonParameters = progress.getDungeonParameters(),
            mapSize = dungeonParameters.mapSize,
            seed = dungeonParameters.seed,
            coverTitle = dungeonParameters.coverTitle,
            coverSubtitle = dungeonParameters.coverSubtitle;

        if (CONST.DEBUG.showLogs)
            console.log("SEED",seed);

        random = new Random(seed);

        game.skybox = dungeonParameters.skybox;
        game.seed = seed;
        game.random = random;
        game.hints = [];
        game.keyDoors = {};
        game.checkpoints = progress.getCheckpoints(seed);

        do {

            let
                firstRoom,
                lastRoom;

            rooms = TOMBS.pickRooms(
                game,
                dungeonParameters.keysCount,
                dungeonParameters.roomsCount,
                dungeonParameters.tags
            );

            rooms.all = rooms.all.filter(room=>{
                if (room.isEntrance)
                    firstRoom = room;
                else if (room.isExit)
                    lastRoom = room;
                else
                    return true;
            })

            dungeon = GenerateDungeon(
                random,
                mapSize-1,
                firstRoom,
                lastRoom,
                rooms.all,
                dungeonParameters.tunnels
            );

        } while (!dungeon);

        if (!coverTitle) {
            let
                titleRandom = new Random(seed),
                tombNames = TOMB_NAMES[rooms.tagsByCount.length] || TOMB_NAMES[TOMB_NAMES.length-1],
                tombName = titleRandom.element(tombNames),
                bags = {};

            coverTitle = tombName.replace(/\{([^}]+)\}/g,(m,m1)=>{
                let
                    parts = m1.split(":"),
                    pool = parts[0],
                    tag = rooms.tagsByCount[parts[1]]
                    
                if (tag) {
                    let
                        tagName = tag.name;

                    if (!bags[tagName])
                        bags[tagName] = {};

                    if (!bags[tagName][pool])
                        bags[tagName][pool] = { elements:TOMBS.TAGS[tagName][pool] };
                    
                    return titleRandom.bagPick(bags[tagName][pool]);
                } else
                    return "???";
            })
        }

        menu.setCoverData([ coverSubtitle, coverTitle ]);
        
        loader.load(rooms.resources,loading,()=>{

            dungeon.roomsByTomb = rooms.byTomb;
            if (CONST.DEBUG.showLogs)
                console.log(dungeon);

            // --- Prepare rooms

            dungeon.allGoldBudget = 0;

            dungeon.rooms.forEach((placedRoom,id)=>{
                let
                    room = placedRoom.room;

                if (room.hasGold) {
                    room.goldBudget = ROOM_GOLD_BUDGET_BASE + (ROOM_GOLD_BUDGET_DISTANCE*id);
                    dungeon.allGoldBudget += room.goldBudget;
                } else
                    room.goldBudget = 0;

                if (!room.tomb.isNoDifficulty) {
                    room.difficulty = roomDifficulty;
                    roomDifficulty += rooms.roomDifficulty;
                    if (room.difficulty > 0.999999)
                        room.difficulty = 1;
                } else
                    room.difficulty = 0;

                room.architectPrice = Math.ceil(room.goldBudget*0.75) || 20;

                room.needsKey = 0;
                room.random = new Random(random.integer(dungeonParameters.seedSize));
                room.id = id;
                room.doors = placedRoom.doorsData;
                room.x = placedRoom.x;
                room.y = placedRoom.y;
            });

            dungeon.goldBudget = dungeon.allGoldBudget;

            // --- Prepare keys and unlocks

            if (rooms.keysCount) {

                let
                    keysCount = rooms.keysCount,
                    keysSequence = [],
                    unlocks = [],
                    fromRoom = 1,
                    toRoom = dungeon.rooms.length-2,
                    roomsCount = toRoom-fromRoom,
                    roomId = 0;

                for (let i=0;i<KEYS_ALL;i++)
                    keysSequence.push(i+1);

                random.shuffle(keysSequence);

                for (let i=0;i<keysCount;i++)
                    unlocks.push({ key:i, rooms:1 });
                
                for (let i=keysCount;i<=roomsCount;i++)
                    random.element(unlocks).rooms++;

                unlocks.forEach(unlock=>{
                    for (let i=0;i<unlock.rooms;i++) {
                        let
                            room;

                        room = dungeon.rooms[fromRoom+roomId];

                        if (room) {

                            room = room.room;

                            if (unlock.key)
                                room.needsKey = keysSequence[unlock.key-1];
                            
                            if (unlock.rooms == 1)
                                room.unlock = { key:keysSequence[unlock.key] };
                            else
                                room.unlock = { key:keysSequence[unlock.key], partOf:unlock.rooms }

                            roomId++;

                        } else
                            console.warn("Missing room for key",i);

                    }
                });

                if (dungeon.rooms[fromRoom+roomId])
                    dungeon.rooms[fromRoom+roomId].room.needsKey = keysSequence[unlocks[unlocks.length-1].key];

            }

            // --- Dungeon skin

            let
                wallTexturesBag = {
                    elements:DUNGEON_WALLTEXTURES
                },
                floorCeilingTexturesBag = {
                    elements:DUNGEON_FLOORCEILINGTEXTURES
                },
                colorsBag = {
                    elements:DUNGEON_COLORS
                },
                color1 = random.bagPick(colorsBag),
                darkColor1 = "DARK"+color1,
                color2 = random.bagPick(colorsBag);

            dungeon.floorColor = CONST.COLORS[color2];
            dungeon.wallsColor = CONST.COLORS[color1];
            dungeon.ceilingColor = CONST.COLORS[darkColor1];

            dungeon.floorAccent = CONST.COLORS.DARKRED;
            dungeon.wallsAccent = CONST.COLORS.RED;
            dungeon.ceilingAccent = CONST.COLORS.DARKRED;

            dungeon.defaultDoorTexture = { image:"images/texture.png", imageX:0, imageY:2 };

            dungeon.defaultWallTexture = Tools.clone(random.bagPick(wallTexturesBag));
            dungeon.defaultWallTexture.backgroundColor = dungeon.wallsColor;

            dungeon.defaultWallAccentTexture = Tools.clone(dungeon.defaultWallTexture);
            dungeon.defaultWallAccentTexture.backgroundColor = dungeon.wallsAccent;

            dungeon.defaultCeilingTexture = Tools.clone(random.bagPick(floorCeilingTexturesBag));
            dungeon.defaultCeilingTexture.backgroundColor = dungeon.ceilingColor;

            dungeon.defaultCeilingAccentTexture = Tools.clone(dungeon.defaultCeilingTexture);
            dungeon.defaultCeilingAccentTexture.backgroundColor = dungeon.ceilingAccent;

            dungeon.defaultFloorTexture = Tools.clone(random.bagPick(floorCeilingTexturesBag));
            dungeon.defaultFloorTexture.backgroundColor = dungeon.floorColor;
            
            dungeon.defaultFloorAccentTexture = Tools.clone(dungeon.defaultCeilingTexture);
            dungeon.defaultFloorAccentTexture.backgroundColor = dungeon.floorAccent;
            
            dungeon.defaultWall = [
                dungeon.defaultWallTexture
            ];

            dungeon.defaultDoor = [
                dungeon.defaultWallTexture,
                dungeon.defaultDoorTexture
            ];

            dungeon.defaultCeiling = [
                dungeon.defaultCeilingTexture
            ];

            dungeon.defaultFloor = [
                dungeon.defaultFloorTexture
            ];

            // --- Paint default dungeon

            for (let y=0;y<mapSize;y++) {
                map[y]=[];
                for (let x=0;x<mapSize;x++) {
                    let
                        cell = (dungeon.map[y] && dungeon.map[y][x]) || 0;
                        
                    switch (cell) {
                        case 5: // Corridor wall
                        case 4:{ // Wall
                            map[y][x]={
                                x:x,
                                y:y,
                                width:1,
                                height:1,
                                mapSymbol:CONST.MAPSYMBOLS.WALL,
                                isProtected:true,
                                isWall:true,
                                isElementPaintable:false,
                                isFloorPaintable:true,
                                isCeilingPaintable:true,
                                isWallPaintable:[ true, true, true, true ],
                                isDirty:{ ceiling:[ 0 ], floor:[ 0 ], walls:[ 0, 0, 0, 0 ]},
                                walls:Tools.clone([
                                    dungeon.defaultWall,
                                    dungeon.defaultWall,
                                    dungeon.defaultWall,
                                    dungeon.defaultWall
                                ]),
                                ceiling:[ 0 ],
                                floor:[ 0 ],
                            };
                            break;
                        }
                        case 3:
                        case 1:{ // Floor
                            map[y][x]={
                                x:x,
                                y:y,
                                width:1,
                                height:1,
                                mapSymbol:CONST.MAPSYMBOLS.FLOOR,
                                isElementPaintable:true,
                                isFloorPaintable:true,
                                isCeilingPaintable:true,
                                isWallPaintable:[ true, true, true, true ],
                                isDirty:{ ceiling:[ 0 ], floor:[ 0 ], walls:[ 0, 0, 0, 0 ]},
                                walls:[ 0, 0, 0, 0],
                                ceiling:Tools.clone([ 
                                    dungeon.defaultCeiling
                                ]),
                                floor:Tools.clone([ 
                                    dungeon.defaultFloor
                                ])
                            };
                            break;
                        }
                    }
                }
            }

            dungeon.rooms.forEach(placedRoom=>{
                let
                    room = placedRoom.room,
                    doors = room.doors;

                for (let x=0;x<room.width;x++)
                    for (let y=0;y<room.height;y++) {
                        let
                            cell = map[y+room.y][x+room.x];
                        cell.room = room;
                    }

                doors.forEach(door=>{

                    map[door.exit.y][door.exit.x].isProtected = true;

                    if (!map[door.y][door.x]) {
                        let
                            highestRoom =  dungeon.rooms[Math.max(door.fromRoom, door.toRoom)].room,
                            needsKey = highestRoom.needsKey,
                            wall = Tools.clone(dungeon.defaultDoor);

                        if (needsKey) {
                            wall.push( { image:"images/texture.png", imageX:needsKey, imageY:2 })
                            if (!game.keyDoors[needsKey])
                                game.keyDoors[needsKey] = 0;
                            game.keyDoors[needsKey]++;
                        }

                        map[door.y][door.x]={
                            x:door.x,
                            y:door.y,
                            width:1,
                            height:1,
                            isWall:true,
                            isDoor:true,
                            isForcedUnpaintable:true,
                            isElementPaintable:false,
                            isFloorPaintable:false,
                            isCeilingPaintable:false,
                            isWallPaintable:false,
                            needsKey:needsKey,
                            mapSymbol:CONST.MAPSYMBOLS.DOOR,
                            isDirty:{ ceiling:[ 0 ], floor:[ 0 ], walls:[ 0, 0, 0, 0 ]},
                            walls:Tools.clone([
                                wall,
                                wall,
                                wall,
                                wall
                            ]),
                            ceiling:Tools.clone([ dungeon.defaultCeiling ]),
                            floor:Tools.clone([ dungeon.defaultFloor ])
                        };
                    }
                })
                    
            })

            // --- Initialize

            game.menu = menu;
            game.items = items;
            game.dungeon = dungeon;
            game.map = map;
            game.audio = audio;
            game.player = new Player(game);
            game.tools = new Tools(game);
            game.movement = new Movement(game);
            game.events = new Events(game);
            game.inventory=new Inventory(game);
            game.dialogue=new Dialogue(game);
            game.locks=new Locks(game);
            game.ui = new UI(game);
            
            // --- Render rooms

            dungeon.roomsByTomb.forEach(set=>{

                // Sort them by distance
                set.sort((a,b)=>{
                    if (a.id > b.id) return 1;
                    else if (a.id < b.id) return -1;
                    else return 0;
                })

                set[0].tomb.renderRooms(game, set);

                if (CONST.DEBUG.setSolved)
                    set.forEach(room=>{
                        room.isSolved = true;
                    })
            });

            // --- Music

            game.music = random.element(dungeonParameters.musics);

            // --- Add decorations

            let
                wallDecorationsBag={
                    elements:DUNGEON_WALLDECORATIONS
                },
                floorDecorationsBag={
                    elements:DUNGEON_FLOORDECORATIONS
                },
                ceilingDecorationsBag={
                    elements:DUNGEON_CEILINGDECORATIONS
                },
                elementDecorationsBag={
                    elements:DUNGEON_ELEMENTDECORATIONS
                },
                wallDecorations=[],
                floorDecorations=[],
                ceilingDecorations=[],
                elementDecorations=[],
                extraInteractiveWalls={};

            for (let i=0;i<5;i++) {
                wallDecorations.push(random.bagPick(wallDecorationsBag));
            }

            for (let i=0;i<2;i++) {
                floorDecorations.push(random.bagPick(floorDecorationsBag));
                ceilingDecorations.push(random.bagPick(ceilingDecorationsBag));
                elementDecorations.push(random.bagPick(elementDecorationsBag));
            }

            function decorationToTexture(decoration) {
                let
                    texture = Tools.clone(decoration.texture);
                if (decoration.randomX)
                    texture.dx = (texture.dx || 0) + random.integer(21)-10;
                if (decoration.randomY)
                    texture.dy = (texture.dy || 0) + random.integer(21)-10;
                return texture;
            }

            dungeon.walkableCells = 0;

            for (let y=0;y<mapSize;y++) {
                for (let x=0;x<mapSize;x++) {
                    let
                        cell = (map[y] && map[y][x]) || 0;
                
                    if (cell) {

                        if (!cell.isWall)
                            dungeon.walkableCells++;

                        if (!cell.isForcedUnpaintable)
                            if (CONST.DEBUG.decorations) {
                                if (cell.isFloorPaintable && cell.floor[0])
                                    cell.floor[0] = [ {backgroundColor:"#333" } ];
                                if (cell.isCeilingPaintable && cell.ceiling[0])
                                    cell.ceiling[0] = [ {backgroundColor:"#333" } ];
                                if (cell.isElementPaintable) {
                                    cell.mapSymbol = "x";
                                    cell.mapSymbolBgColor = "#f00";
                                }
                                for (let i=0;i<4;i++) {
                                    if (cell.isWallPaintable && cell.isWallPaintable[i] && cell.walls[i]) {
                                        let
                                            direction = CONST.DIRECTIONS[i],
                                            dx = x+direction.x,
                                            dy = y+direction.y,
                                            facingCell = map[dy] && map[dy][dx],
                                            facingItem = game.tools.getElementsAt(dx, dy).list.length;
                                        if (facingCell && !facingCell.isWall)
                                            if (cell.isWall && !cell._events && facingCell.room && !facingItem)
                                                cell.walls[i]= [ {backgroundColor:"#F33" } ];
                                            else
                                                cell.walls[i]= [ {backgroundColor:"#333" } ];
                                    }
                                }
                            } else {
                                if (cell.isCeilingPaintable && cell.ceiling[0] && random.integer(10)<3)
                                    cell.ceiling[0].push(
                                        decorationToTexture(
                                            random.element(ceilingDecorations)
                                        )
                                    );
                                if (cell.isFloorPaintable && cell.floor[0] && random.integer(10)<4)
                                    cell.floor[0].push(
                                        decorationToTexture(
                                            random.element(floorDecorations)
                                        )
                                    );
                                if (cell.isElementPaintable && random.integer(10)<2)
                                    game.tools.addElement(x,y, {
                                        sprite:[
                                            decorationToTexture(
                                                random.element(elementDecorations)
                                            )
                                        ]
                                    }, true);
                                for (let i=0;i<4;i++) {
                                    if ((CONST.DEBUG.forceHints || (cell.isWallPaintable && cell.isWallPaintable[i])) && cell.walls[i]) {
                                        let
                                            direction = CONST.DIRECTIONS[i],
                                            dx = x+direction.x,
                                            dy = y+direction.y,
                                            facingCell = map[dy] && map[dy][dx],
                                            facingItem = game.tools.getElementsAt(dx, dy).list.length;
                                        if (facingCell && !facingCell.isWall)
                                            if (random.integer(10)<5)
                                                cell.walls[i].push(
                                                    decorationToTexture(
                                                        random.element(wallDecorations)
                                                    )
                                                );
                                            else if (cell.isWall && !cell._events && facingCell.room && !facingItem) {
                                                let
                                                    roundedDifficulty = Math.floor(facingCell.room.difficulty*10)/10;
                                                if (!extraInteractiveWalls[roundedDifficulty])
                                                    extraInteractiveWalls[roundedDifficulty] = { room:facingCell.room, difficulty:roundedDifficulty, elements:[] };
                                                extraInteractiveWalls[roundedDifficulty].elements.push({ position:cell, side:i });
                                            }
                                    }
                                }
                            }
                    }

                }
            }

            // --- Add dungeon extras

            if (dungeonParameters.bits)
                BITS.add(game, random, extraInteractiveWalls, dungeonParameters.bits);

            // --- Intro script

            game.introScript = dungeonParameters.introScript;

            // --- Run

            game.player.initialize();

            if (!isDebug) {

                game.dialogue.initialize();
                game.inventory.initialize();
                game.movement.initialize();
                game.ui.initialize();

                if (CONST.DEBUG.debugItem) {
                    let
                        item = game.tools.addInventoryItem(0, {
                            isKey:true,
                            id: "DEBUG-KEY",
                            group:CONST.GROUP.KEY,
                            color:CONST.ITEMCOLOR.KEY,
                            model:"key",
                            counter:"DBG"
                        });
                    game.tools.onUse(item,[
                        {
                            dialogueSay:[
                                {
                                    text:"Select:",
                                    options:[
                                        {
                                            id:"action",
                                            value:"kill",
                                            label:"Kill"
                                        },{
                                            id:"action",
                                            value:"win",
                                            label:"Win"
                                        },{
                                            id:"action",
                                            value:false,
                                            label:"Nothing"
                                        }
                                    ]
                                }
                            ]
                        },{
                            if:{
                                asContext:"answers",
                                is:{ action:"kill" }
                            },
                            hitPlayer:1000
                        },{
                            if:{
                                asContext:"answers",
                                is:{ action:"win" }
                            },
                            endRun:true
                        }
                    ]);

                }

                // --- Start music
                if (game.music)
                    audio.mixerPlayMusic(audio.audio[game.music]);

            }

            done(game);
        });

    }

    function play(menu, audio, loading, done) {
        return generate(menu, audio, loading, done, PROGRESS, LOADER)
    }

    function quitGame(game, done) {
        game.movement.quit();
        game.dialogue.quit();
        game.inventory.quit();
        game.ui.quit();
        game.audio.stopAllAudio();
        game.audio.mixerStopMusic();
        done();
    }

    return {

        RESOURCES:DEFAULT_RESOURCES,
        debugGenerate:(menu, audio, loading, done, progress, loader)=>{
            return generate(menu, audio, loading, done, progress, loader, true);
        },
        onLoad:()=>{

            // Load flags

            let
                hash = window.location.hash,
                isDebug = false,
                debugMode = hash.split(":")[0];

            switch (debugMode) {
                case "#DEBUG":{
                    hash = hash.substr(debugMode.length+1);
                    break;
                }
                case "#DEV":{
                    CONST.DEBUG.openDoors = true;
                    CONST.DEBUG.noMoney = true;
                    CONST.DEBUG.showMap = true;
                    CONST.DEBUG.quickStart = true;
                    CONST.DEBUG.showDecorations = true;
                    CONST.DEBUG.debugPlaque = true;
                    CONST.DEBUG.hintsOnSameRoom = true;
                    CONST.DEBUG.showLogs = true;
                    CONST.DEBUG.debugItem = true;
                    hash = hash.substr(debugMode.length+1);                    
                    break;
                }
                default:{
                    hash = 0;
                }
            }
                
            if (hash) {
                console.warn("DEBUG mode",debugMode);
                hash.split(",").forEach(flag=>{
                    let
                        set = flag.split("="),
                        value;

                    if (CONST.DEBUG[set[0]] !== undefined) {

                        if ((set[1] == "true") || !set[1])
                            value = true;
                        else if (set[1] == "false")
                            value = false;
                        else if (parseFloat(set[1]) == set[1])
                            value = parseFloat(set[1]);
                        else
                            value = set[1]; 

                        CONST.DEBUG[set[0]] = value;
                        console.warn("DEBUG flag:",set[0],"=",value);

                    }

                });
            }

            // Initialize

            PROGRESS.initialize(audio);
            DEVICE.initialize();

            audio = new AudioPlayer({
                resourcesPrefix:"",
                enabled:true,
                effectsEnabled:PROGRESS.save.settingsAudioEffectsEnabled,
                musicEnabled:PROGRESS.save.settingsAudioMusicEnabled,
                volume:PROGRESS.save.settingsAudioEffectsVolume,
                musicVolume:PROGRESS.save.settingsAudioMusicVolume
            });

            PROGRESS.setAudio(audio);
            LOADER.initialize(audio);
        
            let
                menu = new Menu(document.body, audio, {
                    load:(loading, done)=>{
                        let
                            resources = Tools.clone(CORE.RESOURCES);
                        TOMBS.addTombFileResources(resources);
                        LOADER.load(resources, loading, done);
                    },
                    initializeGame:(loading, done)=>{
                        play(menu, audio, loading, done);
                    },
                    startGame:(game)=>{
                        if (game.introScript)
                            game.events.runScript(0,game.introScript);
                    },
                    quitGame:(game, done)=>{
                        quitGame(game, done);
                    },
                    startGameBreak:(game, done)=>{
                        game.movement.quit();
                        game.inventory.quit();
                        game.audio.stopAllAudio();
                        game.audio.mixerStopMusic();
                        game.ui.quit();
                        game.dialogue.startGameBreak();
                        done(game);
                    },
                    resetFixedGame:(game, done)=>{
                        game.dialogue.quit();
                        game.audio.stopAllAudio();
                        game.audio.mixerStopMusic();
                        done(game);
                    },
                    resetGame:(game, done)=>{
                        game.movement.quit();
                        game.inventory.quit();
                        game.dialogue.quit();
                        game.audio.stopAllAudio();
                        game.audio.mixerStopMusic();
                        game.ui.quit();
                        done(game);
                    }
                });
        
            menu.initialize();
        }
    }

}());
