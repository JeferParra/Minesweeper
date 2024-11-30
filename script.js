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
    this.placeMines();
    this.calculateAdjacentMines();
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

  placeMines() {
    let placeMines = 0;
    
    while(placeMines < this.mines) {
      const r = Math.floor(Math.random() * this.rows);
      const c = Math.floor(Math.random() * this.cols);
      
      if (!this.cells[r][c].isMine) {
        this.cells[r][c].isMine = true;
        placeMines++;
      }
    }
  }

  calculateAdjacentMines() {
    this.cells.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (!cell.isMine) {
          cell.adjacentMines = this.getAdjacentCells(r, c)
            .filter(adjCell => adjCell.isMine)
            .length;
        }
      })
    })
  }

  getAdjacentCells(row, col) {
    const directions = [
      [-1, 1], [0, 1], [1, 1],
      [-1, 0], [1, 0],
      [-1, -1], [0, -1], [1, -1]
    ];

    return directions
      .map(([dr, dc]) => [row + dr, col + dc])
      .filter(([nr, nc]) => nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols)
      .map(([nr, nc]) => this.cells[nr][nc]);
  }

  revealCell(row, col) {
    if(this.isGameOver || this.cells[row][col].isRevealed) return;

    const cell = this.cells[row][col];
    cell.reveal();

    if (cell.isMine) {
      this.gameOver('Game Over!')
    } else if (cell.adjacentMines === 0) {
      this.getAdjacentCells(row, col).forEach(adjCell => this.revealCell(adjCell.row, adjCell.col));
    }

    this.checkWin();
  }

  checkWin() {
    const nonMineCells = this.rows * this.cols - this.mines;
    const revealedCells = this.cells.flat().filter(cell => cell.isRevealed).length;

    if (nonMineCells === revealedCells) {
      this.gameOver('You Win!')
    }
  }

  gameOver(message) {
    this.isGameOver = true;
    this.revealAllMines();
    this.highlightIncorrectFlags();
    this.showPopup(message);
  }

  showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = message;
    popup.style.display = 'block';

    document.getElementById('restart-button').addEventListener('click', () => {
      popup.style.display = 'none';
      game.startGame();
    });
  }

  revealAllMines() {
    this.cells.flat().forEach(cell => {
      if (cell.isMine && !cell.isFlagged) {
        cell.reveal();
        cell.element.classList.add('mine');
      }
    })
  }

  highlightIncorrectFlags() {
    this.cells.flat().forEach(cell => {
      if(cell.isFlagged && !cell.isMine) {
        cell.element.classList.remove('flagged');
        cell.element.classList.add('incorrect-flag');
        cell.element.textContent = '❌';
      }
    })
  }

  flagCell(row, col) {
    if (this.isGameOver || this.cells[row][col].isRevealed) return;
    this.cells[row][col].toggleFlag();
  }

  highlightArea(row, col) {
    this.getAdjacentCells(row, col).forEach(cell => cell.highlight())
  }

  clearHighlight() {
    this.cells.flat().forEach(cell => cell.clearHighlight());
  }

  revealArea(row, col) {
    if(this.cells[row][col].adjacentMines === 0 && !this.cells[row][col].isFlagged) {
      this.getAdjacentCells(row.col).forEach(cell => this.revealCell(cell.row, cell.col))
    }
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
    cellDiv.addEventListener('click', () => {
      game.minefield.revealCell(this.row, this.col);
    })
    cellDiv.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      game.minefield.flagCell(this.row, this.col);
    })
    cellDiv.addEventListener('mousedown', (e) => {
      if(e.button === 1) {
        game.minefield.highlightArea(this.row, this.col);
      }
    })
    cellDiv.addEventListener('mouseup', (e) => {
      if(e.button === 1) {
        game.minefield.clearHighlight();
        game.minefield.revealArea(this.row, this.col);
      }
    })
    return cellDiv;
  }

  reveal() {
    if (this.isRevealed) return;
    this.isRevealed = true;
    this.element.classList.add('revealed');
    if (this.isFlagged) {
      this.toggleFlag();
    }
    if (this.isMine) {
      this.element.textContent = '💣';
    } else if (this.adjacentMines > 0) {
      this.element.textContent = this.adjacentMines;
      this.element.setAttribute('data-mines', this.adjacentMines);
    }
  }

  toggleFlag() {
    if(this.isFlagged) {
      this.isFlagged = false;
      this.element.classList.remove('flagged');
      this.element.textContent = '';
    } else {
      this.isFlagged = true;
      this.element.classList.add('flagged');
      this.element.textContent = '🚩';
    }
  }

  highlight() {
    this.element.classList.add('highlighted');
  }

  clearHighlight() {
    this.element.classList.remove('highlighted');
  }
}

class Game {
  constructor() {
    this.minefield = null;
    this.levels = {
      novice: {rows: 9, cols: 9, mines: 10},
      intermediate: {rows: 16, cols: 16, mines: 40},
      expert: {rows: 30, cols: 16, mines: 99},
      superhuman: {rows: 50, cols: 50, mines: 500}
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