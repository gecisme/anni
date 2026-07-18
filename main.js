// DỮ LIỆU THOẠI
const introDialogue = ["A Nhonn welcome, this web created by ur gf", "Em mong là anh có trải nghiệm tốt với những thứ sắp tới", "Lets go, enjoy it, i love you <3"];
const outroDialogue = ["Happi our anniversary", "Cảm ơn anh đã yêu emm", "Em yêu anh."];

// STATE CHUNG
let currentIntroIndex = 0;
let currentOutroIndex = 0;
let isTyping = false;
let typingTimeout = null;
let flashlightTimer = null; 

// DOM ELEMENTS
const screenIntro = document.getElementById("screen-intro");
const screenRule = document.getElementById("screen-rule");
const screenLoading = document.getElementById("screen-loading");
const screenGameFlashlight = document.getElementById("screen-game-flashlight");
const screenGameFlipcard = document.getElementById("screen-game-flipcard");
const screenLetter = document.getElementById("screen-letter");
const screenOutro = document.getElementById("screen-outro");

const introTextEl = document.getElementById("intro-text");
const introHintEl = document.getElementById("intro-hint");
const outroTextEl = document.getElementById("outro-text");
const outroHintEl = document.getElementById("outro-hint");

const btnPlay = document.getElementById("btn-play");
const btnCloseLetter = document.getElementById("btn-close-letter");

// EFFECT GÕ CHỮ
function typeSentence(element, text, hintElement) {
  element.textContent = "";
  isTyping = true;
  hintElement.classList.add("hidden");
  element.classList.add("is-typing");

  let index = 0;
  function typeChar() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      typingTimeout = setTimeout(typeChar, 55);
    } else {
      finishTyping(element, text, hintElement);
    }
  }
  typeChar();
}

function finishTyping(element, text, hintElement) {
  clearTimeout(typingTimeout);
  element.textContent = text;
  isTyping = false;
  element.classList.remove("is-typing");
  hintElement.classList.remove("hidden");
}

// CHUYỂN SCREEN
function transitionToScreen(fromScreen, toScreen) {
  fromScreen.classList.add("hidden");
  setTimeout(() => {
    toScreen.classList.remove("hidden");
    if (toScreen === screenOutro) startOutro();
  }, 800);
}

// SCR 1 (INTRO)
function startIntro() {
  currentIntroIndex = 0;
  typeSentence(introTextEl, introDialogue[0], introHintEl);
}

function handleIntroInteraction() {
  const currentSentence = introDialogue[currentIntroIndex];
  if (isTyping) {
    finishTyping(introTextEl, currentSentence, introHintEl);
  } else {
    currentIntroIndex++;
    if (currentIntroIndex < introDialogue.length) {
      typeSentence(introTextEl, introDialogue[currentIntroIndex], introHintEl);
    } else {
      transitionToScreen(screenIntro, screenRule);
    }
  }
}

screenIntro.addEventListener("click", handleIntroInteraction);
window.addEventListener("keydown", (e) => {
  if (!screenIntro.classList.contains("hidden")) handleIntroInteraction();
});
window.addEventListener("DOMContentLoaded", startIntro);

// SCR 2 (RULE) -> SCR 3 (LOAD) -> SCR 4 (GAME)
btnPlay.addEventListener("click", () => {
  transitionToScreen(screenRule, screenLoading);
  setTimeout(() => {
    transitionToScreen(screenLoading, screenGameFlashlight);
    initFlashlightGame(); 
  }, 3000);
});

// SCR 4: ĐÈN PIN & STEAM POPUP
const overlay = document.querySelector(".flashlight-overlay");
const items = document.querySelectorAll(".game-item");
const steamPopup = document.getElementById("steam-popup");
const achImg = document.getElementById("ach-img");
const achName = document.getElementById("ach-name");
const achDesc = document.getElementById("ach-desc");

let itemsFound = 0;
let totalItems = items.length;
let isPopupActive = false;

screenGameFlashlight.addEventListener("mousemove", (e) => {
  const rect = screenGameFlashlight.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  overlay.style.setProperty("--cursor-x", `${x}%`);
  overlay.style.setProperty("--cursor-y", `${y}%`);
});

function initFlashlightGame() {
  itemsFound = 0;
  randomizeItemPositions();
  if (flashlightTimer) clearInterval(flashlightTimer);
  flashlightTimer = setInterval(() => {
    if (!isPopupActive) randomizeItemPositions();
  }, 30000); 
}

function randomizeItemPositions() {
  items.forEach(item => {
    if (!item.classList.contains("hidden")) {
      const randomX = Math.floor(Math.random() * 75) + 10;
      const randomY = Math.floor(Math.random() * 75) + 10;
      item.style.left = `${randomX}%`;
      item.style.top = `${randomY}%`;
    }
  });
}

items.forEach(item => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isPopupActive) return; 
    
    item.classList.add("hidden");
    itemsFound++;

    const name = item.getAttribute("data-name");
    const desc = item.getAttribute("data-desc");
    const imgSrc = item.querySelector("img").getAttribute("src");
    showSteamAchievement(name, desc, imgSrc);
  });
});

function showSteamAchievement(name, desc, imgSrc) {
  isPopupActive = true;
  achName.textContent = name;
  achDesc.textContent = desc;
  achImg.setAttribute("src", imgSrc);
  steamPopup.classList.add("show");
  setTimeout(hideSteamAchievement, 4000);
}

function hideSteamAchievement() {
  steamPopup.classList.remove("show");
  isPopupActive = false;

  if (itemsFound >= totalItems) {
    clearInterval(flashlightTimer); 
    setTimeout(() => {
      if (screenGameFlipcard) {
        transitionToScreen(screenGameFlashlight, screenGameFlipcard);
        if (typeof initFlipCardGame === 'function') initFlipCardGame();
      } else {
        transitionToScreen(screenGameFlashlight, screenOutro);
      }
    }, 800);
  }
}

screenGameFlashlight.addEventListener("click", () => {
  if (isPopupActive) hideSteamAchievement();
});

// SCR 6 (THƯ) -> OUTRO
if (btnCloseLetter) {
  btnCloseLetter.addEventListener("click", () => {
    transitionToScreen(screenLetter, screenOutro);
  });
}

// SCR 7 (OUTRO)
function startOutro() {
  currentOutroIndex = 0;
  typeSentence(outroTextEl, outroDialogue[0], outroHintEl);
}

function handleOutroInteraction() {
  const currentSentence = outroDialogue[currentOutroIndex];
  if (isTyping) {
    finishTyping(outroTextEl, currentSentence, outroHintEl);
  } else {
    currentOutroIndex++;
    if (currentOutroIndex < outroDialogue.length) {
      typeSentence(outroTextEl, outroDialogue[currentOutroIndex], outroHintEl);
    } else {
      location.reload(); 
    }
  }
}

screenOutro.addEventListener("click", handleOutroInteraction);
window.addEventListener("keydown", (e) => {
  if (!screenOutro.classList.contains("hidden")) handleOutroInteraction();
});
