import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "mypassword",
  port: 5432,
});

const app = express();
const port = 3000;

// Connect to the database when the application starts
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
    return;
  }
  console.log("Connected to the database");

  // Query database for quiz questions
  db.query("SELECT * FROM flags", (err, res) => {
    if (err) {
      console.error("Error executing query:", err.stack);
      // Handle error (e.g., set default value for quiz, log error)
      db.end(); // Close the database connection
      return;
    }
    quiz = res.rows;
    db.end(); // Close the database connection after retrieving data
  });
});

let quiz = [];
let totalCorrect = 0;
let currentQuestion = {};

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  try {
    await nextQuestion();
    console.log(currentQuestion);
    res.render("index.ejs", { question: currentQuestion });
  } catch (error) {
    console.error("Error handling GET request:", error);
    res.status(500).send("Internal Server Error");
  }
});

// POST a new post
app.post("/submit", (req, res) => {
  try {
    let answer = req.body.answer.trim();
    let isCorrect = false;
    if (currentQuestion.name.toLowerCase() === answer.toLowerCase()) {
      totalCorrect++;
      console.log(totalCorrect);
      isCorrect = true;
    }
    nextQuestion();
    res.render("index.ejs", {
      question: currentQuestion,
      wasCorrect: isCorrect,
      totalScore: totalCorrect,
    });
  } catch (error) {
    console.error("Error handling POST request:", error);
    res.status(500).send("Internal Server Error");
  }
});

async function nextQuestion() {
  try {
    const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
    currentQuestion = randomCountry;
  } catch (error) {
    throw new Error("Failed to get next question");
  }
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
