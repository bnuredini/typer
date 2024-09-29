import { randomText } from "./words.js";

const tmpWordCnt = document.getElementById("word-cnt");
const gameTextElem = document.getElementById("game-text");
const text = randomText(120);

text.split("").forEach((ch) => {
  const letterElem = document.createElement("letter");
  letterElem.appendChild(document.createTextNode(ch));
  gameTextElem.appendChild(letterElem);
});

const cursorElem = document.createElement("div");
cursorElem.id = "cursor";
gameTextElem.children[0].appendChild(cursorElem);

let idx = 0; // index of the next expected character
let wordCnt = 0;
let gameActive = false;
let gameFinished = false;

document.addEventListener("keydown", (e) => {
  if (e.key == "Backspace" || e.keyCode == 8) {
    e.preventDefault(); // Firefox has backspace mapped to the 'Back' function
  }

  if (idx == 0) {
    // start game
    gameActive = true;
  }

  if (idx >= gameTextElem.children.length || gameFinished) {
    return;
  }

  if (e.key == text[idx]) {
    gameTextElem.children[idx].classList.add("active");

    if (idx + 1 < text.length) {
      gameTextElem.children[idx + 1].appendChild(cursorElem);
    } else {
      gameTextElem.children[idx].removeChild(cursorElem);
    }

    if (idx + 1 >= gameTextElem.children.length) {
      wordCnt++;
      tmpWordCnt.innerText = wordCnt;
      idx++;
      finishGame();
      return;
    }

    if (text[idx + 1] == " " && isCurrWordValid(idx)) {
      wordCnt++;
      tmpWordCnt.innerText = wordCnt;
    }

    idx++;
  } else if (e.key == "Backspace" || e.keyCode == 8) {
    if (idx > 0) {
      idx--;

      // remove cursor if this isn't the last character
      if (idx < gameTextElem.children.length - 1) {
        gameTextElem.children[idx + 1].removeChild(cursorElem);
      }

      if (text[idx + 1] == " " && isCurrWordValid(idx)) {
        wordCnt--;
        console.log(`id: ${idx} text[idx+1]: ${text[idx + 1]}`);
        tmpWordCnt.innerText = wordCnt;
      }

      gameTextElem.children[idx].appendChild(cursorElem);
      gameTextElem.children[idx].classList.remove("active");
      gameTextElem.children[idx].classList.remove("wrong");
    }
  } else {
    gameTextElem.children[idx].classList.add("wrong");
    gameTextElem.children[idx + 1].appendChild(cursorElem);
    idx++;
  }
});

const initialTime = 0.5 * 60 * 1000;
let time = initialTime;
const timerElem = document.getElementById("timer");
timerElem.innerHTML = toMinsSecs(time);

const timerInterval = setInterval(() => {
  if (time <= 0 || gameFinished || !gameActive) {
    return;
  }

  time -= 1000;
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

function toWpm(wordCnt, timeInMillis) {
  const mins = timeInMillis / (60 * 1000);
  return wordCnt / mins;
}

/**
 * Given the last letter index, `lastIdx`, this returns a boolean indicating
 * whether the inputs of the word associated with this letter index are all
 * valid up until this letter.
 *
 * @param {number} lastIdx
 * @param {boolean}
 */
function isCurrWordValid(lastIdx) {
  if (lastIdx < 0 || lastIdx >= gameTextElem.children.length) {
    return false;
  }

  if (gameTextElem.children[lastIdx].innerText == "") {
    return false;
  }

  for (let scanIdx = lastIdx; scanIdx >= 0; scanIdx--) {
    let chElem = gameTextElem.children[scanIdx];

    if (chElem.innerText == " ") {
      return true;
    }

    if (chElem.classList.contains("wrong")) {
      return false;
    }
  }

  return true;
}
