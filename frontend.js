const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

const devicePixelRatio = window.devicePixelRatio || 1;

canvas.width = innerWidth;
canvas.height = innerHeight;
console.log(canvas.width + " " + canvas.height);

//I replaced the enum for actual declarations of the moves
const block = new Block('Block', 0, 2);
const superBlock = new Block('Super Block', 1, 4);
const reflection = new Reflecting('Reflect', 0, 2);
const superReflection = new Reflecting('Super Reflect', 1, 3);
const counter = new Reflecting('Counter', 0, 1);
const knife = new Weapon('Knife', 0, 1);
const bang = new Weapon('Bang', 1, 2);
const shotgun = new Weapon('Shotgun', 2, 3);
const charge = new Charge('Charge', 0);

//clickable elements on the canvas, which includes the buttons for weapons, shields, and charges.
let elements = [];

let frontEndPlayers = {};

//receives the updated players list from the backend
socket.on('updatePlayers', (backendPlayers) => {
    for (const id in backendPlayers) {
        const backendPlayer = backendPlayers[id];
        //if there's a backend player that exists that is not a frontend player, add a frontend player
        if (!frontEndPlayers[id]){
            frontEndPlayers[id] = new Player({
                name: backendPlayer.name,
                health: backendPlayer.health,
                charges: backendPlayer.charges,
                block: backendPlayer.block,
                reflect: backendPlayer.reflect,
                points: backendPlayer.points,
                target: [],
                action: charge,
                order: backendPlayer.order
            });
            //these are the avatars for the newly made player
            elements.push({
                id: id,
                colour: 'rgba(0, 0, 0, 1)',
                width: 100,
                height: 100,
                top: determinePosition(frontEndPlayers[id].order, 'y'),
                left: determinePosition(frontEndPlayers[id].order, 'x'),
                player: true,
                active: false,
                //this is the targeting system
                function(){
                    //if you click on yourself, nothing happens
                    if(this.id === socket.id) {
                        console.log("that's u!");
                    } else{
                        //if you click on a target, it de-targets them
                        const client = frontEndPlayers[socket.id];
                        if(client.target.some((p) => p === this.id)){
                            client.target = client.target.filter((p) => p.id !== this.id);
                        }
                        //if player doesn't select a weapon, ask them to select a weapon
                        else if (!(client.action instanceof Weapon)){
                            console.log('select a weapon!');
                        }
                        //if the player doesn't have enough charges, then they can't target
                        else if((client.charges - client.action.cost*client.target.length) < client.action.cost){
                            console.log('not enough charges!');
                        }
                        //if the player can target, they target whoever they clicked on
                        else{
                            client.target.push(this.id);

                            console.log(socket.id + ' targeted ' + this.id);
                        }
                    }
                }
            });
            //Clickable actions
            if(socket.id === id){
                elements.push({
                    id: 'Weapon',
                    colour: 'rgba(0, 0, 0, 1)',
                    width: canvas.width/12,
                    height: canvas.width/12,
                    top: 200,
                    left: 0,
                    player: false,
                    img: './assets/weapon.webp',
                    active: false,
                    //This function creates a drop down menu for the weapon button; a menu of more weapons like knives and pistols
                    function(){
                        //everytime the button is pressed, all the other drop down menus disappear
                        elements.forEach(function(elem){
                            elem.active = false;
                        })
                        //we push the buttons for more weapons
                        elements.push({
                            id: 'Knife',
                            colour: 'rgba(255, 255, 0, 1)',
                            width: canvas.width/12,
                            height: canvas.width/12,
                            top: 200+canvas.width/12,
                            left: 0,
                            player: false,
                            active: true,
                            img: './assets/knife.webp',
                            //This function changes the client's action to the knife
                            function(){
                                frontEndPlayers[socket.id].target = [];
                                frontEndPlayers[socket.id].action = knife;
                                console.log(socket.id + ' chose knife');
                            }
                        },{
                            id: 'Bang',
                            colour: 'rgba(255, 255, 0, 1)',
                            width: canvas.width/12,
                            height: canvas.width/12,
                            top: 200+canvas.width/12,
                            left: canvas.width/12,
                            player: false,
                            active: true,
                            img: './assets/bang.jpg',
                            //This function changes the client's action to the bang
                            function(){
                                frontEndPlayers[socket.id].target = [];
                                if(frontEndPlayers[socket.id].charges > 0){
                                    frontEndPlayers[socket.id].action = bang;
                                    console.log(socket.id + ' chose bang');
                                } else {
                                    console.log('not enough charges');
                                }

                            }
                        })
                    }
                },{
                    id: 'Shield',
                    colour: 'rgba(0, 0, 0, 1)',
                    width: canvas.width/12,
                    height: canvas.width/12,
                    top: 200,
                    left: canvas.width/12,
                    player: false,
                    active: false,
                    img: './assets/shield.jpg',
                    //this function creates a dropdown menu for reflect, shield, and counter
                    function() {
                        frontEndPlayers[socket.id].target = [];
                        elements.forEach(function(elem){
                            elem.active = false;
                        })
                        elements.push({
                            id: 'Block',
                            colour: 'rgba(255, 255, 0, 1)',
                            width: canvas.width/12,
                            height: canvas.width/12,
                            top: 200+canvas.width/12,
                            left: 0,
                            player: false,
                            active: true,
                            img: './assets/block.jpg',
                            function(){
                                frontEndPlayers[socket.id].action = block;
                                console.log(socket.id + ' chose block');
                            }
                        },{
                            id: 'Reflect',
                            colour: 'rgba(255, 255, 0, 1)',
                            width: canvas.width/12,
                            height: canvas.width/12,
                            top: 200+canvas.width/12,
                            left: canvas.width/12,
                            player: false,
                            active: true,
                            img: './assets/reflect.webp',
                            function(){
                                frontEndPlayers[socket.id].action = reflection;
                                console.log(socket.id + ' chose reflect');
                            }
                        },{
                            id: 'Counter',
                            colour: 'rgba(255, 255, 0, 1)',
                            width: canvas.width/12,
                            height: canvas.width/12,
                            top: 200+canvas.width/12,
                            left: canvas.width/6,
                            player: false,
                            active: true,
                            img: './assets/counter.png',
                            function(){
                                frontEndPlayers[socket.id].action = counter;
                                console.log(socket.id + ' chose counter');
                            }
                        })
                    }
                },{
                    id: 'Charge',
                    colour: 'rgba(0, 0, 0, 1)',
                    width: canvas.width/12,
                    height: canvas.width/12,
                    top: 200,
                    left: canvas.width/6,
                    player: false,
                    active: false,
                    img: './assets/charge.webp',
                    function(){
                        frontEndPlayers[socket.id].target = [];
                        elements.forEach(function(elem){
                            elem.active = false;
                        })
                        frontEndPlayers[socket.id].action = charge;
                        console.log(socket.id + ' chose charge');
                    }
                });
            }

            //button for start game
            if(id === socket.id && backendPlayer.order === 1){
                elements.push({
                    id: 'Start',
                    colour: 'rgba(0, 0, 0, 1)',
                    width: 200,
                    height: 200,
                    top: 0,
                    left: canvas.width/4,
                    player: false,
                    active: true,
                    img: './assets/start.png',
                    function(){
                        //if there are two or more players, start button becomes clickable
                        if(Object.keys(frontEndPlayers).length > 1){
                            frontEndPlayers[socket.id].action = charge;
                            //start a timer of 5 seconds
                            socket.emit('start game', id, 5000);
                            //remove the start button
                           elements = elements.filter(elem => elem.id !== this.id);
                        }
                        else{
                            alert('not enough players');
                        }
                    }

                })
            }
        }
        //if one of the players is the client, have them on the button screen
        if (socket.id === id){
            elements.find((elem) => elem.id === id).top = 800;
            elements.find((elem) => elem.id === id).left = 1150;
        }
    }
    //for every front end player, if there exists a front end player that doesn't exist in the backend, delete that player
    for(const id in frontEndPlayers) {
        if (!backendPlayers[id]) {
            frontEndPlayers[socket.id].target = [];
            elements = elements.filter((element) => element.id !== id);
            for (const id2 in frontEndPlayers) {
                //moves the order down
                if (frontEndPlayers[id].order < frontEndPlayers[id2].order) {
                    console.log(id2+" before: "+frontEndPlayers[id2].order);
                    frontEndPlayers[id2].order--;
                    console.log(id2+" after: "+frontEndPlayers[id2].order);
                }
            }
            delete frontEndPlayers[id];
        }
    }
});

