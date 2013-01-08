#!/bin/bash

b=0;
e=1;
l=0;

USAGE="Usage: `basename $0` [-b|l -e{0|1}]";

# Parse command line options.
while getopts be:l OPT; do
    case "$OPT" in
        b)
	    b=1
            ;;
        e)
	    e=$OPTARG
            ;;
        l)
            l=1
            ;;
        \?)
            # getopts issues an error message
            echo $USAGE >&2
            exit 1
            ;;
    esac
done

svn up
rm -r rel
mkdir rel
if [ $e -eq 1 ]
then
   ./compress.sh -a src rel
else
   tar c -C "src/" --exclude "*.svn" --exclude "*.*~" --exclude "*.diff" --exclude "*.js.*" --exclude "svn-com*" . | \
	tar x -C "rel/"
fi
svn info | grep -r "Revision:" | sed "s/Revision: //g" > rev.tmp
cd rel
#cp ../build_sys/manifest.json.google.com manifest.json

mkdir cm
cd cm
cp ../../src/cm/*.* .
rm *.*~
mkdir keymap
cd keymap
cp ../../../src/cm/keymap/*.* .
rm *.*~
cd ..
cd ..

mkdir saveas
cd saveas
cp ../../src/saveas/*.* .
rm *.*~
cd ..

cp ../README .
cp ../COPYING .
cp ../src/*.html .
cp ../src/*.css .
mkdir images
cp ../images/* images/
mkdir _locales
tar c -C "../i18n/" --exclude "*.svn" --exclude "*.*~" --exclude "*.diff" . | tar x -C "_locales/"
cd _locales
cd ja
wget https://raw.github.com/shirayuki/Tampermonkey-ja/master/messages.json
mv -f messages.json.1 messages.json
cd ..
cd ..
mkdir system
cp ../src/system/* system/

# keep jslint copyright notice
mv jslint.js jslint.js.tmp
head -n 24 ../src/jslint.js > jslint.js
cat jslint.js.tmp >> jslint.js
rm jslint.js.tmp

if [ $l -eq 0 ]
then
    cat ../build_sys/manifest.json.google.com > manifest.tmp
else
    cat ../build_sys/manifest.json.legacy.com > manifest.tmp
    cat ../build_sys/tm_legacy.legacy.xml | sed "s/\(version='\)\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)'/\1\2\.\3\.`cat ../rev.tmp`'/g" > ../tm_legacy.xml
fi

cat manifest.tmp | sed "s/\(\"version\": \"\)\([0-9]*\)\.\([0-9]*\)\.\([0-9]*\)\"/\1\2\.\3\.`cat ../rev.tmp`\"/g" > manifest.json.tmp
rm manifest.tmp

cd images
mv icon_grey.png icon_grey.png.bak
mv icon_grey_blocker.png icon_grey_blocker.png.bak
rm yicon*.png

if [ $l -eq 1 ]
then
    rm icon*.png
    rm ricon*.png
    mv licon.png icon.png
    mv licon48.png icon48.png
    mv licon128.png icon128.png
else
  if [ $b -eq 1 ]
  then
    rm icon*.png
    rm licon*.png
    mv ricon.png icon.png
    mv ricon48.png icon48.png
    mv ricon128.png icon128.png
   else
    rm ricon*.png
    rm licon*.png
   fi
fi
mv icon_grey.png.bak icon_grey.png
mv icon_grey_blocker.png.bak icon_grey_blocker.png

cd ..

if [ $b -eq 1 ]
then
  cat manifest.json.tmp | sed "s/\(\"name\":[ D\t]*\"\)\([A-Za-z0-9]*\)/\1\2 Beta/g" > manifest.json
  rm manifest.json.tmp
else
  mv manifest.json.tmp manifest.json
fi

rm *.*~
rm system/*.*~
rm *.debug.js
cd ..
rm rev.tmp
