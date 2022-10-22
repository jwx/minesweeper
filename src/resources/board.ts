import { bindable, IDisposable, IEventAggregator } from "aurelia";
import { Cell } from "../lib/cell";

export class BoardCustomElement {
  @bindable public rows: number;
  @bindable public columns: number;
  @bindable public mines: number;

  public grid: Cell[][];

  public time = 0;

  private subscription: IDisposable;
  private interval: NodeJS.Timer;
  private revealDelayTime = 20;


  private revealing = false;
  private unrevealed: number;
  private gameOver = false;
  private win = false;

  public constructor(@IEventAggregator public eventAggregator: IEventAggregator) { }

  public get cells(): Cell[] {
    return this.grid.flat();
  }

  public get remainingMines(): number {
    return !this.gameOver ? this.mines - this.cells.filter(cell => cell.markedMine).length : this.mines;
  }
  public get timePassed(): number {
    return Math.min(this.time, 999);
  }

  public get cls(): string {
    if (this.revealing) {
      return 'revealing';
    }
    if (this.win) {
      return 'win';
    }
    if (this.gameOver) {
      return 'game-over';
    }
    return '';
  }

  public binding(): void {
    this.initializeBoard();

    this.subscription = this.eventAggregator.subscribe('cell', this.event);
    this.interval = setInterval(() => this.time++, 1000);
  }

  public unbinding(): void {
    this.subscription.dispose();
    clearInterval(this.interval);
  }

  public endGame(): void {
    this.eventAggregator.publish('board', this.gameOver ? 'new-game' : 'abort-game');
  }

  private initializeBoard(): void {
    this.grid = new Array(this.rows);
    for (let i = 0; i < this.rows; i++) {
      this.grid[i] = new Array(this.columns);
      for (let j = 0; j < this.columns; j++) {
        this.grid[i][j] = new Cell(i, j);
      }
    }
    let mines = this.mines;
    while (mines > 0) {
      const row = Math.floor(Math.random() * this.rows);
      const column = Math.floor(Math.random() * this.columns);
      if (!this.grid[row][column].mine) {
        this.grid[row][column].mine = true;
        mines--;
      }
    }
    this.cells.forEach(cell => cell.neighbours = cell.mine ? -1 : this.neighbourCount(cell.row, cell.column));
  }

  private event = async (message: { action: string; cell: Cell }) => {
    if (this.gameOver) {
      this.eventAggregator.publish('board', 'new-game');
      return;
    }
    console.log(message);
    const { action, cell } = message;
    switch (action) {
      case 'mark':
        if (cell.revealed) {
          break;
        }
        cell.state = ++cell.state % 3;
        break;
      case 'reveal':
        if (cell.revealed || cell.markedMine) {
          break;
        }
        await this.revealDelay();
        cell.state = 0;
        this.unrevealed = this.cells.filter(cell => !cell.revealed).length;
        this.reveal(cell);
        break;
      case 'reveal-neighbours':
        if (!cell.revealed) {
          break;
        }
        await this.revealDelay();
        this.unrevealed = this.cells.filter(cell => !cell.revealed).length;
        this.revealNeighbours(cell);
        break;
    }
  }

  private endOfGame(win: boolean): void {
    clearInterval(this.interval);
    this.gameOver = true;
    this.win = win;
    this.cells.forEach(cell => cell.revealed = true);
    this.eventAggregator.publish('board', win ? 'win' : 'game-over');
  }

  private async reveal(cell: Cell): Promise<void> {
    if (cell.revealed || cell.markedMine) {
      return;
    }
    cell.revealed = true;
    this.unrevealed--;
    if (cell.mine) {
      cell.neighbours = -2;
      this.endOfGame(false);
      return;
    }
    if (this.unrevealed === this.mines) {
      this.endOfGame(true);
      return;
    }
    await this.revealDelay(false);

    if (cell.neighbours === 0) {
      for (let i = cell.row - 1; i <= cell.row + 1; i++) {
        for (let j = cell.column - 1; j <= cell.column + 1; j++) {
          const neighbour = this.grid[i]?.[j];
          if (neighbour != null) {
            this.reveal(neighbour);
          }
        }
      }
    }
  }

  private async revealNeighbours(cell: Cell): Promise<void> {
    for (let i = cell.row - 1; i <= cell.row + 1; i++) {
      for (let j = cell.column - 1; j <= cell.column + 1; j++) {
        const neighbour = this.grid[i]?.[j];
        if (neighbour != null && !neighbour.markedMine) {
          this.reveal(neighbour);
        }
      }
    }
  }

  private neighbourCount(row: number, column: number): number {
    let neighbours = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (this.grid[row + i]?.[column + j]?.mine ?? false) {
          neighbours++;
        }
      }
    }
    return neighbours;
  }

  private async revealDelay(update = true): Promise<void> {
    this.revealing = update;
    await new Promise(resolve => setTimeout(resolve, this.revealDelayTime));
    this.revealing = false;
  }
}
