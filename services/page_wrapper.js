class PageWrapper {
  static titleLetterSize = 22; // Size of a letter in pixels for the title
  static paragraphLetterSize = 11; // Size of a letter in pixels for the paragraph
  static paragraphSeparatorClass = "flex-break"; // Class used to separate paragraphs
  static elementSelector = "#guessList > div"; // Selector for guess elements
  static foundWordsClass = "rect-max-score"; // Class for found words
  static ignoreRegex = /[.,()«»:\-'"“”‘’;\/]/g; // Regex to ignore special chars

  static getSearchQuery() {
    return (
      this.getSearchQueryForTitleWords() + this.getSearchQueryForContentWords()
    );
  }

  static getSearchQueryForContentWords() {
    let foundSentences = this.getFoundSentences();
    return foundSentences
      .map((sentence) => {
        let sentenceStrings = sentence
          .map((el) => el.innerText.trim())
          .filter((txt) => txt.length > 0);
        // Only include non-empty sentences
        return sentenceStrings.length > 0
          ? `"${sentenceStrings.join(" ")}"`
          : null;
      })
      .filter(Boolean) // Remove null values
      .join(",");
  }

  static getSearchQueryForTitleWords() {
    let foundTitleWords = this.getTitleFilter().expectedTitleWords;
    if (!foundTitleWords || foundTitleWords.length === 0) {
      return ""; // No title words to search for
    }

    return foundTitleWords.map((word) => `intitle:"${word}"`).join(",") + ",";
  }

  static getTitleFilter() {
    let paragraphs = this.getParagraphs();
    let title = paragraphs[0];

    let expectedTitleWords = [];
    let expectedTitleSizes = [];

    title.forEach((el, index) => {
      // Ignore dashes and parentheses
      if (!this.isDashOrParenthesis(index, title)) {
        if (el.classList.contains(this.foundWordsClass)) {
          this.processFoundWordInTitle(
            el,
            expectedTitleWords,
            expectedTitleSizes
          );
        } else {
          this.processNonFoundWordInTitle(el, expectedTitleSizes);
        }
      }
    });

    let expectedTitleSize = expectedTitleSizes.length;

    return {
      expectedTitleSize,
      expectedTitleSizes,
      expectedTitleWords,
    };
  }

  static processFoundWordInTitle(el, expectedTitleWords, expectedTitleSizes) {
    let elText = el.innerText.trim();
    expectedTitleWords.push(elText);
    expectedTitleSizes.push(elText.length);
  }

  static processNonFoundWordInTitle(el, expectedTitleSizes) {
    expectedTitleSizes.push(el.offsetWidth / this.titleLetterSize);
  }

  static isDashOrParenthesis(index, title) {
    return (
      title[index].innerText.trim() === "-" ||
      title[index].innerText.trim() === "(" ||
      title[index].innerText.trim() === ")"
    );
  }

  static getFoundSentences() {
    let elements = this.getElements();
    let foundSentences = [];
    let currentSentence = [];

    elements.forEach((el) => {
      if (
        !el.classList.contains(this.foundWordsClass) ||
        el.innerText.trim().match(this.ignoreRegex)
      ) {
        // Push the current sentence if element is not a max score rectangle
        if (currentSentence.length) {
          foundSentences.push(currentSentence);
          currentSentence = [];
        }
      } else {
        // Add the element to the current sentence
        currentSentence.push(el);
      }
    });
    // Push the last sentence if it has elements
    if (currentSentence.length > 0) {
      foundSentences.push(currentSentence);
    }

    return foundSentences;
  }

  static getParagraphs() {
    let elements = this.getElements();
    let paragraphs = [];
    let currentParagraph = [];

    elements.forEach((el) => {
      let normalizedClassName = el.className.replace(/[\u2010-\u2015]/g, "-");
      if (normalizedClassName.includes(this.paragraphSeparatorClass)) {
        // Push the current paragraph if it has elements
        if (currentParagraph.length) {
          paragraphs.push(currentParagraph);
          currentParagraph = [];
        }
      } else {
        // Add the element to the current paragraph
        currentParagraph.push(el);
      }
    });
    // Push the last paragraph if it has elements
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph);
    }

    return paragraphs;
  }

  static getElements() {
    return Array.from(document.querySelectorAll(this.elementSelector));
  }
}
