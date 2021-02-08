import fs from 'fs';
import os from 'os';
import path from 'path';

import dotenv from 'dotenv';

import Logger from './logger';

const defaultConfiguration = `# email da conta
EMAIL=""
# senha da conta
PASSWORD=""
# quatro últimos números do cartão salvo na conta
CARD_LAST_DIGITS=

# número do celular que irá receber o código SMS, caso necessário
PHONE=
# link para a página do tênis
SHOE_URL=""
# tamanhos do tênis
SHOE_SIZES=

# tempo máximo para a execução de uma ação síncrona (clique, digitação, seleção)
SYNC_TIMEOUT=5000
# tempo máximo para a execução de uma ação assíncrona (navegação)
ASYNC_TIMEOUT=20000
# tempo de espera para tentar novamente após um erro
RETRY_TIMEOUT=5000
`;

const configurationFilename = path.join(fs.realpathSync(process.cwd()), '.env');

if (!fs.existsSync(configurationFilename)) {
  fs.writeFileSync(configurationFilename, defaultConfiguration.replace('\n', os.EOL));
  Logger.warn('Ajuste o arquivo de configuração ".env" e inicie o bot novamente.');
  process.exit(0);
}

const configuration = dotenv.parse(fs.readFileSync(configurationFilename));

const {
  EMAIL,
  PASSWORD,
  CARD_LAST_DIGITS,
  PHONE,
  SHOE_URL,
  SHOE_SIZES,
  SYNC_TIMEOUT,
  ASYNC_TIMEOUT,
  RETRY_TIMEOUT,
} = configuration;

if (!EMAIL) {
  Logger.error('Defina o email da conta no arquivo de configurações ".env".');
  process.exit(0);
}
if (!PASSWORD) {
  Logger.error('Defina a senha da conta no arquivo de configurações ".env".');
  process.exit(0);
}
if (CARD_LAST_DIGITS === undefined) {
  Logger.error('Defina os 4 últimos números do cartão no arquivo de configurações ".env".');
  process.exit(0);
}
if (!PHONE) {
  Logger.error('Defina o número de celular no arquivo de configurações ".env".');
  process.exit(0);
}
if (!SHOE_URL) {
  Logger.error('Defina a URL da página do tênis no arquivo de configurações ".env".');
  process.exit(0);
}
if (SHOE_SIZES === undefined) {
  Logger.error('Defina os tamanhos do tênis no arquivo de configurações ".env".');
  process.exit(0);
}

// validar as configurações
if (CARD_LAST_DIGITS && !/^\d{4}$/.test(CARD_LAST_DIGITS)) {
  Logger.error(`O formato dos últimos dígitos do cartão ("${CARD_LAST_DIGITS}") está incorreto.`);
  process.exit(0);
}
if (!/^\d{11}$/.test(PHONE)) {
  Logger.error(`O formato do número de celular ("${PHONE}") está incorreto.`);
  process.exit(0);
}

export const email = EMAIL;
export const password = PASSWORD;
export const cardLastDigits = CARD_LAST_DIGITS;
export const phone = PHONE;
export const shoeURL = new URL(SHOE_URL, 'https://www.nike.com.br/').href;
export const shoeSizes = SHOE_SIZES.split(',')
  .map((shoeSize) => shoeSize.replace('.', ','))
  .filter(Boolean);
export const syncTimeout = SYNC_TIMEOUT ? Number.parseInt(SYNC_TIMEOUT, 10) : 5000;
export const asyncTimeout = ASYNC_TIMEOUT ? Number.parseInt(ASYNC_TIMEOUT, 10) : 20000;
export const retryTimeout = RETRY_TIMEOUT ? Number.parseInt(RETRY_TIMEOUT, 10) : 5000;
