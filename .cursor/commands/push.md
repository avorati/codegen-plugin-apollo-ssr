- Validar qualidade:
  - yarn lint
  - yarn test
  - yarn build

- Definir a versão diretamente:
  - npm pkg set version=<x.y.z>

- Atualizar CHANGELOG.md e commitar:
  - git add .
  - git commit -m "chore(release): v<x.y.z>"
  - git push