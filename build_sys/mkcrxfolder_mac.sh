#!/bin/bash

# clean directory
rm -rf ./rel

# copy files
cp -r ../src ./rel
cp -r ../i18n ./rel/_locales
cp -r ../images ./rel/images
cp ./manifest.json.google.com ./rel/manifest.json

# make crx
# todo: load .pem
rm -f ./tampermonkey.crx
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=./rel
rm -f ./rel.pem
mv ./rel.crx ./tampermonkey.crx
