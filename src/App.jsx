import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, push, remove } from 'firebase/database';
import './App.css';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfLrVmdlga9C7O5l3L--kxP5EBIYSq__g",
  authDomain: "gloriousrich2025.firebaseapp.com",
  projectId: "gloriousrich2025",
  storageBucket: "gloriousrich2025.firebasestorage.app",
  messagingSenderId: "575479989148",
  appId: "1:575479989148:web:843748aab3728bf3dfbe59",
  measurementId: "G-4GK4J82Y85"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Sound effects
const correctSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
const wrongSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3');
const levelUpSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2002/2002-preview.mp3');
const streakSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');

const questions = [
  {
    question: "What year was Taylor Swift born?",
    options: ["1987", "1988", "1989", "1990"],
    correct: "1989",
    funFact: "Taylor was born on December 13, 1989, in Reading, Pennsylvania!"
  },
  {
    question: "Which album features the song 'Shake It Off'?",
    options: ["Fearless", "Speak Now", "1989", "Red"],
    correct: "1989",
    funFact: "Shake It Off was the lead single from 1989, released in 2014!"
  },
  {
    question: "What is the name of Taylor's first album?",
    options: ["Fearless", "Taylor Swift", "Speak Now", "Debut"],
    correct: "Taylor Swift",
    funFact: "Her self-titled debut album was released when she was just 16 years old!"
  },
  {
    question: "Which song won Taylor her first Grammy for Song of the Year?",
    options: ["Love Story", "You Belong With Me", "Mean", "Blank Space"],
    correct: "Mean",
    funFact: "Mean won Best Country Song and Best Country Solo Performance at the 2012 Grammys!"
  },
  {
    question: "What is the name of Taylor's cat that appears in her music videos?",
    options: ["Meredith", "Olivia", "Benjamin", "All of the above"],
    correct: "All of the above",
    funFact: "All three cats have appeared in her music videos and social media posts!"
  }
];

const achievements = [
  { id: 'first_correct', name: 'First Step', description: 'Got your first correct answer!' },
  { id: 'perfect_score', name: 'Swift Master', description: 'Got a perfect score!' },
  { id: 'quick_answer', name: 'Speedy Swiftie', description: 'Answered correctly in under 5 seconds!' },
  { id: 'streak_3', name: 'On Fire', description: 'Got 3 correct answers in a row!' },
  { id: 'streak_5', name: 'Unstoppable', description: 'Got all 5 questions correct in a row!' },
  { id: 'streak_10', name: 'Legendary Swiftie', description: 'Maintained a 10+ streak!' },
  { id: 'perfect_streak', name: 'Perfect Streak', description: 'Completed the quiz with a perfect streak!' }
];

