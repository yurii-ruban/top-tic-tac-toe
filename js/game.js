
const xMark = 'X';
const oMark = 'O';

const gameField = (function() {
    const fieldSize = 3;
    let field = [];

    function resetField() {
        for (let i = 0; i < fieldSize; ++i) {
            const temp = new Array(fieldSize);
            for (let j = 0; j < fieldSize; ++j) {
                temp[j] = {elem: null, marker: null};
            }
            field[i] = temp;
        }
    }

    function mark(x, y, marker) {
        if (x >= fieldSize || x < 0 || y >= fieldSize || y < 0) return;
        if (field[x][y].marker) {
            return;
        }

        if (field[x][y].elem) {
            field[x][y].elem.style.backgroundImage = marker === xMark ? "url(./img/cross.svg)" : "url(./img/round.svg)";
        }

        field[x][y].marker = marker;
    }

    function setElement (x, y, elem) {
        if (x >= fieldSize || x < 0 || y >= fieldSize || y < 0) return;
        if (field[x][y].elem) {
            return;
        }

        field[x][y].elem = elem;
    }

    function getFieldSize() {
        return fieldSize;
    }

    function getCondition() {
        // Win conditions
        for (let i = 0; i < fieldSize; ++i) {
            if (field[i].every((cell) => {return cell.marker === xMark;}) || 
                field[i].every((cell) => {return cell.marker === oMark;})) {
                console.log('Row');
                return {result: 'winner', line: field[i]};
            }
        }

        for (let j = 0, i = 0; j < fieldSize; ++j) {
            if (field[i][j].marker === field[i + 1][j].marker &&
                field[i + 1][j].marker === field[i + 2][j].marker &&
                field[i][j].marker !== null) {
                console.log('Column');
                return {result: 'winner', line: [field[i][j], field[i + 1][j], field[i + 2][j]]};
            }
        }

        if (field[0][0].marker === field[1][1].marker && 
            field[1][1].marker === field[2][2].marker &&
            field[0][0].marker !== null) {
            console.log('Main diagonale');
            return {result: 'winner', line: [field[0][0], field[1][1], field[2][2]]};
        }

        if (field[0][2].marker === field[1][1].marker &&
            field[1][1].marker === field[2][0].marker &&
            field[0][2].marker !== null) {
            console.log('Secondary diagonale');
            return {result: 'winner', line: [field[0][2], field[1][1], field[2][0]]};
        }

        // Draw condition
        let fieldFull = true;
        for (let i = 0; i < fieldSize; ++i) {
            if (field[i].some((cell) => {return cell.marker === null;})) {
                fieldFull = false;
            }
        }

        return fieldFull ? {result: 'draw', line: field} : {result: 'none'};
    }

    return {
        resetField,
        mark,
        setElement,
        getFieldSize,
        getCondition
    };
})();

function playerFactory(name, mark) {
    return {
        name,
        mark
    };
}

const gameManager = (function () {
    let isGameStopped = false;
    let currentTurn = 0;
    let player1;
    let player2;

    function startGame() {
        isGameStopped = false;
        gameField.resetField();
        currentTurn = getPriority();
        uiController.initEvents();
    }

    function currentPlayer() {
        return currentTurn === 0 ? player1.name : player2.name;
    }

    function initPlayers(p1, p2) {
        player1 = p1;
        player2 = p2;
    }

    function makeTurn(x, y) {
        const player = currentTurn === 0 ? player1 : player2;
        currentTurn = currentTurn === 0 ? 1 : 0;
        const nextPlayerName = currentPlayer();
        uiController.setLoggerText(`${nextPlayerName}, now it's your turn!`);
        
        gameField.mark(x, y, player.mark);
        const gameCondition = gameField.getCondition();

        // Add logic for screen
        if (gameCondition.result === "none") {
            return;
        }

        endGame(gameCondition);
    }

    function restartGame() {
        startGame();
    }

    function endGame(gameState) {
        switch (gameState.result) {
            case "draw": {
                isGameStopped = true;
                uiController.setLoggerText("It's a draw. Good fight though!");
                uiController.renderDrawResult();
                uiController.removeEvents();
                break;
            }
            case "winner": {
                isGameStopped = true;
                const winner = player1.mark === gameState.line[0].marker ? player1 : player2;
                uiController.setLoggerText(`Good job, ${winner.name}! You're champion for this round!`);
                uiController.renderWinResult(gameState.line);
                uiController.removeEvents();
                break;
            }
        }
    }

    function getPriority() {
        return Math.floor(Math.random() * 2);
    }

    function gameStopped () {
        return isGameStopped;
    }

    return {
        startGame,
        restartGame,
        initPlayers,
        makeTurn,
        currentPlayer,
        gameStopped
    };
})();

