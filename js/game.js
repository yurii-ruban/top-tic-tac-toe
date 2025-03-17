
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

        field[x][y].marker = marker;
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
        getCondition
    };
})();

function playerFactory(name, mark) {
    function makeTurn(x, y) {
        console.log(`Player "${name}" goes [${x}, ${y}] with mark: ${mark}`);
    }

    return {
        name,
        mark,
        makeTurn
    };
}

const gameManager = (function () {
    let isGameStopped = false;
    let currentTurn = 0;
    const player1 = playerFactory('John', xMark);
    const player2 = playerFactory('Anna', oMark);

    function startGame() {
        gameField.resetField();
        currentTurn = getPriority();
    }

    function makeTurn(x, y) {
        const currentPlayer = currentTurn === 0 ? player1 : player2;
        currentPlayer.makeTurn(x, y);
        currentTurn = currentTurn === 0 ? 1 : 0;
        
        gameField.mark(x, y, currentPlayer.mark);
        const gameCondition = gameField.getCondition();

        // Add logic for screen
        if (gameCondition.result === "none") {
            return;
        }

        endGame(gameCondition);
    }

    function restartGame() {
        gameField.resetField();
    }

    function endGame(gameState) {
        switch (gameState.result) {
            case "draw": {
                isGameStopped = true;
                // Add logic to disable next moves
                console.log(`It's a draw. gameState: ${gameState.result}. Try again!`);
                console.table(gameState.line);
                break;
            }
            case "winner": {
                isGameStopped = true;
                const winner = player1.mark === gameState.line[0].marker ? player1 : player2;
                console.log(`Now we have a winner! Winner is ${winner.name}`);
                console.dir(gameState.line);
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
        makeTurn,
        gameStopped
    };
})();


gameManager.startGame();
while (!gameManager.gameStopped()) {
    coordX = Math.floor(Math.random() * 3);
    coordY = Math.floor(Math.random() * 3);
    gameManager.makeTurn(coordX, coordY);
}
