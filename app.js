import React, { useState, useEffect, useMemo } from "react"; import ReactDOM from "react-dom/client"; // SVGs const musicNoteSVG = (  ); const staffSVG = ( ); const catSVG = (  ); // Data const lyricQ = [ { lyric: "I knew you were trouble when you walked in", ans: "I Knew You Were Trouble" }, { lyric: "We're happy, free, confused, and lonely at the same time", ans: "22" }, { lyric: "'Cause baby, I could build a castle out of all the bricks they threw at me", ans: "New Romantics" }, { lyric: "Band-aids don't fix bullet holes", ans: "Bad Blood" } ]; const albumQ = [ { song: "Love Story", options: ["Fearless", "Red", "Speak Now", "1989"], ans: "Fearless" }, { song: "Shake It Off", options: ["1989", "Reputation", "Lover", "Red"], ans: "1989" }, { song: "Blank Space", options: ["1989", "Reputation", "Red", "Speak Now"], ans: "1989" }, { song: "Delicate", options: ["Reputation", "Lover", "Folklore", "Evermore"], ans: "Reputation" } ]; function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; } function GenericGame({ questions, type }) { const [idx, setIdx] = useState(0); const [input, setInput] = useState(""); const [score, setScore] = useState(0); const [feedback, setFeedback] = useState(""); useEffect(() => setInput(""), [idx]); const current = questions[idx]; const submit = (ans) => { const correct = type === "lyric" ? ans.trim().toLowerCase() === current.ans.toLowerCase() : ans === current.ans; if (correct) { setScore(s => s + 1); setFeedback("✅ Correct!"); } else { setFeedback(`❌ Wrong! Answer: ${current.ans}`); } setTimeout(() => { setFeedback(""); if (idx < questions.length - 1) setIdx(i => i + 1); }, 1500); }; return ( <>
{ type === "lyric" && musicNoteSVG }
{ type === "lyric" ? `“${current.lyric}”` : `Which album features “${current.song}”?` }
{
    type === "lyric" &&
    { staffSVG }
} {
    feedback.includes('✅') &&
    { catSVG }
}
{
    type === "lyric" ? ( <>   setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && input && submit(input)} />  submit(input)} disabled={!input}>Submit ) : (
        {current.options.map(opt => (
            submit(opt)}>{opt}
))}
)}
        {feedback}
        Score: {score} / {questions.length}
); } function App() { const [mode, setMode] = useState('lyrics'); return ( <>
setMode('lyrics')}>Lyrics Quiz
setMode('albums')}>Album Match
            {mode === 'lyrics' ? : }
); } const root = ReactDOM.createRoot(document.getElementById('root')); root.render();