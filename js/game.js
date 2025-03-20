import { GAME_CONFIG } from './config.js';

class GameField {
    constructor() {
        this.fieldSize = GAME_CONFIG.FIELD_SIZE;
        this.field = [];
        this.resetField();
    }

    resetField() {
        this.field = Array(this.fieldSize).fill(null).map(() => 
            Array(this.fieldSize).fill(null).map(() => ({ elem: null, marker: null }))
        );
    }

    mark(x, y, marker) {
        if (!this.isValidPosition(x, y) || this.field[x][y].marker) return false;

        if (this.field[x][y].elem) {
            this.field[x][y].elem.style.backgroundImage = marker === GAME_CONFIG.MARKS.X 
                ? `url(${GAME_CONFIG.IMAGES.CROSS})` 
                : `url(${GAME_CONFIG.IMAGES.ROUND})`;
        }

        this.field[x][y].marker = marker;
        return true;
    }

    setElement(x, y, elem) {
        if (!this.isValidPosition(x, y) || this.field[x][y].elem) return false;
        this.field[x][y].elem = elem;
        return true;
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.fieldSize && y >= 0 && y < this.fieldSize;
    }

    getFieldSize() {
        return this.fieldSize;
    }

    getCondition() {
        const winConditions = [
            this.checkRows(),
            this.checkColumns(),
            this.checkMainDiagonal(),
            this.checkSecondaryDiagonal()
        ];

        const winResult = winConditions.find(result => result !== null);
        if (winResult) return winResult;

        return this.checkDraw();
    }

    checkRows() {
        for (let i = 0; i < this.fieldSize; i++) {
            const row = this.field[i];
            if (this.isWinningLine(row)) {
                return { result: 'winner', line: row };
            }
        }
        return null;
    }

    checkColumns() {
        for (let j = 0; j < this.fieldSize; j++) {
            const column = this.field.map(row => row[j]);
            if (this.isWinningLine(column)) {
                return { result: 'winner', line: column };
            }
        }
        return null;
    }

    checkMainDiagonal() {
        const diagonal = this.field.map((row, i) => row[i]);
        if (this.isWinningLine(diagonal)) {
            return { result: 'winner', line: diagonal };
        }
        return null;
    }

    checkSecondaryDiagonal() {
        const diagonal = this.field.map((row, i) => row[this.fieldSize - 1 - i]);
        if (this.isWinningLine(diagonal)) {
            return { result: 'winner', line: diagonal };
        }
        return null;
    }

    isWinningLine(line) {
        return line.every(cell => cell.marker === GAME_CONFIG.MARKS.X) ||
               line.every(cell => cell.marker === GAME_CONFIG.MARKS.O);
    }

    checkDraw() {
        const isFieldFull = this.field.every(row => 
            row.every(cell => cell.marker !== null)
        );
        return isFieldFull ? { result: 'draw', line: this.field } : { result: 'none' };
    }
}

function playerFactory(name, mark) {
    return {
        name,
        mark
    };
}

class GameManager {
    constructor() {
        this.isGameStopped = false;
        this.currentTurn = 0;
        this.player1 = null;
        this.player2 = null;
    }

    startGame() {
        this.isGameStopped = false;
        gameField.resetField();
        this.currentTurn = this.getPriority();
        uiController.initEvents();
    }

    currentPlayer() {
        return this.currentTurn === 0 ? this.player1.name : this.player2.name;
    }

    initPlayers(p1, p2) {
        this.player1 = p1;
        this.player2 = p2;
    }

    makeTurn(x, y) {
        const player = this.currentTurn === 0 ? this.player1 : this.player2;
        this.currentTurn = this.currentTurn === 0 ? 1 : 0;
        const nextPlayerName = this.currentPlayer();
        uiController.setLoggerText(`${nextPlayerName}, now it's your turn!`);
        
        if (!gameField.mark(x, y, player.mark)) {
            return;
        }

        const gameCondition = gameField.getCondition();
        if (gameCondition.result === "none") {
            return;
        }

        this.endGame(gameCondition);
    }

    restartGame() {
        this.startGame();
    }

