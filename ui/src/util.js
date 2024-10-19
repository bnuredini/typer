/**
 * Given a certain amount of milliseconds, this convert those milliseconds to
 * the minutes:seconds format, where the seconds bit is repended with a zero
 * (i.e., a "0" character) if the number of seconds is single digit number.
 *
 * @param {numer} timeMs - a number in millis
 * @returns {string}
 */
export function toMinsAndSecs(timeMs) {
  const mins = Math.floor(timeMs / (60 * 1000));
  const secs = (timeMs - mins * 60 * 1000) / 1000;

  if (secs < 10) return mins + ":0" + secs;
  else return mins + ":" + secs;
}

/**
 * Given `wordCnt` words typed in `timeMs`, this outputs the average number of
 * words per written minute.
 *
 * @param {number} wordCnt
 * @param {number} timeMs
 * @return {number}
 */
export function toWpm(wordCnt, timeMs) {
  const mins = timeMs / (60 * 1000);
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
export function isCurrWordValid(lastIdx, gameTextElem) {
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
