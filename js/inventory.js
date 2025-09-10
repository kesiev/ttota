function Inventory(game) {

    const
        UNLOCK_TIMER = 500;
    
    let
        dock = document.createElement("div"),
        isUnlocked = true,
        unlockedTimeout = 0,
        isVisible = false,
        items = [];

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

    let refreshScroll=()=>{
        if (dock.scrollWidth > dock.clientWidth) {
            dock._cancelDrag = true;
            dock.style.touchAction = "pan-x";
        } else {
            dock._cancelDrag = false;
            dock.style.touchAction = "none";
        }
    }

    let updateItem = (item)=>{

        let
            backgrounds = [];
        
        if (item.color)
            backgrounds.push(item.color);

        if (item.model) {

            let
                model = ITEMS.models[item.model],
                allLayers = ITEMS.layers[item.model];

            model.forEach(part=>{
                if (allLayers[part.key]) {
                    let
                        partLayers = allLayers[part.key];
                    if (partLayers) {
                        let
                            value = item[part.key],
                            layer = partLayers[value === undefined ? "default" : value];
                        if (layer) {
                            layer.forEach(layer=>{
                                backgrounds.unshift("url('"+layer.image+"') "+(-layer.imageX*60)+"px "+(-layer.imageY*85)+"px");
                            });
                        }
                    }
                }
            });

        }

        if (item.sprite)
            item.sprite.forEach(layer=>{
                backgrounds.unshift("url('"+layer.image+"') "+(-layer.imageX*60)+"px "+(-layer.imageY*85)+"px");
            })

        item.nodes.inner.style.background = backgrounds.join(", ");

    }

    let newItem = (fromRoom, data, className)=>{
        let
            container = document.createElement("div"),
            div = document.createElement("div"),
            inner = document.createElement("div"),
            counter = document.createElement("div");
        
        container._baseClassName = container.className = "itemcontainer";

        div._cancelDrag = true;
        div._baseClassName = div.className = "item "+ (className || "card");

        inner._cancelDrag = true;
        inner.className = "inner";

        counter._cancelDrag = true;
        counter.className = "counter";

        data.fromRoom = fromRoom.id;
        data.group = data.group || 0;

        data.nodes={
            container: container,
            div: div,
            inner: inner,
            counter: counter
        };
        
        container.appendChild(div);
        div.appendChild(inner);
        div.appendChild(counter);
        container.addEventListener("click",()=>{
            if (isVisible && isUnlocked && game.player.isAlive && !container.isLocked && !game.movement.isLocked)
                game.movement.onUseItem(data);
        });

        updateItem(data);
        
        if (data.counter !== undefined)
            this.setCounter(data, data.counter);

        if (data.counterOf !== undefined)
            this.setCounterOf(data, data.counterOf);

        return data;
    }
    
    let setNodeAnimation=(node,fromClass,toClass)=>{
        if (node._timeout)
            clearTimeout(node._timeout);
        node.className = fromClass;
        node._timeout = setTimeout(()=>{
            node._timeout = 0;
            node.className = toClass;
        },10);
    }

    let setAnimation = function(item, animation) {
        setNodeAnimation(item.nodes.div, item.nodes.div._baseClassName, item.nodes.div._baseClassName+" "+animation);
    }

    let addItemToInventory = (item, skipAnimation)=>{
        let
            append = true;

        item.nodes.container.isLocked = false;
        if (item.nodes.container.removeTimeout) {
            clearTimeout(item.nodes.container.removeTimeout);
            item.nodes.container.removeTimeout = 0;
        }

        for (let i=0;i<items.length;i++) {
            if (items[i].group > item.group) {
                dock.insertBefore(item.nodes.container, items[i].nodes.container);
                items.splice(i, 0, item);
                append = false;
                break;
            }
        }

        if (append) {
            dock.appendChild(item.nodes.container);
            items.push(item);
        }

        if (!skipAnimation)
            setNodeAnimation(item.nodes.div, item.nodes.div._baseClassName+" beforespawning", item.nodes.div._baseClassName+" spawning");

        refreshScroll();

        return item;
    }

    this.hide=()=>{
        if (isVisible) {
            dock.className = "dock hidden "+(PROGRESS.isFake() ? " fake" : "");
            isVisible = false;
        }
    }

    this.refreshScroll=()=>{
        refreshScroll();
    }

    this.show=()=>{
        if (!isVisible) {
            lockFor(UNLOCK_TIMER);
            dock.className = "dock "+(PROGRESS.isFake() ? " fake" : "");
            isVisible = true;
        }
    }

    this.setCounter=(item,value)=>{
        item.counter = value;
        item.nodes.counter.innerHTML = value + (item.of ? "/"+item.of : "")
    }

    this.setCounterOf=(item,value)=>{
        item.of = value;
        this.setCounter(item, item.counter);
    }

    this.setColor=(item, color)=>{
        item.color = color;
        updateItem(item);
    }

    this.setAnimation=(item, animation)=>{
        setAnimation(item, animation);
    }

    this.addItem=(fromRoom, data, className, skipAnimation)=>{
        let
            item = newItem(fromRoom, data, className);
        addItemToInventory(item, skipAnimation);
        return item;
    }

    this.getItem=(id)=>{
        for (let i=0;i<items.length;i++)
            if (items[i].id == id)
                return items[i];
    }

    this.getItemsFromRoom=(fromRoom)=>{
        return items.filter(item=>{
            return item.fromRoom === fromRoom.id;
        })
    }

    let removeAnimation=(item, skipAnimation)=>{
        item.nodes.container.isLocked = true;
        if (skipAnimation || !isVisible)
            item.nodes.container.parentNode.removeChild(item.nodes.container);
        else {
            setAnimation(item, "leave");
            item.nodes.container.removeTimeout = setTimeout(()=>{
                if (item.nodes.container.parentNode)
                    item.nodes.container.parentNode.removeChild(item.nodes.container);
            },260);
        }
    }

    this.removeItem=(itemToRemove, skipAnimation)=>{
        let
            pos = items.indexOf(itemToRemove);
        
        if (pos != -1) {
            let
                item = items[pos];
            removeAnimation(item, skipAnimation);
            items.splice(pos,1);
        }

        refreshScroll();
    }

    this.removeItemsFromRoom=(fromRoom, skipAnimation)=>{
        items = items.filter(item=>{
            if (item.fromRoom === fromRoom.id) {
                removeAnimation(item, skipAnimation);
                return false;
            }
            return true;
        })

        refreshScroll();
    }

    this.storeItemsFromRoom=(fromRoom)=>{
        let
            stored = [];
        items = items.filter(item=>{
            if (item.fromRoom === fromRoom.id) {
                removeAnimation(item);
                stored.push(item);
                return false;
            }
            return true;
        })
        fromRoom._storedItems = stored;
        refreshScroll();
    }

    this.restoreItemsFromRoom=(fromRoom)=>{
        if (fromRoom._storedItems && fromRoom._storedItems.length) {
            fromRoom._storedItems.forEach(item=>{
                addItemToInventory(item);
            });
            delete fromRoom._storedItems;
            return true;
        }
    }

    this.isItemFromRoom=(item, fromRoom)=>{
        return item.fromRoom == fromRoom.id;
    }

    this.initialize=()=>{
        document.body.appendChild(dock);
        this.show();
    }

    this.quit=()=>{
        document.body.removeChild(dock);
    }

    this.dock = dock;

};
