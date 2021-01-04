import fs from 'fs';
import path from 'path';

import dotenv from 'dotenv';

// configuração padrão
const defaultUserConfig = `
# Dados da conta
EMAIL="email"
PASSWORD="senha"
PHONE=00911223344
CARD_LAST_DIGITS=1234

# Dados do tênis
SHOE_URL="link"
SHOE_SIZES=
`;

const userConfigPath = path.resolve(__dirname, '../.env');

// verificar se o arquivo de configuração existe, caso não exista criar um com a configuração padrão
if (!fs.existsSync(userConfigPath)) {
  fs.writeFileSync(userConfigPath, defaultUserConfig.trim());
  console.log('Configure o arquivo de configuração ".env" e inicie o bot novamente.');
  process.exit(0);
}

// carregar as configurações do usuário
const userConfig = dotenv.parse(fs.readFileSync(userConfigPath));

const { EMAIL, PASSWORD, PHONE, CARD_LAST_DIGITS, SHOE_URL, SHOE_SIZES } = userConfig;

// verificar a definição das configurações
if (!EMAIL) {
  console.error(
    'Defina o email da conta no arquivo de configurações ".env" com chave EMAIL.' +
      '\n\nExemplo:' +
      '\nEMAIL="nome.sobrenome@gmail.com"'
  );
  process.exit(1);
}
if (!PASSWORD) {
  console.error(
    'Defina a senha da conta no arquivo de configurações ".env" com chave PASSWORD.' +
      '\n\nExemplo:' +
      '\nPASSWORD="s3nh4"'
  );
  process.exit(1);
}
if (!PHONE) {
  console.error(
    'Defina o número de celular no arquivo de configurações ".env" com chave PHONE.' +
      '\n\nExemplo:' +
      '\nPHONE=48998072831'
  );
  process.exit(1);
}
if (CARD_LAST_DIGITS === undefined) {
  console.error(
    'Defina os 4 últimos números do cartão no arquivo de configurações ".env" com chave CARD_LAST_DIGITS.' +
      '\n\nExemplo, escolher o primeiro cartão disponível com os últimos números 7120:' +
      '\nCARD_LAST_DIGITS=7120' +
      '\n\nExemplo, escolher o primeiro cartão disponível na conta:' +
      '\nCARD_LAST_DIGITS='
  );
  process.exit(1);
}
if (!SHOE_URL) {
  console.error(
    'Defina a URL da página do tênis no arquivo de configurações ".env" com chave SHOE_URL.' +
      '\n\nExemplo:' +
      '\nSHOE_URL="https://www.nike.com.br/Snkrs/Produto/Dunk-Low-Feminino/1-16-210-272190"'
  );
  process.exit(1);
}
if (SHOE_SIZES === undefined) {
  console.error(
    'Defina os tamanhos do tênis no arquivo de configurações ".env" com chave SHOE_SIZES.' +
      '\n\nExemplo, escolher o primeiro tamanho disponível na ordem 40, 34, 34.5:' +
      '\nSHOE_SIZES=40,34,34.5' +
      '\n\nExemplo, escolher o primeiro tamanho disponível:' +
      '\nSHOE_SIZES='
  );
  process.exit(1);
}

// validar as configurações
// TODO: validação de email
// TODO: validação mais robusta do número de celular
if (!/^\d{11}$/.test(PHONE)) {
  console.error(`O formato do número de celular ("${PHONE}") está incorreto, deve ser 11 dígitos.`);
  process.exit(1);
}
if (CARD_LAST_DIGITS && !/^\d{4}$/.test(CARD_LAST_DIGITS)) {
  console.error(
    `O formato dos 4 últimos dígitos do cartão ("${CARD_LAST_DIGITS}") está incorreto,` +
      ' deve ser 4 dígitos.'
  );
  process.exit(1);
}

export default {
  EMAIL,
  PASSWORD,
  PHONE,
  CARD_LAST_DIGITS,
  SHOE_URL: new URL(SHOE_URL, 'https://www.nike.com.br/').href,
  SHOE_SIZES: SHOE_SIZES.split(',')
    .map((shoeSize) => shoeSize.replace('.', ','))
    .filter(Boolean),
};
