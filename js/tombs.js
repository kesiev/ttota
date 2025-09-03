let TOMBS = (function(){
    
    const
        TAGS = {
            default:{
                // RESERVED: The default tomb (i.e., common corridors) must have this tag
            },
            debug:{
                // RESERVED: The debug tomb (empty rooms)
            },
            run:{
                // RESERVED: The entrance/exit rooms tomb must have this tag
            },
            tomb:{
                // RESERVED: All game tombs must have this tag
            },
            "story-entrance":{
                // RESERVED: Intro, entrance floor
            },
            "story-day1":{
                // RESERVED: Intro, first floor
            },
            "story-epilogue":{
                // RESERVED: Epilogue
            },
            story:{
                isStory:true,
                isKey:true,
                adjectives:[ "Reading", "Written", "Narrative", "Revealing", "Telling", "Speaking", "Unveiling", "Knowing", "Echoing" ],
                nouns:[ "Pages", "Book", "Story", "Tale", "Chronicle", "Legend", "Script", "Saga", "Myth" ],
                places:[ "Library", "Archive", "Repository", "Vault", "Registry", "Cabinet" ]
            },
            luck:{
                isKey:true,
                isFillBucket:true,
                adjectives:[ "Lucky", "Bidding", "Hazarding", "Chancing", "Casting", "Wagering", "Risking", "Dealing" ],
                nouns:[ "Gamble", "Bid", "Hazard", "Change", "Chance", "Wager", "Fortune", "Stake" ],
                places:[ "Casino", "Palace", "Parlor", "Club", "House" ]
            },
            quiz:{
                isKey:true,
                isFillBucket:true,
                adjectives:[ "Quizzing", "Testing", "Checking", "Proving", "Examining", "Reviewing", "Assessing", "Judging", "Measuring", "Inspecting", "Appraising", "Scrutinizing", "Validating", "Evaluating" ],
                nouns:[ "Question", "Test", "Check", "Examination", "Judgment" ],
                places:[ "Classroom", "Exam", "Test", "Seminar", "Review" ]
            },
            logic:{
                isKey:true,
                isFillBucket:true,
                adjectives:[ "Puzzling", "Enigmatic", "Perplexing", "Confusing", "Bewildering", "Mysterious", "Cryptic", "Ambiguous", "Elusive", "Paradoxical" ],
                nouns:[ "Puzzle", "Enigma", "Confusion", "Dilemma", "Obscurity"," Complexity" ],
                places:[ "Puzzle", "Joint", "Maze", "Riddle", "Enigma", "Knot", "Tangle" ]
            },
            arcade:{
                isKey:true,
                isFillBucket:true,
                adjectives:[ "Reacting", "Triggering", "Speedy", "Quick", "Prompting", "Snapping", "Darting", "Instant", "Immediate" ],
                nouns:[ "Reaction", "Trigger", "Speed", "Reflex", "Prompt", "Flash", "Dash", "Snap", "Impulse", "Agility" ],
                places:[ "Arcade", "Funhouse" ]
            },
            memory:{
                isKey:true,
                isFillBucket:true,
                adjectives:[ "Remembering", "Meditating", "Recalling", "Reminding", "Recollecting", "Reflecting", "Contemplating", "Pondering", "Ruminating", "Memorizing", "Observing" ],
                nouns:[ "Memory", "Remembrance", "Recollection", "Recall", "Reflection", "Retrospect", "Memorization", "Reminding", "Reminiscence" ],
                places:[ "Mind Palace", "Forgotten Place", "Memorium" ]
            },
            special:{
                isKey:true,
                isFillBucket:true,
                adjectives:[ "Unusual", "Atypical", "Peculiar", "Weird", "Bizzarre", "Strange", "Odd", "Curious", "Eccentric", "Quirky", "Uncommon" ],
                nouns:[ "Strange", "Bizzarre", "Weird", "Odd", "Curious", "Eccentric", "Peculiar", "Quirky", "Exceptional" ],
                places:[ "Trick", "Trap" ]
            }
        },
        ITERATIONS_LIMIT = 1000;

    let
        tombs = [],
        tombFiles = [],
        credits;

    function addPersonToCredits(list,persons,line,license) {
        
        persons.forEach(person=>{

            if (!list.elements[person])
                list.elements[person] = [];

            if (!list.index[line]) {
                list.index[line] = true;
                list.elements[person].push({ line:line, license:license });
            }
  
        })
    }

    function addResourcesToCredits(resources, credits) {
        resources.forEach(resource=>{
            let
                added = true;
            switch (resource.type) {
                case "audio":{
                    if (resource.title && resource.by) {
                        if (resource.isSong)
                            addPersonToCredits(credits.music, resource.by,resource.title,resource.license);
                        else
                            addPersonToCredits(credits.sounds, resource.by,resource.title,resource.license);
                    } else
                        added = false;
                    break;
                }
                case "image":{
                    if (resource.by)
                        addPersonToCredits(credits.graphics, resource.by,resource.title,resource.license);
                    else
                        added = false;
                    break;
                }
                case "data":{
                    if (resource.by)
                        addPersonToCredits(credits.data, resource.by,resource.title,resource.license);
                    else
                        added = false;
                    break;
                }
            }

            if (!added)
                console.warn("Resource", resource, "have no credits!");
        })
    }

    function matchTags(from,list) {
        for (let i=0;i<list.length;i++)
            if (from.indexOf(list[i]) == -1)
                return false;
        return true;
    }

    return {
        TAGS:TAGS,
        initialize:function() {

            credits = {
                code:{ index:{}, elements:[] },
                music: { index:{}, elements:[] },
                sounds: { index:{}, elements:[] },
                data: { index:{}, elements:[] },
                graphics: { index:{}, elements:[] },
                architects:{ index:{}, elements:[] }
            };

            metadata = {};

            addResourcesToCredits(CORE.RESOURCES, credits);
            tombs.forEach(tomb=>{
                if (tomb.resources)
                    addResourcesToCredits(tomb.resources,credits);
                
                if (tomb.codeBy)
                    addPersonToCredits(credits.code, tomb.codeBy, true);
                else
                    console.warn("Tomb", tomb, "have no codeBy!");

                if (tomb.byArchitect)
                    addPersonToCredits(credits.architects, [ tomb.byArchitect ], true);
                else
                    console.warn("Tomb", tomb, "have no Architect!");

                tomb.tags.forEach(tag=>{
                    if (!TAGS[tag])
                        console.warn("Tomb",tomb,"has unsupported tag",tag);
                })

                metadata[tomb.id] = {
                    id:tomb.id,
                    tags:tomb.tags,
                    name:tomb.name,
                    description:tomb.description,
                    byArchitect:tomb.byArchitect,
                    codeBy:tomb.codeBy,
                    resources:tomb.resources,
                    minRooms:tomb.minRooms
                };
            })


            for (let k in credits) {
                let
                    sorted = [];

                for (let j in credits[k].elements)
                    sorted.push({ key:j.toUpperCase(), person:j, line:credits[k].elements[j] });

                sorted.sort((a,b)=>{
                    if (a.key>b.key) return 1;
                    else if (a.key<b.key) return -1;
                    else return 0;
                })

                credits[k] = sorted;
            }

            this.credits = credits;
            this.METADATA = metadata;

        },
        pickRooms:(game, keysCount, roomsCount, tags)=>{

            let
                iteration = 1,
                difficultyRooms = 0,
                roomsReady = 0,
                maxRooms = 0,
                selectedTombs = [],
                out = {
                    keysCount:keysCount,
                    byTomb:[],
                    all:[],
                    resources:[],
                    tagsCount:{},
                    tagsByCount:[]
                };

            // Pick tombs

            tags.forEach(strategy=>{
                switch (strategy.type) {
                    case "debug":{
                        tombs.forEach((tomb)=>{
                           if (tomb.id == strategy.id) {
                                if (tomb.isNoDifficulty) {
                                    selectedTombs.push(tomb);
                                    roomsCount = tomb.minRooms;
                                    out.keysCount = tomb.minRooms;
                                } else {
                                    let
                                        rooms = 0;
                                    while (rooms < roomsCount) {
                                        selectedTombs.push(tomb);
                                        rooms+=tomb.minRooms;
                                    }
                                }
                            }
                        });
                        break;
                    }
                    case "pickAll":{
                        tombs.forEach((tomb)=>{
                            if (matchTags(strategy.tags, tomb.tags))
                                selectedTombs.push(tomb);
                        });
                        break;
                    }
                    case "rotate":{
                        let
                            subset = tombs.filter(tomb=>matchTags(strategy.tags, tomb.tags));
                        if (subset.length) {
                            let
                                tomb = subset[strategy.counter % subset.length];
                            selectedTombs.push(tomb);
                        }
                        break;
                    }
                    case "fill":{
                        let
                            bucketList = [],
                            buckets = {},
                            left = {},
                            togo = strategy.amount;
                        tombs.forEach(tomb=>{
                            if (matchTags(tomb.tags, strategy.tags)) // Inverted check, uses tag buckets
                                for (let i=0;i<strategy.buckets.length;i++) {
                                    let
                                        tag = strategy.buckets[i];
                                    if (tomb.tags.indexOf(tag) != -1) {
                                        if (!buckets[tag]) {
                                            buckets[tag] = { elements:[] };
                                            bucketList.push(tag);
                                            left[tag] = strategy.maxPerTag;
                                        }
                                        buckets[tag].elements.push(tomb);
                                        break;
                                    }
                                }
                        });
                        while (togo && bucketList.length) {
                            let
                                bucketIndex = game.random.elementIndex(bucketList),
                                bucket = bucketList[bucketIndex],
                                tomb = game.random.bagPick(buckets[bucket]);

                            selectedTombs.push(tomb);
                            left[bucket]--;
                            togo--;

                            if (!left[bucket])
                                bucketList.splice(bucketIndex,1);
                        }
                        break;
                    }
                }
            });

            selectedTombs = selectedTombs.map(tomb=>{
                roomsReady+=tomb.minRooms;
                maxRooms+=tomb.maxRooms;
                return { tomb:tomb, rooms:tomb.minRooms, iteration:0 };
            })

            // Add rooms

            while ((roomsReady<roomsCount) && (iteration < ITERATIONS_LIMIT)) {
                let
                    availableTombs = selectedTombs.filter(tomb=>(tomb.iteration<iteration) && (tomb.rooms<tomb.tomb.maxRooms) );

                if (availableTombs.length) {
                    let
                        tomb = game.random.element(availableTombs);
                    tomb.rooms++;
                    tomb.iteration = iteration;
                    roomsReady++;
                } else
                    iteration++;   
            };

            // Generate rooms

            selectedTombs.forEach(tomb=>{
                let
                    rooms = tomb.tomb.generateRooms(game, tomb.rooms);

                tomb.tomb.tags.forEach(tag=>{
                    if (TAGS[tag].isKey)
                        if (!out.tagsCount[tag])
                            out.tagsCount[tag] = 1;
                        else
                            out.tagsCount[tag]++;
                })

                rooms.forEach(room=>{
                    room.tomb = tomb.tomb;
                    out.all.push(room);
                })

                if (!tomb.tomb.isNoDifficulty)
                    difficultyRooms+=rooms.length;

                out.byTomb.push(rooms);

                if (tomb.tomb.resources)
                    tomb.tomb.resources.forEach(resource=>{
                        out.resources.push(resource);
                    })
            })

            // Generate tags stats

            for (let k in out.tagsCount)
                out.tagsByCount.push({ name:k, count:out.tagsCount[k] });

            out.tagsByCount.sort((a,b)=>{
                if (a.count > b.count) return -1;
                else if (a.count < b.count) return 1;
                else return 0;
            })

            // Calculate room difficulty step

            if (difficultyRooms == 0)
                out.roomDifficulty = 0;
            else if (difficultyRooms == 1)
                out.roomDifficulty = 1;
            else
                out.roomDifficulty = 1/(difficultyRooms-1);

            return out;
        },
        addTombFileResources:function(list) {
            tombFiles.forEach(file=>{
                list.push({ type:"js", file:file });
            })
            return list;
        },
        addTomb:function(tomb) {
            tombs.push(tomb);
        },
        addTombFiles:function(list) {
            list.forEach(item=>{
                tombFiles.push(item);
            })
        }
    };

})();