const imgCardBack = "card-back.png"; 
const imgCardTypes = {
  theMoon: "the-moon.png",
  theSun: "the-sun.png"
};

const flipAchievements = {
  sad: {
    key: 'sadCatFound',
    name: "Đâu Có Gì Là Suôn Sẻ",
    desc: "Cố lên, biết đâu lần sau lại được, chỉ cần cố thêm chút thì không gì là không thể.",
    img: "the-moon.png" 
  },
  pro: {
    key: 'sunMoonFound',
    name: "Bồ Em Dỏi Vậy Taa",
    desc: "Nếu như tình mình có những thứ không như ý anh, em sẽ giúp anh làm mọi thứ thuận lợi hơn.",
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
    roundTitleEl.textContent = "Vòng Mẫu (Chơi thử nha)";
    statusMsgEl.textContent = "Hãy chọn 1 trong 3 lá bài bên dưới!";
  } else {
    roundTitleEl.textContent = `Vòng Chính Thức ${currentRound} / ${totalRounds}`;
    statusMsgEl.textContent = currentRound <= 3 ? "Cố thêm chút nữa xem sao..." : "Húu hú, sắp được rùi nà!";
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
      statusMsgEl.textContent = "Hụt mất rùi, cố lênn ><";
      if (missCount >= 3) triggerFlipAchievement(flipAchievements.sad);
      setTimeout(handleRoundTransition, 1500);
    } else {
      statusMsgEl.textContent = "Congrats!";
      if (currentRound > 3) {
        triggerFlipAchievement(flipAchievements.pro);
        // hết vòng 6 -> quay về màn đèn pin để tìm lá thư đặc biệt
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

// quay về màn đèn pin và kích hoạt kiểm tra hiện lá thư
function returnToFlashlightScreen() {
  const screenGameFlashlight = document.getElementById("screen-game-flashlight");
  if (screenGameFlashlight && typeof transitionToScreen === 'function') {
    isFlipGameDone = true; 
    transitionToScreen(screenFlipCard, screenGameFlashlight);
    if (typeof initFlashlightGame === 'function') initFlashlightGame();
    if (typeof checkAndSpawnLetter === 'function') checkAndSpawnLetter();
  }
}

function triggerFlipAchievement(achData) {
  if (localStorage.getItem(achData.key)) return;
  localStorage.setItem(achData.key, 'unlocked');
  if (typeof showSteamAchievement === 'function') {
    showSteamAchievement(achData.name, achData.desc, achData.img);
  }
}
