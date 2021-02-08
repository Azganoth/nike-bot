# nike-bot

Compra um tênis SNKRS na Nike Brasil.

## 🚀 Como usar

**Requerimentos:**

- [NodeJS (14+)](https://nodejs.org/)

Instalar as dependências:

```sh
npm install
```

Compilar o programa:

```sh
npm run build
```

Iniciar o programa:

```sh
npm run start
```

## 📜 Documentação

Certifique-se de ajustar as configurações de acordo com suas necessidades no arquivo de configuração ".env" (caso não exista, inicie o bot para ele ser criado).

Para utilizar o bot a conta deve ter, no mínimo, um endereço e cartão salvos.

### Arquivo de configuração

#### Exemplo

```text
EMAIL="nome.sobrenome@gmail.com"
PASSWORD="s3nh4"
CARD_LAST_DIGITS=3253

PHONE=4898037261
SHOE_URL="https://www.nike.com.br/Snkrs/Produto/PG-5/153-169-211-303936"
SHOE_SIZES=34,33.5,42,40

SYNC_TIMEOUT=5000
ASYNC_TIMEOUT=20000
RETRY_TIMEOUT=5000
```

#### EMAIL

O email da conta na Nike.

##### Exemplos

```text
EMAIL=nome.sobrenome@gmail.com
```

#### PASSWORD

A senha da conta na Nike.

##### Exemplos

```text
EMAIL=s3nh4
```

#### CARD_LAST_DIGITS

Os quatro últimos números do cartão salvo na conta. Deve conter 4 dígitos.

##### Exemplos

```text
CARD_LAST_DIGITS=3253
```

Para selecionar o primeiro cartão salvo na conta:

```text
CARD_LAST_DIGITS=
```

##### PHONE

O número de celular que irá receber o código SMS, caso necessário. Deve conter 11 dígitos.

##### Exemplos

```text
PHONE=4898037261
```

#### SHOE_URL

O link para a página do tênis.

##### Exemplos

```text
SHOE_URL=https://www.nike.com.br/Snkrs/Produto/PG-5/153-169-211-303936
```

O domínio pode ser omitido:

```text
SHOE_URL=Snkrs/Produto/PG-5/153-169-211-303936
```

#### SHOE_SIZES

Os tamanhos do tênis.

##### Exemplos

Para selecionar os tamanhos 34; 33,5; 42 e 40:

```text
SHOE_SIZES=34,33.5,42,40
```

Para selecionar os primeiro tamanho disponível:

```text
SHOE_SIZES=
```

#### SYNC_TIMEOUT

O tempo máximo para a execução de uma ação síncrona (clique, digitação, seleção).

##### Exemplos

Para esperar no máximo 5 segundos:

```text
SYNC_TIMEOUT=5000
```

#### ASYNC_TIMEOUT

O tempo máximo para a execução de uma ação assíncrona (navegação).

##### Exemplos

Para esperar no máximo 20 segundos:

```text
ASYNC_TIMEOUT=20000
```

#### RETRY_TIMEOUT

O tempo de espera para tentar novamente após um erro.

##### Exemplos

Para esperar 5 segundos:

```text
RETRY_TIMEOUT=5000
```

## 🔑 Licença

Este projeto está sob a [licença MIT](LICENSE.md).
