function UI(game) {

    const
        ROUND_SCALE = false,
        FLICK_RATIO = 10;

    function makeShade(side) {
        let
            div = document.createElement("div");
        div.className="shade "+side;
        document.body.appendChild(div);
        return div;
    }

    let
        screenWidth = parseFloat(game.movement.container.style.width),
        screenHeight = parseFloat(game.movement.container.style.height),
        leftShade,
        rightShade,
        topShade,
        bottomShade;

    game.movement.container.className = "screen";

    let arrange = ()=>{
        let
            scale,
            width,
            height,
            left,
            top,
            windowWidth=document.body.clientWidth,
            windowHeight=document.body.clientHeight;

        if (windowWidth > windowHeight)
            scale = windowHeight/screenHeight;
        else
            scale = windowWidth/screenWidth;

        if (ROUND_SCALE)
            scale = Math.floor(scale);

        width = screenWidth*scale;
        height = screenHeight*scale;
        left = ((windowWidth-width)/2);
        top = ((windowHeight-height)/2);

        game.movement.container.style.transform = "scale("+scale+")";
        game.movement.container.style.left = left+"px";
        game.movement.container.style.top = top+"px";

        if (left) {
            leftShade.style.display="block";
            leftShade.style.left=left+"px";
            rightShade.style.display="block";
            rightShade.style.left=(left+width-19)+"px";
        } else {
            leftShade.style.display="none";
            rightShade.style.display="none";
        }

        if (top) {
            topShade.style.display="block";
            topShade.style.top=top+"px";
            bottomShade.style.display="block";
            bottomShade.style.top=(top+height-19)+"px";
        } else {
            topShade.style.display="none";
            bottomShade.style.display="none";
        }

        this.flickSize = Math.min(windowHeight, windowWidth) / FLICK_RATIO;

        game.inventory.refreshScroll();

    }

    this.initialize=()=>{
        leftShade = makeShade("left"),
        rightShade = makeShade("right"),
        topShade = makeShade("top"),
        bottomShade = makeShade("bottom");
        window.addEventListener("resize",arrange);
        arrange();
    }

    this.quit=()=>{
        document.body.removeChild(leftShade);
        document.body.removeChild(rightShade);
        document.body.removeChild(topShade);
        document.body.removeChild(bottomShade);
        window.removeEventListener("resize",arrange);
    }

};
