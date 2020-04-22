"use strict";

menuTrigger();

// Often used DOM elements
const quoteWrapper = document.getElementById("quote-wrapper");
const author = document.getElementById("author");
const quote = document.getElementById("quote");
const getRandomQuote = document.getElementById("randomizer");

// Used for rendering correct quote and progress feedback
let gameProgress;

// Render random quote on load
requestRandomQuotes();

// Start quote game
document.getElementById("start-game").addEventListener("click", () => {
  gameProgress = 0;
  // Remove classes so we can use 'start-game' as a 'restart'.
  // Call quote API and store 5 random quotes in localstorage
  resetInterface()
  requestPopularQuotes();
  hideQuoteEl();

  // setTimeout() is only being used for smooth transitions using a loader
  setTimeout(() => {
    // Reset rendered progress on (re)starting a game
    renderGameProgress(-1);
    // Add 'in-game' class for styling purposes
    quoteWrapper.classList.add("in-game");
    document.getElementById("main-nav").classList.add("in-game");
    document.getElementById("start-game").innerHTML = "Restart game";
    // Set max-height on progress for a smooth render because of it being a fixed element.
    document.getElementById("progress").style.maxHeight = "100%";
    author.style.pointerEvents = "auto";
    author.setAttribute("placeholder", "Who's is it? ...");
    renderQuote(getLocalQuotes("quotes"), gameProgress);
    renderGameProgress(gameProgress);
  }, 2000);
});

// User submitted answer
document.getElementById("submit").addEventListener("click", (e) => {
  e.preventDefault();
  // Get quotes from storage and compare quote author with users input
  const localQuotes = getParsedLocalQuotes("quotes");
  let userAnswer = document.getElementById("author").value;
  let correctAnswer = checkAnswer(userAnswer, localQuotes[gameProgress]);
  // Expand array object with returned answer and set it to localstorage
  localQuotes[gameProgress].correctAnswer = correctAnswer;
  localStorage.setItem("quotes", JSON.stringify(localQuotes));
  // Increase game progess and render new quote or render final score
  hideQuoteEl();
  requestRandomImage();
  setTimeout(() => {
    if (gameProgress <= 3) {
      gameProgress = gameProgress + 1;
      renderGameProgress(gameProgress);
      document.getElementById("author").value = "";
      renderQuote(getLocalQuotes("quotes"), gameProgress);
    } else if (gameProgress === 4) {
      hideQuoteEl();
      const gameScore = showGameScore(getParsedLocalQuotes("quotes"));
      document.getElementById("final-score-wrapper").appendChild(gameScore);
      // Restore settings
      gameProgress = 0;
    }
  }, 1000);
});

// Stop Quote game
document.querySelector("#main-nav .stop-game").addEventListener("click", () => {
  document.getElementById("stop").click();
});

document.getElementById("stop").addEventListener("click", () => {
  gameProgress = -1;
  // Reset localstorage and gameprogress
  localStorage.removeItem("quotes");
  hideQuoteEl();
  resetInterface();
  requestRandomQuotes();
});

// Request random quotes
document.getElementById("randomizer").addEventListener("click", () => {
  requestRandomQuotes();
});
