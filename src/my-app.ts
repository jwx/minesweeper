import { IDisposable, IEventAggregator } from "aurelia";

export class MyApp {
  public rows = 10;
  public columns = 20;
  public mines = 5;

  public started = false;

  private subscription: IDisposable;

  public constructor(@IEventAggregator public eventAggregator: IEventAggregator) { }

  public binding(): void {
    this.subscription = this.eventAggregator.subscribe('board', (message) => {
      console.log(message)
      switch (message) {
        case 'game-over':
          break;
        case 'win':
          break;
        case 'new-game':
          this.started = false;
          break;
        case 'abort-game':
          if (confirm('Do you want to abort this game?')) {
            this.started = false;
          }
          break;
      }
    });
  }

  public unbinding(): void {
    this.subscription.dispose();
  }
}
