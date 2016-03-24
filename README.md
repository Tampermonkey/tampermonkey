*This repository contains the source of the Tampermonkey extension up to version 2.9.*
*All newer versions are distributed under a proprietary license.*

Tampermonkey is the most popular userscript manager for Google Chrome.

Features:
 - manage and edit all your userscripts
 - enable and disable your scripts with 2 clicks
 - easily sync you scripts between different Chrome instances
 - search scripts from userscripts.org by URL (with TamperFire enabled)

Beneath of other tags, functions and features the following ones are supported:
 - full unsafeWindow access
 - all GM_* functions including (GM_registerMenuCommand, GM_getResourceText, GM_getResourceURL, GM_notification)
 - a lot of tags supported by Greasemonkey and Scriptish (like @resource, @require, ...)

For a full overview please take a look at the FAQ or just install TM. ;)

---

This code is provided entirely free of charge by the programmer in his spare
time so donations would be greatly appreciated. Please consider a donation.

http://tampermonkey.net/donate.html

---

DOWNLOADS:

Tampermonkey (stable): 
   https://chrome.google.com/webstore/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo

Tampermonkey (beta): developer version, might contain bugs!
   https://chrome.google.com/webstore/detail/gcalenpjmijncebpfijmoaglllgpjagf

Tampermonkey (Legacy - Manifest version 1): for browsers based on Chromimum 17.
   http://tampermonkey.net/crx/tm_legacy.crx

Tampermonkey (retro): very old version 1.1.2190, no support!
   http://tampermonkey.net/crx/tampermonkey_retro.crx

---

SOURCE:

http://code.google.com/p/tampermonkey/

---

SUPPORT:

FAQ: http://tampermonkey.net/faq
API: http://tampermonkey.net/api
Meta Data Block: http://tampermonkey.net/metadata

Report Bugs: http://tampermonkey.net/bug

---

LICENSE: 

GPLv3.  See COPYING for details.

---

DEPENDENCIES:

Google Chrome or Chromium 17 or higher

BASIC BUILD INSTRUCTIONS:

- install Google Chrome or Chromium
- install Cygwin when using Windows
- open a konsole/terminal, and type:

cd
svn checkout http://tampermonkey.googlecode.com/svn/trunk/ tampermonkey-read-only
cd tampermonkey-read-only
ln -s build_sys/mkcrxfolder.sh .
./mkcrxfolder.sh -e0

Depending on your installed browser and OS (I hope this makes the overall scheme clear ;)

chrome.exe --pack-extension=rel/
chromium.exe --pack-extension=rel/

coogle-chrome --pack-extension=rel/
chromium-browser --pack-extension=rel/

ls -la now shows two new files:

-rw-r--r--  1 user user 305170 Aug 29 09:09 rel.crx
-rw-r--r--  1 user user    916 Aug 29 09:09 rel.pem

rel.crx is the Chrome extension, rel.pem the key to create another Tampermonkey extension file with the same extension ID

You can install rel.crx by drag'n'drop or (depending on your OS)

chrome.exe rel.crx
chromium.exe rel.crx

coogle-chrome rel.crx
chromium-browser rel.crx

---

This code is provided entirely free of charge by the programmer in his spare
time so donations would be greatly appreciated. Please consider a donation.

Jan Biniok <jan@biniok.net>
http://tampermonkey.net/donate.html
