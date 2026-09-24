# ADR-005 - Armazenar senhas com hash bcrypt

**Status:** Aceita  
**Data:** 20/09/2026  
**Autores:** Equipe de Engenharia EasyFood

## Contexto

O EasyFood precisa cadastrar usuários e validar suas credenciais no login. A
senha original não deve ser armazenada no banco de dados, pois um vazamento da
base poderia expor as credenciais dos usuários.

## Alternativas consideradas

1. Armazenar a senha em texto puro.
2. Usar uma função hash rápida, como SHA-256, diretamente.
3. Usar bcrypt com fator de custo configurável.
4. Delegar a autenticação a um provedor externo.

## Decisão

Usar bcrypt para gerar um hash não reversível das senhas no cadastro e comparar
a senha informada no login com `bcrypt.compare`. O fator de custo inicial será
10. A senha original nunca será persistida nem retornada nas respostas da API.

## Justificativa

- Bcrypt foi projetado para armazenamento de senhas.
- O custo computacional dificulta ataques de força bruta e dicionário.
- O salt é gerenciado pela própria biblioteca durante a criação do hash.
- A biblioteca `bcrypt` já faz parte das dependências do projeto.

## Consequências

### Positivas

- Um acesso indevido ao banco não revela diretamente as senhas.
- Cada hash possui salt próprio, reduzindo o valor de tabelas pré-computadas.
- A comparação pode ser feita sem recuperar a senha original.

### Negativas

- Cadastro e login consomem mais CPU do que um hash criptográfico comum.
- O fator de custo pode precisar de ajuste conforme a infraestrutura evoluir.
- Senhas esquecidas não podem ser recuperadas; é necessário um fluxo de troca ou
  redefinição.

## Requisitos de segurança

- Nunca registrar senhas em logs, mensagens de erro ou respostas HTTP.
- Validar tamanho e formato da senha na camada de entrada.
- Usar HTTPS para proteger a senha durante o transporte até a API.
- Reavaliar o fator de custo periodicamente e atualizar a biblioteca com cuidado.

## Critérios de revisão

Esta decisão deve ser reavaliada se os requisitos de segurança recomendarem
outro algoritmo de password hashing, se o custo de bcrypt se tornar inadequado
ou se a autenticação for transferida para um provedor especializado.
