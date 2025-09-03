BITS=(function(){

    const
        HINT_SENTENCES=[
            {
                text:"A plaque says: \"{hint}\"",
                decoration:[ {  image:"images/texture.png", imageX:2, imageY:1 } ]
            },{
                text:"Someone left a note here: \"{hint}\"",
                decoration:[ {  image:"images/texture.png", imageX:7, imageY:1 } ]
            },{
                text:"There is a ruined banner hanging. A writing reads: \"{hint}\"",
                decoration:[ {  image:"images/texture.png", imageX:2, imageY:3 } ]
            },{
                text:"A brick sticks out from the wall. In small print you read: \"{hint}\"",
                decoration:[ {  image:"images/texture.png", imageX:3, imageY:3 } ]
            },
        ];

    let
        LIST={
            vendingMachine:{
                type:"wall",
                add:function(game, statusId, statusCondition, bit, wall, difficulty, room) {
                    game.tools.addWallDecoration(0, wall.position, wall.side, game.tools.SOLID, [
                        {  image:"images/texture.png", imageX:6, imageY:1 }
                    ]);
                    game.tools.onBumpWall(wall.position.x, wall.position.y, wall.side, [
                        {
                            if:statusCondition,
                            dialogueSay:[
                                {
                                    text:"This machine is out of order..."
                                }
                            ]
                        },{
                            if:{ and:true },
                            endScript:true,
                        },{
                            if:{
                                canPay:bit.price
                            },
                            dialogueSay:[
                                {
                                    text:"Do you want to pay "+bit.price+" Golden Coins for a healing potion?",
                                    options:[
                                        {
                                            id:"pay",
                                            value:true,
                                            label:"Yes"
                                        },{
                                            label:"No"
                                        }
                                    ]
                                }
                            ]
                        },{
                            if:{ else:true },
                            dialogueSay:[
                                {
                                    text:"This machine says \"Please, insert "+bit.price+" Golden Coins\"."
                                }
                            ]
                        },{
                            if:{ else:true },
                            endScript:true
                        },{
                            if:{
                                asContext:"answers",
                                is:{ pay:true }
                            },
                            playerPayGold:bit.price
                        },{
                            if:{ and:true },
                            healPlayer:1
                        },{
                            if:{ and:true },
                            dialogueSay:[     
                                {
                                    text:"You drank a healing potion!"
                                }
                            ]
                        },{
                            if:{ and:true },
                            asContext:"room",
                            setAttribute:statusId,
                            toValue:true
                        }
                    ]);
                    if (CONST.DEBUG.showDecorations) {
                        game.tools.paintMapSymbol(wall.position, "&#x2665;");
                        game.tools.paintMapSymbolBgColor(wall.position, CONST.COLORS.RED);
                    }
                }
            },
            hint:{
                type:"wall",
                add:function(game, statusId, statusCondition, bit, wall, difficulty, room) {
                    let
                        validHints = [];

                    // --- Look for a fitting hint
                    for (let k in game.hints)
                        if (
                            !game.hints[k].isDone && (
                                (CONST.DEBUG.hintsOnSameRoom && (room.id == k)) ||
                                (!CONST.DEBUG.hintsOnSameRoom && (difficulty <= game.hints[k].difficulty))
                            )
                        )
                            validHints.push(game.hints[k]);

                    if (validHints.length) {
                        let
                            validHint = game.random.element(validHints),
                            hintTypes = [];
                        for (let k in validHint.types)
                            hintTypes.push(k);

                        switch (game.random.element(hintTypes)) {
                            case "sentences":{
                                let
                                    hint = game.random.element(game.random.element(validHint.types.sentences)),
                                    model = game.random.element(HINT_SENTENCES);

                                game.tools.addWallDecoration(0, wall.position, wall.side, game.tools.SOLID, model.decoration);
                                game.tools.onBumpWall(wall.position.x, wall.position.y, wall.side, [ {
                                    dialogueSay:[
                                        {
                                            text:model.text.replace("{hint}", hint)
                                        }
                                    ]
                                } ]);
                                break;
                            }
                            case "decorations":{
                                let
                                    decoration = game.random.element(game.random.element(validHint.types.decorations));

                                game.tools.addWallDecoration(0, wall.position, wall.side, game.tools.SOLID, decoration.decoration);
                                if (decoration.onBump)
                                    game.tools.onBumpWall(wall.position.x, wall.position.y, wall.side, decoration.onBump);
                                break;
                            }
                        }

                        if (CONST.DEBUG.showDecorations) {
                            game.tools.paintMapSymbol(wall.position, "?");
                            game.tools.paintMapSymbolBgColor(wall.position, CONST.COLORS.RED);
                        }

                        validHint.isDone = true;

                    }

                }
            }
        };

    return {
        add:function(game, random, walls, bits) {
            bits.forEach((bit,bitId)=>{
                let
                    wallsBag = {
                        elements:[]
                    };

                for (let k in walls)
                    if ((walls[k].difficulty >= bit.difficultyRange[0]) && (walls[k].difficulty <= bit.difficultyRange[1]))
                        wallsBag.elements.push(walls[k]);
                
                for (let i=0;i<bit.count;i++) {
                    let
                        bitData = LIST[bit.type],
                        statusId = "bit-"+bitId+"-"+i,
                        statusCondition = { asContext:"room", is:{} };

                    statusCondition.is[statusId] = true;

                    switch (bitData.type) {
                        case "wall":{
                            let
                                wallSet = random.bagPick(wallsBag);
                            if (wallSet && wallSet.elements.length) {
                                let
                                    wall = random.removeElement(wallSet.elements);
                                bitData.add(game, statusId, statusCondition, bit, wall, wallSet.difficulty, wallSet.room)
                            }
                            break;
                        }
                    }
                }
            })
        }
    }

}())