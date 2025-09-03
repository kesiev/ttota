let ELEMENTS = (function() {

    const
        ANIMATION_BLINK = [ 0, { dx:-101 }, 0, { dx:-101 }, 0, { dx:-101 } ]

    return {
        models:{
            default:[
                {
                    key:"image"
                }
            ],
            floorItem:[
                {
                    key:"size"
                },{
                    key:"image"
                }
            ],
            ball:[
                {
                    key:"size"
                },{
                    key:"ball",
                    animation:ANIMATION_BLINK
                }
            ]
        },
        layers:{
            size:{
                default:[ { image:"images/npc.png", imageX:1, imageY:0 } ],
                large:[ { image:"images/npc.png", imageX:2, imageY:0 } ],
                small:[ { image:"images/npc.png", imageX:3, imageY:0 } ],
                brightDefault:[ { image:"images/npc.png", imageX:4, imageY:0 } ],
                brightLarge:[ { image:"images/npc.png", imageX:5, imageY:0 } ],
                brightSmall:[ { image:"images/npc.png", imageX:6, imageY:0 } ],
            },
            image:{
                lamp:[ { image:"images/elements.png", imageX:0, imageY:0 } ],
                bag:[ { image:"images/elements.png", imageX:1, imageY:1 } ],
                keyPart:[ { image:"images/elements.png", imageX:2, imageY:1 } ],
                stairs:[ { image:"images/elements.png", imageX:1, imageY:0 } ],
                topStairs:[ { image:"images/elements.png", imageX:2, imageY:0 } ],
                bookStand:[ { image:"images/elements.png", imageX:3, imageY:0 } ],
                statueArchitect:[ { image:"images/elements.png", imageX:3, imageY:1 } ],
                healingPotion:[ { image:"images/elements.png", imageX:0, imageY:2 } ],
                poisonPotion:[ { image:"images/elements.png", imageX:1, imageY:2 } ],
            },
            ball:{
                energy:[ { image:"images/elements.png", imageX:2, imageY:2 } ]
            }
        }
    }

})();