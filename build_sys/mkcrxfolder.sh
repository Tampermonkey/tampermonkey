#!/bin/bash

m=0;

if [ $# -eq 1 ]
then
 if [ $1 == "-b" ]
 then
  m=1;
 else
   echo "'$1' is not supported!"
   exit 1;
 fi
fi

svn up
rm -r rel
mkdir rel
./compress.sh -a src rel
svn info | grep -r "Revision:" | sed "s/Revision: //g" > rev.tmp
cd rel
#cp ../build_sys/manifest.json.google.com manifest.json

mkdir cm
cd cm
cp ../../src/cm/*.* .
rm *.*~
cd ..

mkdir saveas
cd saveas
cp ../../src/saveas/*.* .
rm *.*~
cd ..

cp ../src/*.html .
cp ../src/*.css .
mkdir images
cp ../images/* images/
mkdir _locales
mkdir _locales/de
mkdir _locales/en
mkdir _locales/fr
mkdir _locales/ja
mkdir _locales/zh_CN
cp ../i18n/en/* _locales/en/
cp ../i18n/de/* _locales/de/
cp ../i18n/fr/* _locales/fr/
cp ../i18n/ja/* _locales/ja/
cp ../i18n/zh_CN/* _locales/zh_CN/
mkdir system
cp ../src/system/* system/

cat ../build_sys/manifest.json.google.com | sed "s/\(\"version\": \"\)\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)\"/\1\2\.\3\.`cat ../rev.tmp`\"/g" > manifest.json.tmp
if [ $m -eq 1 ]
then
 cat manifest.json.tmp | sed "s/\(\"name\":[ D\t]*\"\)\([A-Za-z0-9]*\)/\1\2 Beta/g" > manifest.json
 rm manifest.json.tmp
 cd images
 mv icon_grey.png icon_grey.png.bak
 mv icon_3d_grey.png icon_3d_grey.png.bak
 rm icon*.png
 mv ricon.png icon.png
 mv ricon48.png icon48.png
 mv ricon128.png icon128.png
 mv ricon_3d.png icon_3d.png
 mv ricon48_3d.png icon48_3d.png
 mv ricon128_3d.png icon128_3d.png
 mv icon_grey.png.bak icon_grey.png
 mv icon_3d_grey.png.bak icon_3d_grey.png
 cd ..
else
 rm images/ricon*.png
 mv manifest.json.tmp manifest.json
fi

rm *.*~
rm system/*.*~
rm *.debug.js
cd ..
rm rev.tmp
