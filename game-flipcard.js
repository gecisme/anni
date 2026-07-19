const imgCardBack = "card-back.png"; 
const imgCardTypes = {
  theMoon: "the-moon.png",
  theSun: "the-sun.png"
};

const flipAchievements = {
  sad: {
    key: 'sadCatFound',
    name: "đâu có gì là suôn sẻ",
    desc: "cố lên, biết đâu lần sau lại được, chỉ cần cố thêm chút thì không gì là không thể.",
    img: "the-moon.png" 
  },
  pro: {
    key: 'sunMoonFound',
    name: "bồ em dỏi vậy taa",
    desc: "nếu như tình mình có những thứ không như ý anh, em sẽ giúp anh làm mọi thứ thuận lợi hơn.",
    img: "the-sun.png" 
  }
};

let currentRound = 0; 
const totalRounds = 6; 
let missCount = 0; 
let canClickCard = false; 

const screenFlipCard = document.getElementById("screen-game-flipcard");
const roundTitleEl = document.getElementById("flip-round-title");
const statusMsgEl = document.getElementById("flip-status-msg");
const cardsContainerEl = document.querySelector(".cards-container");
const cards = document.querySelectorAll(".card");

function initFlipCardGame() {
  currentRound = 0;
  missCount = 0;
  canClickCard = true;
  setupRound();
}

function setupRound() {
  cardsContainerEl.classList.remove("disabled-clicks"); 
  cards.forEach(card => {
    card.classList.remove("flipped");
    card.querySelector(".card-front img").setAttribute("src", imgCardBack);
    card.style.pointerEvents = "auto";
  });

  if (currentRound === 0) {
    roundTitleEl.textContent = "vòng mẫu (chơi thử nha)";
    statusMsgEl.textContent = "hãy chọn 1 trong 3 lá bài bên dưới!";
  } else {
    roundTitleEl.textContent = `vòng chính thức ${currentRound} / ${totalRounds}`;
    statusMsgEl.textContent = currentRound <= 3 ? "cố thêm chút nữa xem sao..." : "húu hú, sắp được rùi nà!";
  }
}

cards.forEach(card => {
  card.addEventListener("click", () => {
    if (!canClickCard || card.classList.contains("flipped")) return;

    canClickCard = false; 
    cardsContainerEl.classList.add("disabled-clicks"); 

    let resultImgSrc = "";
    if (currentRound === 0) {
      resultImgSrc = (Math.random() > 0.5) ? imgCardTypes.theMoon : imgCardTypes.theSun;
    } else if (currentRound <= 3) {
      resultImgSrc = imgCardTypes.theMoon; 
      missCount++; 
    } else {
      resultImgSrc = imgCardTypes.theSun; 
    }

    card.querySelector(".card-front img").setAttribute("src", resultImgSrc);
    card.classList.add("flipped"); 
    handlePostFlipResults(resultImgSrc);
  });
});

function handlePostFlipResults(resultImgSrc) {
  setTimeout(() => {
    if (resultImgSrc === imgCardTypes.theMoon) {
      statusMsgEl.textContent = "hụt mất rùi, cố lênn ><";
      if (missCount >= 3) triggerFlipAchievement(flipAchievements.sad);
      setTimeout(handleRoundTransition, 1500);
    } else {
      statusMsgEl.textContent = "congrats!";
      if (currentRound > 3) {
        triggerFlipAchievement(flipAchievements.pro);
        setTimeout(returnToFlashlightScreen, 1500);
      } else {
        setTimeout(handleRoundTransition, 1500);
      }
    }
  }, 600); 
}

function handleRoundTransition() {
  currentRound++;
  if (currentRound <= totalRounds) {
    setupRound();
    canClickCard = true;
  }
}

function returnToFlashlightScreen() {
  const screenGameFlashlight = document.getElementById("screen-game-flashlight");
  if (screenGameFlashlight && typeof transitionToScreen === 'function') {
    window.isFlipGameDone = true; 
    transitionToScreen(screenFlipCard, screenGameFlashlight);
    if (typeof initFlashlightGame === 'function') initFlashlightGame();
    if (typeof checkAndSpawnLetter === 'function') checkAndSpawnLetter();
  }
}

function triggerFlipAchievement(achData) {
  if (window.GameStorage && window.GameStorage.isUnlocked(achData.key)) return;
  if (window.GameStorage) window.GameStorage.unlock(achData.key);
  if (typeof showSteamAchievement === 'function') {
    showSteamAchievement(achData.name, achData.desc, achData.img);
  }
}
