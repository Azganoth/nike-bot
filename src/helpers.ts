export function clickSelector(selector: string) {
  const element = document.querySelector<HTMLElement>(selector);

  if (!element) {
    throw new Error(`No element found for selector "${selector}".`);
  }

  return new Promise<string>((resolve, reject) => {
    const intervalId = setInterval(() => {
      // clicar no elemento, caso não esteja desativado
      if (!element.hasAttribute('disabled')) {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        element.click();
        resolve(`clicked on "${selector}"`);
      }
    }, 200);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      reject(`unable to click on "${selector}" because it is disabled`);
    }, 5000);
  });
}