//Timer for the game
socket.on('timer', (arg) =>{
    document.querySelector('#timer').innerHTML = arg;
    if(arg <= 0){
        document.querySelector('#timer').innerHTML = '0.000';
        socket.emit('send data', socket.id, frontEndPlayers[socket.id].action, frontEndPlayers[socket.id].target);
    }
});

//
socket.on('game update', (players, output) => {
    for(const id in players){
        frontEndPlayers[id].health = players[id].health;
        frontEndPlayers[id].charges = players[id].charges;
        frontEndPlayers[id].block = players[id].block;
        frontEndPlayers[id].reflect = players[id].reflect;
    }
    /*document.querySelector('#gameplay').innerHTML = output;*/
    let delay = 50;
    let elem = $("#gameplay");
    elem.css({top: (27/100)*canvas.height, left: (53/100)*canvas.width, position: 'absolute'});
    elem.css('color','black');
    const addTextByDelay = function(text, elem, delay, win){
        if(!elem){
            elem = $("#game");
        }
        if(!delay){
            delay = 100;
        }
        if(text.length > 0){
            if(text[0] === "/"){
                elem.append("<br />");
            } else {
                //append first character
                elem.append(text[0]);
            }
            setTimeout(
                function(){
                    //Slice text by 1 character and call function again
                    addTextByDelay(text.slice(1),elem,delay, win);
                },delay);
        }
        if(text.length === 0 && !win){
            const result = gameEnd(players);
            if(result.end === true){
                elem.css("color", "yellow");
                if(result.player === null){
                    let text = "It's a draw!";
                    addTextByDelay(text, elem, delay, true);
                }
                else{
                    let text = result.player.name + " won!";
                    addTextByDelay(text, elem, delay, true);
                    result.player.points++;
                    frontEndPlayers[result.player.id].points++;
                }

                socket.emit('restart');
                for(const id in frontEndPlayers){
                    frontEndPlayers[id].health = 2;
                    frontEndPlayers[id].charges = 0;
                    frontEndPlayers[id].block = 0;
                    frontEndPlayers[id].reflect = 0;
                    frontEndPlayers[id].target = [];
                }

                //a ready button for people to start the next round
                elements.push({
                    id: 'Ready',
                    colour: 'rgba(0, 0, 0, 1)',
                    width: 200,
                    height:200,
                    top: 0,
                    left: canvas.width/4,
                    player: false,
                    active: true,
                    img: './assets/ready.webp',
                    function() {
                        socket.emit('ready');
                    },

                })
            }

            else{
                setTimeout(
                    function(){
                        frontEndPlayers[socket.id].action = charge;
                        frontEndPlayers[socket.id].block = 0;
                        frontEndPlayers[socket.id].reflect = 0;
                        elem.empty();
                        if(frontEndPlayers[socket.id].order === 1){
                            socket.emit('start game', socket.id, 5000);
                        }
                    }, 2000);
            }

        }

    }

    addTextByDelay(output, elem, delay, false);


});

