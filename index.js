let difficulty = 0;
let countdown;
let timeLeft = 0;
let timeSetting = 0;
let isLocked = false;
let clicks = 0;
let pairsLeft = difficulty;
let pairsMatched = 0;

const start = document.getElementById("startBtn");
const easyBtn = document.getElementById("easyDifficulty");
const medBtn = document.getElementById("medDifficulty");
const hardBtn = document.getElementById("hardDifficulty");
const grid = document.getElementById("game_grid");
const stats = document.getElementById("game-stats");
const powerBtn = document.getElementById("powerUpBtn");
const msg = document.getElementById("message");

async function loadPokemon() {
  let response = await fetch(`https://pokeapi.co/api/v2/pokemon?&limit=1025`);
  let jsonObj = await response.json();
  //   console.log(jsonObj);

  const pokemons = [];
  for (let i = 0; i < difficulty; i++) {
    let randomPokemon =
      jsonObj.results[Math.floor(Math.random() * jsonObj.results.length)];
    pokemons.push(randomPokemon);
  }

  // Duplicate randomPokemon to be pairs
  const pairedPokemons = [...pokemons, ...pokemons];
  //   console.log(pairedPokemons);

  shuffle(pairedPokemons);

  let counter = 0;
  for (let pokemon of pairedPokemons) {
    let response2 = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`,
    );
    let jsonObj2 = await response2.json();
    // console.log(jsonObj2);
    const img = jsonObj2.sprites.other["official-artwork"].front_default;

    const list = document.getElementById("game_grid");
    counter++;
    list.innerHTML += `
        <div class="card">
            <img src="${img}" id="${pokemon.name}-${counter}" class="front_face"  alt="">
            <img class="back_face" src="back.webp" alt="">
        </div>      
    `;
  }

  setup();
  timer();
  showPowerUp();
}

function setup() {
  let firstCard = undefined;
  let secondCard = undefined;

  $(".card").on("click", function () {
    // prevent user from clicking same card twice
    if ($(this).hasClass("flip") && !secondCard) return;

    // prevent user from clicking card while flipping
    if (isLocked) return;

    $(this).toggleClass("flip");

    clicks++;

    updateStatus();

    if (!firstCard) firstCard = $(this).find(".front_face")[0];
    else {
      secondCard = $(this).find(".front_face")[0];
      isLocked = true;
      //   console.log(firstCard, secondCard);
      if (firstCard.src == secondCard.src) {
        // console.log("match");
        $(`#${firstCard.id}`).parent().off("click");
        $(`#${secondCard.id}`).parent().off("click");

        $(`#${firstCard.id}`).parent().addClass("matched");
        $(`#${secondCard.id}`).parent().addClass("matched");

        firstCard = undefined;
        secondCard = undefined;
        isLocked = false;

        pairsLeft--;
        pairsMatched++;
        updateStatus();

        if (document.querySelectorAll(".matched").length == difficulty * 2) {
          showMessage("You Win!");
          clearInterval(countdown);
        }
      } else {
        // console.log("no match");
        setTimeout(() => {
          $(`#${firstCard.id}`).parent().toggleClass("flip");
          $(`#${secondCard.id}`).parent().toggleClass("flip");
          firstCard = undefined;
          secondCard = undefined;
          isLocked = false;
        }, 1000);
      }
    }
  });
}

// Fisher-Yates algorithm for shuffling https://www.geeksforgeeks.org/dsa/shuffle-a-given-array-using-fisher-yates-shuffle-algorithm/
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function timer() {
  countdown = setInterval(() => {
    if (timeLeft <= 0) {
      isLocked = true;
      clearInterval(countdown);
      showMessage("You Lose, Try again!");
    } else {
      timeLeft--;
      document.getElementById("timer").textContent = `${timeLeft}s`;
      document.querySelector(".timerTotal").textContent =
        `Total time: ${timeSetting}s`;
    }
  }, 1000);
}

function showMessage(message) {
  msg.textContent = message;
  msg.classList.remove("hidden");
}

