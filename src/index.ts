import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import inquirer from 'inquirer';

import config from './config';
import { clickSelector } from './helpers';

import type { ClickSelectorOptions } from './helpers';

// puppeteer plugins
puppeteer.use(StealthPlugin());

// configurações
const { EMAIL, PASSWORD, PHONE, CARD_LAST_DIGITS, SHOE_URL, SHOE_SIZES, TIMEOUT } = config;

const cartURL = 'https://www.nike.com.br/Carrinho';
const checkoutURL = 'https://www.nike.com.br/Checkout';

const actionTimeout = 5000;

// processo principal
(async () => {
  const { commit } = await inquirer.prompt<{ commit: boolean }>([
    {
      type: 'confirm',
      name: 'commit',
      message: 'Deseja finalizar a compra ao chegar no checkout?',
    },
  ]);

  // configurar o navegador
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = (await browser.pages())[0] ?? (await browser.newPage());
  page.setDefaultTimeout(actionTimeout);
  page.setDefaultNavigationTimeout(TIMEOUT);

  // implementar `page.click` com a possibilidade de clicar em elementos não visíveis
  async function waitForClick(selector: string, options: Partial<ClickSelectorOptions> = {}) {
    const { intervalTime = 200, timeoutTime = actionTimeout } = options;
    await page.waitForSelector(selector, { timeout: timeoutTime });
    await page.evaluate(clickSelector, selector, { intervalTime, timeoutTime });
  }

  // bloquear página do carrinho
  page.setRequestInterception(true);
  page.on('request', (request) => {
    if (request.url() === cartURL) {
      request.abort();
    } else {
      request.continue();
    }
  });

  // ETAPA 0 - BOT
  while (true) {
    try {
      if (page.isClosed()) {
        console.log('A página foi fechada... terminando processo.');
        process.exit(0);
      }

      // carregar a página do tênis
      if (page.url() !== SHOE_URL) {
        await page.goto(SHOE_URL);
      } else {
        await page.reload();
      }

      if (await page.$('#errorModal')) {
        throw new Error('Erro por parte do site encontrado... tentando novamente.');
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
        try {
          await page.waitForNavigation();
        } catch {
          throw new Error('Erro por parte do site encontrado... tentando novamente.');
        }

        await page.waitForSelector('.logado.active');
      }

      // ETAPA 2 - TAMANHO DO TÊNIS
      console.log('> Escolhendo o tamanho do tênis');
      const shoeSizesList = await page.waitForSelector('.variacoes-tamanhos__lista');
      const availableShoeSizes = await shoeSizesList.$$eval('input', (elements) =>
        elements.map((element) => element.getAttribute('data-tamanho'))
      );

      const choosenShoeSize =
        SHOE_SIZES.length > 0
          ? SHOE_SIZES.find((shoeSize) => availableShoeSizes.includes(shoeSize))
          : availableShoeSizes.find(Boolean);

      if (choosenShoeSize) {
        await waitForClick(`#tamanho__id${choosenShoeSize.replace(',', '')}`);
        console.log(`>> O tamanho "${choosenShoeSize}" foi escolhido`);
      } else {
        console.log('Nenhum tamanho de tênis definido está disponível, terminando processo...');
        process.exit(0);
      }

      // ETAPA 2.5 - SMS
      await page.waitForTimeout(1000); // wait for possible sms dialog to show

      if (await page.$('input[name="CelularCliente"]')) {
        console.log('> Enviando código SMS');
        await page.type('input[name="CelularCliente"]', PHONE);
        await page.waitForTimeout(200);

        await waitForClick('.modal-footer--botao-vertical > button');

        console.log('>> Aguardando código SMS');
        while (true) {
          const { smsCode } = await inquirer.prompt<{ smsCode: string }>([
            {
              name: 'smsCode',
              message: 'Digite o código SMS (6 dígitos):',
            },
          ]);

          if (/^\d{6}$/.test(smsCode)) {
            for (let index = 0; index < smsCode.length; index++) {
              await page.type(`input[name="Code${index + 1}"]`, smsCode.charAt(index));
              await page.waitForTimeout(200);
            }

            await waitForClick('.modal-footer--botao-vertical > button[type="submit"]');
            break;
          } else {
            console.log('~ O código deve conter 6 dígitos...');
          }
        }
      } else {
        console.log('> Código SMS não foi requerido');
      }

      // ETAPA 3 - CARRINHO
      console.log('> Adicionando ao carrinho');
      await waitForClick('#btn-comprar');
      await page.waitForNavigation();

      // ETAPA 4 - CHECKOUT
      console.log('> Confirmando a compra');
      let firstTry = false;
      while (true) {
        try {
          // carregar a página de checkout
          if (page.url() !== checkoutURL) {
            await page.goto(checkoutURL);
          } else if (!firstTry) {
            await page.reload();
          }

          firstTry = true;

          console.log('>> Confirmando endereço e entrega');
          await waitForClick('#seguir-pagamento', { timeoutTime: TIMEOUT });

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

          console.log('>> Aceitando políticas de trocas e cancelamentos');
          await waitForClick('#politica-trocas');

          // ETAPA 5 - FINALIZAR COMPRA
          if (commit) {
            console.log('> Finalizando a compra');
            await waitForClick('#confirmar-pagamento');

            console.log('> Comprado!?!');
          } else {
            console.log('> Compra não finalizada (decisão do usuário)');
          }

          await page.waitForNavigation();

          break;
        } catch (error) {
          console.error(error.message ? `! ${error.message}` : error);
          await page.waitForTimeout(5000);
        }
      }

      break;
    } catch (error) {
      console.error(error.message ? `! ${error.message}` : error);
      await page.waitForTimeout(5000);
    }
  }
})();
