# EasyFood API

API de restaurantes construída com Node.js, Express, Prisma e PostgreSQL.
Autenticação via JWT.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie o arquivo `.env` a partir do `.env.example` e preencha os valores:

   | Variável       | Para que serve                                                    |
   |----------------|-------------------------------------------------------------------|
   | `DATABASE_URL` | Conexão usada pela aplicação (no Supabase, a URL do pooler)        |
   | `DIRECT_URL`   | Conexão direta usada pelo Prisma para rodar as migrations          |
   | `JWT_SECRET`   | Chave para assinar os tokens de login                              |
   | `MAILER_API`   | Token da API do MailerSend (envio de e-mails)                      |
   | `DOMAIN_MAIL`  | Domínio verificado no MailerSend (os e-mails saem de `no-reply@<domínio>`) |

3. Rode as migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Inicie o servidor:
   ```bash
   npm start
   ```
   A API sobe em `http://localhost:3000`.

## Estrutura

```
src/
  app.js                 # registra middlewares e rotas
  database/prisma.js     # cliente Prisma compartilhado
  modules/
    <módulo>/            # auth, restaurant, dishes, search, favorites, cart, notifications
      *.routes.js        # rotas e middlewares de autenticação/upload
      *.controller.js    # lê a requisição e devolve a resposta
      *.service.js       # regras de negócio e acesso ao banco
    shared/              # utilitários usados por vários módulos (erros HTTP, imagens, e-mail…)
prisma/                  # schema e migrations
adrs/                    # decisões de arquitetura
```

## Endpoints

🔒 = exige o header `Authorization: Bearer <token>` (obtido no login).

### Auth
- `POST /auth/register` — cadastra usuário com `{ name, email, password }`; e-mail repetido retorna `409`
- `POST /auth/login` — faz login com `{ email, password }` e devolve um token JWT
- `GET  /auth/me` 🔒 — dados do usuário logado
- `POST /auth/me/image` 🔒 — envia a foto do usuário logado

### Restaurantes
- `GET  /restaurants` — lista restaurantes
- `POST /restaurants` 🔒 — cadastra restaurante com `{ name, category, rating }`

### Pratos
- `GET    /restaurants/:restaurantId/dishes` — lista o cardápio
- `POST   /restaurants/:restaurantId/dishes` 🔒 — cadastra prato com `{ name, category, description, price }` (só o dono)
- `GET    /dishes/:dishId` — detalhes do prato
- `PUT    /dishes/:dishId` 🔒 — edita o prato, enviando todos os campos (só o dono)
- `DELETE /dishes/:dishId` 🔒 — remove o prato (só o dono)
- `POST   /dishes/:dishId/image` 🔒 — envia a imagem do prato (só o dono)

### Busca
- `GET /search?q=termo` — busca restaurantes (nome e categoria) e pratos (nome, categoria e descrição)

### Favoritos 🔒
- `GET    /favorites` — lista os favoritos do usuário
- `POST   /favorites/:restaurantId` — adiciona aos favoritos (repetir não duplica)
- `DELETE /favorites/:restaurantId` — remove dos favoritos

### Carrinho 🔒
- `GET    /cart` — mostra o carrinho com os totais
- `POST   /cart/items` — adiciona prato com `{ dishId, quantity }`
- `PATCH  /cart/items/:itemId` — altera a quantidade com `{ quantity }`
- `DELETE /cart/items/:itemId` — remove um item
- `DELETE /cart` — esvazia o carrinho

### Notificações 🔒
- `GET   /notifications` — lista as notificações e o total de não lidas
- `PATCH /notifications/:notificationId/read` — marca uma como lida
- `PATCH /notifications/read-all` — marca todas como lidas

## Regras de negócio

- **Nome de restaurante é único**, sem diferenciar maiúsculas/minúsculas nem espaços extras (`"Pizza do Zé"` = `"  pizza   DO zé "`). Nome repetido retorna `409` — ver [ADR-003](adrs/003-nome-unico-de-restaurante.md).
- **Só o dono** do restaurante (quem o cadastrou) pode criar, editar, remover e enviar imagem de pratos; os demais recebem `403`.
- **Carrinho de um restaurante só:** adicionar prato de outro restaurante retorna `409`. A quantidade de cada item vai de 1 a 99.
- **Notificações automáticas:** boas-vindas no cadastro, aviso ao cadastrar restaurante e aviso de prato novo para quem favoritou o restaurante.

## Imagens

- Os uploads usam `multipart/form-data` com o arquivo no campo `image` (JPEG, PNG ou WebP, até 5 MB).
- A imagem é validada, redimensionada e convertida para WebP, e o arquivo fica na pasta `uploads/` (fora do Git).
- O banco guarda apenas o caminho (ex.: `/uploads/dishes/<id>.webp`). Para abrir, junte o endereço da API: `http://localhost:3000/uploads/dishes/<id>.webp`.
- Como os arquivos ficam no disco local, quem usa o mesmo banco em outra máquina vê o caminho mas não o arquivo.

## Migrations: se uma falhar

Se `npx prisma migrate dev` falhar (erro `P3018`), o PostgreSQL desfaz a migration, mas o Prisma a registra como falha e bloqueia as próximas:

1. Leia o erro e corrija a causa nos dados (ex.: nomes de restaurante duplicados antes da migration de nome único).
2. Marque a migration como revertida:
   ```bash
   npx prisma migrate resolve --rolled-back <nome_da_migration>
   ```
3. Rode `npx prisma migrate dev` de novo.

## Decisões de arquitetura (ADRs)

- [ADR-001](<adrs/001-storage-in-memory copy.md>) — armazenamento em memória no protótipo (substituída pela ADR-002)
- [ADR-002](adrs/002-Data-base-PostgresSql.md) — PostgreSQL como banco de dados
- [ADR-003](adrs/003-nome-unico-de-restaurante.md) — nome de restaurante único (normalizado)
