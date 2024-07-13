const text =
  "see who part help program when day high off program should have on such end after day never while mean play change follow be large keep ask work think since how also line and present old from even set help elephant bicycle window harmony potato galaxy umbrella spectrum volcano whisper mirage dragonfly bubble radiant cascade lemon symphony avalanche serenade enigma coral luminous elixir quasar velvet tornado twilight cascade wanderlust blossom echo nebula treasure citadel horizon whirlwind moondust kaleidoscope harmony melody zenith whisper secret stardust sapphire avalanche radiance serendipity phoenix tranqui";
const gameTextElem = document.getElementById("game-text");
text.split("").forEach((ch) => {
  const letterElem = document.createElement("letter");
  letterElem.appendChild(document.createTextNode(ch));
  gameTextElem.appendChild(letterElem);
});

const cursorElem = document.createElement("div");
cursorElem.id = "cursor";
gameTextElem.children[0].appendChild(cursorElem);

let idx = 0;
let wordCnt = 0;
let gameActive = false;
let gameFinished = false;

document.addEventListener("keydown", (e) => {
  console.log("this key was pressed:", e);

  if (idx == 0) {
    // start game
    gameActive = true;
  }

  if (e.key == "=") {
    // restart game
    restartGame();
    return;
  }

  if (idx >= gameTextElem.children.length || gameFinished) {
    return;
  }

  if (e.key == text[idx]) {
    console.log("✅: expected", text[idx], "got", e.key);
    gameTextElem.children[idx].classList.add("active");

    if (idx + 1 < text.length) {
      gameTextElem.children[idx + 1].appendChild(cursorElem);
    } else {
      gameTextElem.children[idx].removeChild(cursorElem);
    }

    if (e.key == " ") {
      wordCnt++;
    }

    idx++;

    if (idx >= gameTextElem.children.length) {
      wordCnt++;
      finishGame();
    }
  } else if (e.key == "Backspace" || e.keyCode == 8) {
    console.log("got backspace; preventing the default back action");
    e.preventDefault();

    if (idx > 0) {
      console.log("decrementing index from", idx, "to", idx - 1);
      idx--;

      if (idx < gameTextElem.children.length - 1) {
        // don't try to remove cursor if this is the last character
        gameTextElem.children[idx + 1].removeChild(cursorElem);
      }

      gameTextElem.children[idx].appendChild(cursorElem);
      gameTextElem.children[idx].classList.remove("active");
    }
  } else {
    console.log("❌: expected", text[idx], "got", e.key, e);
  }
});

let initialTime = 0.5 * 60 * 1000;
let time = initialTime;
const timerElem = document.getElementById("timer");
timerElem.innerHTML = toMinsSecs(time);

const timerInterval = setInterval(() => {
  if (time <= 0 || gameFinished || !gameActive) {
    return;
  }

  time -= 1000;
  console.log("time:", time);
  timerElem.innerHTML = toMinsSecs(time);

  if (time <= 0) {
    gameFinished = true;
    finishGame();
    return;
  }
}, 1000);

function toMinsSecs(timeInMillis) {
  const mins = Math.floor(timeInMillis / (60 * 1000));
  const secs = (timeInMillis - mins * 60 * 1000) / 1000;

  if (secs < 10) return mins + ":0" + secs;
  else return mins + ":" + secs;
}

function finishGame() {
  gameFinished = true;
  gameActive = false;
  document.getElementById("game-finished").classList.remove("hidden");
  clearInterval(timerInterval);

  document.getElementById("speed").innerHTML =
    "Speed: " + toWpm(wordCnt, initialTime - time) + " WPM";
  document.getElementById("time").innerHTML =
    "Time: " + toMinsSecs(initialTime - time);
  document.getElementById("word-count").innerHTML = "Words: " + wordCnt;
}

function restartGame() {
  gameActive = false;
  gameFinished = false;
  clearInterval(timerInterval); // not good
  idx = 0;
  for (child of gameTextElem.children) {
    child.classList.remove("active");
  }

  gameTextElem.children[0].appendChild(cursorElem);
}

function toWpm(wordCnt, timeInMillis) {
  const mins = timeInMillis / (60 * 1000);
  return wordCnt / mins;
}