function updateStatus() {
  document.getElementById("clicks").textContent = clicks;
  document.getElementById("pairs-left").textContent = pairsLeft;
  document.getElementById("pairs-matched").textContent = pairsMatched;
  document.getElementById("total-pairs").textContent = difficulty;
}

function startGame() {
  setDifficulty();

  const difficultyEl = document.getElementById("btn-container");
  const reset = document.getElementById("resetBtn");

  start.addEventListener("click", (e) => {
    difficultyEl.classList.remove("block");
    difficultyEl.classList.add("hidden");

    stats.classList.add("block");
    stats.classList.remove("hidden");

    start.classList.add("hidden");

    showPowerUp();
    loadPokemon();
  });

  powerBtn.addEventListener("click", powerUp);
  reset.addEventListener("click", resetGame);
}

function resetGame() {
  clearInterval(countdown);
  clicks = 0;
  pairsMatched = 0;
  pairsLeft = difficulty;
  isLocked = false;
  timeLeft = timeSetting;
  document.getElementById("game_grid").innerHTML = "";
  powerBtn.classList.add("hidden");
  msg.classList.add("hidden");
  loadPokemon();
  updateStatus();
}

function setDifficulty() {
  const buttons = document.querySelectorAll(".btn");

  buttons.forEach((button) => {
    button.addEventListener("click", function () {
      buttons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      start.classList.remove("hidden");
    });
  });

  easyBtn.addEventListener("click", () => {
    grid.classList.remove("easy", "medium", "hard");
    grid.classList.add("easy");
    difficulty = 3;
    timeLeft = 60;
    timeSetting = 60;
    pairsLeft = difficulty;
  });

  medBtn.addEventListener("click", (e) => {
    grid.classList.remove("easy", "medium", "hard");
    grid.classList.add("medium");
    difficulty = 6;
    timeLeft = 120;
    timeSetting = 120;
    pairsLeft = difficulty;
  });

  hardBtn.addEventListener("click", (e) => {
    grid.classList.remove("easy", "medium", "hard");
    grid.classList.add("hard");
    difficulty = 9;
    timeLeft = 180;
    timeSetting = 180;
    pairsLeft = difficulty;
  });
}

function changeDifficulty() {
  const changeBtn = document.getElementById("changeBtn");
  changeBtn.addEventListener("click", () => {
    document.getElementById("btn-container").classList.remove("hidden");
    document.getElementById("game-stats").classList.add("hidden");
    clearInterval(countdown);
    msg.classList.add("hidden");
    document.getElementById("game_grid").innerHTML = "";
    document
      .querySelectorAll(".btn")
      .forEach((btn) => btn.classList.remove("active"));
    powerBtn.classList.add("hidden");
  });
}

function changeTheme() {
  const lightTheme = document.getElementById("lightMode");
  const darkTheme = document.getElementById("darkMode");

  lightTheme.addEventListener("click", () => {
    document.body.classList.remove("bg-black");
    grid.classList.remove("border-2", "border-white");
    grid.classList.add("border-2", "border-red-500");
    stats.classList.remove("text-white");
    document
      .querySelectorAll(".btn")
      .forEach((btn) => btn.classList.remove("text-white"));
  });

  darkTheme.addEventListener("click", (e) => {
    document.body.classList.add("bg-black");
    grid.classList.remove("border-2", "border-red-500");
    grid.classList.add("border-2", "border-white");
    stats.classList.add("text-white");
    document
      .querySelectorAll(".btn")
      .forEach((btn) => btn.classList.add("text-white"));
  });
}

function powerUp() {
  const cards = document.querySelectorAll(".card");
  isLocked = true;
  cards.forEach((card) => {
    if (!card.classList.contains("matched")) {
      card.classList.add("flip");
    }
  });
  setTimeout(() => {
    cards.forEach((card) => {
      if (!card.classList.contains("matched")) {
        card.classList.remove("flip");
      }
    });
    isLocked = false;
    powerBtn.classList.add("hidden");
  }, 5000);
}

function showPowerUp() {
  setTimeout(() => {
    powerBtn.classList.remove("hidden");
  }, 5000);
}

$(document).ready(function () {
  changeDifficulty();
  changeTheme();
  startGame();
});
