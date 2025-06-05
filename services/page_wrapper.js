class PageWrapper {
  static titleLetterSize = 22; // Size of a letter in pixels for the title
  static paragraphLetterSize = 11; // Size of a letter in pixels for the paragraph
  static paragraphSeparatorClass = "flex-break"; // Class used to separate paragraphs
  static elementSelector = "#guessList > div"; // Selector for guess elements
  static foundWordsClass = "rect-max-score"; // Class for found words
  static ignoreRegex = /[.,()«»:\-'"“”‘’;]/g; // Regex to ignore special chars

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
      if (this.isDashWord(index, title)) {
        // Handle dash words separately
        this.processDashWordInTitle(
          index,
          title,
          expectedTitleWords,
          expectedTitleSizes
        );
      } else if (el.classList.contains(this.foundWordsClass)) {
        this.processFoundWordInTitle(
          el,
          expectedTitleWords,
          expectedTitleSizes
        );
      } else {
        this.processNonFoundWordInTitle(el, expectedTitleSizes);
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
    expectedTitleSizes.push(this.getNonFoundWordSize(el));
  }

  static isDashWord(index, title) {
    return (
      title[index].innerText.trim() === "-" ||
      (index > 0 && title[index - 1].innerText.trim() === "-") ||
      (index < title.length - 1 && title[index + 1].innerText.trim() === "-")
    );
  }

  static processDashWordInTitle(
    index,
    title,
    expectedTitleWords,
    expectedTitleSizes
  ) {
    if (title[index].innerText.trim() !== "-") {
      return; // Wait for the dash to handle the combination
    }

    let prevEl = title[index - 1];
    let nextEl = title[index + 1];

    if (
      prevEl.classList.contains(this.foundWordsClass) &&
      nextEl.classList.contains(this.foundWordsClass)
    ) {
      let prevText = prevEl.innerText.trim();
      let nextText = nextEl.innerText.trim();
      let combinedWord = `${prevText}-${nextText}`;

      // Remove the previous elements word and add the combined word
      expectedTitleWords.push(combinedWord);

      // Remove the previous element's size and add the combined word size
      expectedTitleSizes.push(combinedWord.length);
    } else {
      let prevElSize = this.getNonFoundWordSize(prevEl);
      let nextElSize = this.getNonFoundWordSize(nextEl);
      expectedTitleSizes.push(prevElSize + 1 + nextElSize);
    }
  }

  static getNonFoundWordSize(el) {
    // Calculate the size of a non-found word based on its width
    return el.offsetWidth / this.titleLetterSize;
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
