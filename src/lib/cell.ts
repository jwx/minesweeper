export class Cell {
  public static States = ['blank', 'mine', 'question'];

  public revealed = false;
  public mine = false;
  public state = 0;
  public neighbours = 0;

  public constructor(public row: number, public column: number) { }

  public get markedMine(): boolean {
    return this.state === Cell.States.indexOf('mine');
  }
}
