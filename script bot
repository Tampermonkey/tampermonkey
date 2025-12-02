// ==UserScript==
// @name         chair-script
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  scripts and exploits
// @author       chair
// @match        https://pony.town
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==
//MADE BY CHAIR (disc:im_chair/telegram:@im_chair)
(function() {
  'use strict';

 const panelContainer = document.createElement('div');
 panelContainer.id = 'scriptPanel';
 panelContainer.style.position = 'fixed';
 panelContainer.style.top = '10px';
 panelContainer.style.left = '10px';
 panelContainer.style.zIndex = '9999';
 document.body.appendChild(panelContainer);


  let intervalId;

  const panelStyles = `
    #scriptPanel button {
      background-color: red;
      color: white;
      padding: 8px 12px;
      margin-right: 10px;
      border: none;
      cursor: pointer;
      outline: none;
      border-radius: 4px;
    }

    #scriptPanel button:hover {
      background-color: darkred;
    }

    #scriptPanel button.active {
      background-color: green;
    }
  `;

  const styleElement = document.createElement('style');
  styleElement.textContent = panelStyles;
  document.head.appendChild(styleElement);

  const madeByChair = document.getElementById('madeByChair');
  if (madeByChair) {
    madeByChair.style.top = 'calc(30px + 20px)';
  }

    const welcomeWindowHTML = `
    <div id="welcomeWindow" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #333; padding: 20px; text-align: center; border: 2px solid rgba(0, 0, 0, 0.2); transition: opacity 0.5s, visibility 0.5s; z-index: 10000;">
      <h1 style="color: white; font-weight: bold;">Chair Script</h1>
      <h3 style="color: white; font-weight: bold; font-size: 24px;">Version: <span style="font-size: 28px;">version-0.2-alpha</span></h3>
      <!-- gif1 -->
      <h2 style="color: white;">
        RUS: Добро пожаловать в мой чит-клиент. Он постоянно будет обновляться и дополняться. На данный момент он безопасный, его очень сложно найти. Удачи в использовании!
      </h2>
      <img src="https://s5.gifyu.com/images/SRCZg.gif" alt="Your GIF" style="display: block; margin: 20px auto 0; width: 320px; height: 154px;">
      <h2 style="color: white;">
        ENG: Welcome to my cheat client. It will be constantly updated and supplemented. At the moment, it is safe, it is very difficult to find.
      </h2>
      <img src="https://i.postimg.cc/158N60D6/imgonline-com-ua-Resize-Aue-NYww-PPj-Q7i.png" alt="photo" width="320" height="154" style="display: block; margin: 20px auto 0;">
      <hr style="border-top: 1px solid white;">
      <button id="letsGoButton" style="background-color: #5cb85c; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;">Let's go!</button>
    </div>
    <div id="overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); backdrop-filter: blur(5px); z-index: 9999;"></div>
    <div id="madeByChair" style="position: fixed; top: 30px; right: 10px; font-size: 16px; z-index: 10001;">
      <span id="madeByText" style="cursor: pointer; color: #E52AE2;">Made by Chair</span>
      <img id="chairImage" src="https://i.postimg.cc/MGLzpczq/imgonline-com-ua-Resize-Iu-Xd-Gid-Qt-SQu.png" alt="photo" width="64" height="64" style="vertical-align: middle; margin-left: 5px; opacity: 0.7;">
    </div>
  `;



  panelContainer.innerHTML = welcomeWindowHTML;

  const welcomeWindow = document.getElementById('welcomeWindow');
  const letsGoButton = document.getElementById('letsGoButton');

  setTimeout(() => {
    welcomeWindow.style.opacity = '1';
    welcomeWindow.style.visibility = 'visible';
  }, 500);

  function closeWelcomeWindow() {
    welcomeWindow.style.opacity = '0';
    welcomeWindow.style.visibility = 'hidden';
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'auto';
    }, 1000); 
  }

  letsGoButton.addEventListener('click', closeWelcomeWindow);
  letsGoButton.addEventListener('mouseover', function() {
    letsGoButton.style.backgroundColor = '#4CAF50'; 
  });
  letsGoButton.addEventListener('mouseout', function() {
    letsGoButton.style.backgroundColor = '#5cb85c'; 
  });

  setTimeout(() => {
    welcomeWindow.style.display = 'block';
  }, 1000);

  letsGoButton.addEventListener('click', closeWelcomeWindow);

  const antiafkButton = document.createElement('button');
  antiafkButton.textContent = 'ANTIAFK';
  antiafkButton.style.backgroundColor = 'red';
  antiafkButton.style.color = 'white';
  antiafkButton.style.padding = '8px 12px';
  antiafkButton.style.marginRight = '10px';
  antiafkButton.style.border = 'none';
  antiafkButton.style.cursor = 'pointer';
  antiafkButton.style.borderRadius = '4px';
  panelContainer.appendChild(antiafkButton);

  const autoWriterButton = document.createElement('button');
  autoWriterButton.textContent = 'AUTOADWRITER';
  autoWriterButton.style.backgroundColor = 'red';
  autoWriterButton.style.color = 'white';
  autoWriterButton.style.padding = '8px 12px';
  autoWriterButton.style.marginRight = '10px';
  autoWriterButton.style.border = 'none';
  autoWriterButton.style.cursor = 'pointer';
  autoWriterButton.style.borderRadius = '4px';
  panelContainer.appendChild(autoWriterButton);

  let isAntiafkActive = false;
  let isAutoWriterActive = false;
  let intervalIdAutoWriter;

  antiafkButton.addEventListener('click', toggleAntiafk);
  autoWriterButton.addEventListener('click', toggleAutoWriter);

    const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.style.pointerEvents = 'none';
    overlay.style.display = 'block';

    const letsGoButton = document.getElementById('letsGoButton');
    if (letsGoButton) {
      letsGoButton.addEventListener('click', function() {
        overlay.style.display = 'none';
        overlay.style.pointerEvents = 'auto';
      });
    }
  }

  function click() {
    var event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    var element = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    element.dispatchEvent(event);

    console.log("click");
  }

  function startClicking() {
    intervalId = setInterval(click, 15000);
    console.log("script starting");
  }

  function stopClicking() {
    clearInterval(intervalId);
    console.log("script stop");
    setTimeout(function() {
      console.clear();
    }, 5000);
  }

  function toggleAntiafk() {
    isAntiafkActive = !isAntiafkActive;
    if (isAntiafkActive) {
      antiafkButton.classList.add('active');
      antiafkButton.style.backgroundColor = 'green';
      console.log('ANTIAFK enable');
      startClicking();
    } else {
      antiafkButton.classList.remove('active');
      antiafkButton.style.backgroundColor = 'red';
      console.log('ANTIAFK disable');
      stopClicking();
    }
  }
  antiafkButton.addEventListener('click', toggleAntiafk);

  function sendMessage(statsText) {
    let messageCount = 0;
    let isChatOpen = false;
    let isSendingMessage = false;

    function click() {
      var event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      var element = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      element.dispatchEvent(event);

      console.log("click");
    }

    function openChat() {
      const chatButton = document.querySelector(".chat-open-button button");

      if (chatButton) {
        chatButton.click();
        isChatOpen = true;
      }
    }


    function closeChat() {
      const closeButton = document.querySelector(".chat-close-button button");

      if (closeButton) {
        closeButton.click();
        isChatOpen = false;
      }
    }

function sendMessage(statsText) {
  if (isAutoWriterActive) {
    if (isChatOpen) {
      if (!isSendingMessage) {
        isSendingMessage = true;
        const textareaElement = document.querySelector("textarea[aria-label='Chat message']");

        if (textareaElement) {
          const statsTextWithoutFps = statsText.replace(/\d+\s?fps/, '');
          textareaElement.value = `${++messageCount} ${statsTextWithoutFps}`;

          const enterEvent = new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            cancelable: true,
          });

          textareaElement.dispatchEvent(enterEvent);
          const sendButton = document.querySelector("ui-button[title='Send message (hold Shift to send without closing input)'] button");
          if (sendButton) {
            sendButton.click();
          }

          if (messageCount === 200) {
            location.reload();
          }
        }
        isSendingMessage = false;
      } else {
        setTimeout(sendMessage, 1000, statsText);
      }
    } else {
      openChat();
    }
  }
}

    function updateAndSendMessage() {
      sendMessage(statsText);

      if (Math.random() < 0.39) {
        click();
      }
    }
    setInterval(updateAndSendMessage, 4000 + Math.random() * 2000);
  }
  function toggleAutoWriter() {
    isAutoWriterActive = !isAutoWriterActive;
    if (isAutoWriterActive) {
      autoWriterButton.classList.add('active');
      autoWriterButton.style.backgroundColor = 'green';
      console.log('AUTOADWRITER enable');
      console.log('enter the text for the ad:');
      const adText = prompt('enter the text for the ad:');
      if (adText !== null) {
        const statsText = adText.trim() || 'Default text';
        sendMessage(statsText);
      } else {
        autoWriterButton.classList.remove('active');
        autoWriterButton.style.backgroundColor = 'red';
        isAutoWriterActive = false;
        console.log('AUTOADWRITER disable');
      }
    } else {
      autoWriterButton.classList.remove('active');
      autoWriterButton.style.backgroundColor = 'red';
      console.log('AUTOADWRITER disable');
      stopAutoWriterActions();
    }
  }
     function stopAutoWriterActions() {
    clearInterval(intervalIdAutoWriter);
    console.log("AUTOADWRITER stopping");
  }

  autoWriterButton.addEventListener('click', toggleAutoWriter);
  antiafkButton.addEventListener('click', toggleAntiafk);
  autoWriterButton.addEventListener('click', toggleAutoWriter);


}());
