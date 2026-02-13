#!/bin/bash

# Script de build para ¥$ Extension
# Gera a extensão pronta para instalação

set -e

echo "=== Iniciando build da extensão ¥$ ==="

# Limpar pasta de build anterior
echo "Limpando build anterior..."
rm -rf build
mkdir -p build

# Copiar arquivos JavaScript
echo "Copiando arquivos JavaScript..."
cp -r src/*.js build/
cp -r src/*.html build/
cp -r src/*.css build/

# Copiar CodeMirror
echo "Copiando CodeMirror..."
mkdir -p build/cm/keymap
cp src/cm/*.* build/cm/ 2>/dev/null || true
cp src/cm/keymap/*.* build/cm/keymap/ 2>/dev/null || true

# Copiar saveas
echo "Copiando saveas..."
mkdir -p build/saveas
cp src/saveas/*.* build/saveas/ 2>/dev/null || true

# Copiar imagens
echo "Copiando imagens..."
mkdir -p build/images
cp images/* build/images/

# Copiar traduções (i18n)
echo "Copiando traduções..."
mkdir -p build/_locales
cp -r i18n/* build/_locales/

# Copiar scripts do sistema (incluindo zavz)
echo "Copiando scripts do sistema..."
mkdir -p build/system
cp src/system/* build/system/

# Copiar arquivos de licença
echo "Copiando licença..."
cp COPYING build/ 2>/dev/null || true
cp README.md build/ 2>/dev/null || true

# Gerar manifest.json
echo "Gerando manifest.json..."
VERSION="1.0.0"
if [ -d .git ]; then
    # Usar timestamp do git como versão
    VERSION="1.0.$(git rev-list --count HEAD)"
fi

cat > build/manifest.json << EOF
{
    "manifest_version": 2,
    "name": "¥$",
    "version": "$VERSION",
    "description": "¥$ - The most popular userscript manager",
    "icons": {
        "16": "images/icon.png",
        "48": "images/icon48.png",
        "128": "images/icon128.png"
    },
    "browser_action": {
        "default_icon": {
            "19": "images/icon.png",
            "38": "images/icon.png"
        },
        "default_title": "¥$",
        "default_popup": "action.html"
    },
    "background": {
        "page": "background.html"
    },
    "options_page": "options.html",
    "content_scripts": [
        {
            "matches": ["http://*/*", "https://*/*"],
            "js": ["content.js"],
            "run_at": "document_start",
            "all_frames": true
        }
    ],
    "permissions": [
        "tabs",
        "idle",
        "notifications",
        "contextMenus",
        "unlimitedStorage",
        "storage",
        "webNavigation",
        "webRequest",
        "webRequestBlocking",
        "cookies",
        "<all_urls>"
    ],
    "content_security_policy": "script-src 'self'; object-src 'self'",
    "web_accessible_resources": [
        "inject.js"
    ]
}
EOF

# Criar arquivo ZIP da extensão
echo "Criando arquivo ZIP..."
cd build
zip -r ../ys-extension.zip * -q
cd ..

echo ""
echo "=== Build concluído com sucesso! ==="
echo "Pasta de build: ./build/"
echo "Arquivo ZIP: ./ys-extension.zip"
echo ""
echo "Para instalar no Chrome/Edge:"
echo "1. Abra chrome://extensions/"
echo "2. Ative o 'Modo do desenvolvedor'"
echo "3. Clique em 'Carregar sem compactação'"
echo "4. Selecione a pasta './build/'"
echo ""
echo "Ou extraia o arquivo ys-extension.zip e carregue a pasta extraída"