socket.on('round start', () =>{
    elements = elements.filter(elem => elem.id !== "Ready");
    let delay = 1000;
    let elem = $("#gameplay");
    elem.css("color", "black");
    let text = "3/2/1/"
    elem.empty();
    const countdown = function(text, elem, delay){
        if(!elem){
            elem = $("#game");
        }
        if(!delay){
            delay = 1000;
        }
        if(text.length > 0){
            if(text[0] === "/"){
                elem.append("<br />");
            } else {
                //append first character
                elem.append(text[0]);
            }
            setTimeout(
                function(){
                    //Slice text by 1 character and call function again
                    countdown(text.slice(1),elem,delay);
                },delay);
        }
        if(text.length === 0 && frontEndPlayers[socket.id].order === 1){
            elem.empty();
            socket.emit('start game', socket.id, 5000);
        }
    }

    countdown(text, elem, delay)


});

const gameEnd = function(players){
    let playersAlive = [];
    for(const id in players){
        if(players[id].health > 0){
            playersAlive.push(players[id]);
        }
    }
    if(playersAlive.length === 0){
        return {
            end: true,
            player: null
        }
    } else if(playersAlive.length === 1){
        return {
            end: true,
            player: playersAlive[0]
        }
    } else{
        return {
            end: false
        }
    }
}