    endGame(gameState) {
        switch (gameState.result) {
            case "draw":
                this.handleDraw();
                break;
            case "winner":
                this.handleWinner(gameState);
                break;
        }
    }

    handleDraw() {
        this.isGameStopped = true;
        uiController.setLoggerText("It's a draw. Good fight though!");
        uiController.renderDrawResult();
        uiController.removeEvents();
    }

    handleWinner(gameState) {
        this.isGameStopped = true;
        const winner = this.player1.mark === gameState.line[0].marker ? this.player1 : this.player2;
        uiController.setLoggerText(`Good job, ${winner.name}! You're champion for this round!`);
        uiController.renderWinResult(gameState.line);
        uiController.removeEvents();
    }

    getPriority() {
        return Math.floor(Math.random() * 2);
    }

    gameStopped() {
        return this.isGameStopped;
    }
}

class UIController {
    constructor() {
        this.body = document.querySelector("body");
        this.greetingPanel = document.querySelector(".greeting-panel");
        this.boardContainer = null;
    }

    startGameEvent(clickEv) {
        clickEv.preventDefault();
        const p1Name = document.querySelector("#p1").value;
        const p2Name = document.querySelector("#p2").value;
        const player1 = playerFactory(p1Name, GAME_CONFIG.MARKS.X);
        const player2 = playerFactory(p2Name, GAME_CONFIG.MARKS.O);
        gameManager.initPlayers(player1, player2);
        this.greetingPanel.remove();
        this.renderBoard();
    }

    setLoggerText(text) {
        const logger = document.querySelector(".logInfo");
        logger.textContent = text;
    }

    renderDrawResult() {
        const tiles = Array.from(this.boardContainer.children);
        tiles.forEach((item) => {
            item.classList.toggle("draw");
        });
    }

    renderWinResult(winLane) {
        winLane.forEach((arrObject) => {
            const item = arrObject.elem;
            item.classList.toggle("win");
        });
    }

    resetGameEvent(clickEv) {
        const bodyChilds = Array.from(this.body.children);
        bodyChilds.forEach((item) => {
            item.remove();
        });
        
        this.body.appendChild(this.greetingPanel);
        gameManager.restartGame();
    }

    initEvents() {
        const startBtn = document.querySelector(".starter");
        startBtn.addEventListener("click", this.startGameEvent.bind(this));
    }

    processTurn(clickEv) {
        const tile = clickEv.target;
        if (Array.from(tile.classList).includes("boardElement")) {
            gameManager.makeTurn(tile.dataset.i, tile.dataset.j);
        }
    }

    renderBoard() {
        this.boardContainer = document.createElement("div");
        this.boardContainer.classList.add("boardContainer");
        
        for (let i = 0; i < gameField.getFieldSize(); ++i) {
            for (let j = 0; j < gameField.getFieldSize(); ++j) {
                const elem = document.createElement("div");
                elem.classList.add("boardElement");
                elem.dataset.i = i;
                elem.dataset.j = j;
                gameField.setElement(i, j, elem);
                this.boardContainer.appendChild(elem);
            }
        }
        
        this.boardContainer.addEventListener("click", this.processTurn.bind(this));
        this.body.appendChild(this.boardContainer);

        this.renderLogContainer();
    }

    renderLogContainer() {
        const logContainer = document.createElement("div");
        logContainer.classList.add("logContainer");
        
        const logInfo = document.createElement("h1"); 
        logInfo.textContent = gameManager.currentPlayer() + ", now is your turn!";
        logInfo.classList.add("logInfo");
        
        const restartButton = document.createElement("button");
        restartButton.classList.add("starter");
        restartButton.textContent = "Restart";
        restartButton.addEventListener("click", this.resetGameEvent.bind(this));
        
        logContainer.appendChild(logInfo);
        logContainer.appendChild(restartButton);
        this.body.appendChild(logContainer);
    }

    removeEvents() {
        this.boardContainer.style.opacity = "0.5";
        const children = Array.from(this.boardContainer.children);
        children.forEach((child) => {
            child.style.opacity = "0.7";
        });
        this.boardContainer.removeEventListener("click", this.processTurn.bind(this));
    }
}

const gameField = new GameField();
const uiController = new UIController();
const gameManager = new GameManager();
gameManager.startGame();


