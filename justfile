set dotenv-load := true
set export
set shell := ["bash", "-uc"]
nowts := `date +%Y%m%d_%H%M%S`
YYYYMMDD := `date +%Y%m%d`


start_local:
    npx docusaurus start

build:
    npm run build

upgrade_packages:
    npx npm-check-updates -u
    npm install