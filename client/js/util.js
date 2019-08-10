function clamp(val, min, max) {
    return Math.max(min, Math.min(val, max));
}

function fitStageIntoParentContainer(){
    if(!theBoard){
        return;
    }
    let stage = theBoard.stage;

    if (stage === undefined) {
        console.log("stage undefined");
        return;
    }
    
    var container = document.querySelector('#ctx');
    var containerWidth = container.offsetWidth;
    
    var scale = containerWidth / 600;
    
    stage.setWidth(600 * scale);
    stage.setHeight(600 * scale);
    stage.setScale({ x: scale, y: scale });
    stage.draw(); 
}

function debug(data) {
    if (verbose) {
        console.log(data);
    }
}

function displayLobbyList(){
    socket.emit("getLobbyList");
}

function sendChat() {
    let input = $("#chatInput");
    let msg = input.val();

    //case of command
    if(msg.indexOf("/") == 0){

        //join
        if (msg.indexOf("/join") == 0) {
            //if already in lobby
            if(myLobby !== undefined){
                input.val("");
                addMsgToChat("Already in a lobby", 4, true);
                return;
            }
            //otherwise send off to server
            else{
                socket.emit("chat", msg);
                input.val("");
                return;
            }
        }
        //create
        else if (msg.indexOf("/create") == 0) {
            //if already in lobby
            if(myLobby !== undefined){
                input.val("");
                addMsgToChat("/leave before creating new lobby", 4, true);
                return;
            }
            //otherwise send off to server
            else {
                socket.emit("chat", msg);
                input.val("");
                return;
            }
        }
        //clear
        else if (msg.indexOf("/clear") == 0) {
            //if not in lobby -> clear chat, no server
            if (myLobby === undefined) {
                input.val("");
                clearChat();
                return;
            } 
            //otherwise send to server
            else {
                socket.emit("chat", msg);
                input.val("");
                return;
            }
        }
        //list
        else if (msg.indexOf("/list") == 0) {
            //if not in lobby -> clear chat, no server
            if (myLobby === undefined) {
                displayLobbyList();
                input.val("");
                return;
            }
            //otherwise send to server
            else {
                socket.emit("chat", msg);
                input.val("");
                return;
            }
        }
        //help
        else if (msg.indexOf("/help") == 0) {
            //if not in lobby -> display commands, no server
            if (myLobby === undefined) {
                displayCommands();
                input.val("");
                return;
            }
            //otherwise send to server
            else {
                socket.emit("chat", msg);
                input.val("");
                return;
            }
        } 
        //other command -> send to server
        else{
            socket.emit("chat", msg);
            input.val("");
            return;
        }
    } 
    //if not command, and empty message -> clear input, do nothing
    else if (!msg || msg.trim() == "") {
        input.val("");
        return;
    }

    //emit, add to chat, and clear textbox
    socket.emit("chat", msg);
    input.val("");
    addMsgToChat(msg);
}

function addMsgToChat(msg, colorNum = myColor, overrideMsg = false) {
    let color;
    let cssColor;

    if(theBoard === undefined){
        color = "Guest";
        cssColor = "Black";
    } else if (colorNum == -1) {
        color = "Black";
        cssColor = "Black";
    } else{
        color = theBoard.gameInfo.numToColor[colorNum];
        cssColor = theBoard.gameInfo.numToCSSColor[colorNum];
    }

    shortenChat();

    if (overrideMsg) {
        $("#chatList").append($("<li class='chatMessage'>").text(msg).css('color', cssColor));
        return;
    }
    $("#chatList").append($("<li class='chatMessage'>").text(color + ": " + msg).css('color', cssColor));
}

function addNewLineToChat(){
    $("#chatList").append($("<li class='chatMessage'>").text(" ")); //alt + 255
}

function shortenChat(){
    if($("#chatList").children().length > 14){
        $("#chatList").html( $("#chatList").children().slice(-14) );
    }
}

function clearChat(verbose=true) {
    $("#chatList").html("");
    if(verbose){
        addMsgToChat("Chat Cleared", "4", true);
    }
}

function clearCanvases(){
    let mainCanvas = document.querySelector("#ctx > div > canvas");
    let mainCanvasCtx = mainCanvas.getContext("2d");

    let cardCanvas = document.querySelector("#cardCanvas");
    let cardCanvasCtx = cardCanvas.getContext("2d");

    mainCanvasCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
    cardCanvasCtx.clearRect(0, 0, cardCanvas.width, cardCanvas.height);

    $("#ctx > div > canvas").css("background", "none");
}

function displayCommands(){
    if(myLobby === undefined){
        addNewLineToChat();
        addMsgToChat("/join <name>", 4, true);
        addMsgToChat("/create <gamecode> <name>", 4, true);
        addMsgToChat("/list", 4, true);
        addMsgToChat("/games", 4, true);
        addMsgToChat("/clear", 4, true);
    } else{
        theBoard.displayCommands();
    }
    
}

function getGameByCode(gameCode){
    for (let i = 0; i < gameInfo.gameList.length; i++) {
        if(gameInfo.gameList[i].gameCode == gameCode){
            return gameInfo.gameList[i];
        }
    }
}

function newGame(firstGame=false){
    debug("starting new Game");
    let gameInfo = getGameByCode(currentGameCode);
    theBoard = new Board(gameInfo);
    fitStageIntoParentContainer();

    let cardCanvas = document.querySelector("#cardCanvas");
    let cardCanvasCtx = cardCanvas.getContext("2d");
    cardCanvasCtx.clearRect(0, 0, cardCanvas.width, cardCanvas.height);

    if(firstGame){
        addMsgToChat("You are " + theBoard.gameInfo.numToColor[myColor], myColor, true);
    }
}

function displayCardOnCanvas(cardVal) {
    cardVal = cardVal.toString();
    let cardDesc;

    for (let i = 0; i < theBoard.gameInfo.cardList.length; i++) {
        if (theBoard.gameInfo.cardList[i][cardVal] !== undefined){
            cardDesc = theBoard.gameInfo.cardList[i][cardVal];
        }
    }

    let cardCanvas = document.getElementById("cardCanvas");
    let cardCanvasCtx = cardCanvas.getContext("2d");
    cardCanvasCtx.font = '25px Arial';

    //clear card
    cardCanvasCtx.clearRect(0, 0, cardCanvas.width, cardCanvas.height);
    cardCanvasCtx.fillStyle = "red";
    cardCanvasCtx.textAlign = "center";
    cardCanvasCtx.fillText(cardVal, cardCanvas.width / 2, cardCanvas.height / 5);

    var lineheight = 30;
    var lines = cardDesc.split('\n');

    for (var i = 0; i < lines.length; i++)
        cardCanvasCtx.fillText(lines[i], cardCanvas.width / 2, cardCanvas.width / 2 + (i * lineheight));
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function changeDeckColor(){
    debug("hit");
    let color = getRandomColor();
    let card = theBoard.layer.find(".card");
    card.fill(color);
    theBoard.layer.draw();
}