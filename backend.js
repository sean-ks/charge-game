const express = require('express');
const backend = express();
const { v4: uuid } = require('uuid');


//socket io setup
const http = require('http');
const server = http.createServer(backend);
const { Server } = require('socket.io');
const io = new Server(server, {pingInterval: 2000, pingTimeout: 10000});

const port = process.env.PORT || 8000;

backend.use(express.static(__dirname));

backend.get('/', function (req, res) {
    res.sendFile(__dirname+"/start.html");
})

const names = ["frog","moose","tito","tita","lolo"]
const rooms = {};
const ROOM_MAX = 8;
const backEndPlayers = {};

let count = 0;

//game function
function game(players){
    let gameplayString = "";
    for(const id in players){
        if(backEndPlayers[id].health <= 0){
            continue;
        }
        if(backEndPlayers[id].action.type === 'Charge'){
            gameplayString += backEndPlayers[id].name + ' ' + backEndPlayers[id].action.type + 's!/';
            backEndPlayers[id].charges = backEndPlayers[id].charges + 1;
        }
        if(backEndPlayers[id].action.type === 'Reflect' || backEndPlayers[id].action.type === 'Counter'){
            backEndPlayers[id].charges -= backEndPlayers[id].action.cost
            gameplayString += backEndPlayers[id].name + ' ' + backEndPlayers[id].action.type + 's!/';
            backEndPlayers[id].reflect = backEndPlayers[id].action.reflectAmt;
        }
        if(backEndPlayers[id].action.type === 'Block'){
            backEndPlayers[id].charges -= backEndPlayers[id].action.cost
            gameplayString += backEndPlayers[id].name + ' ' + backEndPlayers[id].action.type + 's!/';
            backEndPlayers[id].block = backEndPlayers[id].action.blockAmt;
        }
    }

    for(const id in players){
        //If the player plays a knife move
        if(backEndPlayers[id].action.type === 'Knife'){
            backEndPlayers[id].target.forEach((targetID) => {
                //if the target is also targeting the player
                if((backEndPlayers[targetID].action.type === 'Knife' || backEndPlayers[targetID].action.type === 'Bang' || backEndPlayers[targetID].action.type === 'Shotgun') && backEndPlayers[targetID].target.some(p => p === id)){
                    const dmg = Math.max(0, backEndPlayers[id].action.damage - backEndPlayers[targetID].action.damage);
                    backEndPlayers[targetID].health = Math.max(0,backEndPlayers[targetID].health - dmg);
                    gameplayString += backEndPlayers[id].name + ' attacks ' + backEndPlayers[targetID].name + ' with a knife! But ' + backEndPlayers[targetID].name + ' attacks back with a ' +
                        backEndPlayers[targetID].action.type + '!/ ' + backEndPlayers[targetID].name + ' has ' + backEndPlayers[targetID].health + ' hp!/';
                }
                //if the target played a block move
                else if(backEndPlayers[targetID].block > 0){
                    backEndPlayers[targetID].health = Math.max(0,backEndPlayers[targetID].health - Math.max(0, backEndPlayers[id].action.damage - backEndPlayers[targetID].block));
                    backEndPlayers[targetID].block = Math.max(0, backEndPlayers[targetID].block - backEndPlayers[id].action.damage);

                    gameplayString += backEndPlayers[id].name + ' hits ' + backEndPlayers[targetID].name + ' with a knife! But ' + backEndPlayers[targetID].name + ' ' + backEndPlayers[targetID].action.type + 's!/' +
                        backEndPlayers[targetID].name + ' has ' + backEndPlayers[targetID].health + ' hp and has ' + backEndPlayers[targetID].block + ' block!/';
                }
                //if the target played a reflect move
                else if(backEndPlayers[targetID].reflect > 0){
                    //if target played counter
                    if(backEndPlayers[targetID].reflect === 1){
                        backEndPlayers[id].health = Math.max(0,backEndPlayers[id].health - backEndPlayers[id].action.damage);

                        gameplayString += backEndPlayers[id].name + " tried to knife " + backEndPlayers[targetID].name + " but " + backEndPlayers[targetID].name + " countered the knife and hits " + backEndPlayers[id].name + " back!/" +
                            backEndPlayers[id].name + " has " + backEndPlayers[id].health + " hp!/";
                    }
                    //if target didnt play counter
                    else{
                        backEndPlayers[targetID].health = Math.max(0,backEndPlayers[targetID].health - backEndPlayers[id].action.damage);

                        gameplayString += backEndPlayers[id].name + " cuts through " + backEndPlayers[targetID].name + " reflect and attacks them with a knife!/" +
                            backEndPlayers[targetID].name + " has " + backEndPlayers[targetID].health + " hp!/";
                    }
                }
                else{
                    backEndPlayers[targetID].health = Math.max(backEndPlayers[targetID].health - backEndPlayers[id].action.damage);
                    gameplayString += backEndPlayers[id].name + " hits " + backEndPlayers[targetID].name + " with a knife!/" + backEndPlayers[targetID].name + " has " + backEndPlayers[targetID].health + " hp!/";
                }
            });
        }
        //If the player plays a projectile move
        else if(backEndPlayers[id].action.type === 'Bang' || backEndPlayers[id].action.type === 'Shotgun'){
            backEndPlayers[id].target.forEach((victimID) => {
                backEndPlayers[id].charges -= backEndPlayers[id].action.cost;
                //if the target is also attacking the player
                if ((backEndPlayers[victimID].action.type === 'Knife' || backEndPlayers[victimID].action.type === 'Bang' || backEndPlayers[victimID].action.type === 'Shotgun') && backEndPlayers[victimID].target.some(p => p === id)) {
                    backEndPlayers[victimID].health = Math.max(0, backEndPlayers[victimID].health - Math.max(0, backEndPlayers[id].action.damage - backEndPlayers[victimID].action.damage));

                    gameplayString += backEndPlayers[id].name+ ' attacks ' + backEndPlayers[victimID].name + ' with a ' + backEndPlayers[id].action.type + '! But ' + backEndPlayers[victimID].name + ' attacks back with a ' +
                        backEndPlayers[victimID].action.type + '!/ ' + backEndPlayers[victimID].name + ' has ' + backEndPlayers[victimID].health + ' hp!/';
                }
                //if the target played any block moves
                else if (backEndPlayers[victimID].block > 0) {
                    backEndPlayers[victimID].health = Math.max(0, backEndPlayers[victimID].health - Math.max(0, backEndPlayers[id].action.damage - backEndPlayers[victimID].block));
                    backEndPlayers[victimID].block = Math.max(0, backEndPlayers[victimID].block - backEndPlayers[id].action.damage);

                    gameplayString += backEndPlayers[id].name + " attacks " + backEndPlayers[victimID].name + "with a " + backEndPlayers[id].action.type + ", but it's blocked!/" +
                        backEndPlayers[victimID].name + " has " + backEndPlayers[victimID].health + " hp and " + backEndPlayers[victimID].block + " block!/";
                }
                //if the target played any reflect moves
                else if (backEndPlayers[victimID].reflect > 0) {
                    //if the reflect is greater than the damage, it gets reflected back to the player
                    if (backEndPlayers[victimID].reflect >= backEndPlayers[id].action.damage) {
                        backEndPlayers[id].health = Math.max(0,backEndPlayers[id].health - backEndPlayers[id].action.damage);

                        gameplayString += backEndPlayers[id].name + " hits " + backEndPlayers[victimID].name + " with a " + backEndPlayers[id].action.type + "! But it gets reflected and hits back!/" +
                            backEndPlayers[id].name + " has " + backEndPlayers[id].health + " hp!/";
                    }
                    else{
                        backEndPlayers[victimID].health = Math.max(0,backEndPlayers[victimID].health - backEndPlayers[id].action.damage);

                        gameplayString += backEndPlayers[id].name + " hits " + backEndPlayers[victimID].name + " with a " + backEndPlayers[id].action.type + " and breaks the reflect!/" +
                            backEndPlayers[victimID].name + " has " + backEndPlayers[victimID].health + " hp!/";
                    }
                }
                //if the target is vulnerable, target gets hit
                else{
                    backEndPlayers[victimID].health = Math.max(backEndPlayers[victimID].health - backEndPlayers[id].action.damage);

                    gameplayString += backEndPlayers[id].name + " attacks " + backEndPlayers[victimID].name + " with a " + backEndPlayers[id].action.type + "!/" +
                        backEndPlayers[victimID].name + " has " + backEndPlayers[victimID].health + " hp!/";
                }
            });
        }
    }
    return gameplayString;
}

