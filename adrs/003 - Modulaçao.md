# ADR-003 - Organização modular da aplicação

**Status:** Aceita  
**Data:** 27/08/2026  
**Autores:** Equipe de Engenharia EasyFood

## Contexto

Com a inclusão de autenticação, restaurantes e persistência, concentrar regras
em poucos arquivos aumentaria o acoplamento e dificultaria a evolução da API.
Era necessário definir uma forma simples de separar responsabilidades sem
introduzir um framework adicional.

## Alternativas consideradas

1. Manter toda a aplicação em um único arquivo.
2. Organizar apenas por tipo técnico, com pastas globais para controllers,
	services e routes.
3. Organizar por módulo de negócio, reunindo as rotas, controllers, services e
	middlewares de cada contexto.
4. Adotar um framework modular completo.

## Decisão

Organizar a aplicação por módulos de negócio dentro de `src/modules`. Cada
módulo deve concentrar os arquivos responsáveis pelo seu contexto e expor uma
interface clara para o restante da aplicação.

Os módulos atuais são:

- `auth`: autenticação, middleware, controller, service e rotas.
- `restaurant`: cadastro, consulta, controller, service e rotas.

O arquivo principal da aplicação (`src/app.js`) permanece responsável apenas
pela configuração global do Express e pelo registro das rotas dos módulos.

## Justificativa

- Mantém regras relacionadas próximas umas das outras.
- Reduz o acoplamento entre autenticação e restaurantes.
- Facilita testes, manutenção e futura extração de módulos.
- Usa a estrutura já adotada no projeto, sem adicionar complexidade de framework.

## Consequências

### Positivas

- Novas funcionalidades podem ser adicionadas como módulos independentes.
- A localização de uma regra fica previsível.
- Controllers, services e rotas possuem responsabilidades mais claras.

### Negativas

- Pequenas funcionalidades podem exigir mais de um arquivo.
- Dependências entre módulos precisam ser explícitas para evitar acoplamento.
- A equipe deve manter convenções de nomes e limites de responsabilidade.

## Critérios de revisão

Esta decisão deve ser reavaliada se o número de módulos tornar a navegação
difícil, se surgirem dependências circulares ou se a aplicação exigir um
framework modular com recursos que a estrutura atual não oferece.
