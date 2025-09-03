let NPC = (function() {

    const
        ANIMATION_BODY = [ 0, 0, 0, { dy:-1}, { dy:-1}, { dy:-1} ],
        ANIMATION_HEAD = [ 0, 0, { dy:-1}, { dy:-1}, { dy:-1}, 0, 0 ];

    return {
        models:{
            default:[
                {
                    key:"shadow"
                },{
                    key:"bottomDress",
                    animation:ANIMATION_BODY
                },{
                    key:"shoes"
                },{
                    key:"topDress",
                    animation:ANIMATION_BODY
                },{
                    key:"head",
                    animation:ANIMATION_HEAD
                },{
                    key:"eyes",
                    animation:ANIMATION_HEAD
                },{
                    key:"mustaches",
                    animation:ANIMATION_HEAD
                },{
                    key:"goatee",
                    animation:ANIMATION_HEAD
                },{
                    key:"mouth",
                    animation:ANIMATION_HEAD
                },{
                    key:"nose",
                    animation:ANIMATION_HEAD
                },{
                    key:"hair",
                    animation:ANIMATION_HEAD
                },{
                    key:"hands",
                    animation:ANIMATION_HEAD
                },{
                    key:"special",
                    animation:ANIMATION_HEAD
                }
            ],
            planted:[
                {
                    key:"shadow"
                },{
                    key:"bottomDress"
                },{
                    key:"shoes"
                },{
                    key:"topDress",
                    animation:ANIMATION_BODY
                },{
                    key:"head",
                    animation:ANIMATION_HEAD
                },{
                    key:"eyes",
                    animation:ANIMATION_HEAD
                },{
                    key:"mustaches",
                    animation:ANIMATION_HEAD
                },{
                    key:"goatee",
                    animation:ANIMATION_HEAD
                },{
                    key:"mouth",
                    animation:ANIMATION_HEAD
                },{
                    key:"nose",
                    animation:ANIMATION_HEAD
                },{
                    key:"hair",
                    animation:ANIMATION_HEAD
                },{
                    key:"hands",
                    animation:ANIMATION_HEAD
                }
            ],
            object:[
                {
                    key:"shadow"
                },{
                    key:"object"
                }
            ],
            chest:[
                {
                    key:"shadow"
                },{
                    key:"chest"
                }
            ]
        },
        layers:{
            shadow:{
                default:[ { image:"images/npc.png", imageX:1, imageY:0 } ],
                large:[ { image:"images/npc.png", imageX:2, imageY:0 } ],
            },
            topDress:{
                shirt:[ { image:"images/npc.png", imageX:0, imageY:6 } ],
                monk:[ { image:"images/npc.png", imageX:1, imageY:6 } ],
                armor:[ { image:"images/npc.png", imageX:2, imageY:6 } ],
                fancy:[ { image:"images/npc.png", imageX:3, imageY:6 } ],
                farmer:[ { image:"images/npc.png", imageX:4, imageY:6 } ],
                tshirt:[ { image:"images/npc.png", imageX:5, imageY:6 } ],
                darkitect:[ { image:"images/npc.png", imageX:6, imageY:6 } ],
            },
            bottomDress:{
                pants:[ { image:"images/npc.png", imageX:0, imageY:8 } ],
                // shortCoat:[ { image:"images/npc.png", imageX:1, imageY:8 } ], // Free pants slot!
                darkPants:[ { image:"images/npc.png", imageX:2, imageY:8 } ],
                equipmentPants:[ { image:"images/npc.png", imageX:3, imageY:8 } ],
                scarecrow:[ { image:"images/npc.png", imageX:4, imageY:8 } ],
            },
            shoes:{
                boots:[ { image:"images/npc.png", imageX:0, imageY:9 } ],
                sandals:[ { image:"images/npc.png", imageX:1, imageY:9 } ],
                greaves:[ { image:"images/npc.png", imageX:2, imageY:9 } ],
                shoes:[ { image:"images/npc.png", imageX:3, imageY:9 } ],
                scarecrow:[ { image:"images/npc.png", imageX:4, imageY:9 } ],
            },
            hands:{
                default:[ { image:"images/npc.png", imageX:0, imageY:7 } ],
                gloves:[ { image:"images/npc.png", imageX:1, imageY:7 } ],
                pike:[ { image:"images/npc.png", imageX:2, imageY:7 } ],
            },
            head:{
                default:[ { image:"images/npc.png", imageX:0, imageY:2 } ],
                nobody:[ { image:"images/npc.png", imageX:1, imageY:2 } ],
                scarecrow:[ { image:"images/npc.png", imageX:2, imageY:2 } ],
                darkitect:[ { image:"images/npc.png", imageX:3, imageY:2 } ],
            },
            eyes:{
                default:[ { image:"images/npc.png", imageX:0, imageY:3 } ],
                glasses:[  { image:"images/npc.png", imageX:1, imageY:3 } ],
                helmet:[  { image:"images/npc.png", imageX:2, imageY:3 } ],
                sad:[  { image:"images/npc.png", imageX:3, imageY:3 } ],
                girlyGlasses:[  { image:"images/npc.png", imageX:4, imageY:3 } ],
                rings:[  { image:"images/npc.png", imageX:5, imageY:3 } ],
                shady:[  { image:"images/npc.png", imageX:6, imageY:3 } ],
                surprised:[  { image:"images/npc.png", imageX:7, imageY:3 } ],
                thinking:[  { image:"images/npc.png", imageX:8, imageY:3 } ],
                blue:[  { image:"images/npc.png", imageX:9, imageY:3 } ],
            },
            mouth:{
                default:[ { image:"images/npc.png", imageX:0, imageY:5 } ],
                relaxed:[ { image:"images/npc.png", imageX:1, imageY:5 } ],
                sad:[ { image:"images/npc.png", imageX:2, imageY:5 } ],
                wrinkles:[ { image:"images/npc.png", imageX:3, imageY:5 } ],
            },
            mustaches:{
                short:[ { image:"images/npc.png", imageX:0, imageY:10 } ],
                curvy:[ { image:"images/npc.png", imageX:1, imageY:10 } ],
                longBeard:[ { image:"images/npc.png", imageX:2, imageY:10 } ],
                wrinkles:[ { image:"images/npc.png", imageX:3, imageY:10 } ],
            },
            nose:{
                default:[ { image:"images/npc.png", imageX:0, imageY:4 } ],
                small:[ { image:"images/npc.png", imageX:1, imageY:4 } ],
                big:[ { image:"images/npc.png", imageX:2, imageY:4 } ],
                pointy:[ { image:"images/npc.png", imageX:3, imageY:4 } ],
                wide:[ { image:"images/npc.png", imageX:4, imageY:4 } ],
            },
            goatee:{
                wide:[ { image:"images/npc.png", imageX:0, imageY:11 } ],
                long:[ { image:"images/npc.png", imageX:1, imageY:11 } ],
                shaved:[ { image:"images/npc.png", imageX:2, imageY:11 } ],
                longPointy:[ { image:"images/npc.png", imageX:3, imageY:11 } ],
                shavedGood:[ { image:"images/npc.png", imageX:4, imageY:11 } ],
            },
            hair:{
                bob:[ { image:"images/npc.png", imageX:0, imageY:1 } ],
                shortTail:[ { image:"images/npc.png", imageX:1, imageY:1 } ],
                shortMessy:[ { image:"images/npc.png", imageX:2, imageY:1 } ],
                hat:[ { image:"images/npc.png", imageX:3, imageY:1 } ],
                tuft:[ { image:"images/npc.png", imageX:4, imageY:1 } ],
                tuftLong:[ { image:"images/npc.png", imageX:5, imageY:1 } ],
                pulledLong:[ { image:"images/npc.png", imageX:6, imageY:1 } ],
                shortWave:[ { image:"images/npc.png", imageX:7, imageY:1 } ],
                sides:[ { image:"images/npc.png", imageX:8, imageY:1 } ],
                buzz:[ { image:"images/npc.png", imageX:9, imageY:1 } ],
            },
            special:{
                luck:[ { image:"images/npc.png", imageX:2, imageY:12 } ],
                quiz:[ { image:"images/npc.png", imageX:3, imageY:12 } ],
                logic:[ { image:"images/npc.png", imageX:4, imageY:12 } ],
                arcade:[ { image:"images/npc.png", imageX:5, imageY:12 } ],
                memory:[ { image:"images/npc.png", imageX:6, imageY:12 } ],
                special:[ { image:"images/npc.png", imageX:7, imageY:12 } ],
            },
            chest:{
                closed:[ { image:"images/npc.png", imageX:0, imageY:12 } ],
                open:[ { image:"images/npc.png", imageX:1, imageY:12 } ]
            }
        }
    }

})();