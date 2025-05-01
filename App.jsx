import React, { useState, useEffect } from 'react';
import './App.css';

const questions = [
  {
    question: "What year was Taylor Swift born?",
    options: ["1987", "1988", "1989", "1990"],
    correct: "1989"
  },
  {
    question: "Which album features the song 'Shake It Off'?",
    options: ["Fearless", "Speak Now", "1989", "Red"],
    correct: "1989"
  },
  {
    question: "What is the name of Taylor's first album?",
    options: ["Fearless", "Taylor Swift", "Speak Now", "Debut"],
    correct: "Taylor Swift"
  },
  {
    question: "Which song won Taylor her first Grammy for Song of the Year?",
    options: ["Love Story", "You Belong With Me", "Mean", "Blank Space"],
    correct: "Mean"
  },
  {
    question: "What is the name of Taylor's cat that appears in her music videos?",
    options: ["Meredith", "Olivia", "Benjamin", "All of the above"],
    correct: "All of the above"
  }
];

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    if (!showScore && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
  }, [timeLeft, showScore]);

  const handleAnswerClick = (selectedOption) => {
    setSelectedAnswer(selectedOption);
    const correct = selectedOption === questions[currentQuestion].correct;
    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
    setTimeout(() => {
      handleNextQuestion();
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(15);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setShowScore(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setTimeLeft(15);
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  return (
    <div className="app">
      <div className="quiz-container">
        <h1>Taylor Swift Trivia</h1>
        {showScore ? (
          <div className="score-section">
            <h2>Quiz Complete! 🎵</h2>
            <p>You scored {score} out of {questions.length}</p>
            <button onClick={resetQuiz}>Play Again</button>
          </div>
        ) : (
          <>
            <div className="question-section">
              <div className="question-count">
                <span>Question {currentQuestion + 1}</span>/{questions.length}
              </div>
              <div className="timer">Time Left: {timeLeft}s</div>
              <div className="question-text">{questions[currentQuestion].question}</div>
            </div>
            <div className="answer-section">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(option)}
                  className={`answer-button ${
                    selectedAnswer === option
                      ? isCorrect
                        ? 'correct'
                        : 'incorrect'
                      : ''
                  }`}
                  disabled={selectedAnswer !== null}
                >
                  {option}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App; 