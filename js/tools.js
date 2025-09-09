let Tools=function(game){

    const
        SEQUENCE_SEPARATORS = [ ", ", " ", " - ", " / " ],
        SEQUENCE_INDEX = [ ":", ": ", "=" ];

    let patternCloneObject = (vars, obj)=>{
        let
            out = Tools.clone(obj);
        for (let k in out)
            if ((typeof out[k] == "object") && (out[k]._))
                out[k] = vars[out[k]._];
        return out;
    }

    let patternAddTexture = (vars, to, texture, isSub)=>{
        if (typeof texture == "string")
            to.push(Tools.clone(game.dungeon[texture]));
        else if (Array.isArray(texture)) {
            if (isSub) {
                texture.forEach(row=>{
                    patternAddTexture(vars, to, row, true);
                })
            } else {
                let
                    sub = [];
                texture.forEach(row=>{
                    patternAddTexture(vars, sub, row, true);
                })
                to.push(sub);
            }
        } else if (typeof texture == "object")
            to.push(patternCloneObject(vars, texture));
        else
            to.push(texture);
        return to;
    }

    let addWallDecoration=(vars, mode, cell, subvalue, side, colors, force)=>{
        if (cell && !cell.isForcedUnpaintable && (force || (cell.isWallPaintable  && cell.isWallPaintable[side]))) {
            game.movement.setDirtySide(cell, subvalue, side);
            switch (mode) {
                case this.SOLID:{
                    patternAddTexture(vars, cell[subvalue][side], colors, true);
                    break;
                }
            }
        }
    }

    let addSideDecoration=(vars, subvalue, ispaintable, area, mode, colors, force)=>{
        for (let x=0;x<area.width;x++)
            for (let y=0;y<area.height;y++) {
                let
                    cell = game.map[area.y+y][area.x+x];
                if (cell && !cell.isForcedUnpaintable && (force || cell[ispaintable])) {
                    game.movement.setDirtySide(cell, subvalue, 0);
                    switch (mode) {
                        case this.SOLID:{
                            patternAddTexture(vars, cell[subvalue][0], colors, true);
                            break;
                        }
                    }
                }
            }
    }

    let paintWall=(vars, mode, cell, subvalue, side, colors, force)=>{
        if (cell && !cell.isForcedUnpaintable && (force || (cell.isWallPaintable && cell.isWallPaintable[side]))) {
            game.movement.setDirtySide(cell, subvalue, side);
            switch (mode) {
                case this.SOLID:{
                    cell[subvalue][side] = patternAddTexture(vars, [], colors, true);
                    break;
                }
            }
        }
    }

    let paintSide=(vars, subvalue, ispaintable, area, mode, colors, force)=>{
        for (let x=0;x<area.width;x++)
            for (let y=0;y<area.height;y++) {
                let
                    cell = game.map[area.y+y][area.x+x];
                if (cell && !cell.isForcedUnpaintable && (force || cell[ispaintable])) {
                    game.movement.setDirtySide(cell, subvalue, 0);
                    switch (mode) {
                        case this.SOLID:{
                            cell[subvalue][0]=patternAddTexture(vars, [], colors, true);
                            cell[ispaintable]=false;
                            break;
                        }
                        case this.CHECKERBOARD:{
                            cell[subvalue][0]=patternAddTexture(vars, [], colors[(x+y)%colors.length], true);
                            cell[ispaintable]=false;
                            break;
                        }
                    }
                }
            }
    }

    let patternCellToCell=(vars, prevCell, pattern)=>{
        let
            cell = {
                x:prevCell.x,
                y:prevCell.y,
                width:prevCell.width,
                height:prevCell.height,
                room:prevCell.room,
                isDirty:{ ceiling:[ 1 ], floor:[ 1 ], walls:[ 1, 1, 1, 1 ]}
            };

        for (let k in pattern) {
            let
                patternValue = pattern[k];
            switch (k) {
                case "floor":
                case "ceiling":
                case "walls":{
                    let
                        cellValue = [];
                    patternValue.forEach(value=>{
                        patternAddTexture(vars, cellValue, value);
                    });
                    cell[k] = cellValue;
                    break;
                }
                default:{
                    cell[k] = patternValue;
                }
            }
        }

        return cell;
    }

    let patternPaste = (vars, index, area, dx, dy, pattern, palette)=>{
        for (let y=0;y<pattern.map.length;y++)
            for (let x=0;x<pattern.map[y].length;x++) {
                let 
                    px = dx+x,
                    py = dy+y,
                    ex = area.x+px,
                    ey = area.y+py,
                    isProtected = game.map[ey] && game.map[ey][ex] ? game.map[ey][ex].isProtected : false,
                    tile = Tools.clone(palette[pattern.map[y][x]]),
                    npc = pattern.npcs ? palette[pattern.npcs[y][x]] : 0,
                    element = pattern.elements ? palette[pattern.elements[y][x]] : 0;
                if ((px>=0) && (py>=0) && (px<area.width) && (py<area.height) && (!isProtected || !tile || !tile.skipOnProtectedCell)) {

                    if (tile) {
                        game.map[ey][ex] = patternCellToCell(vars, game.map[ey][ex], tile);
                        if (isProtected)
                            game.map[ey][ex].isProtected = isProtected;
                    }

                    if (element)
                        index.elements.push(this.addElement(ex, ey, patternCloneObject(vars, element)));

                    if (npc)
                        index.npcs.push(this.addNpc(ex, ey, patternCloneObject(vars, npc)));

                }
            }
    }

    let patternFill = (vars, index, area, x1, y1, x2, y2, pattern, palette)=>{
        for (let y=y1;y<y2;y++)
            for (let x=x1;x<x2;x++) {
                let
                    ex = area.x+x,
                    ey = area.y+y,
                    py = (y-y1)%pattern.map.length,
                    px = (x-x1)%pattern.map[py].length,
                    isProtected = game.map[ey] && game.map[ey][ex] ? game.map[ey][ex].isProtected : false,
                    tile = Tools.clone(palette[pattern.map[py][px]]),
                    npc = pattern.npcs ? palette[pattern.npcs[py][px]] : 0,
                    element = pattern.elements ? palette[pattern.elements[py][px]] : 0;

                if (!isProtected || !tile || !tile.skipOnProtectedCell) {

                    if (tile) {
                        game.map[ey][ex] = patternCellToCell(vars, game.map[ey][ex], tile);
                        if (isProtected)
                            game.map[ey][ex].isProtected = isProtected;
                    }

                    if (element)
                        index.elements.push(this.addElement(ex, ey, patternCloneObject(vars, element)));

                    if (npc)
                        index.npcs.push(this.addNpc(ex, ey, patternCloneObject(vars, npc)));

                }

            }
    }

    let blitPattern = (vars, area, pattern, palette)=>{
        let
            index = { npcs:[], elements:[] },
            cx1=0,
            cy1=0,
            cx2=area.width,
            cy2=area.height;

        if (pattern.topLeft) {
            if (pattern.topLeft.map) {
                patternPaste(vars, index, area, 0, 0, pattern.topLeft, palette );
                cx1 = Math.max(cx1, pattern.topLeft.map[0].length);
                cy1 = Math.max(cy1, pattern.topLeft.map.length);
            }
        }
        if (pattern.topRight) {
            if (pattern.topRight.map) {
                patternPaste(vars, index, area, area.width-pattern.topRight.map[0].length, 0, pattern.topRight, palette );
                cx2 = Math.min(cx2, area.width-pattern.topRight.map[0].length);
                cy1 = Math.max(cy1, pattern.topRight.map.length);
            }
        }
        if (pattern.bottomLeft) {
            if (pattern.bottomLeft.map) {
                patternPaste(vars, index, area, 0, area.height-pattern.bottomLeft.map.length, pattern.bottomLeft, palette );
                cx1 = Math.max(cx1, pattern.bottomLeft.map[0].length);
                cy2 = Math.min(cy2, area.height-pattern.bottomLeft.map.length);
            }
        }
        if (pattern.bottomRight) {
            if (pattern.bottomRight.map) {
                patternPaste(vars, index, area, area.width-pattern.bottomRight.map[0].length, area.height-pattern.bottomRight.map.length, pattern.bottomRight, palette );
                cx2 = Math.min(cx2, area.width-pattern.bottomRight.map[0].length);
                cy2 = Math.min(cy2, area.height-pattern.bottomRight.map.length);
            }
        }
        if (pattern.top)
            patternFill(vars, index, area, cx1, 0, cx2, cy1, pattern.top, palette );
        if (pattern.bottom)
            patternFill(vars, index, area, cx1, cy2, cx2, area.height, pattern.bottom, palette );
        if (pattern.left)
            patternFill(vars, index, area, 0, cy1, cx1, cy2, pattern.left, palette );
        if (pattern.right)
            patternFill(vars, index, area, cx2, cy1, area.width, cy2, pattern.right, palette );

        if (pattern.center)
            patternFill(vars, index, area, cx1, cy1, cx2, cy2, pattern.center, palette );

        return index;
    }

    let changeNpc=(description)=>{

        let
            modelData,
            sprite = [];

        if (!description.model)
            description.model = "default";

        modelData = NPC.models[description.model];

        modelData.forEach(row=>{
            let
                key = row.key,
                id = description[key] || "default";

            if (NPC.layers[key] && NPC.layers[key][id])
                NPC.layers[key][id].forEach(layer=>{
                    layer.animation = row.animation;
                    sprite.push(layer);
                })
        });

        description.sprite = sprite;
    }

    let setPaintableWall=(x,y,side,set)=>{
        let
            cell = game.map[y][x];

        if (cell) {
            if (!cell.isWallPaintable)
                cell.isWallPaintable = [ false, false, false, false];
            cell.isWallPaintable[side] = set;
        }
    }

    let addDecorableWall=(checkprotected, set, x, y, side)=>{
        let
            cell = game.map[y][x],
            coordFront = CONST.DIRECTIONS[side],
            fx = x+coordFront.x,
            fy = y+coordFront.y,
            frontCell = game.map[fy] ? game.map[fy][fx] : 0;

        if (
            cell.isWallPaintable &&
            !cell.isForcedUnpaintable &&
            cell.isWallPaintable[side] &&
            cell.isWall &&
            frontCell &&
            !frontCell.isWall &&
            (
                !checkprotected ||
                !frontCell.isProtected
            )
        )
            set.push({
                x:x,
                y:y,
                side: side,
                width:1,
                height:1,
                cell:cell,
                front:{
                    x:fx,
                    y:fy,
                    width:1,
                    height:1,
                    cell: frontCell
                }
            });
    }

    let getDecorableWalls=(area,checkprotected)=>{
        let
            out = [];

        for (let x=0;x<area.width;x++) {
            addDecorableWall(checkprotected, out, area.x+x, area.y-1, 2);
            addDecorableWall(checkprotected, out, area.x+x, area.y+area.height, 0);
        }
        
        for (let y=0;y<area.height;y++) {
            addDecorableWall(checkprotected, out, area.x-1, area.y+y, 1);
            addDecorableWall(checkprotected, out, area.x+area.width, area.y+y, 3);
        }

        for (let x=0;x<area.width;x++)
            for (let y=0;y<area.height;y++)
                for (let s=0;s<4;s++)
                    addDecorableWall(checkprotected, out, area.x+x, area.y+y, s, true);

        return out;
    }

    let removeVerticalDecoration=(area, id, sidename)=>{
        for (let x=0;x<area.width;x++) {
            for (let y=0;y<area.height;y++) {
                let
                    cell = game.map[area.y+y] ? game.map[area.y+y][area.x+x] : 0,
                    side = cell ? cell[sidename] : 0;

                if (side && side[0]) {
                    game.movement.setDirtySide(cell, sidename, 0);
                    side[0] = side[0].filter(texture=>{
                        return !texture[id]
                    })
                }
            }
        }
    }

    let changeVerticalDecoration=(area, id, values, sidename)=>{
        for (let x=0;x<area.width;x++) {
            for (let y=0;y<area.height;y++) {
                let
                    cell = game.map[area.y+y] ? game.map[area.y+y][area.x+x] : 0,
                    side = cell ? cell[sidename] : 0;

                if (side && side[0]) {
                    game.movement.setDirtySide(cell, sidename, 0);
                    side[0].forEach(texture=>{
                        if (texture[id])
                            for (let k in values)
                                texture[k] = values[k];
                    });
                }
            }
        }
    }
    
    this.SOLID = 0;
    this.CHECKERBOARD = 1;

    // --- NPCs

    this.addNpc=(x,y,description)=>{

        changeNpc(description);

        description.width = 1;
        description.height = 1;
        description.x = x;
        description.y = y;

        game.movement.addItem(description);

        return description;
    }

    this.changeNpc=(sprite, model)=>{
        for (let k in model)
            sprite[k] = model[k];

        changeNpc(sprite);
    }

    // --- Elements

    this.addElement = (x,y,description,top)=>{
        let
            sprite = [],
            modelData;

        if (!description.sprite) {

            if (!description.model)
                description.model = "default";

            modelData = ELEMENTS.models[description.model];

            modelData.forEach(row=>{
                let
                    key = row.key,
                    id = description[key] || "default";

                if (ELEMENTS.layers[key] && ELEMENTS.layers[key][id])
                    ELEMENTS.layers[key][id].forEach(layer=>{
                        layer.animation = row.animation;
                        sprite.push(layer);
                    })
            });

            description.sprite = sprite;

        }

        description.width = 1;
        description.height = 1;
        description.x = x;
        description.y = y;
 
        game.movement.addItem(description, top);

        return description;
    }

    this.removeElement = (element)=>{
        game.movement.removeItem(element);
    }

    this.setElementPaintable = (area,mode)=>{
        for (let x=0;x<area.width;x++)
            for (let y=0;y<area.height;y++)
                game.map[area.y+y][area.x+x].isElementPaintable = mode;
    }

    this.moveElementAt = (element, x, y)=>{
        game.movement.moveItem(element, x, y);
    }

    this.moveElementBy = (element, dx, dy)=>{
        game.movement.moveItem(element, element.x+dx, element.y+dy);
    }

    this.getElementsAt = (x,y)=>{
        return game.movement.getItemsAt(x,y);
    }

    this.showElement = (element)=>{
        return game.movement.showItem(element);
    }

    this.hideElement = (element)=>{
        return game.movement.hideItem(element);
    }

    // --- Events

    this.onBumpWall=(x,y,side,events)=>{
        game.events.add(game.map[y][x], [ "wall", "onBump", side ], events);
    };

    this.onEnter=(x,y,events)=>{
        game.events.add(game.map[y][x], [ "cell", "onEnter" ], events);
    };

    this.onInteract=(npc,events)=>{
        game.events.add(npc, [ "onInteract" ], events);
    };

    this.onGiveItem=(npc,item, events)=>{
        game.events.add(npc, [ "onGiveItem", item ], events);
    };

    this.onUse=(item, events)=>{
        game.events.add(item, [ "onUse" ], events);
    };

    this.onEnter=(room, events)=>{
        game.events.add(room, [ "onEnter" ], events);
    };

    this.onLeave=(room, events)=>{
        game.events.add(room, [ "onLeave" ], events);
    };

    this.onMove=(room, events)=>{
        game.events.add(room, [ "onMove" ], events);
    };

    this.onFrame=(room, events)=>{
        game.events.add(room, [ "onFrame" ], events);
    };

    // --- Map building

    this.blitPattern=(vars, area, pattern, palette)=>{
        return blitPattern(vars, area, pattern, palette);
    }

    // --- Cells protection

    this.setProtected=(area, protected)=>{
        for (let x=0;x<area.width;x++)
            for (let y=0;y<area.height;y++)
                game.map[area.y+y][area.x+x].isProtected = protected;
    };

    // --- Painting

    this.setWallPaintable=(x,y,side,mode)=>{
        game.map[y][x].isWallPaintable[side] = mode;
    }

    this.setWallsPaintable=(area,mode)=>{
        for (let x=0;x<area.width;x++)
            for (let y=0;y<area.height;y++)
                game.map[area.y+y][area.x+x].isWallPaintable = mode;
    }

    this.setEdgesPaintable=(area,mode)=>{
        for (let x=0;x<area.width;x++) {
            setPaintableWall(area.x+x, area.y-1, 2, mode);
            setPaintableWall(area.x+x, area.y+area.height, 0, mode);
        }
        for (let y=0;y<area.height;y++) {
            setPaintableWall(area.x-1, area.y+y, 1, mode);
            setPaintableWall(area.x+area.width, area.y+y, 3, mode);
        }
    }

    this.paintData=(area, data)=>{
        for (let x=0;x<area.width;x++)
            for (let y=0;y<area.height;y++) {
                for (let k in data)
                    game.map[area.y+y][area.x+x][k] = data[k];
            }
    };
    
    this.paintMapSymbolColor=(area, color)=>{
        for (let x=0;x<area.width;x++)
            for (let y=0;y<area.height;y++)
                game.map[area.y+y][area.x+x].mapSymbolColor = color;
    };

    this.paintMapSymbolBgColor=(area, color)=>{
        for (let x=0;x<area.width;x++)
            for (let y=0;y<area.height;y++)
                game.map[area.y+y][area.x+x].mapSymbolBgColor = color;
    };

    this.paintMapSymbol=(area, symbol)=>{
        for (let x=0;x<area.width;x++)
            for (let y=0;y<area.height;y++)
                game.map[area.y+y][area.x+x].mapSymbol = symbol;
    };

    this.paintFloor=(vars, area, mode, colors, force)=>{
        paintSide(vars, "floor","isFloorPaintable",area, mode, colors, force);
    };

    this.setFloorPaintable=(area, mode)=>{
        for (let x=0;x<area.width;x++)
            for (let y=0;y<area.height;y++)
                game.map[area.y+y][area.x+x].isFloorPaintable = mode;
    }

    this.setCeilingPaintable=(area, mode)=>{
        for (let x=0;x<area.width;x++)
            for (let y=0;y<area.height;y++)
                game.map[area.y+y][area.x+x].isCeilingPaintable = mode;
    }

    this.paintCeiling=(vars, area, mode, colors, force)=>{
        paintSide(vars, "ceiling","isCeilingPaintable",area,mode,colors,force);
    };
    
    this.paintWalls=(vars, area, mode, colors, force)=>{
        for (let x=0;x<area.width;x++) {
            paintWall(vars, mode, game.map[area.y-1][area.x+x], "walls", 2, colors, force);
            paintWall(vars, mode, game.map[area.y+area.height][area.x+x], "walls", 0, colors, force);
        }
        for (let y=0;y<area.height;y++) {
            paintWall(vars, mode, game.map[area.y+y][area.x-1], "walls", 1, colors, force);
            paintWall(vars, mode, game.map[area.y+y][area.x+area.width], "walls", 3, colors, force);
        }
    };
    
    this.paintWalls=(vars, area, mode, colors, force)=>{
        for (let x=0;x<area.width;x++) {
            paintWall(vars, mode, game.map[area.y-1][area.x+x], "walls", 2, colors, force);
            paintWall(vars, mode, game.map[area.y+area.height][area.x+x], "walls", 0, colors, force);
        }
        for (let y=0;y<area.height;y++) {
            paintWall(vars, mode, game.map[area.y+y][area.x-1], "walls", 1, colors, force);
            paintWall(vars, mode, game.map[area.y+y][area.x+area.width], "walls", 3, colors, force);
        }
    };

    // --- Setting

    this.setFloorLayerAttribute=(cell, layer, attribute, value)=>{
        cell.floor[0][layer][attribute] = value;
        game.movement.setDirtyFloor(cell);
    }

    this.removeFloorLayer=(cell, layer)=>{
        cell.floor[0].splice(layer,1);
        game.movement.setDirtyFloor(cell);
    }

    this.removeWalls=(cell)=>{
        for (let i=0;i<4;i++)
            cell.walls[i] = 0;
        game.movement.setDirtyWalls(cell);
    }

    this.setWalls=(cell, walls)=>{
        cell.walls = Tools.clone(walls);
        game.movement.setDirtyWalls(cell);
    }

    // --- Wall decorations

    this.getDecorableWalls=(area)=>{
        return getDecorableWalls(area, false);
    }

    this.addWallDecoration=(vars, area, side, mode, colors, force)=>{
        for (let x=0;x<area.width;x++) {
            for (let y=0;y<area.height;y++) {
                let
                    cell = game.map[area.y+y] ? game.map[area.y+y][area.x+x] : 0;

                if (cell)
                    addWallDecoration(vars, mode, cell, "walls", side, colors, force);
            }
        }
    };

    // TODO: removeWallDecoration

    this.changeWallDecoration=(area, side, id, values)=>{
        for (let x=0;x<area.width;x++) {
            for (let y=0;y<area.height;y++) {
                let
                    cell = game.map[area.y+y] ? game.map[area.y+y][area.x+x] : 0;

                if (cell && cell.walls[side]) {
                    game.movement.setDirtyWall(cell,side);
                    cell.walls[side].forEach(texture=>{
                        if (texture[id])
                            for (let k in values)
                                texture[k] = values[k];
                    });
                }
            }
        }
    }

    // --- Floor decoration

    this.addFloorDecoration=(vars, area, mode, colors, force)=>{
        addSideDecoration(vars, "floor","isFloorPaintable", area, mode, colors, force);
    };

    this.removeFloorDecoration=(area, id)=>{
        return removeVerticalDecoration(area, id, "floor");
    }

    this.changeFloorDecoration=(area, id, values)=>{
        return changeVerticalDecoration(area, id, values, "floor");
    }

    // --- Ceiling decoration

    this.addCeilingDecoration=(vars, area, mode, colors, force)=>{
        addSideDecoration(vars, "ceiling","isCeilingPaintable", area, mode, colors, force);
    };

    this.removeCeilingDecoration=(area, id)=>{
        return removeVerticalDecoration(area, id, "ceiling");
    }

    this.changeCeilingDecoration=(area, id, values)=>{
        return changeVerticalDecoration(area, id, values, "ceiling");
    }

    // --- Special decorations

    this.addPlaques=(room,text,by)=>{
        if (!by)
            by = "Plaque";
        if (!text)
            text = "{name}\n\n{quote}\n\n- {author}";
        if (CONST.DEBUG.debugPlaque)
            text += "\n\nDifficulty: "+room.difficulty+"\nID: "+room.id+"\nGold budget: "+(room.goldBudget||0)+"\nArchitect price: "+(room.architectPrice || 0);

        room.doors.forEach(door=>{
            let
                x = door.x,
                y = door.y,
                side = (door.wall+3)%4;
            switch (door.wall) {
                case 0:{
                    x++;
                    break;
                }
                case 1:{
                    y++;
                    break;
                }
                case 2:{
                    x--;
                    break;
                }
                case 3:{
                    y--;
                    break;
                }
            }
            game.tools.addWallDecoration(0,game.map[y][x],side,game.tools.SOLID,[
                {  image:"images/texture.png", imageX:1, imageY:1 }
            ]);
            game.tools.setWallPaintable(x,y,side,false);
            game.tools.onBumpWall(x,y,side,[
                {
                    as:room,
                    dialogueSay:[
                        {
                            by:by,
                            text:text
                        }
                    ]
                }
            ])
        })
    }

    // --- Cell movement

    this.swapCells = (a,b)=>{
        let
            xa = a.x,
            ya = a.y;

        game.map[a.y][a.x] = b;
        game.map[b.y][b.x] = a;

        a.x = b.x;
        a.y = b.y;
        b.x = xa;
        b.y = ya;

        game.movement.setDirty(a);
        game.movement.setDirty(b);
    }

    // --- Layout helpers

    this.getWalkableCells=(area)=>{
        
        let
            out = [];

        for (let y=0;y<area.height;y++)
            for (let x=0;x<area.width;x++) {
                let
                    dx = area.x+x,
                    dy = area.y+y,
                    cell = game.map[dy][dx];

                if (cell && !cell.isWall && !cell.isProtected )
                    out.push({ x:dx, y:dy, width:1, height:1, cell:cell });
            }

        return out;

    }

    // --- Wall interactions

    this.getWalkableWalls=(area)=>{
        return getDecorableWalls(area, true);
    }

    // --- Navigation

    this.getRoomPosition=(room, position)=>{
        let
            pos = position || game.position,
            x = pos.x - room.x,
            y = pos.y - room.y;

        if ((x<0) || (y<0) || (x>=room.width) || (y>=room.height))
            return false;
        else
            return {
                x:pos.x,
                y:pos.y,
                roomX:x,
                roomY:y,
                width:1,
                height:1,
                cell:game.map[pos.y][pos.x]
            };
    }

    this.getRoomFacingPosition=(room)=>{
        let
            position = this.getRoomPosition(room);

        if (position) {
            let
                front = CONST.MOVEMENT[game.position.direction].up;
                
            position.roomX += front.x;
            position.roomY += front.y;

            if ((position.roomX<0) || (position.roomY<0) || (position.roomX>=room.width) || (position.roomY>=room.height))
                return false;
            else {
                position.x += front.x;
                position.y += front.y;    
                position.roomX += front.x;
                position.roomY += front.y;
                position.cell = game.map[position.y][position.x];
                return position;
            }

        } else
            return false;
    }

    // --- Movement locking

    this.lockControl=(side)=>{
        return game.movement.lockControl(side);
    }

    this.unlockControl=(side)=>{
        return game.movement.unlockControl(side);
    }

    this.unlockControls=()=>{
        return game.movement.unlockControls();
    }

    this.lockMovement=()=>{
        return game.movement.lock();
    }

    this.unlockMovement=()=>{
        return game.movement.unlock();
    }

    // --- Player

    this.hitPlayer=(damage)=>{
        return game.player.hit(damage);
    }

    this.healPlayer=(health)=>{
        return game.player.heal(health);
    }

    this.killPlayer=()=>{
        return game.player.kill();
    }

    this.playerPayGold=(gold)=>{
        return game.player.payGold(gold);
    }

    this.playerGainGold=(room, gold)=>{
        return game.player.gainGold(room, gold);
    }

    this.playerCanPay=(gold)=>{
        return game.player.canPay(gold);
    }

    this.movePlayerTo=(x,y)=>{
        return game.movement.moveTo(x,y);
    }

    this.movePlayerBack=()=>{
        return game.movement.goBack();
    }

    // --- Inventory

    this.getInventoryItem=(id)=>{
        return game.inventory.getItem(id);
    }
    this.getInventoryItemsFromRoom=(room)=>{
        return game.inventory.getItemsFromRoom(room);
    }

    this.removeInventoryItem=(item, skipAnimation)=>{
        return game.inventory.removeItem(item, skipAnimation);
    }

    this.addInventoryItem=(fromroom, item, className, skipAnimation)=>{
        return game.inventory.addItem(fromroom, item, className, skipAnimation);
    }

    this.setInventoryItemCounter=(item, counter)=>{
        return game.inventory.setCounter(item, counter);
    }

    this.setInventoryItemCounterOf=(item, value)=>{
        return game.inventory.setCounterOf(item, value);
    }

    this.setInventoryItemColor=(item, color)=>{
        return game.inventory.setColor(item, color);
    }

    this.setInventoryItemAnimation=(item, skipAnimation)=>{
        return game.inventory.setAnimation(item, skipAnimation);
    }

    this.removeInventoryItemsFromRoom=(room, skipAnimation)=>{
        return game.inventory.removeItemsFromRoom(room, skipAnimation);
    }

    this.storeInventoryItemsFromRoom=(room)=>{
        return game.inventory.storeItemsFromRoom(room);
    }

    this.restoreInventoryItemsFromRoom=(room)=>{
        return game.inventory.restoreItemsFromRoom(room);
    }

    // --- Dialogue

    this.dialogueSay=(placeholders,lines,then)=>{
        return game.dialogue.say(placeholders,lines,then);
    }

    // --- Doors

    this.openDoor=(door)=>{
        game.movement.openDoor(door);
    }

    // --- Room unlockings

    this.unlockRoom=(room,done)=>{
        return game.locks.unlock(room, done);
    }

    this.unlockRoomItemOnly=(room,done)=>{
        return game.locks.unlockItemOnly(room, done);
    }

    this.unlockRoomWithAttempts=(room, attempt, maxattempts, done)=>{
        if (CONST.DEBUG.showLogs)
            console.log("UNLOCKING WITH ATTEMPTS", attempt,"vs.",maxattempts);
        return game.locks.unlockWithAttempts(room, attempt, maxattempts, done);
    }

    this.unlockRoomWithScore=(room, score, maxscore, done)=>{
        if (CONST.DEBUG.showLogs)
            console.log("UNLOCKING WITH SCORE", score,"vs.",maxscore);
        return game.locks.unlockWithScore(room, score, maxscore, done);
    }

    // --- Audio

    this.stopMusic=()=>{
        return game.audio.mixerStopMusic();
    }

    this.playMusic=(music)=>{
        if (game.player.isAlive)
            return game.audio.mixerPlayMusic(game.audio.audio[music]);
    }

    this.playAudio=(sample,loop,volume,pitch,force)=>{
        return game.audio.playAudio(game.audio.audio[sample],loop,volume,pitch,force);
    }

    this.resetMusic=()=>{
        if (game.player.isAlive)
            return game.audio.mixerPlayMusic(game.audio.audio[game.music]);
    }

    this.playRoomNewMusic=(room, music)=>{
        room.music = music;
        return game.audio.mixerPlayMusic(game.audio.audio[music]);
    }

    this.cancelRoomMusic=(room)=>{
        if (game.player.isAlive) {
            delete room.music;
            return game.audio.mixerPlayMusic(game.audio.audio[game.music]);
        }
    }

    // --- Special items

    this.addHealingPotion=(cell)=>{
        let
            potion = game.tools.addElement(cell.x, cell.y, {
                isHealingPotion:true,
                model:"floorItem",
                image:"healingPotion",
                size:"small"
            });

        game.tools.onInteract(potion,[
            {
                healPlayer:1
            },{
                dialogueSay:[     
                    {
                        text:"You drank a healing potion!"
                    }
                ]
            },{ removeElement:true, refreshScreen:true }
        ]);
        return potion;
    }

    
    this.addPoisonPotion=(cell)=>{
        let
            potion = game.tools.addElement(cell.x, cell.y, {
                isPoisonPotion:true,
                model:"floorItem",
                image:"poisonPotion",
                size:"small"
            });

        game.tools.onInteract(potion,[
            {
                hitPlayer:2
            },{
                dialogueSay:[     
                    {
                        text:"You drank a poisonous potion!"
                    }
                ]
            },{ removeElement:true, refreshScreen:true }
        ]);
        return potion;
    }

    // --- Checkpoints

    function getTombCheckpointId(room, id) {
        return room.tomb.id + ":" + id;
    }

    this.getCheckpoint=(room,id)=>{
        let
            uid = getTombCheckpointId(room,id);
        if (!game.checkpoints.data[uid])
            game.checkpoints.data[uid] = { p:0 };
        if (CONST.DEBUG.showLogs)
            console.log("READ",uid,game.checkpoints.data[uid],game.checkpoints.data[uid].p);
        return game.checkpoints.data[uid].p;
    }

    this.setNextCheckpoint=(room,id,value)=>{
        let
            uid = getTombCheckpointId(room,id);
        this.getCheckpoint(room,id);
        game.checkpoints.data[uid].n = value;
        if (CONST.DEBUG.showLogs)
            console.log("WRITE",uid,game.checkpoints.data[uid]);
    }

    this.sumNextCheckpoint=(room,id,value)=>{
        this.setNextCheckpoint(room,id,this.getCheckpoint(room,id)+value);
    }

    // --- Hints

    function addPairSentences(a, b, sentences, recurse) {
        if (!sentences)
            sentences = [];
        sentences.push(a+" "+b);
        sentences.push(a+", "+b);
        sentences.push(a+": "+b);
        sentences.push(a+" ("+b+")");
        if (!recurse)
            addPairSentences(b, a, sentences, true);
        else
            return sentences;
    }

    function addMathSentences(key, expression, result, sentences) {
        if (!sentences)
            sentences = [];
        addPairSentences(key, expression+" = "+result, sentences);
        addPairSentences(key, result+" = "+expression, sentences);
        return sentences;
    }

    function addMathQuizSentences(key, avalue, a, bvalue, b, sentences) {
        if (!sentences)
            sentences = [];
        a = parseFloat(a);
        b = parseFloat(b);
        addMathSentences(key, a+" + "+bvalue, (a+b), sentences);
        addMathSentences(key, avalue+" + "+b, (a+b), sentences);
        addMathSentences(key, a+" - "+bvalue, (a-b), sentences);
        addMathSentences(key, avalue+" - "+b, (a-b), sentences);
        addMathSentences(key, a+" &times; "+bvalue, (a*b), sentences);
        addMathSentences(key, avalue+" &times; "+b, (a*b), sentences);
        return sentences;
    }

    this.hintAddSentences=(room, sentences)=>{
        if (!game.hints[room.id])
            game.hints[room.id] = { id:room.id, difficulty:room.difficulty, types:{} };
        if (!game.hints[room.id].types.sentences)
            game.hints[room.id].types.sentences = [];
        game.hints[room.id].types.sentences.push(sentences);
    }

    this.hintAddDecoration=(room, decoration)=>{
        if (!game.hints[room.id])
            game.hints[room.id] = { id:room.id, difficulty:room.difficulty, types:{} };
        if (!game.hints[room.id].types.decorations)
            game.hints[room.id].types.decorations = [];
        game.hints[room.id].types.decorations.push(decoration);
    }

    this.hintAddSequence=(room, sequence)=>{
        let
            straightSentences = [],
            shuffledSentences = [],
            random = room.random.clone(),
            shuffledSequence = [];

        shuffledSequence = sequence.map((item,id)=>{ return { id:id+1, value:item } });
        random.shuffle(shuffledSequence);

        SEQUENCE_SEPARATORS.forEach(separator=>{
            straightSentences.push(sequence.join(separator));
            SEQUENCE_INDEX.forEach(index=>{
                shuffledSentences.push(shuffledSequence.map(item=>item.id+index+item.value).join(separator));
            })
        })

        this.hintAddSentences(room, straightSentences);
        this.hintAddSentences(room, shuffledSentences);
    }

    this.hintAddKeyValue=(room, key, value)=>{
        this.hintAddSentences(room,[
            key+" "+value,
            key+": "+value,
            key+"? "+value,
            key+", "+value,
            value+" ("+key+")",
            value+"... "+key
        ])
    }

    this.hintAddCoordinates=(room, key, x, y)=>{
        let
            sx = x+"";
            sy = y+"";
        this.hintAddSentences(room,[
            key+", "+sx+":"+sy,
            key+", '"+sx+sy,
            sx+sy+": "+key,
            sx+sy+" = "+key
        ], key, "x", x, "y", y);
        this.hintAddSentences(room,[
            key+" ex is "+sx,
            key+" H"+sx,
            key+" "+sx+"x"
        ]);
        this.hintAddSentences(room,[
            key+", why "+sy,
            key+" V"+sy,
            key+" "+sy+"y",
        ]);
        this.hintAddSentences(room, addMathQuizSentences(key, "X", x, "Y", y));
    }

    // --- Screen

    this.refreshScreen=()=>{
        game.movement.update();
    }

    // --- Subscripts: Architects

    this.subscriptArchitectFreeQuote=(game, room, architect)=>{
        let
            quote = ARCHITECTS.getArchitectRoomSentence(game, room, architect);

        return {
            subScript:[
                {
                    dialogueSay:[     
                        {
                            audio:architect.voiceAudio,
                            by:quote.by,
                            text:quote.text
                        }
                    ]
                }
            ]
        }
    }

    this.scriptArchitectPaidQuote=(game, room, architect, muteNoMoney)=>{
        if (architect.paySentence) {
            let
                quote = ARCHITECTS.getArchitectRoomSentence(game, room, architect),
                subScript = [
                    {
                        if:{
                            is:{ quotePaid:true }
                        },
                        dialogueSay:[     
                            {
                                audio:architect.voiceAudio,
                                by:quote.by,
                                text:quote.text
                            }
                        ]
                    },{
                        if:{ and:true },
                        endSubScript:true
                    },{
                        if:{
                            canPay:room.architectPrice
                        },
                        dialogueSay:[
                            {
                                text:architect.paySentence.replace("{architectPrice}", room.architectPrice),
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
                    }
                ];
            if (!muteNoMoney && architect.cantPaySentence)
                subScript.push({
                    if:{ else:true },
                    dialogueSay:[
                        {
                            audio:architect.voiceAudio,
                            by:"{name}",
                            text:architect.cantPaySentence
                        }
                    ]
                });
            subScript.push({
                if:{
                    asContext:"answers",
                    is:{ pay:true }
                },
                playerPayGold:room.architectPrice
            })
            subScript.push({
                if:{ and:true },
                setAttribute:"quotePaid",
                toValue:1
            })
            subScript.push({
                if:{ and:true },
                dialogueSay:[
                    {
                        audio:architect.voiceAudio,
                        by:quote.by,
                        text:quote.text
                    }
                ]
            });
            return { subScript:subScript };
        } else
            return this.subscriptArchitectFreeQuote(game, room, architect);        
    }

};

Tools.leftPad = (value, len, padding)=>{
    let
        ret = value ? value.toString() : "0";
    if (!padding)
        padding = "0";
    while (ret.length<len)
        ret = padding+ret;
    return ret;
}

Tools.capitalize=(str)=>{
    return str[0].toUpperCase()+str.substr(1);
}

Tools.clone = (obj)=>{
    switch (typeof obj) {
        case "object":{
            let
                out;
            if (Array.isArray(obj)) {
                out = [];
                obj.forEach((item,id)=>{
                    out[id]=Tools.clone(item);
                })
            } else {
                out = {};
                for (let k in obj)
                    out[k]=Tools.clone(obj[k]);
            }
            return out;
        }
        default:{
            return obj;
        }
    }
}
