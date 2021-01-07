export type ClickSelectorOptions = {
  intervalTime: number;
  timeoutTime: number;
};

export function clickSelector(selector: string, options: ClickSelectorOptions) {
  const { intervalTime, timeoutTime } = options;

  const element = document.querySelector<HTMLElement>(selector);

  if (!element) {
    throw new Error(`No element found for selector "${selector}".`);
  }

  return new Promise<string>((resolve, reject) => {
    let elapsedMS = 0;
    const hasTimeout = timeoutTime > 0;

    const intervalId = setInterval(() => {
      // clicar no elemento, caso não esteja desativado
      if (!element.hasAttribute('disabled')) {
        clearInterval(intervalId);
        element.click();
        resolve(`clicked on "${selector}"`);
      }

      if (hasTimeout) {
        if (elapsedMS > timeoutTime) {
          clearInterval(intervalId);
          reject(`unable to click on "${selector}"`);
        }

        elapsedMS += intervalTime;
      }
    }, intervalTime);
  });
}
