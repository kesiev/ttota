function Menu(root, audio, triggers) {

    const
        UNLOCK_TIMER = 500,
        TRANSITION_MODULES = 20,
        TRANSITION_DURATION = 600,
        INITIALIZATION_MENU = "initialize",
        DEFAULT_MENU = "title",
        DEFAULT_CREDITS = "credits",
        LOADING_MENU = "loading",
        PAUSE_MENU = "pause",
        COVER_MENU = "cover",
        LOGO_MENU = "logo",
        RESTARTGAME_MENU = "restartgame",
        IMPORTERROR_MENU = "importerror",
        IMPORTCONFIRM_MENU = "importconfirm",
        ELEMENT_TYPES = {
            LOGO: 1,
            OPTIONS: 2,
            LABEL: 3,
            RANKINGS: 4,
            TITLE: 5,
            COVER: 6,
            PUSHER: 7,
            DEVICE_WARNINGS: 8,
            SETTINGS: 9,
            SYMBOL: 10
        },
        TRANSITIONS={
            OPEN:1,
            CLOSE:2,
            IDLE:3,
            FAKEIDLE:4
        },
        MENUS={
            initialize:{
                elements:[
                    {
                        type:ELEMENT_TYPES.DEVICE_WARNINGS
                    },{
                        type:ELEMENT_TYPES.OPTIONS,
                        options:[
                            { initialize:true, label:"Start" }
                        ]
                    }
                ]
            },
            title:{
                elements:[
                    {
                        type:ELEMENT_TYPES.LOGO
                    },{
                        type:ELEMENT_TYPES.OPTIONS,
                        options:[
                            { isStart:true, initializeGame:true },
                            { label:"Settings", gotoMenu:"settings" },
                            { hideOnFake:true, label:"Rankings", gotoMenu:"rankings", soundEffect:"sheet1" },
                            { hideOnFake:true, label:"Credits", gotoMenu:"credits" }
                        ]
                    },{
                        type:ELEMENT_TYPES.PUSHER
                    }
                ]
            },
            loading:{
                elements:[
                    {
                        type:ELEMENT_TYPES.LABEL,
                        label:"Loading... <span class='rollingcursor'></span>"
                    },{
                        id:"progress",
                        className:"progress",
                        type:ELEMENT_TYPES.LABEL,
                        label:"0%"
                    }
                ]
            },
            credits:{
                elements:[
                    {
                        type:ELEMENT_TYPES.TITLE,
                        title:"Credits"
                    },{
                        container:"container htmlcontainer",
                        type:ELEMENT_TYPES.HTML
                    },{
                        type:ELEMENT_TYPES.OPTIONS,
                        options:[
                            { label:"Back", gotoMenu:"title" }
                        ]
                    }
                ]
            },
            settings:{
                elements:[
                    {
                        type:ELEMENT_TYPES.TITLE,
                        title:"Settings"
                    },{
                        container:"container htmlcontainer",
                        type:ELEMENT_TYPES.SETTINGS
                    },{
                        type:ELEMENT_TYPES.OPTIONS,
                        options:[
                            { label:"Back", saveSettings:true, gotoMenu:"title" }
                        ]
                    }
                ]
            },
            pause:{
                elements:[
                    {
                        type:ELEMENT_TYPES.OPTIONS,
                        options:[
                            { label:"Back", unpause:true },
                            { hideOnFake:true, label:"Escape", gotoMenu:"escape" },
                            { label:"Main menu", quitGame:true },
                        ]
                    }
                ]
            },
            escape:{
                elements:[
                    {
                        type:ELEMENT_TYPES.SYMBOL,
                        symbol:"exit"
                    },{
                        type:ELEMENT_TYPES.LABEL,
                        label:"Do you really want to escape?<br><br>This run will end, and I'll judge your play so far a little less harshly than I will when you die."
                    },{
                        type:ELEMENT_TYPES.OPTIONS,
                        options:[
                            { label:"Let me escape!", escape:true },
                            { label:"I want to try harder!", gotoMenu:"pause" },
                        ]
                    }
                ]
            },
            rankings:{
                elements:[
                    {
                        type:ELEMENT_TYPES.TITLE,
                        title:"Rankings"
                    },{
                        container:"container rankingscontainer",
                        type:ELEMENT_TYPES.RANKINGS
                    },{
                        type:ELEMENT_TYPES.OPTIONS,
                        options:[
                            { label:"Back", gotoMenu:"title", soundEffect:"sheet1" }
                        ]
                    }
                ]
            },
            restartgame:{
                elements:[
                    {
                        type:ELEMENT_TYPES.LABEL,
                        label:"Please restart the game for the changes to take effect."
                    },{
                        type:ELEMENT_TYPES.OPTIONS,
                        options:[
                            { label:"Restart game", restartGame:true }
                        ]
                    }
                ]
            },
            importerror:{
                elements:[
                    {
                        type:ELEMENT_TYPES.LABEL,
                        label:"It looks like this save file is corrupt, invalid, or unreadable.<br><br>Please, try with another one!"
                    },{
                        type:ELEMENT_TYPES.OPTIONS,
                        options:[
                            { label:"Back", gotoMenu:"settings" }
                        ]
                    }
                ]
            },
            importconfirm:{
                elements:[
                    {
                        type:ELEMENT_TYPES.SYMBOL,
                        symbol:"warning"
                    },{
                        type:ELEMENT_TYPES.LABEL,
                        label:0
                    },{
                        type:ELEMENT_TYPES.OPTIONS,
                        options:[
                            { label:"Import anyway" },
                            { label:"Cancel", gotoMenu:"settings" }
                        ]
                    }
                ]
            },
            cover:{
                elements:[
                    {
                        type:ELEMENT_TYPES.COVER
                    }
                ]
            },
            logo:{
                elements:[
                    {
                        type:ELEMENT_TYPES.LOGO
                    }
                ]
            },
        };

    let
        isUnlocked = true,
        unlockedTimeout = 0,
        coverData = [];

    function makeDiv(className, parent) {
        let
            div = document.createElement("div");
        div.className = className;
        if (parent)
            parent.appendChild(div);
        return div;
    }

    let
        currentGame,
        elementIds,
        transitionModuleSize = 100/TRANSITION_MODULES,
        transitionModules = [ [], [] ],
        isTransitionRunning = 0,
        transitionCurrent = 0,
        transitionStart = -1,
        transitionModulesPosition = [ [], [] ],
        divs = [ makeDiv("menu"), makeDiv("menu") ],
        transitionModulesContainer = makeDiv("transitionmodules"),
        currentDiv;

    this.isNotPaused = false;
    this.isGameRunning = false;
    this.isGameOver = false;

    let setFullScreen=()=>{
        if (root.requestFullscreen)
            root.requestFullscreen();
        else if (root.webkitRequestFullscreen)
            root.webkitRequestFullscreen();
        else if (root.msRequestFullscreen)
            root.msRequestFullscreen();
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

    let addOption=(to, text, update)=>{
        let
            row = makeDiv("optionrow", to),
            label = makeDiv("optionlabel", row),
            value = makeDiv("optionvalue", row),
            data = {
                row: row,
                label: label,
                value: value
            };

        label.innerHTML = text;

        data.update = ()=>{ update(data) };
        data.update();

        return data;   
    }

    let prepareCredits=()=>{
        let
            credits = TOMBS.credits,
            html = "";

        html = "<div class='banner'></div>";
        html += "<div class='subtitle'>A game by <a target=_blank href='"+CONST.CREDITS.BYURL+"'>"+CONST.CREDITS.BY+"</a></div>";
        html += "<div class='entry url'><a target=_blank href='https://"+CONST.CREDITS.URL+"'>Play here</a></div>";
        html += "<div class='entry url'><a target=_blank href='https://"+CONST.CREDITS.SOURCES+"'>Sources here</a></div>";

        [
            { title: "Code", credits:credits.code, skipLines:true },
            { title: "Graphics", credits:credits.graphics },
            { title: "Music", credits:credits.music },
            { title: "Sounds", credits:credits.sounds },
            { title: "Data", credits:credits.data },
            { title: "Tools", credits:CONST.CREDITS.TOOLS },
            { title: "Libraries", credits:CONST.CREDITS.LIBRARIES },
            { title: "In Memory Of", credits:credits.architects, skipLines:true },
            { title: "Special Thanks", credits:CONST.CREDITS.THANKS, skipLines:true },
        ].forEach(block=>{

            html+="<div class='section'><span class='rollingcursor'></span> "+block.title+" <span class='reverserollingcursor'></div>";
            block.credits.forEach(entry=>{
                html+="<div class='person'>";
                if (entry.url)
                    html+="<a target=_blank href='"+entry.url+"'>";
                html+=entry.person;
                if (entry.url)
                    html+="</a>";
                html+="</div>";
                if (!block.skipLines && entry.line)
                    entry.line.forEach(text=>{
                        html+="<div class='entry'>"+text.line+"</div>";
                        if (text.license)
                            html+="<div class='entry license'>"+text.license+"</div>";
                    })
            })

        })
        html += "<div class='section'><div class='entry license'>Version "+CONST.VERSION+"</div></div>";

        html+="<div class='spacer'></div>";
        
        MENUS.credits.elements[1].html = html;
    }

    let setTransitionModulePosition=(side,id,pos)=>{
        transitionModulesPosition[side][id]=pos;
        if (side)
            transitionModules[side][id].style.transform="translateY("+(pos*100)+"%)";
        else
            transitionModules[side][id].style.transform="translateY("+(-pos*100)+"%)";
    }

    let setTransitionModuleColor=(side,id,color)=>{
        transitionModules[side][id].style.backgroundColor=color;
    }

    for (let i=0;i<TRANSITION_MODULES;i++) {
        let
            upper = makeDiv("transition upper close", transitionModulesContainer),
            lower = makeDiv("transition lower close", transitionModulesContainer);
        
        transitionModules[0].push(upper);
        transitionModules[1].push(lower);
        setTransitionModulePosition(0,i,0);
        setTransitionModulePosition(1,i,0);

        upper.style.width = lower.style.width = (transitionModuleSize+2)+"%";
        upper.style.left = lower.style.left = (i*transitionModuleSize-1)+"%";
    }

    function setTransition(mode) {
        document.body.backgroundColor = "#f00";
        transitionCurrent = mode;
        transitionStart = -1;
        if (!isTransitionRunning)
            animateTransition();
    }

    let animateTransition = ()=>{
        window.requestAnimationFrame((time)=>{
            let
                pos, r, g, b,
                timePassed;

            if (transitionStart == -1)
                transitionStart = time;

            timePassed = time-transitionStart;
            
            switch (transitionCurrent) {
                case TRANSITIONS.OPEN:{
                    if (timePassed >= TRANSITION_DURATION) {
                        for (let i=0;i<TRANSITION_MODULES;i++) {
                            setTransitionModulePosition(0,i,1);
                            setTransitionModulePosition(1,i,1);
                        }
                        transitionCurrent=0;
                        root.removeChild(transitionModulesContainer);
                    } else {
                        if (!transitionModulesContainer.parentNode)
                            root.appendChild(transitionModulesContainer);
                        for (let i=0;i<TRANSITION_MODULES;i++) {
                            pos =Math.sin((0.2+(i/TRANSITION_MODULES*0.6))*Math.PI)*(timePassed/TRANSITION_DURATION*2);
                            setTransitionModulePosition(0,i,pos);
                            setTransitionModulePosition(1,i,pos);
                        }
                    }
                    break;
                }
                case TRANSITIONS.CLOSE:{
                    if (!transitionModulesContainer.parentNode)
                        root.appendChild(transitionModulesContainer);
                    if (timePassed >= TRANSITION_DURATION) {
                        for (let i=0;i<TRANSITION_MODULES;i++) {
                            setTransitionModulePosition(0,i,0);
                            setTransitionModulePosition(1,i,0);
                        }
                        transitionCurrent=0;
                    } else {
                        for (let i=0;i<TRANSITION_MODULES;i++) {
                            pos =(Math.sin((0.2+(i/TRANSITION_MODULES*0.6))*Math.PI)*(2-(timePassed/TRANSITION_DURATION*2)));
                            setTransitionModulePosition(0,i,pos);
                            setTransitionModulePosition(1,i,pos);
                            setTransitionModuleColor(0,i,"#000");
                            setTransitionModuleColor(1,i,"#000");
                        }
                    }
                    break;
                }
                case TRANSITIONS.IDLE:{
                    if (!transitionModulesContainer.parentNode)
                        root.appendChild(transitionModulesContainer);
                    for (let i=0;i<TRANSITION_MODULES;i++) {
                        pos = 0.9+(Math.sin(i*0.4+timePassed/500)*0.05);
                        r = 128+Math.sin(i*0.4+timePassed/500)*50;
                        g = 128+Math.sin(i*0.8+timePassed/500)*50;
                        b = 128+Math.sin(i*0.2+timePassed/500)*50;
                        setTransitionModulePosition(0,i,pos);
                        setTransitionModulePosition(1,i,pos);
                        setTransitionModuleColor(0,i,"rgb("+r+","+g+","+b+")");
                        setTransitionModuleColor(1,i,"rgb("+b+","+g+","+r+")");
                    }
                    break;
                }
                case TRANSITIONS.FAKEIDLE:{
                    if (!transitionModulesContainer.parentNode)
                        root.appendChild(transitionModulesContainer);
                    for (let i=0;i<TRANSITION_MODULES;i++) {
                        pos = 0.9+(Math.sin(i*0.4+timePassed/1000)*0.025);
                        d = 128+Math.sin(i*0.4+timePassed/1000)*50;
                        setTransitionModulePosition(0,i,pos);
                        setTransitionModulePosition(1,i,pos);
                        setTransitionModuleColor(0,i,"rgb(0,0,"+d+")");
                        setTransitionModuleColor(1,i,"rgb("+d+",0,0)");
                    }
                    break;
                }
            }

            if (transitionCurrent)
                animateTransition();
        });
    }

    let pause = ()=>{
        if (this.isNotPaused) {
            this.isNotPaused = false;
            setTransition(TRANSITIONS.CLOSE);
            gotoMenu(PAUSE_MENU);
        }
    }

    let unpause = ()=>{
        if (!this.isNotPaused) {
            this.isNotPaused = true;
            closeMenu(()=>{
                setTransition(TRANSITIONS.OPEN);
            });
        }
    }

    let quit = ()=>{
        this.isGameRunning = false;
        this.isNotPaused = false;
        this.isGameOver = true;
        triggers.quitGame(currentGame, ()=>{
            gotoMenu(DEFAULT_MENU);
            setIdleAnimation();
            setIdleMusic();
        });
    }

    let gameOver = ()=>{
        if (!this.isGameOver) {
            this.isGameOver = true;
            setTransition(TRANSITIONS.CLOSE);
            setTimeout(()=>{
                quit();
            },550)
        }
    }

    let loadingCallback = (count,all)=>{
        let
            percent = Math.ceil(count/all*100);
        elementIds.progress.innerHTML = percent+"%";
    }

    let playStart = ()=>{
        audio.playAudio(PROGRESS.isFake() ? audio.audio.confirm1 : audio.audio.dooropen1);
    }

    let playClick = ()=>{
        audio.playAudio(PROGRESS.isFake() ? audio.audio.beep2 : audio.audio.mouseclick1);
    }

    let setIdleMusic = () => {
        if (PROGRESS.isFake())
            audio.mixerPlayMusic(audio.audio.mystery1);
        else
            audio.mixerPlayMusic(audio.audio.title1);
    }

    let setIdleAnimation = () =>{
        if (PROGRESS.isFake())
            setTransition(TRANSITIONS.FAKEIDLE);
        else
            setTransition(TRANSITIONS.IDLE);
    }

    let initializeGame = () =>{
        playStart();
        this.isGameRunning = true;
        this.isNotPaused = false;
        this.isGameOver = false;
        setTransition(TRANSITIONS.CLOSE);
        setTimeout(()=>{
            closeMenu(()=>{
                gotoMenu(LOADING_MENU);
                triggers.initializeGame(loadingCallback,
                    (game)=>{
                        currentGame = game;
                        gotoMenu(COVER_MENU);
                        setTimeout(()=>{
                            this.isNotPaused = true;
                            triggers.startGame(currentGame);
                        },3500);
                    }
                );
            });
        },550);
    }

    let renderMenu=(data, node)=>{
        elementIds = {};
        data.elements.forEach(element=>{
            if (!element.hideOnFake || !PROGRESS.isFake()) {

                let
                    container = makeDiv(element.container || "container" + (PROGRESS.isFake() ? " fake" : ""), node);
                switch (element.type) {
                    case ELEMENT_TYPES.PUSHER:{
                        makeDiv("pusher", container);
                        break;
                    }
                    case ELEMENT_TYPES.LOGO:{
                        let
                            logo = makeDiv("logo"+ (PROGRESS.isFake() ? "" : " animated"), container);

                        makeDiv("thetombofthe", logo);
                        makeDiv("software", logo);
                        makeDiv("architects", logo);
                        makeDiv("maze", logo);

                        elementIds.logo = logo;

                        break;
                    }
                    case ELEMENT_TYPES.TITLE:{
                        let
                            div = makeDiv("title", container);
                        div.innerHTML = "<span class='rollingcursor'></span> "+element.title+" <span class='reverserollingcursor'></span>";
                        break;
                    }
                    case ELEMENT_TYPES.COVER:{
                        coverData.forEach((row,id)=>{
                            let
                                div = makeDiv("cover id-"+id, container);
                        
                            div.innerHTML = row;
                        });

                        setTimeout(()=>{
                            closeMenu(()=>{
                                setTransition(TRANSITIONS.OPEN);
                            })
                        }, 3000);

                        break;
                    }
                    case ELEMENT_TYPES.LABEL:{
                        let
                            div = makeDiv("label "+(element.className || ""), container);

                        div.innerHTML = element.label;

                        if (element.id)
                            elementIds[element.id] = div;
                        break;
                    }
                    case ELEMENT_TYPES.RANKINGS:{
                        let
                            div = makeDiv("rankings", container),
                            list = PROGRESS.chartsToSummary([]);
                        list.forEach(row=>{
                            PROGRESS.renderSummaryRow(row, div);
                        })
                        break;
                    }
                    case ELEMENT_TYPES.HTML:{
                        let
                            div = makeDiv("html", container);

                        makeDiv("htmlshade top", container),
                        makeDiv("htmlshade bottom", container);

                        div.innerHTML = element.html;
                        break;
                    }
                    case ELEMENT_TYPES.SETTINGS:{
                        let
                            div = makeDiv("html "+ (PROGRESS.isFake() ? " fake" : ""), container);

                        makeDiv("htmlshade bottom", container);

                        let fullScreenOnStartOption = addOption(div, "Fullscreen", (option)=>{
                            option.value.innerHTML = "<div class='optionbutton'>"+(PROGRESS.save.fullScreenOnStartOption ? "Yes" : "No")+"</div>";
                        })

                        fullScreenOnStartOption.value.addEventListener("click",()=>{
                            if (isUnlocked) {
                                PROGRESS.setFlag("fullScreenOnStartOption", !PROGRESS.save.fullScreenOnStartOption);
                                if (PROGRESS.save.fullScreenOnStartOption)
                                    setFullScreen();
                                fullScreenOnStartOption.update();
                                playClick();
                            }
                        })

                        let fullScreenOnMenuOption = addOption(div, "Set fullscreen on &#x2261;", (option)=>{
                            option.value.innerHTML = "<div class='optionbutton'>"+(PROGRESS.save.fullScreenOnMenu ? "Yes" : "No")+"</div>";
                        })

                        fullScreenOnMenuOption.value.addEventListener("click",()=>{
                            if (isUnlocked) {
                                PROGRESS.setFlag("fullScreenOnMenu", !PROGRESS.save.fullScreenOnMenu);
                                fullScreenOnMenuOption.update();
                                playClick();
                            }
                        })

                        let cameraPan = addOption(div, "3D Effect", (option)=>{
                            option.value.innerHTML = "<div class='optionbutton'>"+(PROGRESS.save.cameraPan ? "Yes" : "No")+"</div>";
                        })

                        cameraPan.value.addEventListener("click",()=>{
                            if (isUnlocked) {
                                PROGRESS.setFlag("cameraPan", !PROGRESS.save.cameraPan);
                                cameraPan.update();
                                playClick();
                            }
                        })

                        let musicOption = addOption(div, "Music", (option)=>{
                            option.value.innerHTML = "<div class='optionbutton'>"+(PROGRESS.save.settingsAudioMusicEnabled ? "Yes" : "No")+"</div>";
                        })

                        musicOption.value.addEventListener("click",()=>{
                            if (isUnlocked) {
                                PROGRESS.setFlag("settingsAudioMusicEnabled", !PROGRESS.save.settingsAudioMusicEnabled);
                                audio.setMusicEnabled(PROGRESS.save.settingsAudioMusicEnabled);
                                setIdleMusic();
                                musicOption.update();
                                playClick();
                            }
                        })

                        let soundsOption = addOption(div, "Sound effects", (option)=>{
                            option.value.innerHTML = "<div class='optionbutton'>"+(PROGRESS.save.settingsAudioEffectsEnabled ? "Yes" : "No")+"</div>";
                        })

                        soundsOption.value.addEventListener("click",()=>{
                            if (isUnlocked) {
                                PROGRESS.setFlag("settingsAudioEffectsEnabled", !PROGRESS.save.settingsAudioEffectsEnabled);
                                audio.setEffectsEnabled(PROGRESS.save.settingsAudioEffectsEnabled);
                                soundsOption.update();
                                playClick();
                            }
                        })

                        let effectsVolumeOption = addOption(div, "Effects volume", (option)=>{

                            option.value.innerHTML = "";

                            let
                                value = Math.floor(10*PROGRESS.save.settingsAudioEffectsVolume),
                                decrease = makeDiv("optionbutton", option.value),
                                label = makeDiv("optiontext", option.value),
                                increase = makeDiv("optionbutton", option.value);

                            decrease.innerHTML = "-";
                            increase.innerHTML = "+";
                            label.innerHTML = value;

                            increase.addEventListener("click",()=>{
                                if (isUnlocked) {
                                    value++;
                                    if (value > 10) value = 10;
                                    
                                    PROGRESS.setFlag("settingsAudioEffectsVolume", value/10);
                                    audio.setVolume(PROGRESS.save.settingsAudioEffectsVolume);
                                    effectsVolumeOption.update();
                                    playClick();
                                }
                            })

                            decrease.addEventListener("click",()=>{
                                if (isUnlocked) {
                                    value--;
                                    if (value < 1) value = 1;
                                    
                                    PROGRESS.setFlag("settingsAudioEffectsVolume", value/10);
                                    audio.setVolume(PROGRESS.save.settingsAudioEffectsVolume);
                                    effectsVolumeOption.update();
                                    playClick();
                                }
                            })

                        })

                        let musicVolumeOption = addOption(div, "Music volume", (option)=>{

                            option.value.innerHTML = "";

                            let
                                value = Math.floor(10*PROGRESS.save.settingsAudioMusicVolume),
                                decrease = makeDiv("optionbutton", option.value),
                                label = makeDiv("optiontext", option.value),
                                increase = makeDiv("optionbutton", option.value);

                            decrease.innerHTML = "-";
                            increase.innerHTML = "+";
                            label.innerHTML = value;

                            increase.addEventListener("click",()=>{
                                if (isUnlocked) {
                                    value++;
                                    if (value > 10) value = 10;
                                    
                                    PROGRESS.setFlag("settingsAudioMusicVolume", value/10);
                                    audio.setMusicVolume(PROGRESS.save.settingsAudioMusicVolume);
                                    musicVolumeOption.update();
                                    playClick();
                                }
                            })

                            decrease.addEventListener("click",()=>{
                                if (isUnlocked) {
                                    value--;
                                    if (value < 1) value = 1;
                                    
                                    PROGRESS.setFlag("settingsAudioMusicVolume", value/10);
                                    audio.setMusicVolume(PROGRESS.save.settingsAudioMusicVolume);
                                    musicVolumeOption.update();
                                    playClick();
                                }
                            })

                        })

                        addOption(div, "Export save data", (option)=>{

                            let
                                exportButton = makeDiv("optionbutton", option.value);

                            exportButton.innerHTML = "Save";

                            exportButton.addEventListener("click",()=>{
                                PROGRESS.exportSave();
                            })

                        })

                        addOption(div, "Import save data", (option)=>{

                            let
                                exportButton = makeDiv("optionbutton", option.value);

                            exportButton.innerHTML = "Load";

                            exportButton.addEventListener("click",()=>{
                                PROGRESS.importSave(
                                    ()=>{ gotoMenu(RESTARTGAME_MENU); },
                                    ()=>{ gotoMenu(IMPORTERROR_MENU); },
                                    (saveVersion, gameVersion, onOk)=>{
                                        MENUS[IMPORTCONFIRM_MENU].elements[1].label = "The save file you're importing is for version "+saveVersion+" of the game while you're playing version "+gameVersion+".<br><br>If imported, the game may not function properly.<br><br>Do you want to continue?";
                                        MENUS[IMPORTCONFIRM_MENU].elements[2].options[0].run = onOk;
                                        gotoMenu(IMPORTCONFIRM_MENU);
                                    }
                                );
                            })

                        })

                        break;
                    }
                    case ELEMENT_TYPES.SYMBOL:{
                        makeDiv(element.symbol, container);
                        break;
                    }
                    case ELEMENT_TYPES.DEVICE_WARNINGS:{
                        if (DEVICE.warnings.length) {
                            makeDiv("warning", container);
                            DEVICE.warnings.forEach(warning=>{
                                makeDiv("label", container).innerHTML = warning;
                            })
                        }
                        break;
                    }
                    case ELEMENT_TYPES.OPTIONS:{
                        element.options.forEach(option=>{

                            if (!option.hideOnFake || !PROGRESS.isFake()) {
                                let
                                    div = makeDiv("option", container);

                                div.innerHTML = option.isStart ? PROGRESS.getStartButtonLabel() : option.label;
                                
                                div.addEventListener("click",()=>{
                                    if (node.isReady && isUnlocked) {
                                        node.isReady = false;
                                        if (option.saveSettings)
                                            PROGRESS.storeData();
                                        if (option.run)
                                            option.run();
                                        else if (option.restartGame)
                                            location.reload();
                                        else if (option.initialize) {
                                            if (PROGRESS.save.fullScreenOnStartOption)
                                                setFullScreen();
                                            setIdleAnimation();
                                            setIdleMusic();
                                            gotoMenu(DEFAULT_MENU);
                                        } else if (option.gotoMenu) {
                                            if (option.soundEffect)
                                                audio.playAudio(audio.audio[option.soundEffect]);
                                            else
                                                playClick();
                                            gotoMenu(option.gotoMenu);
                                        } else if (option.initializeGame) {
                                            if (!PROGRESS.isFake())
                                                div.className+=" starting";
                                            initializeGame();
                                        } else if (option.quitGame) {
                                            playClick();
                                            quit();
                                        } else if (option.unpause) {
                                            playClick();
                                            unpause();
                                        } else if (option.escape) {
                                            currentGame.movement.gameOver(CONST.GAMEOVER.ESCAPE);
                                            unpause();
                                        }
                                    }
                                })
                            }
                        })
                        break;
                    }
                }
            }
        })
    }

    function closeMenu(cb) {
        let
            nextCurrentDiv = (currentDiv+1)%2,
            div1 = divs[currentDiv],
            div2 = divs[nextCurrentDiv];
        div1.isReady = false;
        div1.className += " leave";
        currentDiv = 0;
        if (div2.parentNode)
            div2.parentNode.removeChild(div2);
        setTimeout(()=>{
            if (div1.parentNode) {
                div1.innerHTML = "";
                div1.parentNode.removeChild(div1);
            }
            cb();
        },550)
    }

    function gotoMenu(menu) {
        currentMenu = menu;
        if (currentDiv === undefined) {
            currentDiv = 0;
            divs[0].isReady = true;
            divs[0].innerHTML = "";
            renderMenu(MENUS[menu], divs[0]);
            root.appendChild(divs[0]);
            currentDiv = 0;
        } else {
            let
                nextCurrentDiv = (currentDiv+1)%2;
                div1 = divs[currentDiv],
                div2 = divs[nextCurrentDiv];
            div1.isReady = false;
            div1.className += " leave";
            div2.innerHTML = "";
            if (div2.parentNode)
                div2.parentNode.removeChild(div2);
            div2.isReady = true;
            renderMenu(MENUS[menu], div2);
            div2.className = "menu";
            root.appendChild(div2);
            currentDiv = nextCurrentDiv;
        }
        lockFor(UNLOCK_TIMER);
    }

    this.setCoverData = (data)=>{
        coverData = data;
    }

    this.pause=function (game) {
        if (PROGRESS.save.fullScreenOnMenu)
            setFullScreen();
        currentGame = game;
        pause();
    }

    this.gameOver=function(game) {
        currentGame = game;
        gameOver();
    }

    this.startGameBreak=function(game, done) {
        currentGame = game;
        this.isGameRunning = false;
        this.isNotPaused = false;
        this.isGameOver = true;
        setTransition(TRANSITIONS.CLOSE);
        setTimeout(()=>{
            triggers.startGameBreak(game, (game)=>{
                currentGame = game;
                gotoMenu(LOGO_MENU);
                done();
            });
        },550);
    }

    this.progressStory=function(game) {
        currentGame = game;
        this.isGameRunning = false;
        this.isNotPaused = false;
        this.isGameOver = true;
        setTransition(TRANSITIONS.CLOSE);
        setTimeout(()=>{
            PROGRESS.progressStory(true);
            triggers.quitGame(currentGame, ()=>{
                this.isGameRunning = true;
                this.isNotPaused = false;
                this.isGameOver = false;
                closeMenu(()=>{
                    gotoMenu(LOADING_MENU);
                    triggers.initializeGame(loadingCallback,
                        (game)=>{
                            currentGame = game;
                            gotoMenu(COVER_MENU);
                            setTimeout(()=>{
                                this.isNotPaused = true;
                                triggers.startGame(currentGame);
                            },3500);
                        }
                    );
                });
            });
        },550)   
    }

    this.fixTitle=function() {
        elementIds.logo.className = "logo animated";
    }

    this.resetFixedGame=function(game) {
        currentGame = game;
        setTransition(TRANSITIONS.CLOSE);
        PROGRESS.storeData();
        triggers.resetFixedGame(currentGame, ()=>{
            gotoMenu(DEFAULT_MENU);
            setIdleAnimation();
            setIdleMusic();
        });
    }

    this.resetGame=function(game) {
        currentGame = game;
        setTransition(TRANSITIONS.CLOSE);
        PROGRESS.storeData();
        triggers.resetGame(currentGame, ()=>{
            setTimeout(()=>{
                gotoMenu(DEFAULT_MENU);
                setIdleAnimation();
                setIdleMusic();
            },2000);
        });
    }

    this.goToCredits=function(game) {
        currentGame = game;
        setTransition(TRANSITIONS.CLOSE);
        PROGRESS.storeData();
        setTimeout(()=>{
            triggers.resetGame(currentGame, ()=>{
                setTimeout(()=>{
                    gotoMenu(DEFAULT_CREDITS);
                    setIdleAnimation();
                    setIdleMusic();
                },1000);
            })
        },550);
    }

    this.initialize = ()=>{
        gotoMenu(LOADING_MENU);
        triggers.load(
            loadingCallback,
            ()=>{
                loadingCallback(1,1);
                closeMenu(()=>{
                    TOMBS.initialize();
                    prepareCredits();
                    if (CONST.DEBUG.quickStart)
                        initializeGame();
                    else
                        gotoMenu(INITIALIZATION_MENU);
                })
            }
        );
    }

}