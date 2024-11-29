class Minefield {
  constructor(rows, cols, mines) {
    this.rows = rows;
    this.cols = cols;
    this.mines = mines;
    this.cells = [];
    this.isGameOver = false;
    this.init()
  }

  init() {
    this.cells = Array.from({length: this.rows}, () => Array(this.cols).fill(null));
    this.createCells();
  }

  createCells() {
    const minefieldDiv = document.getElementById('minefield');
    minefieldDiv.innerHTML = '';

    this.cells.forEach((row, r) => {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('row');
      row.forEach((_, c) => {
        const cell = new Cell(r, c);
        row[c] = cell;
        rowDiv.appendChild(cell.element);
      })
      minefieldDiv.appendChild(rowDiv);
    })
  }
}

class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.isMine = false;
    this.isRevealed = false;
    this.isFlagged = false;
    this.adjacentMines = 0;
    this.element = this.createElement();
  }

  createElement() {
    const cellDiv = document.createElement('div');
    cellDiv.classList.add('cell');
    // eventlistenners in game

    return cellDiv;
  }

}

class Game {
  constructor() {
    this.minefield = null;
    this.levels = {
      novice: {rows: 9, cols: 9, mines: 10},
      intermediate: {rows: 16, cols: 16, mines: 40},
      expert: {rows: 30, cols: 16, mines: 99},
      superhuman: {rows: 50, cols: 40, mines: 500}
    }
  }

  startGame() {
    const level = document.getElementById('level').value;
    const {rows, cols, mines} = this.levels[level];
    this.minefield = new Minefield(rows, cols, mines);
  }
}

const game = new Game();
game.startGame();