'use strict';

let theBoard;
let myColor;
let myLobby;
let currentGameCode;
let socket;
let verbose = true;
let firstGame = true;
let NotSeenHelpCommand = true;

$(document).ready(function () {
    

    window.addEventListener('resize', fitStageIntoParentContainer);

    socket = io();

    socket.on("lobbyList", (lobbyList) => {
        //clearChat(false);
        addNewLineToChat();
        addMsgToChat("Open Lobbies: ", -1, true);
        addNewLineToChat();
        for (let i = 0; i < lobbyList.length; i++) {
            addMsgToChat(lobbyList[i].toString(), -1, true);
        }
        addNewLineToChat();
        if (NotSeenHelpCommand) {
            addMsgToChat("Type /help for help", -1, true);
            NotSeenHelpCommand = false;
        }
    });

    socket.on("gameList", (games) => {
        addNewLineToChat();
        addMsgToChat("Game : gamecode", -1, true);
        addNewLineToChat();
        for(let i in games){
            addMsgToChat(games[i], -1, true);
        }
    });

    socket.on("joined", (lobbyInfo) => {
        debug("joined lobby: " + lobbyInfo.id);
        myLobby = lobbyInfo.id;
        currentGameCode = lobbyInfo.gameCode;

        newGame(firstGame);
        firstGame = false;
    });

    socket.on("failedToJoin", () => {
        debug("failed to join lobby");

        //clearChat(false);
        addNewLineToChat();
        addMsgToChat("Failed to join lobby", -1, true);
        socket.emit("getLobbyList");
    });

    socket.on("yourColor", (color) => {
        myColor = color;
        clearChat(false);
        if(theBoard !== undefined){
            addNewLineToChat();
            addMsgToChat("You are " + theBoard.gameInfo.numToColor[color], color, true);
        }
    });

    socket.on("newMsg", (chatObj) => {
        addMsgToChat(chatObj.msg, chatObj.color);
    });

    socket.on("commandList", (commands) => {
        addNewLineToChat();
        addMsgToChat("Available Commands: ", -1, true);
        addNewLineToChat();
        for (let i = 0; i < commands.length; i++) {
            addMsgToChat(commands[i], -1, true);
        }
    });

    socket.on("invalidLobbyCommand", () => {
        addNewLineToChat();
        addMsgToChat("Server: Invalid command", -1, true);
    });

    socket.on("newCard", (cardObj) => {
        displayCardOnCanvas(cardObj.card);
        if(!cardObj.override){
            changeDeckColor();
        }  
    });

    socket.on("colorRoll", (colorNum) => {
        addMsgToChat("Rolled " + theBoard.gameInfo.numToColor[colorNum], colorNum, true);
    });

    socket.on("numRoll", (roll) => {
        addMsgToChat("Rolled " + roll, -1, true);
    });

    socket.on("getKicked", () => {
        window.location.href = "https://www.youtube.com/watch?v=Wp1kzZ-eDTw";
    });

    socket.on("openHowToPlay", () => {
        if(theBoard === undefined){
            return;
        }
        let url = theBoard.gameInfo.howToPlayLink;
        if(url !== ""){
            window.open(url);
        }
    });

    socket.on("removedFromLobby", () => {
        theBoard.adjustCss(false);
        theBoard = undefined;
        myColor = undefined;
        myLobby = undefined;
        clearChat(false);
        addMsgToChat("Left Lobby", -1, true);
        socket.emit("getLobbyList");
        clearCanvases();
    });

    socket.on("lobbyCreationFailed", (reason) => {
        addNewLineToChat();
        addMsgToChat("Failed to create Lobby: " + reason, -1, true);
    });

    socket.on("letGo", () => {
        if (theBoard.currentPiece) {
            theBoard.dropPiece = true;
        }
    });

    socket.on("rollValue", (value) => {
        addMsgToChat("Rolled " + theBoard.gameInfo.numToColor[value], value, true);
    });

    socket.on("pieceMoving", (unitPosition) => {
        theBoard.setUnitPosition(unitPosition.piece, unitPosition);
    });

    socket.on("pieceDropped", (unitPosition) => {
        theBoard.setUnitPosition(unitPosition.piece, unitPosition);
    });

    socket.on("gameState", (histArr) => {
        debug(histArr);
        for(let i=0;i<histArr.length;i++){
            theBoard.setUnitPosition(histArr[i].index, histArr[i].position);
        }
    });

    socket.on("clearChat", () => {
        clearChat();
    });

    socket.on("newGame", () => {
        newGame(firstGame);
    });

    socket.on("playerJoined", (color) => {
        addMsgToChat("Server: " + theBoard.gameInfo.numToColor[color] + " Joined", -1, true)
    });

    socket.on("playerLeft", (color) => {
        addMsgToChat("Server: " + theBoard.gameInfo.numToColor[color] + " Left", -1, true)
    });

    socket.on("playerList", (players) => {
        addNewLineToChat();
        addMsgToChat("Currently Online: ", -1, true);
        addNewLineToChat();
        for (let i = 0; i < players.length; i++) {
            addMsgToChat(theBoard.gameInfo.numToColor[players[i]], players[i], true);
        }
    });

    $(document).keydown(function (e) {
        if (e.keyCode === 27) { //bind fix to escape
            socket.emit("chat", { "color": myColor, "msg": "/fix", "lobby": myLobby });
            return;
        }
        else if (e.keyCode == 13) { //enter
            $("#chatInput").focus();
            sendChat();
        }
        else {
            $("#chatInput").focus();
        }
    });

});
