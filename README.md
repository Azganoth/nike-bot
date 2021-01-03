# nike-bot

Compra um tênis na nike.

## 🚀 Como usar

**Requerimentos:**

- NodeJS

Instalar as dependências:

```sh
npm install
```

Caso não exista um arquivo chamado `.env` no diretório raíz, crie-o e certifique-se de que ele contêm a seguinte estrutura:

```text
EMAIL="email"
PASSWORD="senha"
PHONE="DD9XXXXXXXX"

SHOE_URL="link"
SHOE_SIZES=34,36.5,37,42
```

Executar o programa:

```sh
npm start
```

## 📜 Documentação

### Estrutura do arquivo de configuração

```text
EMAIL="email"  # email da conta
PASSWORD="senha"  # senha da conta
PHONE="DD9XXXXXXXX"  # número de celular que receberá o código SMS, caso necessário

SHOE_URL="link"  # link da página do tênis
SHOE_SIZES=34,36.5,37,42  # tamanhos preferíveis, deixe vazio para selecionar o primeiro tamanho disponível
```

## 🔑 Licença

Este projeto está sob a [licença MIT](LICENSE.md).
