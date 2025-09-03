let CONST=(function(){
    
    const
        FONTMAP = [
            [ "0","1","2","3","4","5","6","7","8","9" ],
            [ "A","B","C","D","E","F","G","H","I","J" ],
            [ "K","L","M","N","O","P","Q","R","S","T" ],
            [ "U","V","W","X","Y","Z","+","-","*","/" ],
            [
                "&#x2191;",
                "&#x2192;",
                "&#x2193;",
                "&#x2190;",
                "?",
                "!",
                "&#x2660;",
                "&#x2663;",
                "&#x2665;",
                "&#x2666;"
            ],[
                "&#x25B2;",
                "&#x25BA;",
                "&#x25BC;",
                "&#x25C4;",
                "=",
                ":"
            ]
        ],
        ANGLES=[
            Math.PI,
            Math.PI*0.5,
            0,
            Math.PI*1.5,
        ],
        SIGHT_ANGLE_FROM = -0.7,
        SIGHT_ANGLE_TO = 0.7,
        SIGHT_ANGLE_STEP = 0.01,
        SIGHT_RAY_STEP = 0.9,
        SIGHT_RAY_TIMES = 8;

    let
        VIEWMAPS,
        TEXTURESFONT = {},
        ITEMSFONT = {};

    VIEWMAPS = ANGLES.map(angle=>{

        let
            raysCache = {},
            rays = [],
            delta = SIGHT_ANGLE_FROM;

        do {
            let
                raySignature = "",
                cache = {},
                ray = [],
                sin = Math.sin(angle+delta),
                cos = Math.cos(angle+delta);

            for (let i=0;i<SIGHT_RAY_TIMES;i++) {

                let
                    dx = Math.floor(0.5+sin*(i*SIGHT_RAY_STEP)),
                    dy = Math.floor(0.5+cos*(i*SIGHT_RAY_STEP)),
                    signature = dx+","+dy;

                raySignature+=signature+"-";

                if (!cache[signature]) {
                    ray.push({x:dx, y:dy});
                    cache[signature] = true;
                }
            }

            if (!raysCache[raySignature]) {
                rays.push(ray);
                raysCache[raySignature] = true;
            }

            delta +=SIGHT_ANGLE_STEP;
        } while (delta<=SIGHT_ANGLE_TO);

        return rays;
    });

    for (let y=0;y<FONTMAP.length;y++)
        for (let x=0;x<FONTMAP[0].length;x++) {
            TEXTURESFONT[FONTMAP[y][x]]={ image:"images/text.png", imageX:x, imageY:y };
            ITEMSFONT[FONTMAP[y][x]]={ image:"images/item-text.png", imageX:x, imageY:y };
        }

    return {
        VERSION:"0.1b",
        DEBUG:{
            seed:0, // Use a specific seed (DEFAULT:0)
            seedDelta:0, // Delta seed starting from today's (DEFAULT:0)
            tombId:0, // Generate a specific tomb IDs dungeon (DEFAULT: 0)
            progressiveSeeds: false, // Play the next seed in checkpoints (DEFAULT: false)
            decorations: false, // Debug the decorable walls (DEFAULT: false)
            openDoors: false, // Open the doors without needing a key (DEFAULT: false)
            noClip: false, // Pass thru walls (DEFAULT: false)
            noMoney: false, // Payments in Golden Coins are always allowed (DEFAULT: false)
            showMap: false, // Show the dungeon full map at beginning (DEFAULT:false)
            quickStart: false, // Starts the game right after loading (DEFAULT:false)
            debugPlaque: false, // Add debug info to the plaque (DEFAULT:false)
            showDecorations: false, // Show where the decorations are (DEFAULT:false)
            hintsOnSameRoom: false, // Show hints on the same room (DEFAULT:false)
            forceHints: false, // Add hints on protected cells (DEFAULT:false)
            setSolved:false, // Set isSolved on all rooms (DEFAULT:false)
            showLogs:false, // Show logs (DEFAULT:false)
            debugItem:false, // Add a fake item to test inventory priority and trigger game events (DEFAULT:false)
        },
        COMPAT:{
            noWrap:true, // Remove the DIV wrapping canvas
            cssFilters:false, // CSS filters and rotation to canvas instead of canvas filters and rotations.
            noFilterFront:false // Disable filters on front element. TRUE for Firefox due to perspective/translateZ/filter combo bug.
        },
        CREDITS:{
            UNKNOWN:"(Unknown)",
            ANONYMOUS:"(Anonymous)",
            BY:"KesieV",
            BYURL:"https://www.kesiev.com",
            URL:"www.kesiev.com/architects",
            SOURCES:"github.com/kesiev/architects",
            LIBRARIES:[
                { person: "JSXM", line:[ { line:"by a1k0n" } ], url:"https://github.com/a1k0n/jsxm" }
            ],
            TOOLS:[
                { person: "Gimp", url:"https://www.gimp.org/" },
                { person: "Inkscape", url:"https://inkscape.org/" },
                { person: "Audacity", url:"https://www.audacityteam.org/" }
            ],
            THANKS:[
                { person: "Bianca", url:"http://www.linearkey.net/" },
                { person: "...and YOU!" }
            ]
        },
        TEXTURES:{
            FONT:TEXTURESFONT
        },
        ITEMS:{
            FONT:ITEMSFONT
        },
        VOLUME:{
            VOICE:0.5,
            NOISESFX:0.25
        },
        DIRECTIONS:[
            { x:0, y:-1 },
            { x:1, y:0 },
            { x:0, y:1 },
            { x:-1, y:0 },
        ],
        ANGLES:ANGLES,
        VIEWMAPS:VIEWMAPS,
        DEGTORAD:3.14/180,
        CURSOR:[ "|", "/", "-", "\\", "|", "/", "-", "\\" ],
        COLORS:{
            TRANSPARENT:"",

            BLACK:"#000",
            WHITE:"#fff",
            
            RED:"#f00",
            GREEN:"#0f0",
            BLUE:"#00f",
            YELLOW:"#ff0",
            CYAN:"#0ff",
            PURPLE:"#f0f",

            GRAY:"#999",
            DARKRED:"#900",
            DARKGREEN:"#090",
            DARKBLUE:"#009",
            DARKYELLOW:"#990",
            DARKCYAN:"#099",
            DARKPURPLE:"#909"
        },
        ITEMCOLOR:{
            HEALTH:"#f00",
            GOLD:"#ff0",
            KEY:"#fff",
            ROOMITEM:"#0ff"
        },
        MAPSYMBOLS:{
            WALL:"&#x2588;",
            FLOOR:".",
            DOOR:"&#x25D8;"
        },
        NOTHING:"Nothing happens.",
        GROUP:{
            STATS:-200,
            KEY:-100,
            KEYPART:-99,
            ROOMITEM:-50
        },
        KEY_NAMES:[
            0,
            "circle",
            "cross",
            "triangle",
            "square",
            "pentagon",
            "hexagon"
        ],
        BRIGHTNESS:{
            LAMP:30
        },
        MOVEMENT:[
            {
                up:{ direction:0, x:0, y:-1 },
                down:{ direction:0, x:0, y:1 },
                left:{ direction:3, x:0, y:0 },
                right:{ direction:1, x:0, y:0 }
            },{
                up:{ direction:1, x:1, y:0 },
                down:{ direction:1, x:-1, y:0 },
                left:{ direction:0, x:0, y:0 },
                right:{ direction:2, x:0, y:0 }
            },{
                up:{ direction:2, x:0, y:1 },
                down:{ direction:2, x:0, y:-1 },
                left:{ direction:1, x:0, y:0 },
                right:{ direction:3, x:0, y:0 }
            },{
                up:{ direction:3, x:-1, y:0 },
                down:{ direction:3, x:1, y:0 },
                left:{ direction:2, x:0, y:0 },
                right:{ direction:0, x:0, y:0 }
            }
        ],
        SCORES:{
            GOLD:[
                { label:"Forsaken", color:"#00f", points:0 },
                { label:"Explorer", color:"#00f", points:0.1 },
                { label:"Drudge", color:"#00f", points:0.2 },
                { label:"Chaser", color:"#090", points:0.6 },
                { label:"Baron", color:"#900", points:0.8 },
                { label:"Aurum", color:"#990", points:1 },
            ],
            SPENTGOLD:[
                { label:"Frugal", color:"#00f", points:0 },
                { label:"Economical", color:"#00f", points:0.1 },
                { label:"Deliberate", color:"#00f", points:0.2 },
                { label:"Comfortable", color:"#090", points:0.6 },
                { label:"Big Spender", color:"#900", points:0.8 },
                { label:"Affluent", color:"#990", points:1 },
            ],
            STEPS:[
                { percentage:3, label:"Fumbler", color:"#00f", points:0 },
                { percentage:2.25, label:"Errant", color:"#00f", points:0.1 },
                { percentage:1.7, label:"Drifter", color:"#00f", points:0.2 },
                { percentage:1.5, label:"Cartographer", color:"#090", points:0.6 },
                { percentage:1.2, label:"Bridger", color:"#900", points:0.8 },
                { percentage:0, label:"Ascendant", color:"#990", points:1 },
            ],
            HEALTH:[
                { label:"Fragile", color:"#00f", points:0 },
                { label:"Exhausted", color:"#00f", points:0.1 },
                { label:"Damaged", color:"#00f", points:0.2 },
                { label:"Composed", color:"#090", points:0.6 },
                { label:"Battered", color:"#900", points:0.8 },
                { label:"Alacritous", color:"#990", points:1 },
            ],
            HEALTHLOST:[
                { label:"Aetherial", color:"#990", points:1 },
                { label:"Blurred", color:"#900", points:0.8 },
                { label:"Champion", color:"#090", points:0.6 },
                { label:"Defiant", color:"#00f", points:0.2 },
                { label:"Endurer", color:"#00f", points:0.1 },
                { label:"Falterer", color:"#00f", points:0 },
            ],
            HEALTHGAINED:[
                { label:"Auric", color:"#990", points:1 },
                { label:"Booster", color:"#900", points:0.8 },
                { label:"Cauterized", color:"#090", points:0.6 },
                { label:"Depleted", color:"#00f", points:0.2 },
                { label:"Exiguous", color:"#00f", points:0.1 },
                { label:"Floundering", color:"#00f", points:0 },
            ],
            EXTRAS:[
                { label:"Fleeting", color:"#00f", points:0 },
                { label:"Elusive", color:"#00f", points:0.1 },
                { label:"Diligent", color:"#00f", points:0.2 },
                { label:"Collector", color:"#090", points:0.6 },
                { label:"Bountiful", color:"#900", points:0.8 },
                { label:"Avaricious", color:"#990", points:1 },
            ],
            FINAL:[
                { letter:"F", color:"#00f" },
                { letter:"F+", color:"#00f" },

                { letter:"E-", color:"#00f" },
                { letter:"E", color:"#00f" },
                { letter:"E+", color:"#00f" },

                { letter:"D-", color:"#00f" },
                { letter:"D", color:"#00f" },
                { letter:"D+", color:"#00f" },
        
                { letter:"C-", color:"#00f" },
                { letter:"C", color:"#00f" },
                { letter:"C+", color:"#00f" },
        
                { letter:"B-", color:"#090" },
                { letter:"B" , color:"#090"},
                { letter:"B+", color:"#090" },
        
                { letter:"A-", color:"#990" },
                { letter:"A", color:"#990" },
                { letter:"A+", color:"#990" },
                { letter:"A++", color:"#990" },
        
                { letter:"S", color:"#909" },
                { letter:"SS", color:"#909" },
                { letter:"SSS", color:"#909" },
            ]
        }
    };
    
}());