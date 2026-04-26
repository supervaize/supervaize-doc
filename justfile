set dotenv-load := true
set export
set shell := ["bash", "-uc"]
nowts := `date +%Y%m%d_%H%M%S`
YYYYMMDD := `date +%Y%m%d`

# Default recipe
default:
    @just --list


dev:
    npx docusaurus start

build:
    npm run build

upgrade:
    npx npm-check-updates -u
    npm install

release-patch:
    npm run release:patch

release-minor:
    npm run release:minor

release-major:
    npm run release:major