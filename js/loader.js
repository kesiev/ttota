let LOADER = (function(){

    let
        prefix = "",
        isLoading = false,
        audioPlayer,
        loadingCount = 0,
        loadingCurrent = 0,
        callbackLoading,
        callbackLoaded,
        loadedResources = {},
        audioToLoad = [],
        resourcesToLoad = [],
        loadedImages = document.createElement("div");

    loadedImages.style.position = "absolute";
    loadedImages.style.overflow = "hidden";
    loadedImages.style.left = "-100px";
    loadedImages.style.top = "-100px";
    loadedImages.style.width = loadedImages.style.height = "1px";

    function createResourceUid(resource) {
        let
            out = resource.type+"-";
        switch (resource.type) {
            case "audio":{
                out+=resource.id;
                break;
            }
            default:{
                out+=resource.file;
            }
        }
        return out;
    }

    function loadResource() {
        if (resourcesToLoad.length) {

            let
                resource=resourcesToLoad.shift();

            loadingCurrent++;
            callbackLoading(loadingCurrent, loadingCount);

            switch (resource.type) {
                case "js":{
                    let
                        js = document.createElement("script");

                    js.setAttribute("src", prefix + resource.file);
                    js.addEventListener("load", loadResource);
                    document.head.appendChild(js);
                    break;
                }
                case "data":{
                    let
                        xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            LOADER.DATA[resource.id] = this.responseText;
                            loadResource();
                        }
                    };
                    xhttp.open("GET", prefix + resource.file, true);
                    xhttp.send();   
                    break;
                }
                case "image":{
                    let
                        image = document.createElement("img");

                    image.style.display = "none";
                    image.setAttribute("src", prefix + resource.file);
                    image.addEventListener("load", ()=>{
                        LOADER.IMAGESDATA[resource.file]={
                            image:image,
                            width:image.width,
                            height:image.height
                        };
                        loadResource();
                    });
                    loadedImages.appendChild(image);
                    break;
                }
                default:{
                    console.warn("Unsupported resource", resource);
                    loadResource();
                }
            }

        } else if (audioToLoad.length) {

            if (audioPlayer)
                audioPlayer.load(audioToLoad,()=>{
                    loadingCurrent++;
                    callbackLoading(loadingCurrent, loadingCount);
                },()=>{
                    audioToLoad = [];
                    loadResource();
                });
            else {
                audioToLoad = [];
                loadResource();
            }

        } else {

            isLoading = false;
            if (callbackLoaded) {
                loadingCount = 0;
                loadingCurrent = 0;
                callbackLoaded();
            }
        }

    }

    return {
        IMAGESDATA:{},
        DATA:{},
        setPrefix:(p)=>{
            prefix = p;
        },
        getTexture:(file)=>{
            if (LOADER.IMAGESDATA[file].data)
                return LOADER.IMAGESDATA[file].data;
            else
                return file;
        },
        initialize:(audio)=>{
            audioPlayer = audio;
            document.body.appendChild(loadedImages);
        },
        load:(resources,cbloading,cbloaded)=>{
            let
                toLoad = 0;
            resources.forEach(resource=>{
                if (resource) {
                    let
                        id = createResourceUid(resource);
                    if (!loadedResources[id]) {
                        toLoad++;
                        if (resource.type == "audio")
                            audioToLoad.push(resource);
                        else
                            resourcesToLoad.push(resource);
                        loadedResources[id] = true;
                    }
                }
            });
            if (toLoad) {
                callbackLoading = cbloading;
                callbackLoaded = cbloaded;
                loadingCount += toLoad;
                if (!isLoading)
                    loadResource();
            } else
                cbloaded();
        }
    }

})();