//this function determines all the player's avatar's locations using the order they connected
function determinePosition(count, position){
    if(position === 'x'){
        if(count === 1 || count === 2){
            return (115/192)*canvas.width; //1150
        }
        if(count === 3){
            return (800/1920)*canvas.width;
        }
        if(count === 4){
            return (1500/1920)*canvas.width;
        }
        if(count === 5 || count === 7){
            return (900/1920)*canvas.width;
        }
        if(count === 6 || count === 8){
            return (1400/1920)*canvas.width;
        }
    }
    else if(position === 'y'){
        if(count === 1 || count === 2){
            return (100/955)*canvas.height;
        }
        if(count === 3 || count === 4){
            return (450/955)*canvas.height;
        }
        if(count === 5 || count === 8){
            return (700/955)*canvas.height;
        }
        if(count === 6 || count === 7){
            return (200/955)*canvas.height;
        }
    }
    console.log('count:'+count)
    return 500;
}

function determineHeart(health){
    if(health <= 0){
        return './assets/empty-heart.png'
    }
    else if(health === 1){
        return './assets/half-heart.png'
    }
    else{
        return './assets/full-heart.png'
    }
}

//this function continuously animates the canvas
function animate(){
    //runs the animate function continuously, like frames in a game
    let animationId = requestAnimationFrame(animate);
    const chargeImg = new Image();
    chargeImg.src = './assets/charge-counter.png';

    //right background
    ctx.fillStyle = 'rgba(144, 169, 183, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //left background
    ctx.fillStyle = 'rgba(113, 145, 163, 1)';
    ctx.fillRect(0, 0, canvas.width/4, canvas.height);
    ctx.strokeRect(0,0,canvas.width/4, canvas.height);

     //lines separating round and buttons
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    ctx.moveTo(0, 200);
    ctx.lineTo(canvas.width/4, 200);
    ctx.stroke();
    ctx.closePath();

    //this draws the target when an avatar is clicked
    try {
        frontEndPlayers[socket.id].target.forEach((player) => {
            const target = elements.find((elem) => elem.id === player);
            const targetImg = new Image();
            targetImg.src = './assets/target.png';
            ctx.drawImage(targetImg, target.left-30, target.top-30, 50, 50);
        });
    } catch(TypeError){
        console.log('undefined socket id: ' + socket.id + "\n" + TypeError);
    }

    //this draws all the elements in the element array, if it's a player, determine where they are
    //I gotta fix this, it bugs out when more than 8 players join
    //After the 8th player, they become a spectator
    elements.forEach(function(element) {
        if(element.player === true){
            const player = frontEndPlayers[element.id];
            const { order } = player;
            if (socket.id === element.id) {
                if(order > 8){
                    //spectator
                    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                    ctx.font = '20px verdana';
                    ctx.fillText('You are spectating', 500, 50);
                }
                else {
                    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                    ctx.font = "20px verdana";
                    ctx.fillText(player.name, 115*canvas.width/192, 160*canvas.height/191 - 25);

                    ctx.fillStyle = 'rgba(0,0,0,1)';
                    ctx.fillRect(115*canvas.width/192,160*canvas.height/191, 100,100);
                    element.left = 115*canvas.width/192; // 1150
                    element.top = 160*canvas.height/191; // 800

                    const heartImg = new Image();
                    heartImg.src = determineHeart(player.health);
                    ctx.drawImage(heartImg,70,50,100,100);
                    ctx.drawImage(chargeImg,250,25,100,150);

                    ctx.fillStyle='rgba(247, 208, 39, 1)';
                    ctx.font = '30px Impact';
                    ctx.fillText('x', 350, 40);
                    ctx.font = '60px Impact';
                    ctx.fillText(player.charges, 370,60)
                }
            }
            else {
                if(order > 8){
                    //code for the people in the game
                    ctx.font = '20px verdana';
                    ctx.fillText('There is/are ' + (order - 8) + ' spectator/s', 500, 50);//this has to be an html thing, not a canvas thing
                }
                else if(order === 1){
                    let switchX = determinePosition(frontEndPlayers[socket.id].order,'x');
                    let switchY = determinePosition(frontEndPlayers[socket.id].order,'y');
                    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                    ctx.font = "20px verdana";
                    ctx.fillText(player.name, switchX, switchY-25);
                    ctx.fillStyle = 'rgba(0,0,0,1)';
                    ctx.fillRect(switchX, switchY, 100, 100);

                    const heartImg = new Image();
                    heartImg.src = determineHeart(player.health);
                    ctx.drawImage(heartImg,switchX,switchY+100,50,50);

                    ctx.fillStyle='rgba(247, 208, 39, 1)';
                    ctx.font = '30px Impact';
                    ctx.fillText(player.charges, switchX+60,switchY+130)

                    element.left = switchX;
                    element.top = switchY;
                }
                else {
                    element.left = determinePosition(player.order,'x');
                    element.top = determinePosition(player.order,'y');

                    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                    ctx.font = "20px verdana";
                    ctx.fillText(player.name, element.left, element.top-25);

                    ctx.fillStyle = 'rgba(0,0,0,1)';
                    ctx.fillRect(element.left, element.top, 100,100);

                    const heartImg = new Image();
                    heartImg.src = determineHeart(player.health);
                    ctx.drawImage(heartImg,element.left,element.top+100,50,50);

                    ctx.fillStyle='rgba(247, 208, 39, 1)';
                    ctx.font = '30px Impact';
                    ctx.fillText(player.charges, element.left+60,element.top+130)
                }
            }
        }
        else {
            const image = new Image();
            image.src = element.img;
            if(frontEndPlayers[socket.id].health < 1){
                ctx.filter = 'grayscale(1)';
            } else {
                ctx.filter = 'grayscale(0)';
            }
            ctx.drawImage(image, element.left, element.top, element.width, element.height);
        }
    });

}
//this checks for the clicks in the game, if an element is clicked, call a function
canvas.addEventListener('click', function() {
    let x = event.pageX - (canvas.offsetLeft + canvas.clientLeft);
    let y = event.pageY - (canvas.offsetTop + canvas.clientTop);
    elements.forEach(function(element){
        if(frontEndPlayers[socket.id].health < 1){
            return;
        }
        if(y > element.top && y < element.top + element.height && x > element.left && x < element.left + element.width){
            console.log('clicked an element: ' + element.id);
            element.function();
            elements = elements.filter((elem) => (elem.player === true || elem.colour === 'rgba(0, 0, 0, 1)' || elem.active === true));
        }
    });
}, false);

// send message function
function sendMessage(e){
    e.preventDefault()
    const input = document.querySelector('input')
    if (input.value){
        console.log(input.value)
        socket.emit('message', input.value)
        input.value=""
    }
    input.focus()
}

// adds send message to the form
/*document.querySelector('form').addEventListener('submit', sendMessage)*!/
function addSendMessage(){
    document.querySelector('#chatform').addEventListener('submit', sendMessage)
    console.log("ye")
}*/

//listens for messages and adds it to the page
socket.on("message", (data) => {
    const li = document.createElement('li')
    li.textContent = data
    document.querySelector('ul').appendChild(li)
})
