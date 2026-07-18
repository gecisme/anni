// CONFIG ẢNH CARD
const imgCardBack = "card-back.png"; 
const imgCardTypes = {
  theMoon: "the-moon.png",
  theSun: "the-sun.png"
};

// ĐỒNG BỘ BADGE STEAM
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

// STATE LẬT BÀI
let currentRound = 0; 
const totalRounds = 6; 
let missCount = 0; 
let canClickCard = false; 

// DOM ELEMENTS
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

// XỬ LÝ CLICK CARD
cards.forEach(card => {
  card.addEventListener("click", () => {
    if (!canClickCard || card.classList.contains("flipped")) return;

    canClickCard = false; 
    cardsContainerEl.classList.add("disabled-clicks"); 

    let resultImgSrc = "";
    // V0: Random | V1-3: Moon (Hụt) | V4-6: Sun (Trúng)
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
      statusMsgEl.textContent = "Congrats! Cậu giỏi quá!";
      if (currentRound > 3) {
        triggerFlipAchievement(flipAchievements.pro);
        setTimeout(() => {
          statusMsgEl.textContent = "Nhấn vào lá bài THE SUN vừa lật để xem thư nha ❤️";
          canClickCard = true;
          const flippedCard = document.querySelector(".card.flipped");
          if (flippedCard) {
            flippedCard.style.pointerEvents = "auto";
            flippedCard.addEventListener("click", goToLetterScreen, { once: true });
          }
        }, 1500);
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

function goToLetterScreen(e) {
  e.stopPropagation(); 
  const screenLetter = document.getElementById("screen-letter"); 
  if (screenLetter) transitionToScreen(screenFlipCard, screenLetter);
}

function triggerFlipAchievement(achData) {
  if (localStorage.getItem(achData.key)) return;
  localStorage.setItem(achData.key, 'unlocked');
  if (typeof showSteamAchievement === 'function') {
    showSteamAchievement(achData.name, achData.desc, achData.img);
  }
}
