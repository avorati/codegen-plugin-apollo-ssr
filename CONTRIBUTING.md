# Contributing

Obrigado por considerar contribuir para este projeto! Este documento fornece diretrizes e instruções para contribuir.

## Código de Conduta

Este projeto adere a um código de conduta. Ao participar, espera-se que você mantenha este código. Por favor, reporte comportamentos inaceitáveis.

## Como Contribuir

### Reportar Bugs

Se você encontrou um bug, por favor:

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/avorati/codegen-plugin-apollo-ssr/issues)
2. Se não foi reportado, crie uma nova issue com:
   - Título descritivo
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs comportamento atual
   - Ambiente (versões de Node.js, npm/yarn, etc.)

### Sugerir Melhorias

Sugestões de melhorias são sempre bem-vindas! Para sugerir:

1. Verifique se já existe uma issue relacionada
2. Crie uma nova issue descrevendo:
   - O problema que a melhoria resolveria
   - Como você imagina que deveria funcionar
   - Benefícios da mudança

### Enviar Pull Requests

1. **Fork o repositório**

2. **Clone seu fork**:
   ```bash
   git clone https://github.com/seu-usuario/codegen-plugin-apollo-ssr.git
   cd codegen-plugin-apollo-ssr
   ```

3. **Crie uma branch para sua feature**:
   ```bash
   git checkout -b feature/minha-feature
   # ou
   git checkout -b fix/correcao-de-bug
   ```

4. **Instale as dependências**:
   ```bash
   yarn install
   ```

5. **Faça suas alterações** seguindo as convenções abaixo

6. **Execute os testes**:
   ```bash
   yarn test
   ```

7. **Execute o linter**:
   ```bash
   yarn lint
   ```

8. **Formate o código**:
   ```bash
   yarn format
   ```

9. **Certifique-se de que o build funciona**:
   ```bash
   yarn build
   ```

10. **Commit suas mudanças**:
    ```bash
    git add .
    git commit -m "feat: descrição da feature"
    # ou
    git commit -m "fix: descrição da correção"
    ```

11. **Push para sua branch**:
    ```bash
    git push origin feature/minha-feature
    ```

12. **Abra um Pull Request** no GitHub

## Convenções de Código

### Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: Nova feature
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto e vírgula faltando, etc (não afeta o código)
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Mudanças em build, configurações, etc.

Exemplos:
```
feat: adicionar suporte a subscriptions
fix: corrigir problema com fragments aninhados
docs: atualizar exemplos de uso
```

### Code Style

- Usamos **ESLint** e **Prettier** para manter consistência
- Execute `yarn lint` e `yarn format` antes de commitar
- O código deve seguir as regras do ESLint configuradas

### Testes

- Novas features devem incluir testes
- Correções de bugs devem incluir testes que demonstram o bug fix
- Todos os testes devem passar antes de fazer PR

### Documentação

- Atualize a documentação se necessário
- Adicione exemplos de uso se for uma nova feature
- Atualize o CHANGELOG.md descrevendo suas mudanças

## Estrutura do Projeto

```
.
├── src/           # Código fonte
│   ├── plugin.ts  # Plugin principal
│   ├── index.ts   # Exports
│   └── templates/ # Templates Handlebars
├── tests/         # Testes
├── docs/          # Documentação
└── dist/          # Build (não commitar)
```

## Processo de Review

1. Seu PR será revisado por mantenedores
2. Pode ser que sejam solicitadas mudanças
3. Uma vez aprovado, será mergeado na branch principal

## Dúvidas?

Se tiver dúvidas sobre como contribuir, abra uma issue ou entre em contato com os mantenedores.

Obrigado por contribuir! 🎉
