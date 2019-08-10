var util = require('./util.js');
let Games = require("./../shared/gameInfo.js");
for (var key in util)
    global[key] = util[key];

class Lobby {
    constructor(LobbyNum, gameInfo, lobbyName) {
        this.id = LobbyNum;
        this.gameInfo = gameInfo;
        this.name = lobbyName ? lobbyName : LobbyNum;
        this.playerList = []; //[{color:0, socket:socket, holding: undefined}, ]
        this.gameState = []; //[{index:1, position:{x:0, y:0}}, ...]
        this.currentCard = undefined;
    }
    newGame() {
        this.broadCast("newGame");
        this.clearPlayerHoldings();
        this.gameState = [];
        this.currentCard = undefined;
    }
    updateGameState(index, position) {
        let found = false;
        for (let i = 0; i < this.gameState.length; i++) {
            if (this.gameState[i].index == index) {
                found = true;
                this.gameState[i].position = position;
            }
        }
        if (!found) {
            this.gameState.push({ index: index, position: position });
        }
    }
    sendGameState(socket) {
        socket.emit("gameState", this.gameState);
        if (this.currentCard) {
            socket.emit("newCard", {card: this.currentCard, override: true});
        }
    }
    forceGameState() {
        for (let i = 0; i < this.playerList.length; i++) {
            this.sendGameState(this.playerList[i].socket);
        }
    }
    isFull() {
        return this.playerList.length >= this.gameInfo.maxNumPlayers;
    }
    hasRoom() {
        return this.playerList.length < this.gameInfo.maxNumPlayers;
    }
    isEmpty() {
        return this.playerList.length == 0;
    }
    broadCast(type, msg) {
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i].socket.emit(type, msg);
        }
    }
    getPlayerInfoFromSocket(socket){
        if (!socket) {
            debug("error: calling Lobby.getPlayerInfoFromSocket with undefined socket");
            return;
        }

        for (let i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].socket == socket) {
                return this.playerList[i];
            }
        }
    }
    broadCastExceptToSocket(type, msg, socket){
        if (!socket) {
            debug("error: calling Lobby.broadCastExceptToSocket with undefined socket");
            return;
        }

        for (let i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].socket == socket) {
                continue;
            }
            this.playerList[i].socket.emit(type, msg);
        }
    }
    broadCastExceptToColor(type, msg, color) {
        if (color === undefined) {
            debug("error: calling Lobby.broadCastExceptToColor with undefined color");
            return;
        }
        for (let i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].color == color) {
                continue;
            }
            this.playerList[i].socket.emit(type, msg);
        }
    }
    broadCastToColor(type, msg, color) {
        for (let i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].color == color) {
                this.playerList[i].socket.emit(type, msg);
                return;
            }
        }
    }
    getSmallestUniquePlayerColor() {
        let colors = this.gameInfo.playerColorNums.slice(); //duplicate array
        colors.sort(function (a, b) { return b - a });

        for (let i = 0; i < this.playerList.length; i++) {
            let index = colors.indexOf(this.playerList[i].color);
            colors.splice(index, 1);
        }
        return colors.pop();
    }
    add(socket) {
        if(!socket){
            debug("error: calling Lobby.add with undefined socket");
            return;
        }
        let playerColor = this.getSmallestUniquePlayerColor();
        this.playerList.push({ color: playerColor, socket: socket, holding: undefined });
        
        
        socket.emit("joined", { id: this.id, gameCode: this.gameInfo.gameCode });
        this.sendGameState(socket);
        socket.emit("yourColor", playerColor);
        this.broadCastExceptToSocket("playerJoined", playerColor, socket);
        socket.lobby = this;
    }
    kick(color) {
        if(color === undefined){
            debug("color undefined at Lobby.kick");
            return;
        }
        color = color.trim().toLowerCase();
        for (let i = 0; i < this.playerList.length; i++) {
            if (this.gameInfo.numToColor[this.playerList[i].color].toLowerCase() == color) {
                let player = this.playerList[i];
                this.playerList.splice(i, 1);
                player.socket.emit("getKicked");
                this.broadCast("playerLeft", player.color);
            }
        }
    }
    removePlayer(socket){
        for (let i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].socket == socket) {
                let player = this.playerList[i];
                this.playerList.splice(i, 1);
                player.socket.emit("removedFromLobby");
                this.broadCast("playerLeft", player.color);
            }
        }
    }
    pieceIsOpen(num) {
        for (let i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].holding == num) {
                return false;
            }
        }
        return true;
    }
    clearPlayerHoldings() {
        for (let i = 0; i < this.playerList.length; i++) {
            this.playerList[i].holding = undefined;
        }
    }
    setPlayerHolding(socket, piece) {
        for (let i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].socket == socket) {
                this.playerList[i].holding = piece;
                return;
            }
        }
    }
    playerIsHolding(socket, piece) {
        for (let i = 0; i < this.playerList.length; i++) {
            if (this.playerList[i].socket == socket && this.playerList[i].holding == piece) {
                return true;
            }
        }
        return false;
    }
    pushRandomCard() {
        for (let i = 0; i < this.gameInfo.cardList.length; i++) {
            if (Math.random() < this.gameInfo.cardListProbabilities[i]){
                let cardVal = Object.keys(this.gameInfo.cardList[i]).random();
                this.currentCard = cardVal;
                this.broadCast("newCard", { card: cardVal, override: false });
                return;
            }
        }
    }
    pushPlayerList(socket){
        let players = [];
        for (let i = 0; i < this.playerList.length; i++) {
            players.push(this.playerList[i].color);
        }
        socket.emit("playerList", players);
    }
    rollColor(){
        let roll = this.gameInfo.rollColors.random();
        this.broadCast("colorRoll", roll);
    }
    rollNum(){
        let roll = this.gameInfo.rollNums.random();
        this.broadCast("numRoll", roll);
    }
    howtoplay(socket){
        socket.emit("openHowToPlay")
    }
    executeCommand(socket, cmd, params){
        if(!socket || cmd === undefined){
            debug("socket or cmd undefined at Lobby.executeCommand");
            return;
        }

        switch (cmd) {
            case "sendCommands":
                this.sendCommands(socket);
                break;
            case "clearChat":
                this.broadCast("clearChat");
                break;
            case "newGame":
                this.newGame();
                break;
            case "kickPlayer":
                this.kick(params[0]);
                break;
            case "forceGameState":
                this.forceGameState();
                break;
            case "clearPlayerHoldings":
                this.clearPlayerHoldings();
                break;
            case "rollColor":
                this.rollColor();
                break;
            case "newCard":
                this.pushRandomCard();
                break;
            case "listPlayers":
                this.pushPlayerList(socket);
                break;
            case "playerLeave":
                this.removePlayer(socket);
                break;
            case "howtoplay":
                this.howtoplay(socket);
                break;
            case "rollNum":
                this.rollNum();
                break;
        }
    }
    newChat(socket, msg){
        let allCommands = this.gameInfo.commands;

        //command handling
        if(msg.indexOf("/") == 0){
            let tokenArray = msg.slice(1).split(" ");
            let command = tokenArray[0];
            let params = tokenArray.splice(1);

            //if command exists
            if (allCommands[command] !== undefined){
                //execute all sub commands
                for (let i = 0; i < allCommands[command].length; i++) {
                    this.executeCommand(socket, allCommands[command][i], params);
                }
                return;
            }
            //invalid command
            else{
                socket.emit("invalidLobbyCommand");
                return;
            }
        } 
        //not a command -> send as chat
        else{
            let playerInfo = this.getPlayerInfoFromSocket(socket);
            if(playerInfo === undefined){
                debug("playerInfo undefined at lobby.newChat > getPlayerInfoFromSocket");
                return;
            }
            this.broadCastExceptToSocket("newMsg", {msg: msg, color: playerInfo.color}, socket);
        }
    }
    sendCommands(socket){
        if(!socket){
            debug("socket undefined at lobby.sendCommands");
            return;
        }

        let commands = Object.keys(this.gameInfo.commands);
        for (let i = 0; i < commands.length; i++) {
            commands[i] = "/" + commands[i];
        }
        socket.emit("commandList", commands);
    }
}

