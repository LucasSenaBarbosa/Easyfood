# EasyFood 🍽️

API REST e interface mobile-first para cadastro e listagem de restaurantes, com autenticação de usuários via JWT.

---

## Sumário

- [Visão geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Configuração](#configuração)
- [Banco de dados](#banco-de-dados)
- [Rodando o projeto](#rodando-o-projeto)
- [Rotas da API](#rotas-da-api)
- [Documentação OpenAPI](#documentação-openapi)
- [Interface web](#interface-web)
- [Decisões de arquitetura (ADRs)](#decisões-de-arquitetura-adrs)

---

## Visão geral

O EasyFood é uma plataforma para listagem e cadastro de restaurantes. Usuários criam uma conta e podem cadastrar seus próprios restaurantes. A interface é uma SPA mobile-first servida pelo próprio backend, que se comunica com a API via `fetch`.

---

## Tecnologias

| Camada       | Tecnologia                          |
|--------------|-------------------------------------|
| Runtime      | Node.js                             |
| Framework    | Express 5                           |
| ORM          | Prisma 7                            |
| Banco        | PostgreSQL                          |
| Auth         | JWT (`jsonwebtoken`) + Bcrypt       |
| Front-end    | HTML + CSS + JS vanilla (sem build) |

---

## Estrutura do projeto

```
projeto_easyfood/
├── prisma/
│   ├── schema.prisma          # Modelos User e Restaurant
│   └── migrations/            # Histórico de migrações
├── src/
│   ├── app.js                 # Configuração do Express
│   ├── database/
│   │   └── prisma.js          # Instância do PrismaClient
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.middleware.js
│   │   │   ├── auth.routes.js
│   │   └── restaurant/
│   │       ├── restaurant.controller.js
│   │       ├── restaurant.service.js
│   │       └── restaurant.routes.js
│   └── public/
│       └── index.html         # Interface mobile-first
├── adrs/                      # Registros de decisão de arquitetura
├── openapi.yml                # Contrato OpenAPI da API
├── server.js                  # Entry point
├── .env.example               # Variáveis de ambiente necessárias
└── package.json
```

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+

---

## Configuração

Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.example .env
```

| Variável                  | Descrição                                              |
|---------------------------|--------------------------------------------------------|
| `DATABASE_URL`            | String de conexão com o PostgreSQL                     |
| `JWT_SECRET`              | Chave secreta para assinar os tokens JWT               |

> ⚠️ Nunca versione o `.env` no repositório. O `JWT_SECRET` deve ter alta entropia.

---

## Banco de dados

Instale as dependências e execute as migrações:

```bash
npm install
npx prisma migrate deploy
```

Para gerar o Prisma Client após alterações no schema:

```bash
npx prisma generate
```

Para inspecionar os dados em desenvolvimento:

```bash
npx prisma studio
```

---

## Rodando o projeto

```bash
npm start
```

O servidor sobe na porta **3000**. A interface web estará disponível em:

```
http://localhost:3000
```

---

## Rotas da API

### Autenticação — `/auth`

| Método | Rota                  | Autenticação | Descrição                                      |
|--------|-----------------------|:------------:|------------------------------------------------|
| POST   | `/auth/register`      | —            | Cria um novo usuário                               |
| POST   | `/auth/login`         | —            | Autentica e retorna um token JWT               |
| GET    | `/auth/me`            | ✅ Bearer    | Retorna os dados do usuário autenticado        |

#### `POST /auth/register`

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "minhasenha"
}
```

**Resposta 201:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com"
}
```

#### `POST /auth/login`

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "minhasenha"
}
```

**Resposta 200:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com"
  }
}
```

---

### Restaurantes — `/restaurants`

| Método | Rota                          | Autenticação | Descrição                                    |
|--------|-------------------------------|:------------:|----------------------------------------------|
| GET    | `/restaurants`                | —            | Lista todos os restaurantes                  |
| POST   | `/restaurants`                | ✅ Bearer    | Cria um restaurante (vinculado ao usuário)   |

#### `POST /restaurants`

**Header:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Trattoria del Nonno",
  "category": "Italiana"
}
```

As categorias aceitas são: `Italiana`, `Japonesa`, `Brasileira`, `Burger`, `Pizza`, `Mexicana`, `Chinesa`, `Fast Food`, `Saudável`, `Sobremesas` e `Cafeteria`. A avaliação não é informada no cadastro; o restaurante é criado com `rating: null` até receber avaliações.

**Resposta 201:**
```json
{
  "restaurant": { "id": 1, "name": "Trattoria del Nonno", ... },
  "message": "Restaurante cadastrado com sucesso."
}
```

### Documentação OpenAPI

O contrato completo da API está em [`openapi.yml`](./openapi.yml) e pode ser aberto em ferramentas como Swagger Editor ou Redocly.

---

## Interface web

A interface é uma SPA (Single Page Application) servida em `/` pelo Express. Não há etapa de build — é HTML, CSS e JavaScript puro.

Na home, todos os usuários podem consultar os restaurantes persistidos, pesquisar por nome ou categoria e filtrar por categoria. O cadastro de restaurante fica em uma tela separada e exige autenticação.

**Fluxo de autenticação no front-end:**

1. Ao carregar, o app verifica se há um token salvo no `localStorage`
2. Se houver, valida com `GET /auth/me` antes de exibir a home
3. Token expirado ou inválido limpa a sessão e redireciona para o login
4. Após login bem-sucedido, token e dados do usuário são salvos no `localStorage`
5. O nome do usuário é exibido na saudação da home

---

## Decisões de arquitetura (ADRs)

Os registros de decisão estão na pasta [`adrs/`](./adrs):

| ADR | Decisão |
|-----|---------|
| [001](./adrs/001-storage-in-memory.md) | Armazenamento em memória (fase inicial) |
| [002](./adrs/002-Data-base-PostegresSql.md) | Banco de dados PostgreSQL |
| [003](./adrs/003%20-%20Modulaçao.md) | Estrutura modular por domínio |
| [004](./adrs/004-autenticacao-com-jwt.md) | Autenticação com JWT |
| [005](./adrs/005-hash-de-senhas-com-bcrypt.md) | Hash de senhas com bcrypt |
| [006](./adrs/006-prisma-e-migracoes-versionadas.md) | Prisma e migrações versionadas |
| [007](./adrs/007-verificacao-email-restaurante.md) | Verificação de e-mail para restaurantes |
| [008](./adrs/008-propriedade-e-autorizacao-restaurantes.md) | Propriedade e autorização de restaurantes por usuário |
