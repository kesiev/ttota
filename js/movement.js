function Movement(game) {

    const
        MAP_EMPTY = "&nbsp;",
        KEYHOLD_TIMER = 250,
        UNLOCK_TIMER = 250,
        GESTUREHOLD_TIMER = 400,
        GESTUREHOLD_TIMER_SIDES = 800,
        GESTUREDOT_BORDER = 3,
        GESTUREDOT_HSIZE = 15,
        GESTUREDOT_SIZE = GESTUREDOT_HSIZE*2,
        ANGLE_SLICE = Math.PI / 4,
        ANGLE_SLICE3 = ANGLE_SLICE*3,
        SOUNDS = {
            WALK:[ "walk1", "walk2", "walk3" ],
            KEYBOARD:[ "keypress1", "keypress2", "keypress3" ]
        },
        STEP_PITCH = [ 1, 0.8 ],
        CAMERA_ANIMATION = {
            HIT: 1,
            DEAD: 2,
            HEAL: 3
        },
        ANIMATION_SPEED = Math.floor(1000/4),
        ANIMATION_FRAMES = 6,
        ANIMATION_FRAME_BLINK = 3,
        ANIMATION_NOMOD = {},
        MINIMAP_WIDTH = 5,
        MINIMAP_HEIGHT = 5,
        MINIMAP_DX = (MINIMAP_WIDTH-1)/2,
        MINIMAP_DY = (MINIMAP_HEIGHT-1)/2,
        MENU_SYMBOL = "&#x2261;";
        PLAYER_SYMBOL = [
            "&#x25B2;",
            "&#x25BA;",
            "&#x25BC;",
            "&#x25C4;"
        ],
        MESSAGES = {
            dailyRunSavedMessage: { stamp:"Thank you for playing!<br>See you tomorrow!" },
            failure:{
                messages:[
                    "YOU DIED",
                    "GAME OVER",
                    "LIFE OVER",
                    "NICE WORK",
                    "FAILURE",
                    "OH NO"
                ],
                comments:[
                    [ "*** YOU SUCCESSFULLY ***", "*** FAILED ***" ],
                    [ "IT ENDED BADLY", "WHO WOULD HAVE EVER THOUGHT" ],
                    [ "YOU HAVE BEEN DEFEATED", "WE ARE SHAKEN" ],
                    [ "IT WAS NICE", "WHILE IT LASTED" ],
                    [ "I SWEAR THERE IS", "A GREEN HEADER TOO" ],
                ]
            },
            success:{
                messages:[
                    "GOOD JOB",
                    "WELL DONE",
                    "DONE",
                    "CLEAR",
                    "SUCCESS",
                    "YEAH"
                ],
                comments:[
                    [ "*** YOU SURVIVED ***", "*** DESPITE EVERYTHING ***" ],
                    [ "CONGRATULATIONS", "HERE'S TO YOUR HEALTH" ],
                    [ "GREAT JOB", "WHATEVER IT WAS" ],
                    [ "@TODO ADD A CONFETTI", "ANIMATION HERE" ],
                    [ "YOU DESERVED", "THE GREEN TEXT" ],
                ]
            }
        }

    let
        position = {
            x:0,
            y:0,
            width:1,
            height:1,
            previousX:0,
            previousY:0,
            direction:0,
            currentRoom:0,
            steps:0
        },
        controlLocks = {
            up:true,
            down:true,
            left:true,
            right:true
        },
        keyboard = [],
        lastKeyCode,
        keyHoldTimeout = 0,
        gestureHoldTimeout = 0,
        gestureMode = 0,
        gesture = 0,
        isFullRefresh = true,
        isUnlocked = true,
        unlockedTimeout = 0,
        isGameEnded = false,
        isSuccess,
        canGoBack = false,
        animationFrame = 0,
        animationFrameNextAt = 0,
        cameraAnimation,
        cameraAnimationStart,
        cameraAnimationLength,
        isFullMap = false,
        minimap = document.createElement("div"),
        fullmapOuter = document.createElement("div"),
        fullmapMiddle = document.createElement("div"),
        fullmap = document.createElement("div"),
        pause = document.createElement("div"),
        gameOverContainer = document.createElement("div"),
        gameOverMessage = document.createElement("div"),
        gameOverButton = document.createElement("div"),
        gameOverSummary = document.createElement("div"),
        gestureDot = document.createElement("div"),
        gameOverMessageText,
        gameOverPhase,
        gameOverStep,
        gameOverTimeout = 0,
        summary = [],
        stepPitchPosition = 0,
        tiles = GenerateViewport(0,100,100,100,9,9,4,7.5,100),
        visibleMap = [],
        minX, minY, maxX, maxY;

    minimap.className = "topbutton map mini show";

    fullmapOuter.className = "outer";
    fullmapMiddle.className = "middle";
    fullmap.className = "topbutton map full hidden";

    gestureDot.style.zIndex=10;
    gestureDot.style.position="absolute";
    gestureDot.style.height=GESTUREDOT_SIZE+"px"
    gestureDot.style.transformOrigin=(GESTUREDOT_HSIZE+GESTUREDOT_BORDER)+"px "+(GESTUREDOT_HSIZE+GESTUREDOT_BORDER)+"px";
    gestureDot.style.borderRadius=GESTUREDOT_SIZE+"px 0 0 "+GESTUREDOT_SIZE+"px";
    gestureDot.style.backgroundColor = "rgba(0,0,0,0.3)";
    
    fullmap.appendChild(fullmapOuter);
    fullmapOuter.appendChild(fullmapMiddle);

    pause.className = "topbutton pause show";
    pause.innerHTML = MENU_SYMBOL;

    gameOverContainer.className = "gameover";
    gameOverButton.className = "button";
    gameOverButton.innerHTML = "End run";
    gameOverSummary.className = "summary";

    gameOverButton.addEventListener("pointerdown",()=>{
        if (!this._clicked) {
            this._clicked = true; 
            if (gameOverTimeout) {
                clearTimeout(gameOverTimeout);
                gameOverTimeout = 0;
            }
            game.menu.gameOver(game);
            playClick();
        }
    })

    gameOverContainer.appendChild(gameOverMessage);
    gameOverContainer.appendChild(gameOverSummary);
    gameOverContainer.appendChild(gameOverButton);

    game.position = position;

    if (game.skybox)
        tiles.skybox.style.backgroundImage = "url('"+game.skybox+"')";

    this.container = tiles.container;
    this.CAMERA_ANIMATION = CAMERA_ANIMATION;

    if (CONST.DEBUG.showMap) {
        minX = 0;
        minY = 0;
        maxX = maxY = 50;
    }

    minimap.addEventListener("pointerdown", ()=>{
        if (game.menu.isNotPaused && isUnlocked && !this.isLocked && game.player.isAlive) {
            endGesture();
            this.showFullMap();
        }
    });

    fullmap.addEventListener("pointerup",()=>{
        if (isFullMap)
            this.hideFullMap();
    });

    pause.addEventListener("pointerdown", ()=>{
        if (game.menu.isNotPaused && isUnlocked && !this.isLocked) {
            endGesture();
            game.menu.pause(game);
            playClick();
        }
    });

    let playClick = ()=>{
        game.audio.playAudio(PROGRESS.isFake() ? game.audio.audio.beep2 : game.audio.audio.mouseclick1);
    }

    let randomElement = (list)=>{
        return list[Math.floor(Math.random()*list.length)];
    }

    let renderMap = (static,x1,y1,x2,y2)=>{
        let
            content = "<div class='content'>";
        for (let i=y1;i<=y2;i++) {
            for (let j=x1;j<=x2;j++) {
                if ((j == position.x) && (i == position.y))
                    content += static || (animationFrame < ANIMATION_FRAME_BLINK) ? "<span class='player'>"+PLAYER_SYMBOL[position.direction]+"</span>" : "&nbsp;";
                else if ((CONST.DEBUG.showMap || (visibleMap[i] && visibleMap[i][j])) && game.map[i] && game.map[i][j]) {
                    let
                        cell = game.map[i][j],
                        style = "";

                    if (cell.mapSymbolColor)
                        style+="color:"+cell.mapSymbolColor+";";
                    if (cell.mapSymbolBgColor)
                        style+="background-color:"+cell.mapSymbolBgColor+";";

                    content += (style ? "<span style='"+style+"'>" : "")+((cell.mapSymbol === undefined) || (cell.mapSymbol === " ") ? MAP_EMPTY : cell.mapSymbol)+(style ? "</span>" : "");
                } else
                    content += MAP_EMPTY;
            }
            content+="<br>";
        }
        content+="</div>";
        return content;
    }

    let updateVisibleMap = ()=>{
       
        CONST.VIEWMAPS[position.direction].forEach(ray=>{

            for (let i=0;i<ray.length;i++) {
                let
                    map = ray[i],
                    dx = map.x+position.x,
                    dy = map.y+position.y;
                    
                if ((minX === undefined)||(minX>dx))
                    minX = dx;
                if ((minY === undefined)||(minY>dy))
                    minY = dy;
                if ((maxX === undefined)||(maxX<dx))
                    maxX = dx;
                if ((maxY === undefined)||(maxY<dy))
                    maxY = dy;

                if (game.map[dy] && game.map[dy][dx]) {
                    let
                        cell = game.map[dy][dx];

                    if (!visibleMap[dy]) visibleMap[dy]=[];
                    visibleMap[dy][dx]=true;
                    if (cell.isWall && !cell.isTransparent)
                        break;
                } else
                    break;
            }
            
        })
        
    }

    let makeLayerBackground=(layer)=>{
        let
            background={ repeat:"no-repeat" },
            mod = layer.animation ? layer.animation[animationFrame%layer.animation.length] : ANIMATION_NOMOD;

        if (layer.backgroundColor)
            background.backgroundColor = layer.backgroundColor;

        if (layer.image) {
            background.url = LOADER.getTexture(layer.image);
            background.x = layer.imageX*101 - (layer.dx || 0) - (mod.dx || 0);
            background.y = layer.imageY*101 - (layer.dy || 0) - (mod.dy || 0);
        }

        return background;
    }

    let makeSurfaceBackground=(set)=>{
        let
            isAnimated = false,
            backgrounds = [],
            brightness = 1;

        set.forEach(layer=>{
            isAnimated |= !!layer.animation;
            if (layer.brightness !== undefined)
                brightness += layer.brightness;
            backgrounds.push(makeLayerBackground(layer));
        });

        return {
            isAnimated: isAnimated,
            background: backgrounds,
            brightness: brightness
        };
    }

    let makeItemsBackground=(items)=>{
        let
            isAnimated = false,
            brightness = 1,
            backgrounds = [];

        items.forEach(item=>{
            if (!item.isHidden) {
                if (item.brightness !== undefined)
                    brightness += item.brightness;
                item.sprite.forEach(layer=>{
                    isAnimated |= !!layer.animation;
                    backgrounds.push(makeLayerBackground(layer));
                })
            }
        });
        return {
            isAnimated: isAnimated,
            background: backgrounds,
            brightness: brightness
        };
    }

    let getItemsAt=(x, y)=>{
        if (!game.items[y])
            game.items[y] = [];
        if (!game.items[y][x])
            game.items[y][x] = { isDirty:true, list:[] };
        return game.items[y][x];
    }

    let addItem=(item, top)=>{
        let
            cell = getItemsAt(item.x, item.y);

        if (top)
           cell.list.unshift(item);
        else
           cell.list.push(item);

       cell.isDirty = true;
    }

    let removeItem=(item)=>{
        let
            cell = getItemsAt(item.x, item.y),
            pos = cell.list.indexOf(item);

        if (pos != -1) {
            cell.isDirty = true;
            cell.list.splice(pos,1);
            return true;
        }

        return false;
    }

    let moveItem=(item,x,y)=>{
        removeItem(item);
        item.x = x;
        item.y = y;
        addItem(item);
    }

    let forceUpdate=(fullrefresh)=>{
        if (fullrefresh)
            isFullRefresh = true;
        if (game.menu.isGameRunning)
            update();
    }

    let showItem=(item)=>{
        let
            cell = getItemsAt(item.x, item.y);
        item.isHidden = false;
        cell.isDirty = true;
    }

    let hideItem=(item)=>{
        let
            cell = getItemsAt(item.x, item.y);
        item.isHidden = true;
        cell.isDirty = true;
    }

    let updateTexture=(render, background, rotate, flipX, brightness)=>{

        let
            div = render.div,
            canvas = div._texture;

        if (background) {

            canvas.width = canvas.width;

            if (CONST.COMPAT.cssFilters) {

                let
                    backgroundColor = "transparent";

                if (CONST.COMPAT.noFilterFront && render.isFront)
                    canvas.style.filter = "";
                else
                    canvas.style.filter = "brightness("+brightness+"%)";

                background.forEach(layer=>{
                    if (layer.backgroundColor)
                        backgroundColor = layer.backgroundColor;
                    if (layer.url)
                        canvas._ctx.drawImage(LOADER.IMAGESDATA[layer.url].image, layer.x, layer.y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                });

                canvas.style.transform = div._transform+"rotate("+rotate+"deg) "+(flipX?"scale(-1)":"");
                canvas.style.backgroundColor = backgroundColor;

            } else {

                if (CONST.COMPAT.noFilterFront && render.isFront)
                    canvas._ctx.filter = "";
                else
                    canvas._ctx.filter = "brightness("+brightness+"%)";

                canvas._ctx.translate(canvas._hwidth, canvas._hheight);
                canvas._ctx.rotate(rotate);
                canvas._ctx.translate(-canvas._hwidth, -canvas._hheight);

                if (flipX) {
                    canvas._ctx.scale(-1, 1);
                    canvas._ctx.translate(-canvas.width, 0);
                }

                background.forEach(layer=>{
                    if (layer.backgroundColor) {
                        canvas._ctx.fillStyle = layer.backgroundColor;
                        canvas._ctx.fillRect(-1,-1,canvas.width+2, canvas.height+2);
                    }
                    if (layer.url)
                        canvas._ctx.drawImage(LOADER.IMAGESDATA[layer.url].image, layer.x, layer.y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
                });

            }
            
            if (!div.parentNode)
                tiles.camera.appendChild(div);

        } else
            if (div.parentNode)
                tiles.camera.removeChild(div);
         
    }

    let update=()=>{
        let
            changes = 0;

        tiles.renderMaps[position.direction].forEach(renderList=>{
            let
                render,
                found,
                dx,
                dy,
                background,
                cell;
            
            for (let i=0;i<renderList.length;i++) {
                render=renderList[i];
                dx=position.x+render.x;
                dy=position.y+render.y;
                if (game.map[dy] && (cell = game.map[dy][dx]))
                    found = game.map[dy][dx][render.key][render.id];
                if (found)
                    break;
            }
            if (cell && (isFullRefresh || cell.isDirty[render.key][render.id])) {
                changes++;
                if (found) {
                    background = makeSurfaceBackground(found);
                    cell.isDirty[render.key][render.id] = background.isAnimated;
                    updateTexture(
                        render,
                        background.background,
                        render.rotate, render.flipX,
                        Math.max(0,((100-(render.depth*15+(render.isFaceWall ? 10 : 0)))+background.brightness))
                    );
                } else {
                    cell.isDirty[render.key][render.id] = false;
                    updateTexture(render);
                }
            }
        });
        tiles.itemMaps[position.direction].forEach(renderList=>{
            renderList.forEach(render=>{
                let
                    background,
                    found = getItemsAt(position.x+render.x, position.y+render.y);

                if (isFullRefresh || found.isDirty) {
                    changes++;
                    if (found.list.length) {
                        background = makeItemsBackground(found.list);
                        found.isDirty = background.isAnimated;
                        updateTexture(
                            render,
                            background.background,
                            0,0,
                            Math.max(0,((100-(render.depth*15))+background.brightness))
                        );
                    } else {
                        found.isDirty = false;
                        updateTexture(render);
                    }
                }

            });
        })
        tiles.skybox.style.backgroundPosition=(position.direction*33)+"% 0";
        
        // --- Update minimap
        minimap.innerHTML = renderMap(true,position.x-MINIMAP_DX,position.y-MINIMAP_DY,position.x+MINIMAP_DX,position.y+MINIMAP_DY);

        isFullRefresh = false;
    }

    let move=(dx,dy)=>{
        let
            newCurrentRoom;

        game.dungeon.rooms.forEach(placedRoom=>{
            let
                room = placedRoom.room;

            if (!(
                (dx<room.x) || (dx>=room.x+room.width) ||
                (dy<room.y) || (dy>=room.y+room.height)
            )) {
                newCurrentRoom = room;
            }
        })

        position.x = dx;
        position.y = dy;
        position.cell = game.map[dy][dx];

        updateVisibleMap();

        if (newCurrentRoom != position.currentRoom) {
            if (position.currentRoom)
                game.events.runEvent({
                    as:position.currentRoom,
                    room:position.currentRoom
                },[ "onLeave" ]);
            position.currentRoom = newCurrentRoom;
            if (position.currentRoom) {
                game.events.runEvent({
                    as:position.currentRoom,
                    room:position.currentRoom,
                },[ "onEnter" ]);
                if (position.currentRoom.music !== undefined)
                    if (position.currentRoom.music)
                        game.audio.mixerPlayMusic(game.audio.audio[position.currentRoom.music]);
                    else
                        game.audio.mixerStopMusic();
            } else
                game.audio.mixerPlayMusic(game.audio.audio[game.music]);
        }

        if (position.currentRoom)
            game.events.runEvent({
                as:position.currentRoom,
                room:position.currentRoom,
            },[ "onMove" ]);

    }

    let applyCameraAnimation=(percent)=>{
        switch (cameraAnimation) {
            case CAMERA_ANIMATION.HIT:{
                tiles.camera.style.transform = "rotateZ("+(3*(1-percent))+"deg)";
                tiles.effects.style.backgroundColor = "rgba(255,0,0,"+((1-percent)*0.5)+")";
                break;
            }
            case CAMERA_ANIMATION.DEAD:{
                tiles.camera.style.transform = "translateY("+(-20*percent)+"px) rotateZ("+(-3*percent)+"deg)";
                tiles.effects.style.backgroundColor = "rgba(255,0,0,"+(percent*0.75)+")";
                break;
            }
            case CAMERA_ANIMATION.HEAL:{
                tiles.effects.style.backgroundColor = "rgba(0,255,0,"+((1-percent)*0.5)+")";
                break;
            }
        }
    }

    let scheduleFrame=()=>{
        window.requestAnimationFrame((time)=>{
            if (game.menu.isGameRunning) {
                
                if (cameraAnimation) {
                    if (!cameraAnimationStart)
                        cameraAnimationStart = time;
                    percent = Math.min((time - cameraAnimationStart)/cameraAnimationLength,1);
                    applyCameraAnimation(percent);
                    if (percent == 1)
                        cameraAnimation = 0;
                }

                if (time >= animationFrameNextAt) {
                    animationFrameNextAt = time + ANIMATION_SPEED;
                    animationFrame = (animationFrame+1)%ANIMATION_FRAMES;
                    if (game.menu.isNotPaused && game.player.isAlive && position.currentRoom && position.currentRoom.onFrame)
                        position.currentRoom.onFrame(game);
                    if (isFullMap)
                        updateFullMap();
                    update();
                }

                scheduleFrame();
            }
        });
    }

    let playWalk=(cell)=>{
        stepPitchPosition = (stepPitchPosition+1)%STEP_PITCH.length;
        game.audio.playAudio(
            game.audio.audio[randomElement((cell.sounds && cell.sounds.walk) ||  SOUNDS.WALK)],
            false,
            0,
            STEP_PITCH[stepPitchPosition]
        );
    }

    let playCameraAnimation=(animation, length)=>{
        applyCameraAnimation(1);
        cameraAnimation = animation;
        cameraAnimationStart = 0;
        cameraAnimationLength = length || 250;
    }

    let updateFullMap = ()=>{
        fullmapMiddle.innerHTML = renderMap(false,minX,minY,maxX,maxY);
    }

    let cancelKeyHold = ()=>{
        if (keyHoldTimeout) {
            clearTimeout(keyHoldTimeout);
            keyHoldTimeout = 0;
        }
    }

    let scheduleKeyHold = (keycode)=>{
        lastKeyCode = keycode;
        cancelKeyHold();
        keyHoldTimeout = setTimeout(onkeyDownEvent, KEYHOLD_TIMER);
    }

    let onkeyUpEvent = (e) =>{
        keyboard[e.keyCode] = 0;
        cancelKeyHold();
    }

    let getGestureMode = () =>{
        return (gesture.distance > game.ui.flickSize);
    }

    let getGestureKey = ()=>{
        if ((gesture.angle>-ANGLE_SLICE) && (gesture.angle<ANGLE_SLICE))
            return "right";
        else if ((gesture.angle>ANGLE_SLICE3) || (gesture.angle<-ANGLE_SLICE3))
            return "left";
        else if (gesture.angle > 0 )
            return "down";
        else
            return "up";
    }

    let stopGestureHold = ()=>{
        if (gestureHoldTimeout) {
            clearTimeout(gestureHoldTimeout);
            gestureHoldTimeout = 0;
        }
    }

    let setGestureMode = (mode, lastkey)=>{
        stopGestureHold();
        gestureMode = mode;
        gestureHoldTimeout = setTimeout(onGestureMode, mode ? ((lastkey == "left" || lastkey == "right") ? GESTUREHOLD_TIMER_SIDES : GESTUREHOLD_TIMER) : KEYHOLD_TIMER);
    }

    let onGestureMode = ()=>{
        if (gestureMode) {
            let
                key = getGestureKey();
            gesture.triggered = true;
            pressKey(key);
            setGestureMode(true, key);
        }
    }

    let updateGestureDot=()=>{
        if (gesture) {
            gestureDot.style.pointerEvents="none";
            gestureDot.style.display="block";
            gestureDot.style.width=(gesture.distance+GESTUREDOT_SIZE)+"px";
            gestureDot.style.border = GESTUREDOT_BORDER+"px solid "+(getGestureMode() ? "#f00" : "#00f");
            gestureDot.style.left = (gesture.x1-GESTUREDOT_HSIZE-GESTUREDOT_BORDER)+"px";
            gestureDot.style.top = (gesture.y1-GESTUREDOT_HSIZE-GESTUREDOT_BORDER)+"px";
            gestureDot.style.transform="rotate("+gesture.angle+"rad)";
        } else {
            gestureDot.style.display="none";
        }
    }

    let onPointerDownEvent = (e)=>{
        if (!gesture && !e.target._cancelDrag && game.menu.isNotPaused && isUnlocked && !this.isLocked && game.player.isAlive) {
            gesture = {
                startAt:Date.now(),
                triggered:false,
                x1:e.pageX,
                y1:e.pageY,
                x2:e.pageX,
                y2:e.pageY,
                distance:0,
                angle:0
            };
            stopGestureHold();
            updateGestureDot();
        }
    }

    let endGesture = ()=>{
        stopGestureHold();
        gesture = 0;
        updateGestureDot();
    }

    let onPointerUpEvent = (e)=>{
        if (gesture && !gesture.triggered && getGestureMode())
            pressKey(getGestureKey());
        if (PROGRESS.save.cameraPan && gesture) {
            tiles.camera.style.transform = "translate(0px,0px)";
            tiles.camera.style.perspectiveOrigin = "50% 50%";
        }
        endGesture();
    }

    let onPointerMoveEvent = (e)=>{

        if (gesture) {

            gesture.x2 = e.pageX;
            gesture.y2 = e.pageY;
            gesture.angle = Math.atan2(gesture.y2 - gesture.y1, gesture.x2 - gesture.x1);
            gesture.distance = Math.hypot(gesture.x2 - gesture.x1, gesture.y2 - gesture.y1);

            updateGestureDot();

            let
                newGestureMode = getGestureMode();

            if (newGestureMode != gestureMode)
                setGestureMode(newGestureMode);
        }

        if (PROGRESS.save.cameraPan && game.menu.isNotPaused && game.player.isAlive && isUnlocked) {
            let
                cx, cy,
                w = document.body.clientWidth,
                h = document.body.clientHeight,
                pan = true;
            
            if  (e.pointerType == "mouse") {
                cx = document.body.clientWidth/2;
                cy = document.body.clientHeight/2;
            } else if (gesture) {
                cx = gesture.x1;
                cy = gesture.y1;
            } else
                pan = false;

            dx = (e.pageX-cx)/w,
            dy = (e.pageY-cy)/h;
            
            if (pan) {
                tiles.camera.style.transform = "translate("+((-dx*2))+"px,"+((-dy*2))+"px)";
                tiles.camera.style.perspectiveOrigin = (50+(-dx*5))+"% "+(50+(-dy*5))+"%";
            } else {
                tiles.camera.style.transform = "translate(0px,0px)";
                tiles.camera.style.perspectiveOrigin = "50% 50%";
            }
        }
    }

    let unlockControls = ()=>{
        for (let k in controlLocks)
            controlLocks[k] = true;
    }

    let lockControl=(side)=>{
        controlLocks[side] = false;
    }

    let unlockControl=(side)=>{
        controlLocks[side] = true;
    }

    let pressKey=(key)=>{

        if (game.menu.isNotPaused && game.player.isAlive && isUnlocked && !this.isLocked) {

            if (position.currentRoom && position.currentRoom.onKey)
                position.currentRoom.onKey(game, key);

            if (controlLocks[key]) {

                let
                    movement = CONST.MOVEMENT[position.direction][key];

                position.direction = movement.direction;

                if (movement.x || movement.y) {
                    let
                        dx=position.x+movement.x,
                        dy=position.y+movement.y,
                        cell=game.map[dy] ? game.map[dy][dx] : 0;

                    if (cell) {

                        if (cell.isDoor) {
                            if (!game.locks.useKeyForDoor(cell))
                                game.dialogue.say(0,[
                                    {
                                        text:"You need some key..."
                                    }
                                ]);
                        } else if (cell.isWall && !CONST.DEBUG.noClip) {
                            game.events.runEvent({
                                as:cell,
                                room:position.currentRoom
                            },[ "wall", "onBump", (position.direction+2)%4 ])
                        } else {
                            playWalk(cell);
                            game.events.runEvent({
                                as:cell,
                                room:position.currentRoom
                            },[ "cell", "onEnter" ]);
                            canGoBack = true;
                            position.previousX = position.x;
                            position.previousY = position.y;
                            position.steps++;
                            move(dx,dy);

                            let
                                items = getItemsAt(dx, dy);

                            if (items && items.list.length) {
                                let
                                    list = items.list.slice();

                                list.forEach(item=>{
                                    if (!item.isHidden)
                                        game.events.runEvent({
                                            as:item,
                                            room:position.currentRoom
                                        },[ "onInteract" ]);
                                })
                            }

                            forceUpdate(true);
                        }

                    }
                    
                } else
                    forceUpdate(true);
                
                updateVisibleMap();

            }

        }
        
    }

    let onkeyDownEvent = (e)=>{

        let
            keyCode = e ? (!keyboard[e.keyCode] && e.keyCode ) : lastKeyCode;

        if (keyCode) {
            
            keyboard[keyCode] = 1;

            if (game.menu.isNotPaused && game.player.isAlive) {

                let
                    key;

                switch (keyCode) {
                    case 87:
                    case 38:{
                        key = "up";
                        break;
                    }
                    case 83:
                    case 40:{
                        key = "down";
                        break;
                    }
                    case 65:
                    case 37:{
                        key = "left";
                        break;
                    }
                    case 68:
                    case 39:{
                        key = "right";
                        break;
                    }
                }

                switch (keyCode) {
                    case 77:{
                        if (isFullMap)
                            this.hideFullMap();
                        else if (game.menu.isNotPaused && isUnlocked && !this.isLocked && game.player.isAlive)
                            this.showFullMap();
                        break;
                    }
                    case 27:{
                        if (isFullMap)
                            this.hideFullMap();
                        else if (game.menu.isNotPaused && isUnlocked && !this.isLocked)
                            game.menu.pause(game);
                        break;
                    }
                }

                if (key)
                    pressKey(key);

            }

            scheduleKeyHold(keyCode);

        }

    }

    let showGameOver =()=>{

        switch (gameOverPhase) {
            case 0:{
                gameOverStep++;
                game.audio.playAudio(game.audio.audio[randomElement(SOUNDS.KEYBOARD)]);
                if (gameOverStep<gameOverMessageText.length) {
                    gameOverMessage.innerHTML = gameOverMessageText.substr(0,gameOverStep)+"<span class='cursor'>"+CONST.CURSOR[gameOverStep%CONST.CURSOR.length]+"</span>";
                    gameOverTimeout = setTimeout(showGameOver, 100);
                } else {
                    gameOverMessage.innerHTML = gameOverMessageText;
                    gameOverPhase++;
                    gameOverStep=0;
                    gameOverTimeout = setTimeout(showGameOver, 1000);
                }   
                break;
            }
            case 1:{
                gameOverButton.className = "button show";
                gameOverSummary.className = "summary show";
                gameOverMessage.className += " top";
                gameOverPhase++;
                gameOverTimeout = setTimeout(showGameOver, 1000);
                game.audio.playAudio(game.audio.audio.printerload1);
                break;
            }
            case 2:{
                let
                    currentRow = summary[gameOverStep];
                if (currentRow) {
                    if (currentRow.stamp)
                        game.audio.playAudio(game.audio.audio.stamp1,false,0);
                    else
                        game.audio.playAudio(game.audio.audio.printer1,false,0,gameOverStep % 2 ? 0.8 : 1);
                    PROGRESS.renderSummaryRow(currentRow, gameOverSummary);
                    gameOverStep++;
                    gameOverTimeout = setTimeout(showGameOver,500);
                } else
                    game.audio.playAudio(game.audio.audio.printerend1);
            }
        }

        
    }

    let gameOver = (success)=>{
        if (!isGameEnded) {

            let
                isNewRun,
                set,
                comment;

            this.lock();
            game.inventory.hide();
    
            isGameEnded = true;
            isSuccess = success;

            if (success) {
                gameOverMessage.className = "message success";
                set = MESSAGES.success;
                PROGRESS.setCheckpoints(game.checkpoints);
                game.audio.mixerPlayMusic(game.audio.audio.success1);
            } else {
                gameOverMessage.className = "message failure";
                set = MESSAGES.failure;
                game.audio.mixerStopMusic();
            }

            gameOverMessageText = randomElement(set.messages);
            comment = randomElement(set.comments);
            comment.forEach(line=>{
                summary.push({ text:line });
            })
            summary.push({ space:true });

            document.body.appendChild(gameOverContainer);
            
            game.ranks = PROGRESS.rankGame(game, success);
            isNewRun = PROGRESS.saveRanks(game.ranks);

            PROGRESS.ranksToSummary(game.ranks, summary);

            if (isNewRun)
                summary.push(MESSAGES.dailyRunSavedMessage);

            gameOverPhase = 0;
            gameOverStep = 0;
            gameOverTimeout = setTimeout(showGameOver,100);
        }
    }

    let unlockFor=()=>{
        isUnlocked = true;
        if (unlockedTimeout) {
            clearTimeout(unlockedTimeout);
            unlockedTimeout = 0;
        }
    }

    let lockFor=(time)=>{
        isUnlocked = false;
        unlockedTimeout = setTimeout(()=>{
            unlockFor();
        },time);
    }

    let setDirtyWall=(cell,side)=>{
        let
            direction = CONST.DIRECTIONS[side],
            otherCell = game.map[cell.y+direction.y] ? game.map[cell.y+direction.y][cell.x+direction.x] : 0,
            otherSide = (side+2)%4;

        cell.isDirty.walls[side] = true;
        if (otherCell)
            otherCell.isDirty.walls[otherSide] = true;
    }

    let setDirty=(cell)=>{
        setDirtyFloor(cell);
        setDirtyCeiling(cell);
        setDirtyWalls(cell);
    }

    let setDirtyWalls=(cell)=>{
        for (let i=0;i<4;i++)
            setDirtyWall(cell, i);
    }

    let setDirtySide=(cell, key, id)=>{
        cell.isDirty[key][id] = true;
    }

    let setDirtyFloor=(cell)=>{
        cell.isDirty.floor[0] = true;
    }

    let setDirtyCeiling=(cell)=>{
        cell.isDirty.ceiling[0] = true;
    }

    this.playCameraAnimation = (animation, length)=>{
        playCameraAnimation(animation, length);
    }

    this.getItemsAt=(x, y)=>{
        return getItemsAt(x, y);
    }

    this.addItem=(item, top)=>{
        return addItem(item, top);
    }

    this.removeItem=(item)=>{
        return removeItem(item);
    }

    this.moveItem=(item,x,y)=>{
        return moveItem(item,x,y);
    }

    this.showItem=(item)=>{
        return showItem(item);
    }

    this.hideItem=(item)=>{
        return hideItem(item);
    }
    
    this.setDirty=(cell)=>{
        return setDirty(cell);
    };

    this.setDirtySide=(cell, key, id)=>{
        return setDirtySide(cell, key, id);
    };

    this.setDirtyWall=(cell,side)=>{
        return setDirtyWall(cell,side);
    };

    this.setDirtyWalls=(cell)=>{
        return setDirtyWalls(cell);
    };

    this.setDirtyFloor=(cell)=>{
        return setDirtyFloor(cell);
    };

    this.setDirtyCeiling=(cell)=>{
        return setDirtyCeiling(cell);
    };

    this.playCameraAnimation = (animation, length)=>{
        return playCameraAnimation(animation, length);
    };

    this.moveTo=(dx,dy)=>{
        canGoBack = true;
        position.previousX = position.x;
        position.previousY = position.y;
        move(dx, dy);
        forceUpdate(true);
    }
    
    this.update=()=>{
        forceUpdate();
    }

    this.lock=(unlockdelayed)=>{
        unlockFor();
        this.isLocked++;
        this.isUnlockDelayed |= unlockdelayed;
        minimap.className = "topbutton map mini hidden";
        pause.className = "topbutton pause hidden";
        fullmap.className = "topbutton map full hidden";
    };

    this.unlock=()=>{
        if (this.isLocked>0) {
            this.isLocked--;
            if (!this.isLocked) {
                minimap.className = "topbutton map mini show";
                pause.className = "topbutton pause show";
                fullmap.className = "topbutton map full hidden";
                if ((isSuccess !== undefined) && !isGameEnded)
                    gameOver(isSuccess);
                else if (this.isUnlockDelayed) {
                    this.isUnlockDelayed = false;
                    lockFor(UNLOCK_TIMER);
                }
            }
        }
    }

    this.gameOver=(success)=>{
        if (!this.isLocked && !isGameEnded)
            gameOver(success);
        else
            isSuccess = success;
    }

    this.showFullMap=()=>{
        if (!isFullMap) {
            this.isLocked++;
            isFullMap = true;
            game.inventory.hide();
            minimap.className = "topbutton map mini hidden";
            pause.className = "topbutton pause hidden";
            fullmap.className = "topbutton map full";
            updateFullMap();
            game.audio.playAudio(game.audio.audio.sheet1);
        }
    }

    this.hideFullMap=()=>{
        if (isFullMap) {
            this.isLocked--;
            isFullMap = false;
            game.inventory.show();
            minimap.className = "topbutton map mini show";
            pause.className = "topbutton pause show";
            fullmap.className = "topbutton map full hidden";
            game.audio.playAudio(game.audio.audio.sheet1);
        }
    }

    this.goBack=()=>{
        if (canGoBack) {
            canGoBack = false;
            move(position.previousX, position.previousY);
            forceUpdate(true);
        }
    }

    this.onUseItem=(item)=>{
        let
            front = CONST.MOVEMENT[position.direction].up,
            dx = position.x+front.x,
            dy = position.y+front.y,
            cell = game.map[dy] ? game.map[dy][dx] : 0,
            npcs = getItemsAt(dx,dy),
            todo = true;

        if (todo && npcs.length)
            npcs.forEach(npc=>{
                if (todo)
                    todo = !game.events.runEvent({
                        as:npc,
                        item:item,
                        cell:cell,
                        room:position.currentRoom
                    }, [ "onGiveItem", item.id ]);
            })

        if (todo)
            todo = !game.events.runEvent({
                as:item,
                cell:cell,
                room:position.currentRoom
            }, [ "onUse" ]);
    }

    this.openDoor=(cell)=>{
        game.audio.playAudio(game.audio.audio.dooropen1);
        cell.isWall = false;
        cell.isDoor = false;
        cell.walls = [];
        cell.mapSymbol = ".";
        setDirtyWalls(cell);
        forceUpdate();
    }

    this.unlockControls = ()=>{
        return unlockControls();
    }

    this.lockControl=(side)=>{
        return lockControl(side);
    }

    this.unlockControl=(side)=>{
        return unlockControl(side);
    }

    this.initialize=()=>{
        let
            entrance = game.dungeon.rooms.find((room)=>room.room.isEntrance);
        animationFrameNextAt = 0;
        this.isLocked = 0;
        this.isUnlockDelayed = false;
        move(entrance.room.x + entrance.room.entranceX, entrance.room.y + entrance.room.entranceY);
        position.direction = entrance.room.entranceDirection || 0;
        forceUpdate(true);
        scheduleFrame();
        document.body.addEventListener("keydown", onkeyDownEvent);
        document.body.addEventListener("keyup", onkeyUpEvent);
        document.body.addEventListener("pointerdown", onPointerDownEvent);
        document.body.addEventListener("pointerup", onPointerUpEvent);
        document.body.addEventListener("pointerleave", onPointerUpEvent);
        document.body.addEventListener("pointermove", onPointerMoveEvent);
        document.body.appendChild(minimap);
        document.body.appendChild(fullmap);
        document.body.appendChild(pause);  
        document.body.appendChild(tiles.container);
        document.body.appendChild(gestureDot);
    }

    this.quit=()=>{
        game.dungeon.roomsByTomb.forEach(set=>{
            if (set[0].tomb.quit)
                set[0].tomb.quit(game, set);
        });
        if (gameOverContainer.parentNode)
            gameOverContainer.parentNode.removeChild(gameOverContainer);
        document.body.removeEventListener("keydown", onkeyDownEvent);
        document.body.removeEventListener("keyup", onkeyUpEvent);
        document.body.removeEventListener("pointerdown", onPointerDownEvent);
        document.body.removeEventListener("pointerup", onPointerUpEvent);
        document.body.removeEventListener("pointerleave", onPointerUpEvent);
        document.body.removeEventListener("pointermove", onPointerMoveEvent);
        document.body.removeChild(minimap);
        document.body.removeChild(fullmap);
        document.body.removeChild(pause);
        document.body.removeChild(tiles.container);
        document.body.removeChild(gestureDot);
        cancelKeyHold();
        endGesture();
    }

};
