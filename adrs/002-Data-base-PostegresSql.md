# ADR-002 - Adotar PostgreSQL como banco de dados

**Status:** Aceita  
**Data:** 27/08/2026  
**Autores:** Equipe de Engenharia EasyFood

## Contexto

O armazenamento em memória definido no ADR-001 não preserva dados entre
reinicializações e não oferece os recursos necessários para a evolução do
EasyFood. A aplicação precisa persistir usuários e restaurantes, garantir a
unicidade do e-mail do usuário e permitir consultas relacionais confiáveis.

## Alternativas consideradas

1. SQLite
2. Firebase
3. Exportar e importar um array em arquivos JSON
4. MongoDB
5. PostgreSQL

## Decisão

Adotar PostgreSQL como banco de dados relacional da aplicação, acessado por
Prisma ORM. O schema da aplicação ficará em `prisma/schema.prisma`, e a
configuração de conexão será fornecida pela variável `DATABASE_URL`.

## Justificativa

- Oferece persistência, transações e integridade referencial.
- É adequado para usuários, restaurantes e futuros relacionamentos.
- Permite consultas estruturadas e evolução controlada do schema.
- Prisma fornece acesso tipado e centraliza o modelo de dados.
- É uma tecnologia madura e adequada para desenvolvimento e produção.
- A equipe já possui experiência com PostgreSQL em outros projetos, reduzindo
	o tempo de aprendizado e os riscos de adoção.
- É uma opção capaz de acompanhar o crescimento do EasyFood, suportando maior
	volume de dados, concorrência e consultas mais complexas.

## Consequências

### Positivas

- Os dados sobrevivem a reinicializações e deploys.
- Restrições como `@unique` e tipos de coluna são aplicadas pelo banco.
- O modelo pode evoluir por migrações e consultas mais completas.

### Negativas

- O projeto passa a depender de um serviço externo de banco de dados.
- É necessário configurar `DATABASE_URL` e executar o ciclo de migrações.
- A equipe precisa cuidar de backup, segurança, disponibilidade e custos.

## Implementação

- O datasource Prisma utiliza o provider `postgresql`.
- A aplicação instancia um `PrismaClient` em `src/database/prisma.js`.
- Os modelos atuais são `User` e `Restaurant`.

## Critérios de revisão

Esta decisão deve ser reavaliada caso os requisitos de escala, custo,
disponibilidade ou tipo de consulta indiquem outro mecanismo de persistência.