function App() {
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'playing', 'finished'
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [showFunFact, setShowFunFact] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  const [answerTime, setAnswerTime] = useState(0);
  const [streakMultiplier, setStreakMultiplier] = useState(1);
  const [showStreakEffect, setShowStreakEffect] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const roomRef = useRef(null);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = () => {
    const newRoomCode = generateRoomCode();
    const playerId = Math.random().toString(36).substring(2);
    const playerName = prompt('Enter your name:') || 'Player ' + playerId.substring(0, 4);
    
    setRoomCode(newRoomCode);
    setIsHost(true);
    setCurrentPlayer({ id: playerId, name: playerName, score: 0 });
    
    const room = ref(database, `rooms/${newRoomCode}`);
    set(room, {
      host: playerId,
      players: {
        [playerId]: {
          name: playerName,
          score: 0,
          streak: 0,
          currentQuestion: 0
        }
      },
      gameState: 'waiting',
      currentQuestion: 0
    });
    
    roomRef.current = room;
  };

  const joinRoom = () => {
    const code = prompt('Enter room code:');
    if (!code) return;

    const playerId = Math.random().toString(36).substring(2);
    const playerName = prompt('Enter your name:') || 'Player ' + playerId.substring(0, 4);
    
    const room = ref(database, `rooms/${code}`);
    set(room, {
      players: {
        [playerId]: {
          name: playerName,
          score: 0,
          streak: 0,
          currentQuestion: 0
        }
      }
    });
    
    setRoomCode(code);
    setCurrentPlayer({ id: playerId, name: playerName, score: 0 });
    roomRef.current = room;
  };

  useEffect(() => {
    if (roomRef.current) {
      const unsubscribe = onValue(roomRef.current, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPlayers(Object.entries(data.players).map(([id, player]) => ({
            id,
            ...player
          })));
          
          if (data.gameState === 'playing' && gameState === 'lobby') {
            setGameState('playing');
          }
        }
      });

      return () => unsubscribe();
    }
  }, [roomRef.current]);

  const startGame = () => {
    if (isHost) {
      set(ref(database, `rooms/${roomCode}`), {
        ...roomRef.current,
        gameState: 'playing',
        currentQuestion: 0
      });
    }
  };

  const checkAchievements = useCallback((newScore, newStreak, time) => {
    const newAchievements = [];
    
    if (newScore === 1) {
      newAchievements.push(achievements.find(a => a.id === 'first_correct'));
    }
    if (newScore === questions.length) {
      newAchievements.push(achievements.find(a => a.id === 'perfect_score'));
    }
    if (time < 5) {
      newAchievements.push(achievements.find(a => a.id === 'quick_answer'));
    }
    if (newStreak === 3) {
      newAchievements.push(achievements.find(a => a.id === 'streak_3'));
    }
    if (newStreak === 5) {
      newAchievements.push(achievements.find(a => a.id === 'streak_5'));
    }

    newAchievements.forEach(achievement => {
      if (achievement && !achievements.includes(achievement)) {
        setShowAchievement(achievement);
        levelUpSound.play();
        setTimeout(() => setShowAchievement(null), 3000);
      }
    });

    setAchievements(prev => [...prev, ...newAchievements.filter(a => a && !prev.includes(a))]);
  }, [achievements]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(15);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowFunFact(false);
      startTimeRef.current = Date.now();
    } else {
      setShowScore(true);
    }
  }, [currentQuestion]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    if (!showScore && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerRef.current);
    } else if (timeLeft === 0) {
      handleNextQuestion();
    }
  }, [timeLeft, showScore, handleNextQuestion]);

  const calculateScore = useCallback((baseScore, currentStreak) => {
    const multiplier = Math.min(3, 1 + (currentStreak * 0.2)); // Max 3x multiplier
    return Math.round(baseScore * multiplier);
  }, []);

  const handleAnswerClick = (selectedOption) => {
    const answerTime = (Date.now() - startTimeRef.current) / 1000;
    setAnswerTime(answerTime);
    setSelectedAnswer(selectedOption);
    const correct = selectedOption === questions[currentQuestion].correct;
    setIsCorrect(correct);
    
    if (correct) {
      correctSound.play();
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      if (newStreak > highestStreak) {
        setHighestStreak(newStreak);
      }

      const baseScore = 100;
      const newScore = calculateScore(baseScore, newStreak);
      setTotalScore(prev => prev + newScore);
      
      const newMultiplier = Math.min(3, 1 + (newStreak * 0.2));
      setStreakMultiplier(newMultiplier);

      if (newStreak >= 3) {
        setShowStreakEffect(true);
        streakSound.play();
        setTimeout(() => setShowStreakEffect(false), 1000);
      }

      // Update player score in Firebase
      if (roomRef.current && currentPlayer) {
        set(ref(database, `rooms/${roomCode}/players/${currentPlayer.id}`), {
          ...players.find(p => p.id === currentPlayer.id),
          score: totalScore + newScore,
          streak: newStreak,
          currentQuestion: currentQuestion + 1
        });
      }

      checkAchievements(score + 1, newStreak, answerTime);
    } else {
      wrongSound.play();
      setStreak(0);
      setStreakMultiplier(1);
    }

    setShowFunFact(true);
    setTimeout(() => {
      handleNextQuestion();
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setTimeLeft(15);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setStreak(0);
    setStreakMultiplier(1);
    setShowFunFact(false);
    setTotalScore(0);
    startTimeRef.current = Date.now();
  };

  if (gameState === 'lobby') {
    return (
      <div className="app">
        <div className="lobby-container">
          <h1>Taylor Swift Trivia</h1>
          <div className="lobby-buttons">
            <button onClick={createRoom} className="create-room">
              Create Room
            </button>
            <button onClick={joinRoom} className="join-room">
              Join Room
            </button>
          </div>
          {roomCode && (
            <div className="room-info">
              <h2>Room Code: {roomCode}</h2>
              <div className="players-list">
                <h3>Players:</h3>
                {players.map(player => (
                  <div key={player.id} className="player">
                    {player.name} {player.id === currentPlayer?.id && '(You)'}
                  </div>
                ))}
              </div>
              {isHost && (
                <button onClick={startGame} className="start-game">
                  Start Game
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="quiz-container">
        <h1>Taylor Swift Trivia</h1>
        {showScore ? (
          <div className="score-section">
            <h2>Quiz Complete! 🎵</h2>
            <p>You scored {score} out of {questions.length}</p>
            <p className="total-score">Total Points: {totalScore}</p>
            <p className="highest-streak">Highest Streak: {highestStreak} 🔥</p>
            {achievements.length > 0 && (
              <div className="achievements-list">
                <h3>Achievements Unlocked:</h3>
                {achievements.map(achievement => (
                  <div key={achievement.id} className="achievement">
                    🏆 {achievement.name}
                  </div>
                ))}
              </div>
            )}
            <button onClick={resetQuiz}>Play Again</button>
          </div>
        ) : (
          <>
            <div className="question-section">
              <div className="stats">
                <div className="question-count">
                  <span>Question {currentQuestion + 1}</span>/{questions.length}
                </div>
                <div className="streak-container">
                  <div className="streak">🔥 {streak} Streak</div>
                  {streak >= 3 && (
                    <div className="multiplier">x{streakMultiplier.toFixed(1)}</div>
                  )}
                </div>
                <div className="timer">⏱️ {timeLeft}s</div>
              </div>
              {showStreakEffect && (
                <div className="streak-effect">
                  <span>🔥 STREAK BONUS! 🔥</span>
                </div>
              )}
              <div className="question-text">{questions[currentQuestion].question}</div>
              {showFunFact && (
                <div className={`fun-fact ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {questions[currentQuestion].funFact}
                </div>
              )}
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
      {showAchievement && (
        <div className="achievement-popup">
          <h3>🏆 Achievement Unlocked!</h3>
          <p>{showAchievement.name}</p>
          <p className="achievement-description">{showAchievement.description}</p>
        </div>
      )}
    </div>
  );
}

export default App; 