class LobbyManager {
    constructor() {
        this.lobbies = [];
    }
    getOpenLobbyList() {
        let openLobbyList = [];
        for (let i = 0; i < this.lobbies.length; i++) {
            if (this.lobbies[i].hasRoom()) {
                openLobbyList.push(this.lobbies[i]);
            }
        }
        return openLobbyList;
    }
    getUniqueLobbyId() {
        let lobbyids = [];
        for (let i = 0; i < this.lobbies.length; i++) {
            lobbyids.push(this.lobbies[i].id);
        }
        let i = 1;
        while (true) {
            if (lobbyids.includes(i)) {
                i++;
                continue;
            }
            return i;
        }
    }
    maintainLobbies() {

        //initialize all gameCodes
        let gameLobbiesNeeded = [];
        for (let i = 0; i < Games.gameList.length; i++) {
            gameLobbiesNeeded.push(Games.gameList[i].gameCode);
        }

        //loop through all lobbies
        for (let i = 0; i < this.lobbies.length; i++) {
            let lobby = this.lobbies[i];
            let gameCode = lobby.gameInfo.gameCode;

            //clear unnecessary lobbies
            if (lobby.isEmpty() && !gameLobbiesNeeded.includes(gameCode)){
                this.lobbies.splice(i, 1);
                i--;
                continue;
            }

            //mark which games have open lobbies
            if(lobby.hasRoom()){
                if (gameLobbiesNeeded.includes(gameCode)) {
                    let index = gameLobbiesNeeded.indexOf(gameCode);
                    gameLobbiesNeeded.splice(index, 1);
                }
            }
        }

        //open all lobbies that need to be opened
        for (let i = 0; i < gameLobbiesNeeded.length; i++) {
            let id = this.getUniqueLobbyId();
            let game = Games.gameList[gameLobbiesNeeded[i]];
            let name = game.simpleName + id.toString();
            this.lobbies.push(new Lobby(id, game, name));
        }
    }
    removePlayer(socket) {
        let lobby = this.getLobbyBySocket(socket)
        if(lobby === undefined){
            return;
        }
        lobby.removePlayer(socket);
        socket.lobby = undefined;
    }
    getLobbyById(id) {
        for (let i = 0; i < this.lobbies.length; i++) {
            if (this.lobbies[i].id == id) {
                return this.lobbies[i];
            }
        }
    }
    getLobbyByName(name) {
        for (let i = 0; i < this.lobbies.length; i++) {
            if (this.lobbies[i].name == name) {
                return this.lobbies[i];
            }
        }
    }
    getLobbyBySocket(socket){
        return socket.lobby;
        /*
        for (let i = 0; i < this.lobbies.length; i++) {
            for (let j = 0; j < this.lobbies[i].playerList.length; j++) {
                if(this.lobbies[i].playerList[j].socket == socket){
                    return this.lobbies[i];
                }
            }
        }
        */
    }
    joinLobbyById(lobbyId, socket) {
        let lobby = this.getLobbyById(lobbyId);
        if (lobby === undefined || lobby.isFull()) {
            socket.emit("failedToJoin");
            return;
        }
        lobby.add(socket);
    }
    joinLobbyByName(lobbyName, socket){
        let lobby = this.getLobbyByName(lobbyName);
        if (lobby === undefined || lobby.isFull()) {
            socket.emit("failedToJoin");
            return;
        }
        this.joinLobbyById(lobby.id, socket);
    }
    sendOpenLobbys(socket){
        let openLobbyList = this.getOpenLobbyList();
        let lobbyNameList = [];

        for (let i = 0; i < openLobbyList.length; i++) {
            lobbyNameList.push(openLobbyList[i].name);
        }

        socket.emit("lobbyList", lobbyNameList);
    }
    getRandomCard(socket){
        let lobby = this.getLobbyBySocket(socket);
        if (lobby === undefined){
            throw Error("Socket doesnt have an associated lobby at LobbyManager.getRandomCard");
        }
        lobby.getRandomCard();
    }
    nameTaken(name){
        for (let i = 0; i < this.lobbies.length; i++) {
            if(this.lobbies[i].name == name){
                return true;
            }
        }
        return false;
    }
    createNewLobby(type, name, socket){
        type = type.toString().toLowerCase();
        name = name.toString();
        //get gameCode based off type
        let gameCode = undefined;
        for (let i = 0; i < Games.gameList.length; i++) {
            if(Games.gameList[i].simpleName == type){
                gameCode = Games.gameList[i].gameCode;
                break;
            }
        }

        //validate name
        if (this.nameTaken(name)){
            socket.emit("lobbyCreationFailed", "Name taken");
            return;
        }

        //validate gameCode
        if (gameCode === undefined) {
            socket.emit("lobbyCreationFailed", "Invalid Game");
            return;
        }
        
        //create lobby, push it to list, and add player
        debug("making new lobby");
        let lobby = new Lobby(this.getUniqueLobbyId(), Games.gameList[gameCode], name);
        this.lobbies.push(lobby);
        if(socket){
            lobby.add(socket);
        }
    }
    newChat(socket, msg){
        //for joining a lobby
        if (msg.indexOf("/join") == 0) {
            let lobbyName = msg.replace("/join", "").trim();
            if (lobbyName) {
                this.joinLobbyByName(lobbyName, socket);
            } else{
                this.sendOpenLobbys(socket);
            }
            return;
        //create new lobby syntax /create <type> <name>
        } else if (msg.indexOf("/create") == 0){
            msg = msg.replace("/create", "").trim();
            let splitPoint = msg.indexOf(" ");
            if(splitPoint === -1){
                socket.emit("lobbyCreationFailed", "Must have gamecode and name");
                return;
            }

            let type = msg.substring(0, splitPoint).trim();
            let name = msg.substring(splitPoint).trim();

            if (type === undefined || name === undefined) {
                socket.emit("lobbyCreationFailed", "Must have gamecode and name");
                return;
            }

            if (name.length > 15) {
                socket.emit("lobbyCreationFailed", "Name too long (<16)");
                return;
            }
            
            this.createNewLobby(type, name, socket);
            return;
        }
        //available games
        else if (msg.indexOf("/games") == 0) {
            hit();
            let games = [];
            for (let i = 0; i < Games.gameList.length; i++) {
                games.push(Games.gameList[i].gameName + " : " + Games.gameList[i].simpleName);
            }
            socket.emit("gameList", games)
            return;
        }

        //chat inside lobby
        let lobby = this.getLobbyBySocket(socket);
        if (lobby === undefined) {
            //invalid command while not in lobby
            if(msg.indexOf("/") == 0){
                socket.emit("invalidLobbyCommand");
            }
            return;
        }

        lobby.newChat(socket, msg);

        this.maintainLobbies();
    }
}

exports.Lobby = Lobby;
exports.LobbyManager = new LobbyManager();

module.exports = exports;