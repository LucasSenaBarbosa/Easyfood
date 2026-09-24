# ADR-008 - Propriedade e autorização de restaurantes por usuário

**Status:** Aceita
**Data:** 23/09/2026  
**Autores:** Equipe de Engenharia EasyFood

## Contexto

O modelo de dados já prevê um relacionamento de propriedade entre `User` e
`Restaurant` por meio do campo `ownerId`, com a relação `Restaurant.ownerId -> User.id`.
Esse vínculo é relevante porque a aplicação precisa distinguir entre um
restaurante cadastrado por um usuário e outro restaurante acessível publicamente.

A API atual já usa `req.user.id` ao criar um restaurante, mas o controle de
autorização completo ainda precisa ser expandido para operações futuras, como
edição, remoção e listagem filtrada por dono.

## Decisão

Persistir a relação de posse em banco usando `ownerId` em `Restaurant` e aplicar
autorização no servidor sempre que um restaurante for acessado, editado ou
removido por um usuário autenticado.

## Justificativa

- Mantém a integridade dos dados e evita que um usuário altere restaurantes de
  terceiros.
- Permite futuras listagens do tipo “meus restaurantes” e regras de permissão
  mais finas.
- Alinha o modelo com o comportamento esperado da API atual, que associa cada
  restaurante ao usuário autenticado no cadastro.
- Facilita a evolução do sistema para papéis, multi-usuário e controle de acesso
  em nível de recurso.

## Consequências

### Positivas

- A separação entre dados de usuários e restaurantes fica clara.
- O código pode evoluir para autenticação e autorização mais robustas.
- A associação `ownerId` fornece base para regras de negócio e consultas
  filtradas.

### Negativas

- O fluxo de permissão precisa ser validado em cada endpoint relevante.
- Futuras operações de atualização e exclusão exigem checagem explícita de
  propriedade.
- Se o modelo crescer para múltiplos papéis, esta decisão pode evoluir para um
  padrão mais rico de autorização.

## Regras de operação

- Todo restaurante novo deve ser criado com `ownerId` preenchido.
- Endpoints de edição e remoção devem verificar se `req.user.id` corresponde ao
  proprietário do restaurante.
- A listagem pública pode continuar acessível, mas operações de escrita devem
  ficar protegidas pela regra de dono.
- A relação deve manter integridade referencial com `ON DELETE CASCADE`.

## Critérios de revisão

Esta decisão deve ser reavaliada quando o sistema passar a exigir papéis
diferenciados, múltiplos administradores por restaurante, equipes com permissões
compartilhadas ou um modelo de autorização mais complexo do que um proprietário
único.
