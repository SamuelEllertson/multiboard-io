'use strict';

class Board{
    constructor(gameInfo){
        this.gameInfo = gameInfo;
        this.stage = new Konva.Stage({
            container: 'ctx',
            width: 600,
            height: 600
        });
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        this.pieceList = [];

        this.currentPiece = undefined;
        this.dropPiece = false;

        this.currentCard = undefined;

        this.adjustCss(true);
        this.setBackground();
        this.addDefaultPieces();
        this.addDeck();
        this.addRollButton();
        this.setupEvents();
    }

    adjustCss(starting=true){
        if(starting){
            if (this.gameInfo.usesCards) {
                $("#cardCanvas").show();
            } else {
                $("#cardCanvas").hide();
            }
        } else{
            $("#cardCanvas").hide();
        }
        
    }
    setBackground(){
        $("#ctx > div > canvas").css("background", "url(" + this.gameInfo.background + ")");
    }
    addRollButton(){
        if (!this.gameInfo.useRollButton) {
            return;
        }

        var rollButton = new Konva.Rect({
            x: this.gameInfo.rollButtonInfo.x,
            y: this.gameInfo.rollButtonInfo.y,
            width: this.gameInfo.rollButtonInfo.width,
            height: this.gameInfo.rollButtonInfo.height,
            fill: this.gameInfo.rollButtonInfo.color,
            stroke: 'black',
            strokeWidth: 4,
            name: 'rollButton'
        });

        this.layer.add(rollButton);
    }
    addDeck(){
        if (!this.gameInfo.usesCards){
            return;
        }
        let boardSize = 600;
        let cardWidth = 80;
        let cardHeight = cardWidth * 1.5;
        let horizontalGap = 20;
        let verticalOffset = 0;

        var deck = new Konva.Rect({
            x: boardSize / 2 - cardWidth - horizontalGap / 2,
            y: boardSize / 2 - cardHeight / 2 + verticalOffset, 
            width: cardWidth,
            height: cardHeight,
            fill: 'grey',
            stroke: 'black',
            strokeWidth: 4,
            name: 'deck'
        });

        var card = new Konva.Rect({
            x: boardSize / 2 + horizontalGap / 2,
            y: boardSize / 2 - cardHeight / 2 + verticalOffset,
            width: cardWidth,
            height: cardHeight,
            fill: 'lightgrey',
            stroke: 'black',
            strokeWidth: 4,
            name: 'card'
        });
        this.layer.add(deck);
        this.layer.add(card);
    }

    getUnitPosition(index){
        index = parseInt(index);
        let piece = this.pieceList[index];

        let position = piece.position();

        return {
            x: position.x,
            y: position.y
        }
    }

    setUnitPosition(index, unitPos){
        index = parseInt(index);
        let piece = this.pieceList[index];

        piece.moveToTop();

        let newPos = {
            x: unitPos.x,
            y: unitPos.y
        }

        let position = piece.position(newPos);
        theBoard.layer.draw();
    }

    setupEvents(){
        let layer = this.layer;
        let getUnitPos = this.getUnitPosition.bind(this);

        this.stage.on("dragstart", function (e) {
            console.log('Grabbed ' + e.target.name());
            e.target.moveToTop();

            theBoard.currentPiece = e.target;
            socket.emit("grabbedPiece", { lobby: myLobby, color: myColor, piece: e.target.name() });

            layer.draw();
        });

        this.stage.on("dragmove", function (e) {
            //if told to drop -> dont send information
            if(this.dropPiece){
                layer.draw();
                return;
            }

            let unitPos = getUnitPos(e.target.name());
            socket.emit("movedPiece", { lobby: myLobby, color: myColor, piece: e.target.name(), x: unitPos.x, y: unitPos.y});

            layer.draw();
        });

        this.stage.on("dragend", function (e) {
            console.log('Dropped ' + e.target.name());
            this.dropPiece = false;
            this.currentPiece = undefined;

            let unitPos = getUnitPos(e.target.name());
            socket.emit("droppedPiece", { lobby: myLobby, color: myColor, piece: e.target.name(), x: unitPos.x, y: unitPos.y});
            layer.draw();
        });

        this.stage.on("click", function (e) {
            if(e.target.attrs.name == "deck"){
                socket.emit("chat", "/card");
            } else if (e.target.attrs.name == "rollButton") {
                socket.emit("chat", "/roll");
            }
        });
    }

    addDefaultPieces(){
        let stage = this.stage;

        for (let i = 0; i < this.gameInfo.numPieces; i++) {
            let pieceInfo = this.gameInfo.pieces[i];

            let piece = this.makePiece(pieceInfo.x, pieceInfo.y, pieceInfo.color, i, pieceInfo.radius);

            this.pieceList.push(piece);
            this.layer.add(piece);
        }
    }

    makePiece(_x, _y, _fill, _name, _radius){
        let board = this;
        _fill = this.gameInfo.numToCSSColor[_fill];

        return new Konva.Circle({
            x: _x, 
            y: _y,
            radius: _radius,
            fill: _fill,
            stroke: 'black',
            strokeWidth: 2,
            draggable: true,
            name: _name.toString(),
            dragBoundFunc: function (pos) {
                return {
                    x: clamp(pos.x, 0, board.stage.getWidth() - 0),
                    y: clamp(pos.y, 0, board.stage.getHeight() - 0)
                }
            }            
        });
    }
}