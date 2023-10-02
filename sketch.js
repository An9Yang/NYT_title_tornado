
let apiKey = "ELGqeOb4OIfyArTC3ooTbF1nO6MSDAbh";
let wordAreas = [];
let sel;
let angle = 0;
let articles = [];
let titleAreas = []; 

async function fetchData() {
  let category = sel.value();
  let url = `https://api.nytimes.com/svc/topstories/v2/${category}.json?api-key=${apiKey}`;
  let response = await fetch(url);
  let data = await response.json();
  articles = data.results;

  // Regenerate word list and word areas
  let wordList = createWordList();
  wordAreas = [];
  for (let word of wordList) {
    let x = random(width);
    let y = random(height);
    let w = textWidth(word);
    let h = 15; // Approximate height for text
    wordAreas.push({ x, y, w, h, word });
  }
}


function setup() {
  createCanvas(600, 600);
  sel = createSelect();
  sel.position(10, 10);
  sel.option('home');
  sel.option('world');
  sel.option('national');
  sel.option('politics');
  sel.option('technology');
  sel.changed(fetchData);
  fetchData().then(() => {
    let wordList = createWordList();
    for (let word of wordList) {
      let x = random(width);
      let y = random(height);
      let w = textWidth(word);
      let h = 15; // Approximate height for text
      text(word, x, y);
      wordAreas.push({ x, y, w, h, word });
    }
  });
}

function createWordList() {
  let wordList = [];
  for (let article of articles) {
    let words = article.title.split(' ');
    wordList = wordList.concat(words);
  }
  return wordList;
}

function displayCyclone() {
  if (!articles || articles.length === 0) {
    console.log("Articles not loaded yet.");
    return;
  }
  textAlign(CENTER, CENTER);
  titleAreas = [];

  let levels = [[0, 1, 2, 3, 4, 5, 6, 7], [8, 9, 10, 11, 12], [13, 14]]; // 8, 5, 2 titles per level
  let radii = [{x: 300, y: 100}, {x: 200, y: 80}, {x: 100, y: 60}]; // Radii for each level (x and y dimensions)
  let yOffsets = [-150, 100, 220]; // Increased vertical offsets for each level

  for (let l = 0; l < levels.length; l++) {
    let numArticles = levels[l].length;
    let angleStep = TWO_PI / numArticles;

    for (let i = 0; i < numArticles; i++) {
      let index = levels[l][i];
      let x = width / 2 + cos(angle + angleStep * i) * radii[l].x;
      let y = height / 2 + sin(angle + angleStep * i) * radii[l].y + yOffsets[l];  // Add vertical offset

      // Check for mouseover
      let w = textWidth(articles[index].title);
      let h = 15;
      if (mouseX > x - w / 2 && mouseX < x + w / 2 &&
          mouseY > y - h / 2 && mouseY < y + h / 2) {
        fill(255, 0, 0);
      } else {
        fill(0);
      }

      text(articles[index].title, x, y);
      titleAreas.push({ x, y, w, h, title: articles[index].title });
    }

    angle += 0.002;
  }
}



function draw() {
  background(255);
  displayCyclone();

  // Detect if a title is clicked
  for (let area of titleAreas) {
    if (mouseX > area.x - area.w / 2 && mouseX < area.x + area.w / 2 &&
        mouseY > area.y - area.h / 2 && mouseY < area.y + area.h / 2) {
      if (mouseIsPressed) {
        // Fetch and display word cloud for this article
        displayWordCloud(area.title);
      }
    }
  }
}


function mousePressed() {
  for (let area of titleAreas) {
    if (mouseX > area.x - area.w / 2 && mouseX < area.x + area.w / 2 &&
        mouseY > area.y - area.h / 2 && mouseY < area.y + area.h / 2) {
      console.log("Clicked on: " + area.title);
      // Generate word cloud
      let article = articles.find(a => a.title === area.title);
      if (article && article.abstract) {  // Use 'abstract' instead of 'content'
        generateWordCloud(article.abstract);
      } else {
        console.log("Article or abstract not found.");
      }
    }
  }
}

function generateWordCloud(text) {
  let words = text.split(' ');
  let wordCounts = {};
  for (let word of words) {
    word = word.toLowerCase();
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }

  background(255);
  let sortedWords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]);
  for (let i = 0; i < min(20, sortedWords.length); i++) {
    let fontSize = wordCounts[sortedWords[i]] * 10;
    textSize(fontSize);
    fill(random(255), random(255), random(255));
    text(sortedWords[i], random(width), random(height));
  }
}


function displayWordCloud(title) {
  console.log("Displaying word cloud for:", title);

  // Find the article with the clicked title
  let article = articles.find(a => a.title === title);
  if (!article || !article.content) {
    console.log("Article or content not found.");
    return;
  }

  // Generate the word cloud based on the article content
  let words = article.content.split(" ");
  let wordCounts = {};

  for (let word of words) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }

  // Sort words by frequency
  let sortedWords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]);

  // Display the top 20 words as the word cloud
  background(255);
  fill(0);
  for (let i = 0; i < min(20, sortedWords.length); i++) {
    textSize(wordCounts[sortedWords[i]]);
    text(sortedWords[i], random(width), random(height));
  }
}