const uiController = (function() {
    const body = document.querySelector("body");
    let greetingPanel = document.querySelector(".greeting-panel");

    function startGameEvent(clickEv) {
        clickEv.preventDefault();
        const p1Name = document.querySelector("#p1").value;
        const p2Name = document.querySelector("#p2").value;
        const player1 = playerFactory(p1Name, xMark);
        const player2 = playerFactory(p2Name, oMark);
        gameManager.initPlayers(player1, player2);
        greetingPanel.remove();

        renderBoard();
    }

    function setLoggerText(text) {
        const logger = document.querySelector(".logInfo");
        logger.textContent = text;
    }

    function renderDrawResult() {
        const boardContainer = document.querySelector(".boardContainer");
        const tiles = Array.from(boardContainer.children);
        tiles.forEach((item) => {
            item.classList.toggle("draw");
        });
    };

    function renderWinResult(winLane) {
        winLane.forEach((arrObject) => {
            const item = arrObject.elem;
            item.classList.toggle("win");
        });
    }

    function resetGameEvent(clickEv) {
        const bodyChilds = Array.from(body.children);
        bodyChilds.forEach((item) => {
            item.remove();
        });
        
        body.appendChild(greetingPanel);
        gameManager.restartGame();
    }

    function initEvents () {
        const startBtn = document.querySelector(".starter");
        startBtn.addEventListener("click", startGameEvent);
    }

    function processTurn(clickEv) {
        const tile = clickEv.target;
        if (Array.from(tile.classList).includes("boardElement")) {
            gameManager.makeTurn(tile.dataset.i, tile.dataset.j);
        }
    }

    function renderBoard() {
        const boardContainer = document.createElement("div");
        boardContainer.classList.add("boardContainer");
        for (let i = 0; i < gameField.getFieldSize(); ++i) {
            for (let j = 0; j < gameField.getFieldSize(); ++j) {
                const elem = document.createElement("div");
                elem.classList.add("boardElement");
                elem.dataset.i = i;
                elem.dataset.j = j;
                gameField.setElement(i, j, elem);
                boardContainer.appendChild(elem);
            }
        }
        boardContainer.addEventListener("click", processTurn);
        body.appendChild(boardContainer);

        const logContainer = document.createElement("div");
        logContainer.classList.add("logContainer");
        const logInfo = document.createElement("h1"); 
        logInfo.textContent = gameManager.currentPlayer() + ", now is your turn!";
        logInfo.classList.add("logInfo");
        const restartButton = document.createElement("button");
        restartButton.classList.add("starter");
        restartButton.textContent = "Restart";
        restartButton.addEventListener("click", resetGameEvent);
        logContainer.appendChild(logInfo);
        logContainer.appendChild(restartButton);
        body.appendChild(logContainer);

    }

    function removeEvents() {
        const boardContainer = document.querySelector(".boardContainer");
        boardContainer.style.opacity = "0.5";
        const children = Array.from(boardContainer.children);
        children.forEach((child) => {
            child.style.opacity = "0.7";
        });
        boardContainer.removeEventListener("click", processTurn);
    }

    return {
        initEvents,
        renderBoard,
        renderDrawResult,
        renderWinResult,
        setLoggerText,
        removeEvents
    };
})();

gameManager.startGame();
