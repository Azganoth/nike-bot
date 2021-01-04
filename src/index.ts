import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import inquirer from 'inquirer';

import type { Page } from 'puppeteer';

import config from './config';
import { clickSelector } from './helpers';

// puppeteer plugins
puppeteer.use(StealthPlugin());

// configurações
const { EMAIL, PASSWORD, PHONE, CARD_LAST_DIGITS, SHOE_URL, SHOE_SIZES } = config;

const CART_URL = 'https://www.nike.com.br/Carrinho';
const CHECKOUT_URL = 'https://www.nike.com.br/Checkout';

// processo principal
(async () => {
  const { buy } = await inquirer.prompt<{ buy: boolean }>([
    {
      type: 'confirm',
      name: 'buy',
      message: 'Finalizar compra?',
    },
  ]);

  // configurar o navegador
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = (await browser.pages())[0] ?? (await browser.newPage());
  page.setDefaultTimeout(5000);
  page.setDefaultNavigationTimeout(20000);

  // bloquear página do carrinho
  page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request.url() === CART_URL) {
      request.abort();
    } else {
      request.continue();
    }
  });

  // implementar "waitForClick"
  async function waitForClick(selector: string) {
    await page.waitForSelector(selector);
    await page.evaluate(clickSelector, selector);
  }

  // ETAPA 0 - BOT
  while (true) {
    try {
      // carregar a página do tênis
      if (page.url() !== SHOE_URL) {
        await page.goto(SHOE_URL);
      }

      if (await page.$('#errorModal')) {
        await page.reload();
        throw new Error('! Erro... tentando novamente.');
      }

      // ETAPA 1 - LOGIN
      if (!(await page.$('.logado.active'))) {
        console.log(`> Entrando na conta "${EMAIL}"`);
        await waitForClick('#anchor-acessar');

        await page.waitForTimeout(1000); // wait for login dialog to show

        await page.type('.emailAddress > input[name="emailAddress"]', EMAIL);
        await page.waitForTimeout(200);

        await page.type('.password > input[name="password"]', PASSWORD);
        await page.waitForTimeout(200);

        await waitForClick('.loginSubmit > input');
        await page.waitForNavigation();

        await page.waitForSelector('.logado.active');
      }

      // ETAPA 2 - TAMANHO DO TÊNIS
      console.log('> Escolhendo o tamanho do tênis');
      const shoeSizesElements = await page.waitForSelector('.variacoes-tamanhos__lista');
      const availableShoeSizes = await shoeSizesElements.$$eval('input', (elements) =>
        elements.map((element) => element.getAttribute('data-tamanho'))
      );

      const choosenShoeSize =
        SHOE_SIZES.length > 0
          ? SHOE_SIZES.find((shoeSize) => availableShoeSizes.includes(shoeSize))
          : availableShoeSizes.find(Boolean);

      if (choosenShoeSize) {
        await waitForClick(`#tamanho__id${choosenShoeSize.replace(',', '')}`);
        console.log(`>> O tamanho "${choosenShoeSize}" foi escolhido.`);
      } else {
        console.log('Nenhum tamanho de tênis preferível está disponível, terminando processo...');
        process.exit(0);
      }

      // ETAPA 2.1 - SMS
      await page.waitForTimeout(1000); // wait for possible sms dialog to show

      if (await page.$('input[name="CelularCliente"]')) {
        console.log('> Enviando código SMS');
        await page.type('input[name="CelularCliente"]', PHONE);
        await page.waitForTimeout(200);

        await waitForClick('.modal-footer--botao-vertical > button');

        while (true) {
          const { smsCode } = await inquirer.prompt<{ smsCode: string }>([
            {
              name: 'smsCode',
              message: 'Bota o código SMS ai:',
            },
          ]);

          if (/^\d\d\d\d\d\d$/.test(smsCode)) {
            for (let index = 0; index < smsCode.length; index++) {
              await page.type(`input[name="Code${index + 1}"]`, smsCode.charAt(index));
              await page.setDefaultTimeout(200);
            }

            await waitForClick('.modal-footer--botao-vertical > button[type="submit"]');
            break;
          } else {
            console.log('! O código precisa ter 6 dígitos...');
          }
        }
      } else {
        console.log('>> Não pediu código SMS.');
      }

      // ETAPA 3 - CARRINHO
      console.log('> Adicionando ao carrinho');
      await waitForClick('#btn-comprar');
      await page.waitForNavigation();

      // ETAPA 4 - CHECKOUT
      console.log('> Confirmando a compra');
      while (true) {
        try {
          // carregar a página de checkout
          if (page.url() !== CHECKOUT_URL) {
            await page.goto(CHECKOUT_URL);
          }

          await waitForClick('#seguir-pagamento');

          await page.waitForTimeout(1000); // wait for confirmation dialog to show
          await waitForClick('.modal-footer--botao-vertical > button:not([data-dismiss])');

          console.log('>> Selecionando o cartão');
          if (CARD_LAST_DIGITS) {
            try {
              await waitForClick(`input[data-lastdigits="${CARD_LAST_DIGITS}"]`);
            } catch {
              console.log(
                `Nenhum cartão com os últimos números "${CARD_LAST_DIGITS}" disponível,` +
                  ' terminando processo...'
              );
              process.exit(0);
            }
          } else {
            await waitForClick(
              '#cartoes-salvos > .select-cta-options > .select-cta-option > input'
            );
          }

          console.log('>> Aceitando políticas de trocas');
          await waitForClick('#politica-trocas');

          // ETAPA 5 - FINALIZAR COMPRA
          if (buy) {
            console.log('> Finalizando a compra');
            await waitForClick('#confirmar-pagamento');

            console.log('> Comprado!?!');
          } else {
            console.log('> Compra não finalizada por decisão do usuário');
          }

          await page.waitForTimeout(2000);

          break;
        } catch (error) {
          console.error(error.message ?? error);
          await page.waitForTimeout(5000);
        }
      }

      break;
    } catch (error) {
      console.error(error.message ?? error);
      await page.waitForTimeout(5000);
    }
  }
})();
