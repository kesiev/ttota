function Dialogue(game) {

    const
        UNLOCK_TIMER = 500,
        AUDIO_FREQUENCY_FAST = 5,
        AUDIO_FREQUENCY_SLOW = 6,
        TEXT_SPEED = 20,
        AUDIO_KEYBOARD = [ "keypress1", "keypress2", "keypress3" ],
        AUDIO_FAKE = [ "beep1" ],
        NEXT = "&#x25BC;",
        NEXTKEYS=[ 87, 38, 83, 40, 65, 37, 68, 39, 13, 32, 27],
        box = document.createElement("div");

    let
        isUnlocked = true,
        unlockedTimeout = 0,
        isFake = false,
        isVisible = false,
        isReady = false,
        toEnd = false,
        textTimestamp = 0,
        isWaitingAnswer,
        keyUnlocked = true,
        audioFreqency = 0,
        samples,
        isSlideShowVisible = false,
        slideShowProjector,
        slideShowTimeout = 0,
        slideShowDiv,
        slideShowHiddenDiv,
        currentAudioTime = 0,
        currentAnswers,
        currentLine,
        currentThen,
        currentPlaceholders,
        currentLines,
        currentText,
        currentBy,
        currentShow,
        currentId,
        currentLinePos;
    
    box.className = "dialogue hidden";

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

    let solvePlaceHolders = (placeholders, line)=>{
        if (line)
            for (let i=0;i<5;i++)
                line = line.replace(/\{([^}]+)\}/g,(m,m1)=>{
                    let
                        parts = m1.split("."),
                        value = placeholders;

                    parts.forEach(part=>{
                        if (value[part] !== undefined)
                            value = value[part];
                    });

                    return value;
                });
        
        return line;
    }

    let formatText = (text)=>{
        return text.replace(/\n/g,"<br>");
    }

    let doWait = ()=>{
        isReady = false;
        setTimeout(()=>{
            isReady = true;
        }, 10);
    }

    let stopShowLetter=(update)=>{
        if (update) {
            textTimestamp = 1;
            showLetter(2);
        } else
            textTimestamp = 0;
    }

    let startShowLetter=()=>{
        if (!textTimestamp) {
            textTimestamp = -1;
            window.requestAnimationFrame(showLetter);
        }
    }

    let playClick = ()=>{
        game.audio.playAudio(PROGRESS.isFake() ? game.audio.audio.beep2 : game.audio.audio.mouseclick1);
    }

    let showLetter=(time)=>{

        if (textTimestamp)
            if (time > textTimestamp) {

                let
                    header = currentBy ? "<span class='header'>[ "+currentBy+" ]</span><br><br>" : "";

                if (samples) {
                    if (!currentAudioTime) {
                        let
                            playSample = samples[Math.floor(Math.random()*samples.length)];

                        samples.forEach(sample=>{
                            game.audio.stopAudio(game.audio.audio[sample]);
                        })

                        game.audio.playAudio(game.audio.audio[playSample], false);
                        currentAudioTime = audioFreqency;
                    } else
                        currentAudioTime--;
                }

                if (currentLinePos < currentText.length) {
                    currentLinePos++;
                    if (currentText[currentLinePos] == "&") {
                        do {
                            currentLinePos++;
                        } while (currentText[currentLinePos] && (currentText[currentLinePos] != ";"));
                    }
                    box.innerHTML = header+formatText(currentText.substr(0,currentLinePos))+"<span class='cursor'>"+CONST.CURSOR[currentLinePos%CONST.CURSOR.length]+"</span>";
                    if (textTimestamp == -1)
                        textTimestamp = time;
                    textTimestamp+=TEXT_SPEED;
                    window.requestAnimationFrame(showLetter);
                } else {
                    textTimestamp = 0;
                    currentShow = false;
                    if (currentLine.options) {
                        let
                            optionsBox = document.createElement("div");

                        optionsBox.className = "options";

                        isWaitingAnswer = true;
                        box.innerHTML = header+formatText(currentText)+"<br>";
                        box.appendChild(optionsBox);
                        currentLine.options.forEach(option=>{
                            let
                                optionDiv = document.createElement("div");

                            optionDiv.className = "option";
                            optionDiv.innerHTML = option.label;

                            optionDiv.addEventListener("click", ()=>{
                                if (isUnlocked) {
                                    playClick();
                                    currentAnswers[option.id] = option.value;
                                    isWaitingAnswer = false;
                                    doNext();
                                }
                            });

                            optionsBox.appendChild(optionDiv);
                        })
                    } else
                        box.innerHTML = header+formatText(currentText)+" <span class='next'>"+NEXT+"</span>";
                }

                box.scrollTo(0, box.scrollHeight);

            } else
                window.requestAnimationFrame(showLetter);

    }

    let endDialogue = ()=>{
        toEnd = false;
        box.innerHTML = "";
        closeImage();
        game.inventory.show();
        game.movement.unlock();
        this.hide();
        if (currentThen) currentThen(currentAnswers);
    }

    let showLines = ()=>{
        if (currentLines[currentId]) {
            currentAudioTime = 0;
            currentLine = currentLines[currentId];
            currentAnswers = {};
            currentText = solvePlaceHolders(currentPlaceholders,currentLine.text);
            currentBy = solvePlaceHolders(currentPlaceholders,currentLine.by);
            currentLinePos = -1;
            currentShow = true;
            isWaitingAnswer = false;
            if (currentLine.slide)
                showImage(currentLine.slide);
            else
                closeImage();

            if (currentLine.audio) {
                samples = currentLine.audio;
                audioFreqency = AUDIO_FREQUENCY_SLOW;
            } else {
                samples = PROGRESS.isFake() ? AUDIO_FAKE : AUDIO_KEYBOARD;
                audioFreqency = AUDIO_FREQUENCY_FAST;
            }

            if (currentLine.showAudio)
                game.audio.playAudio(game.audio.audio[currentLine.showAudio]);

            if (currentLine.audioFreqency)
                audioFreqency = currentLine.audioFreqency;
                            
            if (currentLine.setFake) {
                box.className = "dialogue fake";
                isFake = true;
            }
            if (currentLine.unsetFake) {
                box.className = "dialogue";
                isFake = false;
            }
            if (currentLine.changeNpc && currentLine.npc) {
                game.tools.changeNpc(currentLine.npc, currentLine.changeNpc);
                game.tools.refreshScreen();
            }
            startShowLetter();
            doWait();
        } else
            endDialogue();
    }

    let doNext = ()=>{
        if (isVisible && isReady && isUnlocked) {
            if (currentShow) {
                currentLinePos = currentText.length;
                stopShowLetter(true);
                lockFor(UNLOCK_TIMER);
            } else if (!isWaitingAnswer) {
                stopShowLetter();
                currentId++;
                showLines();    
            }
        }
    }
    
    let onKeyDownEvent = (e)=>{
        if (keyUnlocked && NEXTKEYS.indexOf(e.keyCode) != -1)
            doNext();
        keyUnlocked = false;
    };

    let onKeyUpEvent = (e)=>{
        keyUnlocked = true;
    };

    let closeImage = ()=>{
        if (isSlideShowVisible) {
            if (slideShowTimeout) {
                clearTimeout(slideShowTimeout);
                slideShowTimeout = 0;
            }
            if (slideShowDiv)
                slideShowDiv.className = "slide hide";
            if (slideShowProjector)
                slideShowProjector.className = "slideprojector hide";
            slideShowTimeout = setTimeout(()=>{
                if (slideShowDiv.parentNode)
                    document.body.removeChild(slideShowDiv);
                if (slideShowHiddenDiv.parentNode)
                    document.body.removeChild(slideShowHiddenDiv);
                if (slideShowProjector.parentNode)
                    document.body.removeChild(slideShowProjector);
            },2500)
            isSlideShowVisible = false;
        }
    }

    let showImage = (e)=>{
        let
            swap;

        if (slideShowTimeout) {
            clearTimeout(slideShowTimeout);
            slideShowTimeout = 0;
        }
            
        if (isSlideShowVisible) {
            slideShowDiv.className = "slide hide";
            slideShowDiv.style.zIndex = 2;
        }
        if (!slideShowHiddenDiv)
            slideShowHiddenDiv = document.createElement("div");
        if (!slideShowHiddenDiv.parentNode)
            document.body.appendChild(slideShowHiddenDiv);
        if (!slideShowProjector)
            slideShowProjector = document.createElement("div");
        if (!slideShowProjector.parentNode) {
            slideShowProjector.className = "slideprojector";
            slideShowProjector.style.zIndex = 1;
            document.body.appendChild(slideShowProjector);        
        }
        slideShowHiddenDiv.className = "slide show";
        slideShowHiddenDiv.style.zIndex = 3;
        slideShowHiddenDiv.style.backgroundImage = "url('"+e+"')";
        swap = slideShowHiddenDiv;
        slideShowHiddenDiv = slideShowDiv;
        slideShowDiv = swap;
        isSlideShowVisible = true;
    }

    this.hide=()=>{
        if (isVisible) {
            box.className = "dialogue hidden"+(PROGRESS.isFake() || isFake ? " fake" : "");
            isVisible = false;
            isFake = false;
            stopShowLetter();
        }
    }

    this.show=()=>{
        if (!isVisible) {
            box.className = "dialogue"+(PROGRESS.isFake() || isFake ? " fake" : "");
            isVisible = true;
            lockFor(UNLOCK_TIMER);
        }
    }

    this.say=(placeholders,lines,then)=>{
        if (toEnd)
            endDialogue();
        currentThen = then;
        currentPlaceholders = placeholders;
        currentLines = lines;
        currentId = 0;
        showLines();
        game.inventory.hide();
        game.movement.lock(true);
        this.show();
        toEnd = true;
    }

    this.startGameBreak = ()=>{
        box.style.zIndex = 100;
    }

    this.initialize = ()=>{
        document.body.appendChild(box);
        document.body.addEventListener("pointerdown", doNext);
        document.body.addEventListener("keydown", onKeyDownEvent);
        document.body.addEventListener("keyup", onKeyUpEvent);
        this.hide();
    }

    this.quit = ()=>{
        if (slideShowTimeout) {
            clearTimeout(slideShowTimeout);
            slideShowTimeout = 0;
        }
        if (slideShowDiv && slideShowDiv.parentNode)
            document.body.removeChild(slideShowDiv);
        if (slideShowHiddenDiv && slideShowHiddenDiv.parentNode)
            document.body.removeChild(slideShowHiddenDiv);
        if (slideShowProjector && slideShowProjector.parentNode)
            document.body.removeChild(slideShowProjector);
        document.body.removeChild(box);
        document.body.removeEventListener("pointerdown", doNext);
        document.body.removeEventListener("keydown", onKeyDownEvent);
        document.body.removeEventListener("keyup", onKeyUpEvent);
        slideShowDiv = 0;
        slideShowHiddenDiv = 0;
        slideShowProjector = 0;
    }

    this.box = box;

};
