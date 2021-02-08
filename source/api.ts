import type { FrameBase, NavigationOptions, Page } from 'puppeteer';

import { syncTimeout, asyncTimeout } from './configuration';
import Logger from './logger';

export function wait(milliseconds: number) {
  Logger.debug(`Esperando por ${milliseconds} milissegundos`);
  return new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export function intercept(
  page: Page,
  options: {
    defaultActionTimeout?: number;
    defaultNavigationTimeout?: number;
    blockedResourceTypes?: Set<string>;
    allowedURLs?: Set<string>;
    blockedURLs?: Set<string>;
  } = {}
) {
  const {
    defaultActionTimeout = syncTimeout,
    defaultNavigationTimeout = asyncTimeout,
    blockedResourceTypes,
    allowedURLs,
    blockedURLs,
  } = options;

  page.setDefaultTimeout(defaultActionTimeout);
  page.setDefaultNavigationTimeout(defaultNavigationTimeout);

  page.setRequestInterception(true);
  page.on('request', (request) => {
    const url = request.url();
    const resourceType = request.resourceType();

    if (
      (!allowedURLs || !allowedURLs.has(url)) &&
      ((blockedResourceTypes && blockedResourceTypes.has(resourceType)) ||
        (blockedURLs && blockedURLs.has(url)))
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });

  return page;
}

export async function navigate(page: Page, url: string, options?: NavigationOptions) {
  Logger.debug(`Navegando para "${url}" ("${options?.waitUntil ?? 'load'}")`);
  await (page.url() === url ? page.reload(options) : page.goto(url, options));
}

export async function click(
  frame: FrameBase,
  selector: string,
  options: {
    timeout?: number;
  } = {}
) {
  const { timeout } = options;

  Logger.debug(`Clicando em "${selector}"`);
  const element = await frame.waitForSelector(selector, {
    timeout,
  });
  await element.evaluate((node) => {
    (node as HTMLElement)?.click();
  });
}

export async function type(
  frame: FrameBase,
  selector: string,
  text: string,
  options: {
    timeout?: number;
    interval?: number;
  } = {}
) {
  const { timeout, interval = 0 } = options;

  Logger.debug(`Digitando "${text}" em "${selector}"`);
  const element = await frame.waitForSelector(selector, {
    timeout,
  });
  await element.type(text, {
    delay: interval,
  });
}

export async function navigation(frame: FrameBase, options?: NavigationOptions) {
  Logger.debug(`Aguardando navegação ("${options?.waitUntil ?? 'load'}")`);
  await frame.waitForNavigation(options);
}
