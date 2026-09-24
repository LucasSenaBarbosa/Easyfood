# ADR-006 - Usar Prisma ORM e migrações versionadas

**Status:** Aceita  
**Data:** 20/09/2026  
**Autores:** Equipe de Engenharia EasyFood

## Contexto

O EasyFood precisa acessar o PostgreSQL de forma consistente e manter o schema
do banco alinhado ao código da aplicação. Alterar tabelas manualmente em cada
ambiente pode causar divergências, dificultar a reprodução do ambiente e tornar
os deploys mais arriscados.

## Alternativas consideradas

1. Usar SQL puro e controlar alterações manualmente.
2. Usar outro ORM para Node.js.
3. Usar Prisma ORM com migrações versionadas.
4. Usar um serviço externo de migrações sem manter o schema no projeto.

## Decisão

Adotar Prisma ORM para acesso ao PostgreSQL e manter as alterações do banco em
migrações versionadas dentro de `prisma/migrations`. O modelo das entidades
será definido em `prisma/schema.prisma`, e as migrações serão aplicadas nos
ambientes por meio da CLI do Prisma.

## Justificativa

- Centraliza o modelo de dados em um schema legível.
- Gera um cliente consistente para a aplicação Node.js.
- Registra a evolução do banco no controle de versão.
- Permite reproduzir a estrutura de tabelas em novos ambientes.
- Reduz alterações manuais e facilita a revisão das mudanças no banco.

## Consequências

### Positivas

- O schema do código e o banco podem evoluir de forma rastreável.
- A migração inicial registra as tabelas `User` e `Restaurant` e o índice único
  do e-mail.
- O cliente Prisma facilita consultas e operações tipadas.
- A equipe pode revisar alterações de banco junto com o código da aplicação.

### Negativas

- O projeto passa a depender do Prisma CLI e do Prisma Client.
- Migrações precisam ser planejadas para evitar perda de dados em produção.
- Alterações manuais no banco podem causar divergência em relação às migrações.
- Mudanças incompatíveis podem exigir migrações em etapas.

## Regras de operação

- Toda alteração persistente deve começar por uma mudança no schema e uma nova
  migração, quando aplicável.
- Migrações aplicadas em ambientes compartilhados não devem ser editadas;
  correções devem ser feitas em uma nova migração.
- O banco de produção deve ter backup antes de alterações relevantes.
- A variável `DATABASE_URL` deve ser fornecida pelo ambiente e não commitada.

## Critérios de revisão

Esta decisão deve ser reavaliada se o custo operacional do Prisma se tornar
inadequado, se o projeto exigir recursos de banco não suportados pela ferramenta
ou se a equipe migrar para outro mecanismo de persistência.