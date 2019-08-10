
//imports
let { express, app, server, io } = require("./expressServer.js");
let { Lobby, LobbyManager } = require("./server/classes.js");

let Games = require("./shared/gameInfo.js");
let util = require('./server/util.js');
for (let key in util)
    global[key] = util[key];

//sockets
io.sockets.on('connection', function (socket) {

    LobbyManager.maintainLobbies();
    LobbyManager.sendOpenLobbys(socket);

    socket.on("disconnect", function () {
        LobbyManager.removePlayer(socket);
        LobbyManager.maintainLobbies();
    });

    socket.on("grabbedPiece", function (startObj) {
        let lobby = LobbyManager.getLobbyBySocket(socket);
        if(!lobby){
            debug("lobby is undefined at dragStart");
            return;
        }

        if(lobby.pieceIsOpen(startObj.piece)){
            lobby.setPlayerHolding(socket, startObj.piece);
        }
        else{
            socket.emit("letGo");
        }
    });

    socket.on("movedPiece", function (moveObj) {
        let lobby = LobbyManager.getLobbyBySocket(socket);
        if (!lobby) {
            debug("lobby is undefined at movedPiece");
            return;
        }
        if (lobby.playerIsHolding(socket, moveObj.piece)) {
            let unitPosition = {x: moveObj.x, y:moveObj.y, piece:moveObj.piece};
            lobby.broadCastExceptToColor("pieceMoving", unitPosition, moveObj.color);
        }
    });

    socket.on("droppedPiece", function (dropObj) {
        let lobby = LobbyManager.getLobbyBySocket(socket);
        if (!lobby) {
            debug("lobby is undefined at droppedPiece");
            return;
        }

        if (lobby.playerIsHolding(socket, dropObj.piece)) {
            let unitPosition = { x: dropObj.x, y: dropObj.y, piece: dropObj.piece };
            lobby.broadCastExceptToColor("pieceDropped", unitPosition, dropObj.color);
            lobby.setPlayerHolding(socket, undefined);
            lobby.updateGameState(dropObj.piece, unitPosition);
        }
    });

    socket.on("getLobbyList", function (moveObj) {
        LobbyManager.maintainLobbies();
        LobbyManager.sendOpenLobbys(socket);
    });
 
    //card handling
    socket.on("getNewCard", function (lobbyid) {
        LobbyManager.getRandomCard(socket);
    });

    //chat handling
    socket.on("chat", function (msg) {
        //Length validation
        if (msg > exports.MaxChatLength) {
            return;
        }

        LobbyManager.newChat(socket, msg);


        /*
        //Command for joining lobby
        if (chatObj.msg.indexOf("/join") == 0) {
            maintainLobbies();
            //join a lobby
            let lobbyNum = chatObj.msg.replace("/join", "").trim();
            if(lobbyNum){
                joinLobby(lobbyNum, socket);
            }
            maintainLobbies();
            return;
        }
        //All other commands require a valid lobby number
        let lobby = getLobby(chatObj.lobby);
        if(!lobby){
            debug("invalid lobby number at chat handling");
            return;
        }
        //New game command
        if (chatObj.msg == "/ng") {
            debug("starting new game");
            maintainLobbies();
            lobby.newGame();
            return;
        }
        //clear chat
        else if (chatObj.msg == "/clear") {
            lobby.broadCast("clearChat");
            return;
        }
        //Roll
        else if (chatObj.msg == "/roll") {
            let value = Math.floor(Math.random() * 4);
            lobby.broadCast("rollValue", value);
            return;
        }
        //force game state + remove all player holdings
        else if (chatObj.msg == "/fix") {
            lobby.clearPlayerHoldings();
            lobby.forceGameState();
            return;
        }
        //kick player
        else if (chatObj.msg.indexOf("/kick") == 0) {
            maintainLobbies();
            let color = chatObj.msg.replace("/kick", "").trim();
            let num = ColorToNum[color];
            if (num !== undefined) {
                debug("kicking " + color);
                lobby.kick(num);
            }
        }

        //Normal text, not a command
        lobby.broadCastExceptToColor("newMsg", chatObj, chatObj.color);
        */
    });
});