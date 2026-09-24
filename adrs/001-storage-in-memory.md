# ADR-001 - Armazenamento inicial em memória

**Status:** Aceita e superada pelo ADR-002  
**Data:** 20/08/2026  
**Responsável:** Lucas Sena Barbosa

## Contexto

A primeira versão da API do EasyFood precisava listar e cadastrar restaurantes
para validar o fluxo da aplicação e apresentar o MVP. O produto ainda estava em
prototipação, portanto a prioridade era reduzir o tempo de desenvolvimento e a
complexidade operacional.

## Alternativas consideradas

1. Array em memória
2. PostgreSQL
3. MongoDB
4. SQLite
5. Firebase
6. Arquivo JSON

## Decisão

Adotar um array em memória como mecanismo de armazenamento na primeira versão do
serviço.

## Justificativa

- Permite desenvolvimento e testes rápidos.
- Não exige configuração ou infraestrutura externa.
- Mantém o custo e a complexidade iniciais baixos.

## Consequências

### Positivas

- Fluxos de consulta e cadastro puderam ser validados rapidamente.
- O conceito de negócio pôde ser demonstrado sem dependências de infraestrutura.

### Negativas

- Os dados são perdidos ao reiniciar o processo ou fazer um novo deploy.
- Não há integridade, concorrência ou histórico de dados.
- Consultas complexas e relacionamentos não são suportados adequadamente.
- A solução não é apropriada para produção.

## Critérios de revisão

Esta decisão deveria ser reavaliada quando o MVP fosse validado, houvesse
necessidade de persistência entre deploys ou surgissem consultas e
relacionamentos mais complexos. Esses critérios levaram à decisão registrada no
ADR-002.

