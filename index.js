let difficulty = 3;
let countdown;
let timeLeft = 60;
let isLocked = false;

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
}

loadPokemon();

function setup() {
  let firstCard = undefined;
  let secondCard = undefined;

  $(".card").on("click", function () {
    // prevent user from clicking same card twice
    if ($(this).hasClass("flip") && !secondCard) return;

    // prevent user from clicking card while flipping
    if (isLocked) return;

    $(this).toggleClass("flip");
    if (!firstCard) firstCard = $(this).find(".front_face")[0];
    else {
      secondCard = $(this).find(".front_face")[0];
      isLocked = true;
      console.log(firstCard, secondCard);
      if (firstCard.src == secondCard.src) {
        console.log("match");
        $(`#${firstCard.id}`).parent().off("click");
        $(`#${secondCard.id}`).parent().off("click");

        $(`#${firstCard.id}`).parent().addClass("matched");
        $(`#${secondCard.id}`).parent().addClass("matched");

        firstCard = undefined;
        secondCard = undefined;
        isLocked = false;

        if (document.querySelectorAll(".matched").length == difficulty * 2) {
          showMessage("Winner!");

          clearInterval(countdown);
          console.log(`${timeLeft} seconds remaining`);
        }
      } else {
        console.log("no match");
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

// Fisher-Yates algorithm for shuffling
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
      document.getElementById("timer").textContent =
        `${timeLeft} seconds remaining`;

      timeLeft--;
    }
  }, 1000);
}

function showMessage(message) {
  const el = document.getElementById("message");
  el.textContent = message;
  el.classList.remove("hidden");
  el.classList.add("block");
}
