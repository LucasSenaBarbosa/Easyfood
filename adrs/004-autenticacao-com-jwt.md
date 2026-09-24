# ADR-004 - Autenticação com JWT

**Status:** Aceita  
**Data:** 20/09/2026  
**Autores:** Equipe de Engenharia EasyFood

## Contexto

A API precisa identificar usuários após o login e proteger endpoints que exigem
autenticação. A solução deve funcionar bem para uma API HTTP e não deve exigir
que o servidor mantenha uma sessão em memória para cada cliente.

## Alternativas consideradas

1. Sessões mantidas no servidor.
2. JWT (JSON Web Token) com autenticação Bearer.
3. Chaves de API.
4. OAuth 2.0 com um provedor externo.

## Decisão

Adotar JWT para autenticação stateless. Após o login, a API emitirá um token
assinado com o segredo definido na variável de ambiente `JWT_SECRET`. O cliente
deverá enviá-lo no header `Authorization` usando o formato `Bearer <token>`.

Os tokens terão validade de uma hora. O middleware de autenticação validará a
assinatura e a expiração, disponibilizando o identificador e o e-mail do usuário
em `req.user`.

## Justificativa

- Não exige armazenamento de sessão no processo da API.
- É adequado para clientes web e móveis que consomem uma API HTTP.
- Permite validar a identidade antes de executar uma rota protegida.
- A biblioteca `jsonwebtoken` já integra com o ecossistema Node.js do projeto.

## Consequências

### Positivas

- A API pode ser escalada horizontalmente sem compartilhar sessões entre
  instâncias.
- O middleware centraliza a validação dos tokens.
- A expiração limita o tempo de uso de um token comprometido.

### Negativas

- Um token emitido permanece válido até expirar, salvo implementação adicional
  de revogação.
- O segredo precisa ser protegido e diferente entre ambientes quando necessário.
- O cliente precisa armazenar e enviar o token corretamente.
- Alterações de permissões não são refletidas em tokens já emitidos.

## Requisitos de segurança

- `JWT_SECRET` não deve ser versionado no repositório.
- O segredo deve ter entropia suficiente e ser configurado pelo ambiente de
  execução.
- A API deve usar HTTPS em ambientes que transportem credenciais ou tokens.
- Endpoints protegidos devem aplicar o middleware antes de executar a regra de
  negócio.

## Critérios de revisão

Esta decisão deve ser reavaliada se houver necessidade de logout imediato,
revogação de tokens, controle avançado de permissões, múltiplos emissores ou
integração com um provedor de identidade externo.
