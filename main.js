const introDialogue = ["A Nhonn welcome, this web created by ur gf", "Em mong là anh có trải nghiệm tốt với những thứ sắp tới", "Lets go, enjoy it, i love you <3"];
const outroDialogue = ["Happi our anniversary", "Cảm ơn anh đã yêu emm", "Em yêu anh rất nhiều."];

let currentIntroIndex = 0;
let currentOutroIndex = 0;
let isTyping = false;
let typingTimeout = null;
let flashlightTimer = null; 

const screenIntro = document.getElementById("screen-intro");
const screenRule = document.getElementById("screen-rule");
const screenLoading = document.getElementById("screen-loading");
const screenGameFlashlight = document.getElementById("screen-game-flashlight");
const screenGameFlipcard = document.getElementById("screen-game-flipcard");
const flipcardRuleBox = document.getElementById("flipcard-rule-box");
const flipcardContent = document.getElementById("flipcard-content");
const screenLetter = document.getElementById("screen-letter");
const screenOutro = document.getElementById("screen-outro");
const whiteOverlay = document.getElementById("white-flash-overlay");

const introTextEl = document.getElementById("intro-text");
const introHintEl = document.getElementById("intro-hint");
const outroTextEl = document.getElementById("outro-text");
const outroHintEl = document.getElementById("outro-hint");

const btnPlay = document.getElementById("btn-play");
const btnStartFlipcard = document.getElementById("btn-start-flipcard");
const btnCloseLetter = document.getElementById("btn-close-letter");

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

function transitionToScreen(fromScreen, toScreen) {
  fromScreen.classList.add("hidden");
  setTimeout(() => {
    toScreen.classList.remove("hidden");
    if (toScreen === screenOutro) startOutro();
  }, 800);
}

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

btnPlay.addEventListener("click", () => {
  transitionToScreen(screenRule, screenLoading);
  setTimeout(() => {
    transitionToScreen(screenLoading, screenGameFlashlight);
    initFlashlightGame(); 
  }, 3000);
});

const overlay = document.querySelector(".flashlight-overlay");
const items = document.querySelectorAll(".game-item");
const steamPopup = document.getElementById("steam-popup");
const achImg = document.getElementById("ach-img");
const achName = document.getElementById("ach-name");
const achDesc = document.getElementById("ach-desc");

let itemsFoundCount = 0; 
let isPopupActive = false;
let isFlipGameDone = false; 

screenGameFlashlight.addEventListener("mousemove", (e) => {
  const rect = screenGameFlashlight.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  overlay.style.setProperty("--cursor-x", `${x}%`);
  overlay.style.setProperty("--cursor-y", `${y}%`);
});

function initFlashlightGame() {
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

    // 1. nếu click trúng lá bài -> đi chơi lật bài
    if (item.id === "item-card") {
      clearInterval(flashlightTimer); 
      setTimeout(() => {
        transitionToScreen(screenGameFlashlight, screenGameFlipcard);
      }, 500);
      return; 
    }

    // 2. nếu click trúng lá thư -> hiệu ứng trắng xóa rồi chuyển scr đọc thư
    if (item.id === "item-letter") {
      clearInterval(flashlightTimer);
      whiteOverlay.classList.remove("hidden");
      setTimeout(() => whiteOverlay.classList.add("active"), 10);
      
      setTimeout(() => {
        screenGameFlashlight.classList.add("hidden");
        screenLetter.classList.remove("hidden");
        whiteOverlay.classList.remove("active");
        setTimeout(() => whiteOverlay.classList.add("hidden"), 800);
      }, 900);
      return;
    }

    // 3. các item thường nổ achievement
    itemsFoundCount++;
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
  checkAndSpawnLetter();
}

// hàm kiểm tra điều kiện xuất hiện lá thư ở cuối cùng
function checkAndSpawnLetter() {
  if (itemsFoundCount >= 5 && isFlipGameDone) {
    const letterItem = document.getElementById("item-letter");
    if (letterItem && letterItem.classList.contains("hidden")) {
      letterItem.classList.remove("hidden");
      const randomX = Math.floor(Math.random() * 75) + 10;
      const randomY = Math.floor(Math.random() * 75) + 10;
      letterItem.style.left = `${randomX}%`;
      letterItem.style.top = `${randomY}%`;
    }
  }
}

screenGameFlashlight.addEventListener("click", () => {
  if (isPopupActive) hideSteamAchievement();
});

if (btnStartFlipcard) {
  btnStartFlipcard.addEventListener("click", () => {
    flipcardRuleBox.classList.add("hidden");
    flipcardContent.classList.remove("hidden");
    if (typeof initFlipCardGame === 'function') initFlipCardGame();
  });
}

if (btnCloseLetter) {
  btnCloseLetter.addEventListener("click", () => {
    transitionToScreen(screenLetter, screenOutro);
  });
}

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
