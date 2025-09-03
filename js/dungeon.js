function GenerateDungeon(random, size, entranceRoom, exitRoom, roomsList, numberOfTunnels) {

    function newEmptyMap(size) {
        let
            out =[];
        for (let i=0; i<size; i++) {
            let
                row = [];
            for (let j=0; j<size; j++)
                row.push(0);
            out[i] = row;
        }
        return out;
    }

    function copyBitmap(bmp) {
        return bmp.map(row => row.slice());
    }

    function zeroBitmap(size) {
        let
            out = newEmptyMap(size);

        for (let i=0; i<size; i++)
            for (let j=0; j<size; j++)
                out[i][j] = 0
        return out;
    }

    function randomInteger(min, max) {
        return Math.floor(random.float()*(max-min+1)+min);
    }

    function placeRoom(mapsize, room, door) {
        let
            w = room.width,
            h = room.height,
            x,
            y;

        if (door) {
            let
                drx = door.x,
                dry = door.y,
                dir = door.wall;

            switch (dir) {
                case 0:{
                    y = dry - h;
                    x = randomInteger(drx - w + 1, drx);
                    break;
                }
                case 1:{
                    y = randomInteger(dry - h + 1, dry);
                    x = drx + 1;
                    break;
                }
                case 2:{
                    y = dry + 1;
                    x = randomInteger(drx - w + 1, drx);
                    break;
                }
                case 3:{
                    y = randomInteger(dry - h + 1, dry);
                    x = drx - w;
                    break;
                }
            }
        } else {
            x = randomInteger(1, mapsize-room.width-1);
            y = randomInteger(1, mapsize-room.height-1);
        }
        return {
            room:room,
            x:x,
            y:y,
            w:w,
            h:h,
            doorsData:[],
            doors:[]
        }
    }

    function isPointInRoom(xx, yy, x, y, w, h) {
        return (xx >= x && xx < x+w && yy >= y && yy < y+h);
    }

    function isPointInR2(r2, x, y) {
        return (x >= r2.x && x <= r2.x + r2.w && y >= r2.y && y <= r2.y + r2.h);
    }

    function areTheyOverlap(r1, r2) {
        for (let i = r1.x; i <= r1.x + r1.w; i++)
            for (let j = r1.y; j <= r1.y + r1.h; j++)
                if (isPointInR2(r2, i, j)) return true;
        return false;
    }

    function isRoomOk(mapsize, rooms, x, y, w, h) {

        if (x < 1 || y < 1 || x > mapsize - w - 1 || y > mapsize - h - 1)
            return false;

        for (let rm of rooms)
            if (areTheyOverlap(rm, {x, y, w, h}))
                return false;

        return true;
    }

    function digRoom(bmp, x, y, w, h) {
        let
            newBmp = copyBitmap(bmp);
        
        for (let i = x-1; i <= x + w; i++) {
            newBmp[y-1][i] = 4;
            newBmp[y+h][i] = 4;
        }

        for (let j = y-1; j <= y + h; j++) {
            newBmp[j][x-1] = 4;
            newBmp[j][x+w] = 4;
        }

        for (let i = x; i < x + w; i++)
            for (let j = y; j < y + h; j++)
                newBmp[j][i] = 1;

        return newBmp;
    }

    function randomDoor(dg, rooms) {
        let
            roomIndex = randomInteger(0, rooms.length-1),
            room = rooms[roomIndex],
            rx = room.x,
            ry = room.y,
            rw = room.w,
            rh = room.h,
            wall = randomInteger(0, 3),
            brick = Math.floor(
                random.float() * (wall % 2 === 0 ? rw : rh)
            ),
            drx,dry;

        switch (wall) {
            case 0:{
                dry = ry - 1;
                drx = rx + brick;
                break;
            }
            case 1:{
                dry = ry + brick;
                drx = rx + rw;
                break;
            }
            case 2:{
                dry = ry + rh;
                drx = rx + brick;
                break;
            }
            case 3:{
                dry = ry + brick;
                drx = rx -1;
                break;
            }
        }

        if ((dg[dry][drx] != 5) && (dg[dry][dry] != 2))
            return {
                fromRoom:roomIndex,
                x:drx, 
                y:dry, 
                roomIndex:roomIndex, 
                wall:wall
            };
    }

    function digDoor(bmp, drx, dry) {
        let
            newBmp = copyBitmap(bmp);

        newBmp[dry][drx] = 2;

        return newBmp;
    }

    function newCoord(drx, dry, direction, distance) {
        let
            xx,
            yy;
        switch (direction) {
            case 0:{
                xx = drx;
                yy = dry - distance;
                break;
            }
            case 1:{
                xx = drx + distance;
                yy = dry;
                break;
            }
            case 2:{
                xx = drx;
                yy = dry + distance;
                break;
            }
            case 3:{
                xx = drx - distance;
                yy = dry;
                break;
            }
        }
        return {
            x: xx,
            y: yy,
            width: 1,
            height: 1
        };
    }

    function randomTunnel(mapsize, dg, rooms, drx, dry, wall) {
        let
            walled = false;

        for (let i = 1; i <= 10; i++) {
            let
                coord = newCoord(drx, dry, wall, i),
                x = coord.x,
                y = coord.y;
            if (
                (x < 1 || y < 1 || x >= mapsize - 1 || y >= mapsize - 1) ||
                ((dg[y][x] === 2) || (dg[y][x] === 3))
            )
                return false;
            if (dg[y][x] > 3)
                if (walled)
                    return false;
                else
                    walled = true;
            if (dg[y][x] === 1)
                return {
                    length: i-1,
                    end: rooms.findIndex(rm => isPointInRoom(x, y, rm.x, rm.y, rm.w, rm.h))
                }
        }
        return false;
    }

    function digTunnel(bmp, length, drx, dry, wall) {
        let
            newBmp = copyBitmap(bmp);

        for (let i = 0; i <= length; i++) {
            let
                coord = newCoord(drx, dry, wall, i),
                x = coord.x,
                y = coord.y;
            if (wall % 2) {
                newBmp[y+1][x] = 5;
                newBmp[y-1][x] = 5;
            } else {
                newBmp[y][x+1] = 5;
                newBmp[y][x-1] = 5;
            }
            newBmp[y][x] = i == length ? 2 : 3;
        }

        return newBmp;
    }

    function removePlacedRoom(rooms, placedRoom) {
        rooms.splice(rooms.indexOf(placedRoom.room),1);
    }

    let
        attempts = 100,
        rooms = [],
        dg = zeroBitmap(size),
        firstRoom,
        roomsLeft = roomsList.length + (exitRoom ? 1 : 0);

    if (entranceRoom)
        firstRoom = placeRoom(size, entranceRoom);
    else {
        roomsLeft--;
        firstRoom = placeRoom(size, random.element(roomsList));
    }

    rooms.push(firstRoom);
    dg = digRoom(dg, firstRoom.x, firstRoom.y, firstRoom.w, firstRoom.h);

    while (roomsLeft) {
        let
            door = randomDoor(dg, rooms);
    
        if (door) {

            let
                newRoom = placeRoom(size, roomsLeft == 1 ? exitRoom : random.element(roomsList), door);

            if (isRoomOk(size, rooms, newRoom.x, newRoom.y, newRoom.w, newRoom.h)) {

                door.toRoom = rooms.length;

                let
                    oppositeDoor = {
                        isOtherDoor:true,
                        toRoom:door.fromRoom,
                        fromRoom:door.toRoom,
                        x:door.x, 
                        y:door.y,
                        width:1,
                        height:1,
                        roomIndex:door.roomIndex, 
                        exit:newCoord(door.x, door.y, door.wall, 1),
                        wall:(door.wall + 2) % 4
                    };

                door.exit = newCoord(door.x, door.y, oppositeDoor.wall, 1);

                rooms[door.roomIndex].doorsData.push(door);
                rooms[door.roomIndex].doors.push(door.wall);

                newRoom.doorsData.push(oppositeDoor);

                rooms.push(newRoom);

                dg = digRoom(dg, newRoom.x, newRoom.y, newRoom.w, newRoom.h);
                dg = digDoor(dg, door.x, door.y);

                removePlacedRoom(roomsList, newRoom);
                roomsLeft--;
            } else {
                if (!attempts--) {
                    // console.log("fail rooms")
                    return;
                }
            }

        } else {
            if (!attempts--) {
                // console.log("fail door")
                return;
            }
        }
    }

    let
        nrTunnels = 0;
    while (nrTunnels < numberOfTunnels) {
        let
            door = randomDoor(dg, rooms);

        if (door && !rooms[door.roomIndex].doors.includes(door.wall)) {
            let
                newTunnel = randomTunnel(size, dg, rooms, door.x, door.y, door.wall);
                
            if (newTunnel && newTunnel.length) {

                door.toRoom = newTunnel.end;
                door.isTunnelDoor = true;

                let
                    destination = newCoord(door.x, door.y, door.wall, newTunnel.length),
                    otherDoor = {
                        isOtherDoor:true,
                        isTunnelDoor:true,
                        toRoom:door.fromRoom,
                        fromRoom:door.toRoom,
                        x:destination.x, 
                        y:destination.y,
                        width:1,
                        height:1,
                        roomIndex:door.roomIndex, 
                        exit:newCoord(destination.x, destination.y, door.wall, 1),
                        wall:(door.wall + 2) % 4
                    };

                door.exit = newCoord(door.x, door.y, otherDoor.wall, 1);


                rooms[door.roomIndex].doorsData.push(door);
                rooms[door.roomIndex].doors.push(door.wall);

                rooms[newTunnel.end].doorsData.push(otherDoor);

                dg = digTunnel(dg, newTunnel.length, door.x, door.y, door.wall);
                dg = digDoor(dg, door.x, door.y);
                nrTunnels++;
            }
        } else
            if (!attempts--) {
                // console.log("fail tunnels")
                break;
            }
    }

    return {
        rooms:rooms,
        map:dg
    };

}