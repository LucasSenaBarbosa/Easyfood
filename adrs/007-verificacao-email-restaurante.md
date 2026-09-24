# ADR-007 - Verificação de e-mail para restaurantes

**Status:** Proposta / em preparação
**Data:** 23/09/2026  
**Autores:** Equipe de Engenharia EasyFood

## Contexto

A entidade `Restaurant` já prevê campos para controle de verificação de e-mail, como
`emailVerificationCodeHash`, `emailVerificationExpiresAt` e `emailVerifiedAt`.
Esse tipo de dado é relevante porque um restaurante pode ter um contato de
comunicação que precisa ser validado antes de ser considerado confiável ou
ativo em fluxos de confiança e notificação.

No projeto atual, a API ainda não implementa o envio de e-mail nem a validação
final do código, mas a estrutura do schema foi preparada para que esse recurso
possa ser adicionado sem reestruturar o modelo principal.

## Alternativas consideradas

1. Não armazenar nenhuma informação de verificação de e-mail.
2. Validar somente o e-mail do usuário cadastrado, sem vínculo com o restaurante.
3. Adicionar campos específicos na tabela de restaurante para suportar
   verificação futura.
4. Delegar a verificação para um provedor externo de identidade ou e-mail.

## Decisão

Adicionar campos de verificação de e-mail diretamente na entidade `Restaurant`
para permitir um fluxo futuro de confirmação de contato, validação de
propriedade e envio de notificações de confiança.

A estrutura aplicada no schema atual inclui:

- `emailVerificationCodeHash`: hash do código gerado para validação.
- `emailVerificationExpiresAt`: prazo de validade do código.
- `emailVerifiedAt`: marca temporal da verificação concluída.

## Justificativa

- Preserva a capacidade de validar a existência e a propriedade de um contato
  antes de publicar ou destacar um restaurante.
- Mantém o modelo de dados pronto para integração com um fluxo de confirmação
  por e-mail, sem alterar a estrutura principal depois.
- Evita decisões ad hoc em fases futuras, quando o recurso de verificação for
  realmente necessário.
- Permite evoluir a aplicação de forma rastreável por migração e documentação.

## Consequências

### Positivas

- O banco já suporta um fluxo de confirmação de e-mail para restaurante.
- O modelo fica preparado para validar a autenticidade do contato.
- A adoção futura de confirmação por link ou código pode ser feita de forma
  incremental.

### Negativas

- A API atual não aproveita esses campos ainda, então o modelo pode parecer
  parcialmente implementado.
- O fluxo completo exige integração com serviço de e-mail e regras de expiração
  do código.
- A verificação pode aumentar a complexidade de onboarding e cadastro.

## Regras de operação

- O campo `emailVerifiedAt` deve permanecer nulo até a confirmação bem-sucedida.
- O código de verificação deve ser gerado e armazenado em hash, nunca em texto
  puro.
- O tempo de expiração deve ser controlado e validado no processo de verificação.
- O uso de e-mail de confirmação deve ser tratado como um recurso opcional e
  evolutivo.

## Critérios de revisão

Esta decisão deve ser revisada quando o fluxo de verificação for implementado em
produção, quando o processo de cadastro exigir confirmação obrigatória ou quando
for definida uma abordagem externa de autenticação/validação por e-mail.
