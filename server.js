let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let port = process.env.PORT || 3000;
let messages = [];
let users = [];

app.use(express.static('public'));

io.on('connection', function (socket) {
    let user = {
        name: '',
        color: ''
    };
    socket.on('cookies', function (msg) {
        let cname = decodeURIComponent(msg[0]);
        if (cname !== '') {
            function nameExists (obj) {
                return obj.name === cname;
            }

            if (users.find(nameExists ) === undefined) {
                user.name = cname;
                user.color = decodeURIComponent(msg[1]);
                users.push(user);
            }
            else {
                user = randomUserName();
            }
        }
        else {
            user = randomUserName();
        }
        for (let m of messages) {
            socket.emit('chat message', m);
        }
        socket.emit('name change', user);
        io.emit('users update', users);
    });

    // timestamps for messages
    socket.on('chat message', function (msg) {
        let firstWord = msg.toLowerCase().split(" ")[0];
        let d = new Date();
        let message = {
            time: ('00' + d.getHours()).slice(-2) + ":" + ('00' + d.getMinutes()).slice(-2),
            user: user.name,
            color: user.color,
            msg: msg
        };

        io.emit('chat message', message);
        messages.push(message);

        //change nickname assigned
        if (firstWord === '/nick') {
            let newName = msg.substring(6);

            function nameExists (obj) {
                return obj.name === newName;
            }
            if (newName.trim() !== "" && users.find(nameExists ) === undefined) {
                user.name = newName;
                socket.emit('name change', user);
                io.emit('users update', users);
            }
        }

        //change nickname color assigned
        else if (firstWord === '/nickcolor') {
            let newColor = msg.substring(11);
            if (/^[0-9A-F]{6}$/i.test(newColor)) {
                user.color = '#' + newColor;
                socket.emit('name change', user);
                io.emit('users update', users);
            }
        }
    });

    // close connection on socket
    socket.on('disconnect', function () {
        function dcName(obj) {
            return obj.name === user.name;
        }
        users.splice(users.findIndex(dcName), 1);
        io.emit('users update', users);
    });
});

http.listen(port, function () {
    console.log('listening on *:' + port);
});

// random names generator: emoji names
function randomUserName() {
    let userRandomNames = 'shirtshrimp, signalerblossom, ladcalling, tektonguardsman, bullcrown, sombericecream, batchskull, magnetdividers, muddyghost, includesparkler, mobileend, insideblush, insulinsoccer, songwrench, crosshairsnerd, registeredmelon, photospheretv, kindlyspaghetti, ballsdagger, wilsoncancer, linkageman';
    let emojis = userRandomNames.split(", ");
    let name = emojis[Math.floor(Math.random() * emojis.length)];

    function nameExists (obj) {
        return obj.name === name;
    }
    while (users.find(nameExists) !== undefined) {
        name = emojis[Math.floor(Math.random() * emojis.length)];
    }

    let user = {
        name: name,
        color: '#' + Math.floor(Math.random() * 999999)
    };
    users.push(user);
    return user;
}
