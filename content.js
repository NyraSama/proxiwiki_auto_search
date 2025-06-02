// content.js

function initProxiwikiAutoSearch() {
  WikipediaButton.get();
  WikipediaPopup.get();
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", initProxiwikiAutoSearch);
} else {
  initProxiwikiAutoSearch();
}

/*
// Optimal list of words to cover a wide range of topics to find easily find in pedantics
- 2000
- Science
- Energie
- Religion
- Artiste
- Cinéma
- Musique
- Informatique
- Histoire
- Littérature
- Géographie
- Politique
- Sport
- Économie
- Psychologie
- Hypothèse
- Garçon
- Mécanique
- Philosophie
- Technologie
*/
