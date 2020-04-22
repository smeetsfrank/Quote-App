"use strict";

// Render randomized quote
// http://quotes.stormconsultancy.co.uk/api
const requestRandomQuotes = () => {
  hideQuoteEl();
  requestRandomImage();
  fetch("http://quotes.stormconsultancy.co.uk/random.json")
    .then((response) => response.json())
    .then((data) => {
      // Capping quote length for visual purposes. Preferably we would not like a scrollbar in our interface.
      if (data.quote.length < 125 && data.author !== "Unknown") {
        setTimeout(() => {
          showQuoteEl();
          getRandomQuote.style.display = "inline-flex";
          quote.textContent = data.quote + ' "';
          author.value = data.author;
        }, 1000);
      } else {
        requestRandomQuotes();
      }
    })
    .catch(function (error) {
      alert("API connection failed");
      throw Error;
    });
};

// Request most popular quotes
// http://quotes.stormconsultancy.co.uk/api
const requestPopularQuotes = () => {
  fetch("http://quotes.stormconsultancy.co.uk/popular.json")
    .then((response) => response.json())
    .then((data) => {
      // Capping quote length for visual purposes. Preferably we would not like a scrollbar in our interface.
      const filteredQuotes = [];
      data.forEach((item) => {
        if (item.quote.length < 125 && item.author !== "Unknown") {
          filteredQuotes.push(item);
        }
      });
      // Return array of 5 random quotes
      let randomPopularQuotes = randomizeQuotes(filteredQuotes, 5);
      // Set returned array to localstorage so we can use them in our game
      localStorage.setItem("quotes", JSON.stringify(randomPopularQuotes));
    })
    .catch(function (error) {
      alert("API connection failed");
      throw Error;
    });
};

// Request random image **!! LIMITED BY 50 CALLS AN HOUR BECAUSE OF DEMO PROJECT !!**
// https://unsplash.com/documentation
const requestRandomImage = () => {
  fetch(
    "https://api.unsplash.com/photos/random?" +
      new URLSearchParams({
        query: "minimal",
        client_id: "MzZUemb6Dpm7QPA1Edx12DF-O81dgKq7rrDkB91MPRE",
      })
  )
    .then((response) => response.json())
    .then((data) => {
      const formattedUrl = data.urls.regular + "&format=auto";
      document
        .getElementById("wrapper-background")
        .classList.remove("increaseAnim");
      document.getElementById(
        "wrapper-background"
      ).style.backgroundImage = `url('${formattedUrl}')`;
      document
        .getElementById("wrapper-background")
        .classList.add("increaseAnim");
    })
    .catch(function (error) {
      alert("API connection failed");
      throw Error;
    });
};

// Randomize output arrays
const randomizeQuotes = (data, num) => {
  const result = [];
  for (let i = 0; i < num; i++) {
    result.push(data[Math.floor(Math.random() * data.length)]);
  }
  return result;
};

// Render quote from localstorage. We use state not only to check our in-game progress, but also as index
// so we can render the object index that equals the current state
const renderQuote = (quotes, state) => {
  quotes = JSON.parse(quotes);
  quote.textContent = quotes[state].quote + ' "';
  showQuoteEl();
};

// Check if user answer is correct and return true : false
const checkAnswer = (answer, quote) => {
  // Remove all spaces, dots, comma's, hyphens. Also lowercase string so we correctly compare the user input
  answer = answer.toLowerCase().replace(/[\. ,-]+/g, "");
  const author = quote.author.toLowerCase().replace(/[\. ,-]+/g, "");
  return answer === author ? true : false;
};

// Keep track of game progress.
const renderGameProgress = (state) => {
  const progressList = document.querySelectorAll("#progress li");
  // Reset visual progress feedback if state -1
  if (state > -1) {
    // Switch classes when item contains active
    progressList.forEach((li) => {
      if (li.classList.contains("active")) {
        li.classList.remove("active");
        li.classList.add("previous");
      }
      if (li.getAttribute("data-progress") == state) {
        li.classList.add("active");
        return;
      }
    });
  } else {
    progressList.forEach((li) => {
      li.classList.remove("active", "previous");
    });
  }
};

