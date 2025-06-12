class WikipediaService {
  static baseUrl = "https://fr.wikipedia.org/w/api.php";
  static continueToken = null;
  static lastSearchQuery = "";
  static allPageTitles = [];

  static writePagesTitles() {
    WikipediaPopup.open();

    let newSearchQuery = PageWrapper.getSearchQuery();
    console.log("New search query:", newSearchQuery);

    // Reset the continue token and titles if the query has changed
    if (newSearchQuery !== this.lastSearchQuery) {
      this.continueToken = null;
      this.allPageTitles = [];
      this.lastSearchQuery = newSearchQuery;
    }

    if (this.allPageTitles.length === 0) {
      this.loadAndWritePagesTitles();
    } else {
      WikipediaPopup.setContent(this.formatPagesTitles(this.allPageTitles));
    }
    return this.allPageTitles;
  }

  static loadAndWritePagesTitles() {
    WikipediaPopup.setContent("Loading pages titles...");

    this.searchMinSetPagesTitles().then((pagesTitles) => {
      // If the popup is not open, show it
      if (!WikipediaPopup.isOpen) {
        WikipediaPopup.open();
      }

      // If no results, display a message
      if (pagesTitles.length === 0) {
        WikipediaPopup.setContent("No pages titles found.");
        return;
      }

      // If results exist, append them to the existing titles
      this.allPageTitles = this.allPageTitles.concat(pagesTitles);

      // Remove duplicates
      this.allPageTitles = [...new Set(this.allPageTitles)];

      // Populate the popup
      WikipediaPopup.setContent(this.formatPagesTitles(this.allPageTitles));
    });
  }

  static formatPagesTitles(pagesTitles) {
    return pagesTitles
      .map((pageTitle) => {
        let pageTitleLink = document.createElement("a");
        pageTitleLink.href = `https://fr.wikipedia.org/wiki/${pageTitle}`;
        pageTitleLink.target = "_blank";
        pageTitleLink.innerText = pageTitle;
        pageTitleLink.style.color = "#FFFFFF";
        pageTitleLink.style.textDecoration = "none";
        return pageTitleLink.outerHTML;
      })
      .join("<br>");
  }

  static async searchMinSetPagesTitles() {
    let foundPageTitles = [];

    try {
      do {
        // Perform the search query
        let pageTitles = await this.searchPagesTitles(this.lastSearchQuery);

        // Filter titles
        let titleFilter = PageWrapper.getTitleFilter();
        pageTitles = this.filterPagesTitles(pageTitles, titleFilter);

        foundPageTitles = foundPageTitles.concat(pageTitles);
      } while (this.continueToken && foundPageTitles.length < 10);
      // Continue until there are no more results or we have enough titles

      // If no more results can be found, disable the load more button
      if (!this.continueToken) {
        WikipediaPopup.disableLoadMoreBtn();
      } else {
        WikipediaPopup.enableLoadMoreBtn();
      }
      return foundPageTitles;
    } catch (error) {
      console.error("Error fetching Wikipedia results:", error);
      return [];
    }
  }

  static filterPagesTitles(pageTitles, titleFilter) {
    if (!titleFilter) {
      return pageTitles; // No filter applied
    }

    return pageTitles.filter((title) => {
      // Preprocess the title: remove special characters and split into words
      let titleWords = title
        .replace(/[()]/g, "") // Remove parentheses
        .replace(PageWrapper.ignoreRegex, " ") // Replace other ignored chars with spaces
        .split(" ") // Split into words
        .filter((word) => word.length > 0); // Remove empty words

      // Check if the title has the expected number of words
      if (titleWords.length !== titleFilter.expectedTitleSize) {
        return false;
      }
      // Check if each word of the title matches the expected size
      return titleWords.every((word, index) => {
        let wordLength = word.length;
        let expectedLength = Math.round(titleFilter.expectedTitleSizes[index]);
        return wordLength === expectedLength;
      });
    });
  }

  static async searchPagesTitles(query) {
    let url = new URL(this.baseUrl);

    // Set the search parameters
    url.searchParams.set("action", "query");
    url.searchParams.set("list", "search");
    url.searchParams.set("srsearch", query);
    url.searchParams.set("srlimit", "50");
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*"); // To avoid CORS issues

    // Add the continue token to the request if it exists
    if (this.continueToken) {
      url.searchParams.set("continue", this.continueToken.continue);
      url.searchParams.set("sroffset", this.continueToken.sroffset);
    }

    let response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Parse the JSON response
    let data = await response.json();

    // Update the continue token for the next request
    this.continueToken = data.continue || null;

    // Return the titles of the matching pages
    return data.query.search.map((page) => page.title);
  }
}
