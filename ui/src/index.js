import { randomText } from "./words.js";

const gameTextElem = document.getElementById("game-text");
const text = randomText(200);

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
const wordCntElem = document.getElementById("word-cnt");

document.addEventListener("keydown", (e) => {
  if (
    e.key == "Backspace" ||
    e.keyCode == 8 || // Firefox has backspace mapped to the 'Back' function
    e.key == " " ||
    e.keyCode == 32
  ) {
    e.preventDefault();
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

    if (idx < text.length - 1) {
      gameTextElem.children[idx + 1].appendChild(cursorElem);
    } else {
      gameTextElem.children[idx].removeChild(cursorElem);
    }

    if (idx >= gameTextElem.children.length - 1) {
      wordCnt++;
      wordCntElem.innerText = wordCnt;
      idx++;
      finishGame();
      return;
    }

    if (text[idx + 1] == " " && isCurrWordValid(idx)) {
      wordCnt++;
      wordCntElem.innerText = wordCnt;
    }

    idx++;
  } else if (e.key == "Backspace" || e.keyCode == 8) {
    if (idx == 0) {
      return;
    }

    idx--;

    // remove cursor if this isn't the last character
    if (idx < gameTextElem.children.length - 1) {
      gameTextElem.children[idx + 1].removeChild(cursorElem);
    }

    if (text[idx + 1] == " " && isCurrWordValid(idx)) {
      wordCnt--;
      console.log(`id: ${idx} text[idx+1]: ${text[idx + 1]}`);
      wordCntElem.innerText = wordCnt;
    }

    gameTextElem.children[idx].appendChild(cursorElem);
    gameTextElem.children[idx].classList.remove("active");

    if (text[idx] == " " || text[idx] == 32) {
      gameTextElem.children[idx].classList.remove("wrong-whitespace");
    } else {
      gameTextElem.children[idx].classList.remove("wrong");
    }
  } else {
      // gameTextElem.children[idx].classList.add("wrong-whitespace");
    console.log(`e.key: ${e.key}`);
    console.log(`e.keyCode: ${e.keyCode}`);
    if (text[idx] == " " || text[idx] == 32) {
      gameTextElem.children[idx].classList.add("wrong-whitespace");
    } else {
      gameTextElem.children[idx].classList.add("wrong");
    }

    gameTextElem.children[idx + 1].appendChild(cursorElem);
    idx++;
  }
});

let initialTime = +document
  .getElementById("active-time-setter")
  .getAttribute("value");
let time = initialTime;
let currTimerInterval = setTimer();

document.querySelectorAll(".time-setter").forEach((elem) => {
  elem.addEventListener("click", (e) => {
    document.getElementById("active-time-setter").removeAttribute("id");
    e.target.setAttribute("id", "active-time-setter");

    const timeSetterValue = +e.target.getAttribute("value");
    initialTime = timeSetterValue;
    time = initialTime;
    clearInterval(currTimerInterval);
    currTimerInterval = setTimer();

    // TODO: you need to restart the game here. Adding a restart option will require modifying the
    // current code structure by quite a bit. An `init` needs to be introduced that resets the
    // game text, cursor position, and other statistics/values about the current game session.
    // This is a good opportunity to introduce purer functions and to categorize some of the
    // responsbilities more sensibly -- and there's a lot of state that's being shared between
    // functions, so that needs to be addressed to.
  });
});

function setTimer() {
  const timerElem = document.getElementById("timer");
  timerElem.innerHTML = toMinsSecs(initialTime);

  const timerInterval = setInterval(
    () => {
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
    },
    1000, // every one second
  );

  return timerInterval;
}

/**
 * Given a certain amount of milliseconds, this convert those milliseconds to
 * the minutes:seconds format, where the seconds bit is repended with a zero
 * (i.e., a "0" character) if the number of seconds is single digit number.
 *
 * @param {numer} timeInMillis a number in millis
 * @returns {string}
 */
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
  clearInterval(currTimerInterval);

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
 * @returns {boolean}
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