// Construct game summary
const showGameScore = (quotes) => {
  document.getElementById("final-score-wrapper").innerHTML = "";
  const score = document.createElement("ul");
  score.id = "final-score";
  let scoreCount = 0;
  // Creating list for each answer
  quotes.forEach((item, index) => {
    const li = document.createElement("li");

    const answerAuthor = document.createElement("span");
    const answerQuote = document.createElement("span");

    answerAuthor.classList.add("final-author");
    answerQuote.classList.add("final-quote");

    answerAuthor.textContent = item.author;
    answerQuote.textContent = item.quote;

    li.appendChild(answerAuthor);
    li.appendChild(answerQuote);
    if (item.correctAnswer) {
      li.classList.add("correct");
      scoreCount = scoreCount + 1;
    } else {
      li.classList.add("false");
    }
    score.appendChild(li);
  });
  // Construct game score message
  let title;
  switch (scoreCount) {
    case 0:
      title = "Yikes, not even one?";
      break;
    case 1:
      title = "I think you can do better than this..";
      break;
    case 3:
      title = "3 out of 5.. Pretty good!";
      break;
    case 4:
      title = "Well done! 4 out of 5, pretty impressive!";
      break;
    case 5:
      title = "A perfect score! You know your quotes!";
      break;
  }
  // Append score message
  const listTitle = document.createElement("li");
  listTitle.id = "score-title";
  listTitle.textContent = title;
  score.insertBefore(listTitle, score.firstChild);

  // Create a restart button and append it
  const restart = document.getElementById("restart-game");
  restart.style.display = "flex";
  quoteWrapper.appendChild(restart);
  // Trigger 'start func' on restart button. Created a new trigger for styling purposes
  document.getElementById("restart-game").addEventListener("click", () => {
    document.getElementById("start-game").click();
  });
  // Add additional class so we can re-locate 'stop button' in the interface
  document.getElementById("stop").classList.add("fixed-stop");
  document.getElementById("stop").style.display = "inline-flex";
  // Switch to 'finished-class' for styling purposes
  quoteWrapper.classList.remove("in-game");
  quoteWrapper.classList.add("finished");
  document.querySelector(".loader").style.display = "none";
  document.getElementById("progress").style.maxHeight = "0";

  return score;
};

const getParsedLocalQuotes = (key) => {
  return JSON.parse(localStorage.getItem(key));
};

const getLocalQuotes = (key) => {
  return localStorage.getItem(key);
};

// Menu
const menuTrigger = () => {
  document.getElementById("trigger").addEventListener("change", (e) => {
    const mainNav = document.getElementById("main-nav");
    if (e.target.checked) {
      mainNav.classList.remove("close");
      mainNav.classList.add("open");
    } else {
      mainNav.classList.remove("open");
      mainNav.classList.add("close");
    }
  });
};

const hideQuoteEl = () => {
  author.style.display = "none";
  author.value = "";
  quote.style.display = "none";
  quote.innerHTML = "";
  getRandomQuote.style.display = "none";
  if (gameProgress >= 0) {
    document.getElementById("submit").style.display = "none";
    document.getElementById("stop").style.display = "none";
  }
  document.querySelector(".loader").style.display = "flex";
};

const showQuoteEl = () => {
  document.querySelector(".loader").style.display = "none";
  author.style.display = "flex";
  quote.style.display = "flex";
  if (gameProgress >= 0) {
    document.getElementById("submit").style.display = "flex";
    document.getElementById("stop").style.display = "inline-flex";
    author.focus();
  }
};

// Reset interface to random quotes
const resetInterface = () => {
  document.getElementById("start-game").textContent = "Guess the quote";
  document.getElementById("submit").style.display = "none";
  document.getElementById("stop").style.display = "none";
  document.getElementById("stop").classList.remove("fixed-stop");
  document.getElementById("progress").style.maxHeight = "0";
  document.getElementById("restart-game").style.display = "none";
  document.getElementById("main-nav").classList.remove("in-game", "open");
  document.getElementById("trigger").checked = false;
  quoteWrapper.classList.remove("in-game");
  quoteWrapper.classList.remove("finished");
}