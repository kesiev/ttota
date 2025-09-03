let ITEMS = (function() {

    let
        CHARACTERS = {};

    for (let k in CONST.ITEMS.FONT)
        CHARACTERS[k] = [ CONST.ITEMS.FONT[k] ];

    return {
        models:{
            default:[
                {
                    key:"image"
                },{
                    key:"character"
                }
            ],
            sword:[
                {
                    key:"grip"
                },{
                    key:"blade"
                },{
                    key:"quard"
                },{
                    key:"character"
                }
            ],
            shield:[
                {
                    key:"shape"
                },{
                    key:"character"
                }
            ],
            key:[
                {
                    key:"body"
                },{
                    key:"shape"
                },{
                    key:"character"
                }
            ]
        },
        layers:{
            sword:{
                grip:{
                    default:[ { image:"images/items.png", imageX:0, imageY:0 } ]
                },
                quard:{
                    default:[ { image:"images/items.png", imageX:0, imageY:1 } ]
                },
                blade:{
                    default:[ { image:"images/items.png", imageX:0, imageY:2 } ]
                },
                character:CHARACTERS
            },
            shield:{
                shape:{
                    default:[ { image:"images/items.png", imageX:0, imageY:3 } ]
                },
                character:CHARACTERS
            },
            key:{
                body:{
                    default:[ { image:"images/items.png", imageX:0, imageY:4 } ]
                },
                shape:{
                    "1":[ { image:"images/items.png", imageX:1, imageY:4 } ],
                    "2":[ { image:"images/items.png", imageX:2, imageY:4 } ],
                    "3":[ { image:"images/items.png", imageX:3, imageY:4 } ],
                    "4":[ { image:"images/items.png", imageX:4, imageY:4 } ],
                    "5":[ { image:"images/items.png", imageX:5, imageY:4 } ],
                    "6":[ { image:"images/items.png", imageX:6, imageY:4 } ],
                },
                character:CHARACTERS
            },
            default:{
                image:{
                    brokenKey:[ { image:"images/items.png", imageX:0, imageY:5 } ],
                    push:[ { image:"images/items.png", imageX:1, imageY:5 } ],
                    heart:[ { image:"images/items.png", imageX:2, imageY:5 } ],
                    gold:[ { image:"images/items.png", imageX:3, imageY:5 } ],
                    shovel:[ { image:"images/items.png", imageX:4, imageY:5 } ],
                    book:[ { image:"images/items.png", imageX:5, imageY:5 } ],
                    rod:[ { image:"images/items.png", imageX:6, imageY:5 } ],
                    addCard:[ { image:"images/items.png", imageX:7, imageY:5 } ],
                    dig:[ { image:"images/items.png", imageX:8, imageY:5 } ],
                    build:[ { image:"images/items.png", imageX:9, imageY:5 } ],
                    pot:[ { image:"images/items.png", imageX:0, imageY:6 } ],
                    brokenShovel:[ { image:"images/items.png", imageX:1, imageY:6 } ],
                    trueDagger:[ { image:"images/items.png", imageX:2, imageY:6 } ],
                    debugPotion:[ { image:"images/items.png", imageX:3, imageY:6 } ],
                    stopwatch:[ { image:"images/items.png", imageX:4, imageY:6 } ],
                    wateringCan:[ { image:"images/items.png", imageX:5, imageY:6 } ],
                    fertilizer:[ { image:"images/items.png", imageX:6, imageY:6 } ],
                    shears:[ { image:"images/items.png", imageX:7, imageY:6 } ],
                    flag:[ { image:"images/items.png", imageX:8, imageY:6 } ],
                    refresh:[ { image:"images/items.png", imageX:9, imageY:6 } ],
                    stop:[ { image:"images/items.png", imageX:0, imageY:7 } ],
                    lifesaver:[ { image:"images/items.png", imageX:1, imageY:7 } ],
                },
                character:CHARACTERS
            }
        }
    }

})();