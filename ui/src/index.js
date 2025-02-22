import { randomText } from "./words.js";
import { toMinsAndSecs, toWpm, isCurrWordValid } from "./util.js"; 

let gameActive = false; 
let gameFinished = false;

let text;
let wordCnt = 0;
let currTimerInterval;
let expectedLetterIdx = 0;

let wordCntElem = document.getElementById("word-cnt");
let gameTextElem = document.getElementById("game-text");
let cursorElem = document.createElement("div");

let darkMode = false;

init();

document.querySelectorAll(".time-setter").forEach((elem) => {
  elem.addEventListener("click", (e) => {
    document.getElementById("active-time-setter").removeAttribute("id");
    e.target.setAttribute("id", "active-time-setter");

    init();
  });
});


document.getElementById("reset-btn").addEventListener("click", (e) => {
  init();
});

document.addEventListener("keydown", (e) => {
  if (e.key == "Tab") {
    e.preventDefault();
    init();
  }
});

document.getElementById("change-theme-btn").addEventListener("click", (e) => {
  const root = document.querySelector(":root");

  // TODO: set these colors in a CSS file. It makes more sense for style-releated values to be
  // defined there. 
  if (!darkMode) {
    root.style.setProperty("--bg-color", "black");
    root.style.setProperty("--text-color", "white");
    root.style.setProperty("--active-text-color", "white");
    root.style.setProperty("--cursor-color", "white");
    root.style.setProperty("--sub-color", "#373737");
  } else {
    root.style.setProperty("--bg-color", "fff");
    root.style.setProperty("--text-color", "black");
    root.style.setProperty("--active-text-color", "black");
    root.style.setProperty("--cursor-color", "black");
    root.style.setProperty("--sub-color", "#f0f0f0");
 }

  darkMode = !darkMode;
});

function init() {
  cleanUp();

  // construct letter elements
  gameTextElem.innerText = "";
  text = randomText(200);
  text.split("").forEach((ch) => {
    const letterElem = document.createElement("letter");
    letterElem.appendChild(document.createTextNode(ch));

    gameTextElem.appendChild(letterElem);
  });

  // add cursor
  cursorElem = document.createElement("div");
  cursorElem.id = "cursor";
  gameTextElem.children[0].appendChild(cursorElem);

  // handle input
  document.addEventListener("keydown", handleInput);

  // start timer
  let initialTime = +document
    .getElementById("active-time-setter")
    .getAttribute("value");
  currTimerInterval = startTimer(
    initialTime,
    () => gameFinished || !gameActive,
    finishGame,
  );
}

function cleanUp() {
  expectedLetterIdx = 0;
  wordCnt = 0;
  wordCntElem.innerText = wordCnt;

  gameActive = false;
  gameFinished = false;

  document.getElementById("cursor")?.remove();
  document.removeEventListener("keydown", handleInput);
  clearInterval(currTimerInterval);

  document.getElementById("speed").innerHTML = "";
  document.getElementById("time").innerHTML = "";
  document.getElementById("word-count").innerHTML = "";
}

function handleInput(e) {
  console.log(
    `expectedLetterIdx=${expectedLetterIdx}, expected=${text[expectedLetterIdx]}, actual=${e.key}`,
  );

  if (
    e.key == "Backspace" ||
    e.keyCode == 8 || // Firefox has backspace mapped to the 'Back' function
    e.key == " " ||
    e.keyCode == 32
  ) {
    e.preventDefault();
  }

  if (expectedLetterIdx == 0) {
    // start game
    gameActive = true;
  }

  if (expectedLetterIdx >= text.length || gameFinished) {
    return;
  }

  if (e.key == text[expectedLetterIdx]) {
    gameTextElem.children[expectedLetterIdx].classList.add("active");

    if (expectedLetterIdx < text.length - 1) {
      gameTextElem.children[expectedLetterIdx + 1].appendChild(cursorElem);
    } else {
      gameTextElem.children[expectedLetterIdx].removeChild(cursorElem);
      wordCnt++;
      wordCntElem.innerText = wordCnt;

      expectedLetterIdx++;
      gameFinished = true;

      return;
    }

    if (
      text[expectedLetterIdx + 1] == " " &&
      isCurrWordValid(expectedLetterIdx, gameTextElem)
    ) {
      wordCnt++;
      wordCntElem.innerText = wordCnt;
    }

    expectedLetterIdx++;
  } else if (e.key == "Backspace" || e.keyCode == 8) {
    if (expectedLetterIdx == 0) {
      return;
    }

    // remove cursor if this isn't the last character
    if (expectedLetterIdx < text.length - 1) {
      gameTextElem.children[expectedLetterIdx].removeChild(cursorElem);
    }

    if (
      text[expectedLetterIdx] == " " &&
      isCurrWordValid(expectedLetterIdx - 1, gameTextElem)
    ) {
      wordCnt--;
      wordCntElem.innerText = wordCnt;
    }

    gameTextElem.children[expectedLetterIdx - 1].appendChild(cursorElem);
    gameTextElem.children[expectedLetterIdx - 1].classList.remove("active");

    if (
      text[expectedLetterIdx - 1] == " " ||
      text[expectedLetterIdx - 1] == 32
    ) {
      gameTextElem.children[expectedLetterIdx - 1].classList.remove(
        "wrong-whitespace",
      );
    } else {
      gameTextElem.children[expectedLetterIdx - 1].classList.remove("wrong");
    }

    expectedLetterIdx--;
  } else {
    if (text[expectedLetterIdx] == " " || text[expectedLetterIdx] == 32) {
      gameTextElem.children[expectedLetterIdx].classList.add(
        "wrong-whitespace",
      );
    } else {
      gameTextElem.children[expectedLetterIdx].classList.add("wrong");
    }

    gameTextElem.children[expectedLetterIdx + 1].appendChild(cursorElem);
    expectedLetterIdx++;
  }
}

function startTimer(initialTimeMs, shouldStopFn, onFinishFn) {
  console.log(`Starting timer from ${initialTimeMs}`);

  const timerElem = document.getElementById("timer");
  timerElem.innerHTML = toMinsAndSecs(initialTimeMs);
  let timeMs = initialTimeMs;

  const timerInterval = setInterval(
    () => {
      if (timeMs <= 0 || shouldStopFn()) {
        return; // TODO: should we stop the timer here?
      }

      timeMs -= 1000;
      timerElem.innerHTML = toMinsAndSecs(timeMs);

      if (timeMs <= 0) {
        const timeElapsed = initialTimeMs - timeMs;
        onFinishFn(timeElapsed);

        return;
      }
    },
    1000, // every one second
  );

  return timerInterval;
}

function finishGame(timeElapsed) {
  gameFinished = true;
  gameActive = false;
  document.getElementById("game-finished").classList.remove("hidden");

  clearInterval(currTimerInterval);
  document.removeEventListener("keydown", handleInput);

  document.getElementById("speed").innerHTML =
    `Speed: ${toWpm(wordCnt, timeElapsed)} WPM`;
  document.getElementById("time").innerHTML =
    `Time: ${toMinsAndSecs(timeElapsed)}`;
  document.getElementById("word-count").innerHTML = `Words: ${wordCnt}`;
}

