const { EMAIL, PASSWORD, PHONE, SHOE_URL, SHOE_SIZES } = process.env;

// email
if (EMAIL === undefined) {
  throw new Error('Defina o email da conta no arquivo de configurações ".env".');
}

// senha
if (PASSWORD === undefined) {
  throw new Error('Defina a senha da conta no arquivo de configurações ".env".');
}

// número do celular
if (PHONE === undefined) {
  throw new Error('Defina o número de celular ("DD9XXXXXXXX") no arquivo de configurações ".env".');
}
if (PHONE.length !== 11) {
  throw new Error(
    'Formato do número de celular incorreto no arquivo de configurações ".env", use o formato "DD9XXXXXXXX".'
  );
}

// URL da página do tênis
if (SHOE_URL === undefined) {
  throw new Error('Defina a URL da página do tênis no arquivo de configurações ".env".');
}

// tamanhos do tênis
if (SHOE_SIZES === undefined) {
  throw new Error('Defina os tamanhos do tênis no arquivo de configurações ".env".');
}

export default {
  EMAIL,
  PASSWORD,
  PHONE,
  SHOE_URL: new URL(SHOE_URL, 'https://www.nike.com.br/').href,
  SHOE_SIZES: SHOE_SIZES.split(',')
    .map((shoeSize) => shoeSize.replace('.', ','))
    .filter(Boolean),
};
