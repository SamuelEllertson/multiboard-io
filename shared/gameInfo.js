(function (exports) {

    // Your code goes here

    exports.sorry = {
        gameName: "Sorry!",
        simpleName: "sorry",
        gameCode: 0,
        howToPlayLink: "https://www.youtube.com/watch?v=uMdylyrST6w",
        background: "client/img/sorry.png",
        maxNumPlayers: 4,
        chatEnabled: true,
        usesCards: true,
        numPieces: 16,
        numCards: 11,
        playerColorNums: [0, 1, 2, 3],
        useRollButton: false,
        rollButtonInfo: { x: 1, y: -1, height: -1, width: -1, color: "" },
        rollType: "none", //none, numeric, color, custom
        rollNums: [],
        rollColors: [],
        customRollVals: [],
        numToColor: {
            0: "Red",
            1: "Blue",
            2: "Yellow",
            3: "Green"
        },
        numToCSSColor: {
            0: "Red",
            1: "Blue",
            2: "Yellow",
            3: "Green",
            4: "Black"
        },
        pieces: [
            { x: 156.3, y: 51.7, color: 0, radius: 9 },
            { x: 180, y: 51.7, color: 0, radius: 9 },
            { x: 156.3, y: 73.4, color: 0, radius: 9 },
            { x: 180, y: 73.4, color: 0, radius: 9 },

            { x: 526, y: 157, color: 1, radius: 9 },
            { x: 550, y: 157, color: 1, radius: 9 },
            { x: 526, y: 180, color: 1, radius: 9 },
            { x: 550, y: 180, color: 1, radius: 9 },

            { x: 420, y: 527, color: 2, radius: 9 },
            { x: 444, y: 527, color: 2, radius: 9 },
            { x: 420, y: 549, color: 2, radius: 9 },
            { x: 444, y: 549, color: 2, radius: 9 },

            { x: 49, y: 418, color: 3, radius: 9 },
            { x: 73, y: 418, color: 3, radius: 9 },
            { x: 49, y: 442, color: 3, radius: 9 },
            { x: 73, y: 442, color: 3, radius: 9 }
        ],
        commands: {
            help: ["sendCommands"],
            card: ["newCard"],
            clear: ["clearChat"],
            players: ["listPlayers"],
            restart: ["newGame"],
            kick: ["kickPlayer"],
            leave: ["playerLeave"],
            howtoplay: ["howtoplay"],
            fix: ["forceGameState", "clearPlayerHoldings"]
        },
        cardList: [{
            "1": "Move Forward\nOne Space\nor\nLeave Start",
            "2": "Move Forward\nTwo Spaces\nor\nLeave Start\n\nand\nDraw Again",
            "3": "Move Forward\nThree Spaces",
            "-4": "Move Backwards\nFour Spaces",
            "5": "Move Forward\nFive Spaces",
            "7": "Move Forward\n Seven Spaces\nor\nSplit the Move\nBetween\nTwo Pieces",
            "8": "Move Forward\nEight Spaces",
            "10": "Move Forward\nTen Spaces\nor\nBackwards One",
            "11": "Move Forward\nEleven Spaces\nor\nSwitch Positions\nWith an Enemy",
            "12": "Move Forward\nTwelve Spaces",
            "Sorry!": "Take a Piece\nFrom Start\nand\nBump an Enemy\nBack to Start"
        }],
        cardListProbabilities: [1]
    };

    exports.fucklord = {
        gameName: "The Great FuckLord",
        simpleName: "fucklord",
        gameCode: 1,
        howToPlayLink: "",
        background: "client/img/fucklord.png",
        maxNumPlayers: 4,
        chatEnabled: true,
        usesCards: true,
        numPieces: 16,
        numCards: 13,
        playerColorNums: [0, 1, 2, 3],
        useRollButton: true,
        rollButtonInfo: { x: 285, y: 380, height: 30, width: 30, color: "Grey" },
        rollType: "color", //none, numeric, color, custom
        rollNums: [],
        rollColors: [0, 1, 2, 3],
        customRollVals: [],
        numToColor: {
            0: "Red",
            1: "Blue",
            2: "Yellow",
            3: "Green"
        },
        numToCSSColor: {
            0: "Red",
            1: "Blue",
            2: "Yellow",
            3: "Green",
            4: "Black"
        },
        pieces: [
            { x: 79,    y: 58,     color: 0, radius: 10 },
            { x: 98.5,  y: 77.7,   color: 0, radius: 10 },
            { x: 79,    y: 97.4,   color: 0, radius: 10 },
            { x: 60.3,  y: 77.7,   color: 0, radius: 10 },
            { x: 521.6, y: 60,     color: 1, radius: 10 },
            { x: 540.2, y: 78.7,   color: 1, radius: 10 },
            { x: 521.6, y: 96.2,   color: 1, radius: 10 },
            { x: 503,   y: 78.7,   color: 1, radius: 10 },
            { x: 521.6, y: 503.9,  color: 2, radius: 10 },
            { x: 538,   y: 521.3,  color: 2, radius: 10 },
            { x: 521.6, y: 539.9,  color: 2, radius: 10 },
            { x: 503,   y: 521.3,  color: 2, radius: 10 },
            { x: 79,    y: 502,    color: 3, radius: 10 },
            { x: 97.5,  y:521.39,  color: 3, radius: 10 },
            { x: 79,    y: 537.7,  color: 3, radius: 10 },
            { x: 60.4,  y: 521.39, color: 3, radius: 10 }
        ],
        commands: {
            help: ["sendCommands"],
            roll: ["rollColor"],
            card: ["newCard"],
            players: ["listPlayers"],
            clear: ["clearChat"],
            restart: ["newGame"],
            kick: ["kickPlayer"],
            leave: ["playerLeave"],
            fix: ["forceGameState", "clearPlayerHoldings"]
        },
        cardList: [{
            "1": "Move\nOne Space\nor\nLeave Start",
            "2": "Move\nTwo Spaces\nor\nLeave Start\n\nand\nDraw Again",
            "3": "Move\nThree Spaces",
            "4": "Move\nFour Spaces\nor\nMove Enemy\nOne Space",
            "5": "Move\nFive Spaces",
            "6": "Move\nSix Spaces\nor\nSwitch Positions\nWith an Enemy",
            "7": "Move\nSeven Spaces\nor\nSplit the Move\nBetween\nTwo Pieces",
            "8": "Move\nEight Spaces\nor\nDraw Again",
            "9": "Move\nNine Spaces",
            "10": "Move\nTen Spaces\nor\nMove Enemy\nTwo Spaces"
            },
            {
            "Fuck Off": "Expell Enemy\nFrom Home\nor\nLeave Start",
            "Get Fucked": "Take a Piece\nFrom Start\nand\nBump an Enemy\nBack to Start",
            "FuckLord": "Leave Start\nor\nMove Piece\nDirectly to Home\n\nAnd\nDraw Again"
        }],
        cardListProbabilities: [0.85, 1]
    };

    exports.ludo = {
        gameName: "Ludo",
        simpleName: "ludo",
        gameCode: 2,
        howToPlayLink: "https://en.wikipedia.org/wiki/Ludo_(board_game)",
        background: "client/img/ludo.png",
        maxNumPlayers: 4,
        chatEnabled: true,
        usesCards: false,
        numPieces: 16,
        numCards: 0,
        playerColorNums: [0, 1, 2, 3],
        useRollButton: true,
        rollButtonInfo: { x: 285, y: 285 , height: 30, width: 30, color: "Grey"},
        rollType: "numeric", //none, numeric, color, custom
        rollNums: [1, 2, 3, 4, 5, 6],
        rollColors: [],
        customRollVals: [],
        numToColor: {
            0: "Red",
            1: "Blue",
            2: "Yellow",
            3: "Green"
        },
        numToCSSColor: {
            0: "Red",
            1: "Blue",
            2: "Yellow",
            3: "Green",
            4: "Black"
        },
        pieces: [
            { x: 130, y: 94,  color: 0, radius: 10 },
            { x: 94,  y: 130, color: 0, radius: 10 },
            { x: 130, y: 166, color: 0, radius: 10 },
            { x: 166, y: 130, color: 0, radius: 10 },

            { x: 470, y: 90,  color: 1, radius: 10 },
            { x: 430, y: 130, color: 1, radius: 10 },
            { x: 470, y: 170, color: 1, radius: 10 },
            { x: 510, y: 130, color: 1, radius: 10 },

            { x: 470, y: 430, color: 2, radius: 10 },
            { x: 430, y: 470, color: 2, radius: 10 },
            { x: 470, y: 510, color: 2, radius: 10 },
            { x: 510, y: 470, color: 2, radius: 10 },

            { x: 130, y: 430, color: 3, radius: 10 },
            { x: 90, y: 470,  color: 3, radius: 10 },
            { x: 130, y: 510, color: 3, radius: 10 },
            { x: 170, y: 470, color: 3, radius: 10 }
        ],
        commands: {
            help: ["sendCommands"],
            roll: ["rollNum"],
            players: ["listPlayers"],
            clear: ["clearChat"],
            restart: ["newGame"],
            kick: ["kickPlayer"],
            leave: ["playerLeave"],
            howtoplay: ["howtoplay"],
            fix: ["forceGameState", "clearPlayerHoldings"]
        },
        cardList: [],
        cardListProbabilities: []
    };

    exports.gameList = [exports.sorry, exports.fucklord, exports.ludo];

})(typeof exports === 'undefined' ? this.gameInfo = {} : exports);