class WikipediaPopup {
  static id = "proxiwiki-auto-search-popup";
  static containerSelector = "body";
  static contentId = this.id + "-content";
  static loadMoreBtnId = this.id + "-load-more-btn";
  static isOpen = false;

  static get() {
    // Check if the popup already exists
    let popup = document.getElementById(this.id);
    if (popup) return popup;

    // Create the popup
    this.build();

    return document.getElementById(this.id);
  }

  static setContent(content) {
    // Get the popup content element
    let popupContent = this.getContent();
    if (!popupContent) return;

    // Clear the existing content
    popupContent.innerHTML = "";
    // Set the new content
    popupContent.innerHTML = content;
  }

  static getContent() {
    // Get the popup content already exists
    let popupContent = document.getElementById(this.contentId);
    if (popupContent) return popupContent;

    // Create the popup
    this.build();

    return document.getElementById(this.contentId);
  }

  static setLoadMoreBtnCallback(callback) {
    // Get the load more button
    let loadMoreBtn = this.getLoadMoreBtn();
    if (!loadMoreBtn) return;

    // Set the click event listener for the load more button
    loadMoreBtn.onclick = callback;
  }

  static getLoadMoreBtn() {
    // Get the load more button already exists
    let loadMoreBtn = document.getElementById(this.loadMoreBtnId);
    if (loadMoreBtn) return loadMoreBtn;

    // Create the popup
    this.build();
    return document.getElementById(this.loadMoreBtnId);
  }

  static disableLoadMoreBtn() {
    // Get the load more button
    let loadMoreBtn = this.getLoadMoreBtn();
    if (!loadMoreBtn) return;

    // Disable the button
    loadMoreBtn.disabled = true;
    loadMoreBtn.innerText = "No more results";
  }

  static enableLoadMoreBtn() {
    // Get the load more button
    let loadMoreBtn = this.getLoadMoreBtn();
    if (!loadMoreBtn) return;

    // Enable the button
    loadMoreBtn.disabled = false;
    loadMoreBtn.innerText = "Load More Results";
  }

  static open() {
    // Get the popup element
    let popup = this.get();
    if (!popup) return;

    // Set the popup to be visible
    popup.style.display = "flex";
    this.isOpen = true;
  }

  static close() {
    // Get the popup element
    let popup = this.get();
    if (!popup) return;

    // Hide the popup
    popup.style.display = "none";
    this.isOpen = false;

    // Clear the content
    this.setContent("");
  }

  static build() {
    // Create the popup element
    let popup = this.popupBase();
    popup.appendChild(this.popupTitle());
    popup.appendChild(this.popupContent());
    popup.appendChild(this.popupCloseBtn());
    popup.appendChild(this.popupLoadMoreBtn());

    // Append the button to the container when it exists
    this.waitBody(() => {
      document.body.appendChild(popup);
    });
  }

  static waitBody(callback) {
    // Check if the body exists
    if (document.body) callback();

    // If not, wait for it to be added to the DOM
    let observer = new MutationObserver((mutations, obs) => {
      if (document.body) {
        callback();
        obs.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  static popupBase() {
    let popup = document.createElement("div");
    popup.id = this.id;
    popup.style.display = "none";
    popup.style.flexDirection = "column";
    popup.style.alignItems = "center";
    popup.style.justifyContent = "center";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.width = "30rem";
    popup.style.maxHeight = "25rem";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.background = "rgba(28, 28, 28, 0.84)";
    popup.style.color = "#fff";
    popup.style.padding = "2rem";
    popup.style.borderRadius = "1rem";
    popup.style.zIndex = "9999";
    popup.style.boxShadow = "0 0 20px #0008";
    return popup;
  }

  static popupTitle() {
    let title = document.createElement("h2");
    title.innerText = "Search Results";
    title.style.margin = "0 0 1rem 0";
    title.style.fontSize = "1.5rem";
    title.style.color = "#fff";
    title.style.textAlign = "center";
    return title;
  }

  static popupContent() {
    let content = document.createElement("div");
    content.id = this.contentId;
    content.style.maxHeight = "15rem";
    content.style.overflowY = "auto";
    content.style.fontSize = "1rem";
    content.style.color = "#fff";
    content.style.lineHeight = "1.5";
    content.style.textAlign = "left";
    content.style.padding = "1rem";
    return content;
  }

  static popupCloseBtn() {
    let closeBtn = document.createElement("button");
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "10px";
    closeBtn.style.right = "10px";
    closeBtn.style.background = "transparent";
    closeBtn.style.color = "#fff";
    closeBtn.style.border = "none";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "1.5rem";

    // Add the close button image
    closeBtn.appendChild(this.popupCloseBtnImg());

    // Add the click event listener
    closeBtn.onclick = () => {
      this.close();
    };
    return closeBtn;
  }

  static popupCloseBtnImg() {
    let img = document.createElement("img");
    img.src = chrome.runtime.getURL("xmark.png");
    img.alt = "Close Icon";
    img.style.height = "20px";
    return img;
  }

  static popupLoadMoreBtn() {
    let loadMoreBtn = document.createElement("button");
    loadMoreBtn.id = this.loadMoreBtnId;
    loadMoreBtn.innerText = "Load More Results";
    loadMoreBtn.classList.add("appButton");

    // Add the click event listener
    loadMoreBtn.onclick = () => {
      WikipediaService.loadAndWritePagesTitles();
    };

    return loadMoreBtn;
  }
}
