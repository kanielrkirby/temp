// prettier-ignore
const defaultCharacters = ["=", "#", "$", "!", "\\", "/", "&", "%", "@", "*", "^", "_", "+", ":", ";", "|", "~", "`", "'", '"', ".", ",", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

/**
 * Takes a `Text` node and returns it scrambled after a given `index`, using provided `characters`.
 * @param {Text} textNode - The Text node to scramble.
 * @param {number} index - The index after which the text will be scrambled.
 * @param {string[]} characters - The characters to use for scrambling.
 * @returns {Text} The scrambled Text node.
 */
function scrambleTextNodeAt(textNode, index, characters) {
  const realText = textNode.__trueTextContent;
  if (!realText) return textNode;

  const readableText = realText.slice(0, index);
  const wordsToScramble = realText.slice(index).split(" ");
  const scrambledWords = wordsToScramble.map(word =>
    word
      .split("")
      .map(char =>
        char === "\n"
          ? char
          : characters[Math.floor(Math.random() * characters.length)]
      )
      .join("")
  );

  textNode.textContent = readableText + scrambledWords.join(" ");

  return textNode;
}

/**
 * Timer class that provides lazily-evaluated properties to track the progress of a timer reaching `duration`.
 * It caches the progress and completion status once the timer duration is exceeded.
 */
class Timer {
  /**
   * @param {number} duration - The total duration of the timer in milliseconds.
   */
  constructor(duration) {
    this.start = Date.now();
    this.duration = duration;
    this.cachedProgress = undefined;
    this.cachedDone = undefined;
  }

  /**
   * Cache the progress and done status as completed.
   */
  cache() {
    this.cachedDone = true;
    this.cachedProgress = 1;
  }

  /**
   * Get the progress of the timer.
   * @returns {number} The progress of the timer as a percentage (0 to 1).
   */
  get progress() {
    if (this.cachedProgress !== undefined) {
      return this.cachedProgress;
    }
    const currentProgress = (Date.now() - this.start) / this.duration;
    if (currentProgress >= 1) {
      this.cache();
      return 1;
    }
    return currentProgress;
  }

  /**
   * Check if the timer is done.
   * @returns {boolean} True if the timer is done, otherwise false.
   */
  get done() {
    if (this.cachedDone !== undefined) {
      return this.cachedDone;
    }
    if (this.progress >= 1) {
      this.cache();
      return true;
    }
    return false;
  }
}

/**
 * Start the scramble animation for all `query` elements and their children over the duration of `duration`, utilizing provided `characters`.
 * @param {string} query - The CSS selector to query elements.
 * @param {number} [duration=1000] - The duration of the scramble animation in milliseconds.
 * @param {string[]} [characters=defaultCharacters] - The characters to use for scrambling.
 */
function scramble(query, duration = 1000, characters = defaultCharacters) {
  const queriedElements = Array.from(document.querySelectorAll(query));
  const textNodes = queriedElements.map(e => recurseAndMark(e)).flat();
  const timer = new Timer(duration);

  let interval = setInterval(() => {
    // Cleanup
    if (timer.done) {
      clearInterval(interval);
      for (const node of textNodes) {
        if (node instanceof Text) {
          node.__trueTextContent = undefined;
        }
        if (node instanceof Element) {
          node.removeAttribute("data-true-content");
        }
      }
      return;
    }

    for (const textNode of textNodes) {
      const index = Math.round(textNode.length * timer.progress);
      scrambleTextNodeAt(textNode, index + 1, characters);
    }
  }, 1);
}

/**
 * Returns an array of marked elements, ready for processing.
 * @param {Element} element - The root element to start marking from.
 * @param {Text[]} [accumulator=[]] - The accumulator array for collected text nodes.
 * @returns {Text[]} The array of text nodes.
 */
function recurseAndMark(element, accumulator = []) {
  for (const elem of element.childNodes) {
    if (elem.childNodes.length < 1 && elem instanceof Text) {
      elem.__trueTextContent = elem.textContent ?? "";
      accumulator.push(elem);
    } else {
      recurseAndMark(elem, accumulator);
    }
  }
  return accumulator;
}

// Exporting the scramble function as the default export
export default scramble;
