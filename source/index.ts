import puppeteer from 'puppeteer';

import type { Page } from 'puppeteer';

import {
  email,
  password,
  cardLastDigits,
  phone,
  shoeURL,
  shoeSizes,
  retryTimeout,
} from './configuration';
import Logger from './logger';
import { ask, confirm } from './prompt';
import { click, intercept, navigate, navigation, type, wait } from './api';

const cartURL = 'https://www.nike.com.br/Carrinho';
const checkoutURL = 'https://www.nike.com.br/Checkout';

async function sms(page: Page) {
  // FIXME: resolver a perda de foco
  await type(page, 'input[name="CelularCliente"]', phone, {
    interval: 100,
  });

  await click(page, '.modal-footer--botao-vertical > button');

  const smsCode = await ask('Digite o código SMS:', {
    validate: (value) => /^\d{6}$/.test(value) || 'O código deve conter 6 dígitos.',
  });

  await type(page, `input[name="Code1"]`, smsCode[0]);
  await type(page, `input[name="Code2"]`, smsCode[1]);
  await type(page, `input[name="Code3"]`, smsCode[2]);
  await type(page, `input[name="Code4"]`, smsCode[3]);
  await type(page, `input[name="Code5"]`, smsCode[4]);
  await type(page, `input[name="Code6"]`, smsCode[5]);

  await click(page, '.modal-footer--botao-vertical > button[type="submit"]');
}

async function login(page: Page, url: string) {
  await navigate(page, url, { waitUntil: 'domcontentloaded' });

  await type(page, 'input[name="emailAddress"]', email);
  await type(page, 'input[name="password"]', password);

  await click(page, '.loginSubmit > input[value="ENTRAR"]');
  // await click(page, '.connectSubmit > input[value="ENTRAR"]');
  await navigation(page, { waitUntil: 'load' });

  // TODO: tratar erro

  Logger.debug(`Fechando a página "${page.url()}"`);
  await page.close();
}

async function shoe(page: Page) {
  await navigate(page, shoeURL, { waitUntil: 'domcontentloaded' });

  const shoeSizesElement = await page.waitForSelector('.variacoes-tamanhos__lista');
  const availableShoeSizes = await shoeSizesElement.$$eval('input', (elements) =>
    elements.map((element) => element.getAttribute('data-tamanho'))
  );

  const choosenShoeSize =
    shoeSizes.length > 0
      ? shoeSizes.find((shoeSize) => availableShoeSizes.includes(shoeSize))
      : availableShoeSizes.find(Boolean);

  if (choosenShoeSize) {
    await click(page, `#tamanho__id${choosenShoeSize.replace(',', '')}`);
  } else {
    Logger.info('Nenhum tamanho de tênis disponível');
    process.exit(0);
  }

  // REVIEW: acho que pode vir depois do SMS tbm
  await click(page, '#btn-comprar');

  // TODO: burlar reChaptcha invisível
  // SMS
  let smsRequired = false;
  try {
    await page.waitForSelector('input[name="CelularCliente"]');
    smsRequired = true;
  } catch {
    // intended
  }

  if (smsRequired) {
    Logger.info(`Enviando o código SMS para "${phone}"`);

    await sms(page);
  } else {
    Logger.info('Código SMS não foi requerido');
  }

  await navigation(page, { waitUntil: 'domcontentloaded' });

  Logger.debug(`Fechando a página "${page.url()}"`);
  await page.close();
}

async function checkout(page: Page, buy: boolean) {
  await navigate(page, checkoutURL, { waitUntil: 'domcontentloaded' });

  await click(page, '#seguir-pagamento:not([disabled])');

  await click(page, '.modal-footer--botao-vertical > button:not([data-dismiss])');

  if (cardLastDigits) {
    try {
      await click(page, `input[data-lastdigits="${cardLastDigits}"]`);
    } catch {
      Logger.info(`Nenhum cartão com os quatro últimos números "${cardLastDigits}" disponível`);
      process.exit(0);
    }
  } else {
    try {
      await click(page, 'input[data-lastdigits]');
    } catch {
      Logger.info('Nenhum cartão disponível');
      process.exit(0);
    }
  }

  await click(page, '#politica-trocas');

  if (buy) {
    await click(page, '#confirmar-pagamento');
    await navigation(page, { waitUntil: 'domcontentloaded' });

    Logger.info('Compra confirmada');
  }

  Logger.debug(`Fechando a página "${page.url()}"`);
  await page.close();
}

(async () => {
  const buy = await confirm('Finalizar compra?');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  browser.once('disconnected', () => {
    Logger.warn('Navegador fechado.');
    process.exit(0);
  });

  // login
  const loginPage = intercept(await browser.newPage(), {
    blockedResourceTypes: new Set(['stylesheet', 'image', 'media', 'font']),
  });

  await navigate(loginPage, shoeURL, { waitUntil: 'domcontentloaded' });

  const loginUrl = await loginPage.$eval(
    '#nike-unite-oauth2-iframe',
    (element) => element.getAttribute('src')!
  );

  Logger.info(`Entrando na conta "${email}"`);
  for (;;) {
    try {
      await login(loginPage, loginUrl);

      break;
    } catch (error) {
      Logger.error(error.message ?? error);
      Logger.warn('Tentando novamente...');

      await wait(retryTimeout);
    }
  }

  // shoe
  const shoePage = intercept(await browser.newPage(), {
    blockedResourceTypes: new Set(['stylesheet', 'image', 'media', 'font']),
    allowedURLs: new Set([
      'https://images.lojanike.com.br/site/ni/dist/css/Index.css?v=461e7459be288e70fcb5c552ac6459aa',
    ]),
    blockedURLs: new Set([cartURL]),
  });

  Logger.info(`Selecionando o tamanho do tênis`);
  for (;;) {
    try {
      // TODO: verificar se a conta está conectada
      // TODO: verificar se o produto já foi adicionado no carrinho
      await shoe(shoePage);

      break;
    } catch (error) {
      Logger.error(error.message ?? error);
      Logger.warn('Tentando novamente...');

      await wait(retryTimeout);
    }
  }

  // checkout
  const checkoutPage = intercept(await browser.newPage(), {
    blockedResourceTypes: new Set(['stylesheet', 'image', 'media', 'font']),
  });

  Logger.info('Confirmando a compra');
  for (;;) {
    try {
      await checkout(checkoutPage, buy);

      break;
    } catch (error) {
      Logger.error(error.message ?? error);
      Logger.warn('Tentando novamente...');

      await wait(retryTimeout);
    }
  }
})();
