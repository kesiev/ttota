function GenerateViewport(out,p,vw,vh,x,y,cx,cy,s) {

    function makeTile(set,into,xc,i,j,s,z,t) {
        let
            div;

        if (!set[i]) set[i]=[];
        if (!set[i][j]) {
            if (CONST.COMPAT.noWrap) {
                div = document.createElement("canvas");
                div._texture = div;
                div._transform = t+" ";
            } else {
                div = document.createElement("div");
                div.style.overflow = "hidden";
                div.style.width = s+"px";
                div.style.height = s+"px";
                div._texture = document.createElement("canvas");
                div.appendChild(div._texture);
                div._transform = "";
            }
            div._texture._ctx = div._texture.getContext("2d");
            set[i][j]=div;
        } else
            div = set[i][j];

        div._texture.style.left = div._texture.style.top = "0px";
        div._texture.width = s;
        div._texture.height = s;
        div._texture._hwidth = s/2;
        div._texture._hheight = s/2;
        div._texture.style.position = div.style.position = "absolute";
        // div._texture.style.border="1px solid "+((i+j)%2?"#f00":"#0f0");
        
        div.style.transform=t;
        div.style.zIndex=z;

        return div;
    }

    let
        div,
        isCss = CONST.COMPAT.cssFilters,
        xc=cx*s,
        yc=(cy+0.5)*s,
        yt=(y-1)*s,
        xvc=(vw-s)/2,
        yvc=(vh-s)/2,
        dyc=vh-s;

    if (!out) {
        let
            container = document.createElement("div"),
            effects = document.createElement("div"),
            camera = document.createElement("div"),
            skybox = document.createElement("div");

        container.style.overflow="hidden";
        
        camera.style.perspective=p+"px";
        
        effects.style.left = skybox.style.left = camera.style.left = container.style.left = "0px";
        effects.style.top = skybox.style.top = camera.style.top = container.style.top = "0px";
        effects.style.width = skybox.style.width = camera.style.width = container.style.width = vw+"px";
        effects.style.height = skybox.style.height = camera.style.height = container.style.height = vh+"px";
        effects.style.position = skybox.style.position = camera.style.position = container.style.position = "absolute";

        skybox.style.backgroundRepeat = "no-repeat";
        skybox.style.backgroundSize = "auto 100%";

        out = {
            effects:effects,
            container:container,
            camera:camera,
            skybox:skybox,
            floor:[],
            ceiling:[],
            sideWalls:[],
            faceWalls:[],
            items:[]
        }

        container.appendChild(skybox);
        container.appendChild(camera);
        container.appendChild(effects);
    }

    out.renderMaps=[[],[],[],[]];
    out.itemMaps=[[],[],[],[]];
    
    for (let i=0;i<=x;i++) {
        
        let
            isRight = i>(x/2);

        for (let j=0;j<y;j++) {
            if (i<x) {
                let
                    isFront = ((j == 0) && (i == (x-1)/2));

                div = makeTile(out.floor,out.camera,xc,i,j,s,1,"rotateX(90deg) translateX("+((i*s)-xc+xvc)+"px) translateY("+(yt-(j*s)-yc+dyc)+"px) translateZ(-"+(s/2+yvc)+"px)");
                out.renderMaps[0].push([
                    { div:div, x:i-cx, y:-j, key:"floor", id:0, depth:j, isFloor:true }
                ]);
                out.renderMaps[1].push([
                    { div:div, x:j, y:i-cx, key:"floor", id:0, depth:j, rotate:-90, isFloor:true }
                ]);
                out.renderMaps[2].push([
                    { div:div, x:-i+cx, y:j, key:"floor", id:0, depth:j, rotate:-180, isFloor:true }
                ]);
                out.renderMaps[3].push([
                    { div:div, x:-j, y:-i+cx, key:"floor", id:0, depth:j, rotate:-270, isFloor:true }
                ]);
                div = makeTile(out.ceiling,out.camera,xc,i,j,s,1,"rotateX(-90deg) translateX("+((i*s)-xc+xvc)+"px) translateY("+(yt+(j*s)-yc+dyc)+"px) translateZ(-"+(s/2+yvc)+"px)");
                out.renderMaps[0].push([
                    { div:div, x:i-cx, y:-j, key:"ceiling", id:0, depth:j, rotate:180, isCeiling:true }
                ]);
                out.renderMaps[1].push([
                    { div:div, x:j, y:i-cx, key:"ceiling", id:0, depth:j, rotate:-90, isCeiling:true }
                ]);
                out.renderMaps[2].push([
                    { div:div, x:-i+cx, y:j, key:"ceiling", id:0, depth:j, isCeiling:true }
                ]);
                out.renderMaps[3].push([
                    { div:div, x:-j, y:-i+cx, key:"ceiling", id:0, depth:j, rotate:90, isCeiling:true }
                ]);
                div=makeTile(out.faceWalls,out.camera,xc,i,j,s,2+4*(vh-j),"translateX("+((i*s)-xc+xvc)+"px) translateY("+yvc+"px) translateZ("+(-s*0.5-(j*s)+yvc*2)+"px)");
                out.renderMaps[0].push([
                    { div:div, x:i-cx, y:-j, key:"walls", id:0, isFaceWall:true, depth:j},
                    { div:div, x:i-cx, y:-j-1, key:"walls", id:2, isFaceWall:true, depth:j},
                ]);
                out.renderMaps[1].push([
                    { div:div, x:j, y:i-cx, key:"walls", id:1, isFaceWall:true, depth:j},
                    { div:div, x:j+1, y:i-cx, key:"walls", id:3, isFaceWall:true, depth:j},
                ]);
                out.renderMaps[2].push([
                    { div:div, x:-i+cx, y:j, key:"walls", id:2, isFaceWall:true, depth:j},
                    { div:div, x:-i+cx, y:j+1, key:"walls", id:0, isFaceWall:true, depth:j},
                ]);
                out.renderMaps[3].push([
                    { div:div, x:-j, y:-i+cx, key:"walls", id:3, isFaceWall:true, depth:j},
                    { div:div, x:-j-1, y:-i+cx, key:"walls", id:1, isFaceWall:true, depth:j},
                ]);
                div=makeTile(out.items,out.camera,xc,i,j,s,2+4*(vh-j)+3,"translateX("+((i*s)-xc+xvc)+"px) translateY("+yvc+"px) translateZ("+(s*0.25-(j*s)+yvc*2)+"px)");
                out.itemMaps[0].push([
                    { div:div, x:i-cx, y:-j, depth:j, isFront:isFront },
                ]);
                out.itemMaps[1].push([
                    { div:div, x:j, y:i-cx, depth:j, isFront:isFront },
                ]);
                out.itemMaps[2].push([
                    { div:div, x:-i+cx, y:j, depth:j, isFront:isFront },
                ]);
                out.itemMaps[3].push([
                    { div:div, x:-j, y:-i+cx, depth:j, isFront:isFront },
                ]);
            }

            if (isRight) {
                div=makeTile(out.sideWalls,out.camera,xc,i,j,s,2+4*(vh-j)+1,"rotateY(-90deg) translateZ(-"+((i*s)-s*0.5+xvc-xc)+"px) translateY("+yvc+"px) translateX("+((-j*s)-dyc)+"px)");
                out.renderMaps[0].push([
                    { div:div, x:i-cx-1, y:-j, key:"walls", id:1, isSideWall:true, depth:j, rotate:isCss ? 180 : 0, flipX:isCss ? 1 : 0},
                    { div:div, x:i-cx, y:-j, key:"walls", id:3, isSideWall:true, depth:j}
                ]);
                out.renderMaps[1].push([
                    { div:div, x:j, y:i-cx-1, key:"walls", id:2, isSideWall:true, depth:j, rotate:isCss ? 180 : 0, flipX:isCss ? 1 : 0},
                    { div:div, x:j, y:i-cx, key:"walls", id:0, isSideWall:true, depth:j}
                ]);
                out.renderMaps[2].push([
                    { div:div, x:-i+cx+1, y:j, key:"walls", id:3, isSideWall:true, depth:j, rotate:isCss ? 180 : 0, flipX:isCss?  1 : 0},
                    { div:div, x:-i+cx, y:j, key:"walls", id:1, isSideWall:true, depth:j}
                ]);
                out.renderMaps[3].push([
                    { div:div, x:-j, y:-i+cx, key:"walls", id:2, isSideWall:true, depth:j},
                    { div:div, x:-j, y:-i+cx+1, key:"walls", id:0, isSideWall:true, depth:j, rotate:isCss ? 180 : 0, flipX:isCss ? 1 : 0}
                ]);
            } else {
                div=makeTile(out.sideWalls,out.camera,xc,i,j,s,2+4*(vh-j)+2,"rotateY(90deg) translateZ("+((i*s)-s*0.5+xvc-xc)+"px) translateY("+yvc+"px) translateX("+((j*s)-dyc)+"px)");
                out.renderMaps[0].push([
                    { div:div, x:i-cx-1, y:-j, key:"walls", id:1, isSideWall:true, depth:j},
                    { div:div, x:i-cx, y:-j, key:"walls", id:3, isSideWall:true, depth:j, rotate:isCss ? 180 : 0, flipX:isCss ? 1 : 0}
                ]);
                out.renderMaps[1].push([
                    { div:div, x:j, y:i-cx-1, key:"walls", id:2, isSideWall:true, depth:j},
                    { div:div, x:j, y:i-cx, key:"walls", id:0, isSideWall:true, depth:j, rotate:isCss ? 180 : 0, flipX:isCss? 1 : 0}
                ]);
                out.renderMaps[2].push([
                    { div:div, x:-i+cx+1, y:j, key:"walls", id:3, isSideWall:true, depth:j},
                    { div:div, x:-i+cx, y:j, key:"walls", id:1, isSideWall:true, depth:j, rotate:isCss ? 180 : 0, flipX:isCss ? 1 : 0}
                ]);
                out.renderMaps[3].push([
                    { div:div, x:-j, y:-i+cx, key:"walls", id:2, isSideWall:true, depth:j, rotate: isCss ? 180 : 0, flipX:isCss ? 1 : 0},
                    { div:div, x:-j, y:-i+cx+1, key:"walls", id:0, isSideWall:true, depth:j}
                ]);
            }
        }

    }

    // --- Apply defaults

    out.renderMaps.forEach(map=>{
        map.forEach(options=>{
            options.forEach(option=>{
                if (!option.flipX) option.flipX = 0;
                if (!option.flipY) option.flipY = 0;
                if (!option.rotate) option.rotate = 0;
                if (!isCss)
                    option.rotate *= CONST.DEGTORAD;
            })
            
        })
    })

    return out;
}
