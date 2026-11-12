# ADR-003 — Nome de restaurante único (normalizado)

| Campo       | Valor                          |
|-------------|--------------------------------|
| **Status**  | Aceito                         |
| **Data**    | 2026-11-11                     |
| **Autores** | Equipe de Engenharia EasyFood  |

---

## Contexto

Em testes, foi possível cadastrar dois restaurantes com o mesmo nome. Na EasyFood o nome é a forma como o cliente identifica o restaurante (listagem, busca, favoritos, notificações), então nomes repetidos geram confusão e abrem espaço para cadastros falsos de um restaurante já existente.

Além do nome idêntico, variações que só mudam maiúsculas/minúsculas ou espaços (`"Pizza do Zé"`, `"pizza do zé"`, `"  Pizza   do Zé "`) também representam o mesmo restaurante para o usuário e precisam ser barradas.

A regra precisa valer mesmo com dois cadastros chegando ao mesmo tempo, o que uma checagem só na aplicação não garante.

---

## Alternativas consideradas

| # | Opção | Descrição |
|---|-------|-----------|
| 1 | Checagem só no service | `findFirst` com `mode: "insensitive"` antes do `create` |
| 2 | `@unique` direto em `name` | Índice único do banco sobre o nome como digitado |
| 3 | Índice único em `LOWER(name)` | Índice por expressão criado via SQL manual |
| 4 | Extensão `citext` | Tipo de texto case-insensitive do PostgreSQL |
| 5 | Coluna `normalizedName` com `@unique` | Coluna calculada pela aplicação, com índice único no banco |

---

## Decisão

Adotar a **opção 5**: a tabela `Restaurant` ganha a coluna `normalizedName` com índice único. O `restaurant.service` calcula o valor (nome sem espaços nas pontas, espaços repetidos colapsados e tudo em minúsculas) a cada cadastro.

O fluxo de cadastro fica:

1. Valida os dados e normaliza o nome
2. Consulta se já existe restaurante com o mesmo `normalizedName` → responde **409**
3. Cria o restaurante; se o banco recusar por violação de unicidade (`P2002`, cadastro simultâneo), também responde **409**

---

## Justificativa

- **Garantia no banco** — o índice único impede duplicados mesmo em concorrência; a opção 1 sozinha falha nesse caso
- **Cobre variações de escrita** — a opção 2 só barra o nome escrito exatamente igual
- **Compatível com o Prisma** — a opção 3 não é representável no `schema.prisma`, e o `migrate dev` tentaria remover o índice na migration seguinte; a opção 4 exige extensão no banco e muda o tipo da coluna
- **Regra em um único lugar** — a normalização fica no service e pode evoluir (ex.: ignorar acentos) sem mudar o restante do código
- **Resposta clara para o cliente** — a checagem prévia permite devolver uma mensagem específica em vez de erro genérico

---

## Consequências

### Positivas

- ✅ Não é mais possível cadastrar restaurantes com nome repetido, nem em concorrência
- ✅ API responde `409 Conflict` com `"Já existe um restaurante cadastrado com este nome"`, que o front já exibe
- ✅ O nome salvo também é limpo (sem espaços sobrando)
- ✅ Busca por nome normalizado usa índice

### Negativas

- ❌ Coluna redundante a manter sincronizada com `name` (qualquer futura edição de nome precisa recalcular `normalizedName`)
- ❌ Restaurantes diferentes com o mesmo nome (ex.: redes ou cidades diferentes) não podem coexistir
- ❌ Acentos ainda diferenciam nomes (`"Café"` ≠ `"Cafe"`)

---

## Critérios de revisão

Esta decisão deve ser reavaliada quando:

1. For criado o endpoint de edição de restaurante (deve reaproveitar a mesma normalização)
2. A plataforma passar a ter filiais/endereços — a unicidade pode passar a ser por nome + localização
3. Surgirem duplicados com diferença só de acentuação

---

## Notas

- Migration: `prisma/migrations/20261111120000_add_restaurant_unique_name` — cria a coluna, preenche os registros existentes com a mesma regra do service e depois cria o índice único. Se já houver duplicados no banco, a criação do índice falha e eles precisam ser resolvidos antes.
- `normalizedName` é um campo interno: o `PrismaClient` (`src/database/prisma.js`) o omite de todas as consultas, então ele não aparece nas respostas da API.
