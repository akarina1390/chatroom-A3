$(function () {
    let socket = io();
    let myName;
    let m = $('#m');
    let messages = $('#messages');

    socket.emit('cookies', [getCookie('name'),getCookie('color')]);

    $('form').submit(function(){
        socket.emit('chat message', m.val());
        m.val('');
        return false;
    });
    socket.on('chat message', function(msg){
        let displayMsg = msg.time + ' <span>' + msg.user + '</span>: ' + msg.msg;
        if(msg.user === myName) {
            displayMsg = '<div class=\"mine\">' + displayMsg + "</div>"
        }
        let cs = checkScroll();
        messages.append($('<li>').html(displayMsg));
        messages.find('li:last').find('span').css('color', msg.color);
        if(cs) {
            messages[0].scrollTop = messages[0].scrollHeight;
        }
    });
    socket.on('users update', function(msg){
        let users = $('#users');
        users.empty();
        for(let user of msg) {
            users.append($('<li>').text(user.name));
        }
    });
    socket.on('name change', function(msg){
        let name = $('#name');
        let displayMsg = 'You are now <span>' + msg.name + '</span>.';
        let cs = checkScroll();
        name.text('You are ' + msg.name + '.');
        messages.append($('<li>').html(displayMsg));
        messages.find('li:last').find('span').css('color', msg.color);
        if(cs) {
            messages[0].scrollTop = messages[0].scrollHeight;
        }
        myName = msg.name;
        setCookie('name', encodeURIComponent(myName), 1);
        setCookie('color', encodeURIComponent(msg.color), 1);
    });

    function checkScroll() {
        return (messages[0].scrollTop >= messages[0].scrollHeight - messages[0].offsetHeight);
    }

    function setCookie(cname, cvalue, exdays) {
        let d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
});