const joinRoom = (socket, room, name) => {
    room.sockets.push(socket);
    socket.join(room.id);
    backEndPlayers[socket.id] = {
        name: name,
        health: 2,
        charges: 0,
        block: 0,
        reflect: 0,
        points: 0,
        target: [],
        action: null,
        order: room.sockets.length,
        id: socket.id,
        roomId: room.id,
        ready: false,
    };
    console.log(socket.id, " (" + name + ") Joined", room.id);
};

/**
 * BackEnd Players in the room
 */
const backEndPlayersInRoom = (roomId) => {
    const players = {};
    for(const id in backEndPlayers) {
        if(backEndPlayers[id].roomId === roomId) {
            players[id] = backEndPlayers[id];
        }
    }
    return players;
};


//gets the connections
io.on('connection', (socket) => {
    console.log("a user connected");

    /**
     * Will make the socket leave any rooms that it is a part of
     * @param socket A connected socket.io socket
     */

    const leaveRooms = (socket) => {
        const roomsToDelete = [];
        for (const id in rooms) {
            const room = rooms[id];
            // check to see if the socket is in the current room
            if (room.sockets.includes(socket)) {
                for(const id1 in backEndPlayersInRoom(id)){
                    const backEndPlayer = backEndPlayers[id1];
                    if (backEndPlayer.order > backEndPlayers[socket.id].order){
                        backEndPlayer.order--;
                    }
                }
                socket.leave(id);
                // remove the socket from the room object
                room.sockets = room.sockets.filter((item) => item !== socket);
                //delete backend player
                delete backEndPlayers[socket.id];
                io.to(id).emit('updatePlayers', backEndPlayersInRoom(id));
            }
            // Prepare to delete any rooms that are now empty
            if (room.sockets.length === 0) {
                roomsToDelete.push(room);
            }
        }

        // Delete all the empty rooms that we found earlier
        for (const room of roomsToDelete) {
            delete rooms[room.id];
        }
    };

    //if a player disconnects, remove them from player list
    socket.on('disconnect', (reason) => {
        console.log(reason);

        /*for(const id in backEndPlayersInRoom(){
            const backEndPlayer = backEndPlayers[id];
            if (backEndPlayer.order > backEndPlayers[socket.id].order){
                backEndPlayer.order--;
            }
        }*/
        leaveRooms(socket);
    })

    //if the hosts starts the game, start the timer
    socket.on('start game', (id, arg) => {
        const roomId = backEndPlayers[id].roomId;
        rooms[roomId].start = true;

        let time = arg;
        let start = Date.now();
        let countdown = setInterval(function(){
            let timeLeft = time - Math.floor(Date.now() - start);
            if(timeLeft <= 0){
                io.to(roomId).emit('timer', 0.000);
                clearInterval(countdown);
            }
            else {
                io.to(roomId).emit('timer', timeLeft / 1000);
            }
        },100);
    });

    //collects data
    socket.on('send data', (id, action, target) => {
        backEndPlayers[id].action = action;
        backEndPlayers[id].target = target;
        count++;
        if (count === Object.keys(backEndPlayersInRoom(backEndPlayers[id].roomId)).length) {
            count = 0;
            const gameplay = game(backEndPlayersInRoom(backEndPlayers[id].roomId));
            io.to(backEndPlayers[id].roomId).emit('game update', backEndPlayersInRoom(backEndPlayers[id].roomId), gameplay);
        }
    });

    //receives messages
    socket.on('message', data => {
        console.log(data)
        io.emit('message', `${socket.id.substring(0,5)}: ${data}`)
        console.log("sent :D")
    });


    socket.on('createRoom',(name, callback) => {
        if(name === ""){
            name = names[Math.floor(Math.random() * names.length)];
        }
        const roomName = name + "'s lobby ";
        const room = {
            id: uuid(),
            name: roomName,
            sockets: [],
            start: false
        };
        rooms[room.id] = room;
        joinRoom(socket, room, name);
        console.log(rooms);
        callback({
            name: name,
        });
        io.to(room.id).emit('updatePlayers', backEndPlayersInRoom(room.id));
    });

    /**
     * Gets fired when a player has joined a room.
     */
    socket.on('joinRoom', (roomId, name, callback) => {
        const room = rooms[roomId];
        if (room.sockets.length >= 8){
            callback({
                join: false,
            })
        }
        else{
            if(name === ""){
                name = names[Math.floor(Math.random() * names.length)];
            }
            joinRoom(socket, room, name);
            callback({
                join: true
            });
            io.to(roomId).emit('updatePlayers', backEndPlayersInRoom(roomId));
        }
    });

    /**
     * Gets fired when a player leaves a room.
     */
    socket.on('leaveRoom', () => {
        leaveRooms(socket);
    });

    socket.on('getRoomNames',(callback) => {
        const roomNames = [];
        for (const id in rooms) {
            const {name} = rooms[id];
            const lobbyNames = name + " (" + rooms[id].sockets.length + "/" + ROOM_MAX + ")";
            const {start} = rooms[id];
            const room = {lobbyNames, id, start};
            console.log(room);
            roomNames.push(room);
        }

        callback({
            names: roomNames,
        });
    });

    socket.on('restart', () => {
        backEndPlayers[socket.id].health = 2;
        backEndPlayers[socket.id].charges = 0;
        backEndPlayers[socket.id].block = 0;
        backEndPlayers[socket.id].reflect = 0;
        backEndPlayers[socket.id].target = [];
    });

    socket.on('ready',() =>{
        console.log(socket.id + " is ready!");
        const roomId = backEndPlayers[socket.id].roomId;
        backEndPlayers[socket.id].ready = true;
        let roomReady = true;

        for(const id in backEndPlayersInRoom(roomId)){
            if(backEndPlayers[id].ready === false){
                roomReady = false;
                break;
            }
        }

        if(roomReady){
            io.to(roomId).emit('round start')
            for(const id in backEndPlayersInRoom(roomId)){
                backEndPlayers[id].ready = false;
            }
        }

    });


});

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
})

console.log('server did load');