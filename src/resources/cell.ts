import { bindable, IEventAggregator } from "aurelia";
import { Cell } from "../lib/cell";

export class CellCustomElement {
  @bindable public cell: Cell;

  public constructor(@IEventAggregator public eventAggregator: IEventAggregator) { }

  public get cls(): string {
    if (this.cell.revealed && !this.cell.mine && this.cell.markedMine) {
      this.cell.neighbours = -3;
    }
    return !this.cell.revealed ? Cell.States[this.cell.state] : `revealed-${this.cell.neighbours}`;
  }

  public action(action: string): void {
    this.eventAggregator.publish('cell', { action, cell: this.cell });
  }
}
