class WikipediaButton {
  static id = "proxiwiki-auto-search-btn";
  static containerSelector = ".inputContainer";

  static get() {
    // Check if the button already exists
    let btn = document.getElementById(this.id);
    if (btn) return btn;

    // Create the button
    this.build();

    return document.getElementById(this.id);
  }

  static setCallback(callback) {
    console.log("Setting callback for Wikipedia button");

    // Set the click event listener for the button
    let btn = this.get();
    console.log("Button found:", btn);

    if (btn) {
      btn.onclick = callback;
    }
  }

  static build() {
    // Create the button element
    let btn = this.btnBase();
    btn.appendChild(this.btnImage());

    // Add the click event listener
    btn.onclick = () => {
      WikipediaPopup.open();
      WikipediaService.writePagesTitles();
    };

    // Append the button to the container when it exists
    this.waitContainer(() => {
      const container = document.querySelector(this.containerSelector);
      container.appendChild(btn);
    });
  }

  static waitContainer(callback) {
    // Check if the container exists
    let container = document.querySelector(this.containerSelector);
    if (container) callback();

    // If not, wait for it to be added to the DOM
    let observer = new MutationObserver((mutations, obs) => {
      container = document.querySelector(this.containerSelector);
      if (container) {
        callback();
        obs.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  static btnBase() {
    let btn = document.createElement("button");
    btn.id = this.btnId;
    btn.className = "searchButton";
    btn.title = "Search in wikipédia";
    btn.style.display = "flex";
    btn.style.alignItems = "center";
    btn.style.justifyContent = "center";
    btn.style.right = "2rem";
    btn.style.height = "100%";
    btn.style.borderRadius = "0";
    btn.style.cursor = "pointer";
    return btn;
  }

  static btnImage() {
    let img = document.createElement("img");
    img.src = chrome.runtime.getURL("wikipedia-logo.png");
    img.alt = "Wikipedia Logo";
    img.style.height = "20px";
    return img;
  }
}
