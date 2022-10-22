export class DigitsValueConverter {
  public toView(value: number | string): HTMLElement {
    const element = document.createElement('span');
    const digits = `${value}`.split('');
    digits.unshift(...['', '', ''].slice(0, 3 - digits.length));
    element.innerHTML = digits.map(digit => `<span class="digit digit-${digit}"></span>`).join('');
    return element;
  }
}
