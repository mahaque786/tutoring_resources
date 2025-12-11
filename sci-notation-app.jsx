import React, { useState, useEffect } from 'react';

const generateRandomNumber = (min, max, decimals = 0) => {
  const num = Math.random() * (max - min) + min;
  return decimals > 0 ? parseFloat(num.toFixed(decimals)) : Math.floor(num);
};

const countSigFigs = (numStr) => {
  const str = numStr.toString().replace(/^-/, '');
  if (str.includes('e') || str.includes('E')) {
    const [coef] = str.split(/[eE]/);
    return countSigFigs(coef);
  }
  const cleaned = str.replace(/^0+\.?/, '').replace('.', '');
  if (str.includes('.')) {
    return cleaned.length;
  }
  return cleaned.replace(/0+$/, '').length || 1;
};

const toScientificNotation = (num) => {
  if (num === 0) return { coefficient: 0, exponent: 0 };
  const exp = Math.floor(Math.log10(Math.abs(num)));
  const coef = num / Math.pow(10, exp);
  return { coefficient: parseFloat(coef.toFixed(4)), exponent: exp };
};

export default function SciNotationApp() {
  const [currentView, setCurrentView] = useState('welcome');
  const [rulesSection, setRulesSection] = useState('scientific');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [practiceType, setPracticeType] = useState('toScientific');
  const [difficulty, setDifficulty] = useState('medium');
  const [practiceScore, setPracticeScore] = useState({ correct: 0, total: 0 });
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);

  const quizQuestions = [
    {
      question: "How many significant figures are in 0.00340?",
      options: ["2", "3", "4", "5"],
      correct: 1,
      explanation: "Leading zeros are never significant. The trailing zero after the 4 IS significant because it's after a decimal point. So: 3, 4, 0 = 3 sig figs."
    },
    {
      question: "What is the correct scientific notation for 45,600?",
      options: ["4.56 × 10³", "4.56 × 10⁴", "45.6 × 10³", "4.560 × 10⁴"],
      correct: 1,
      explanation: "Move the decimal 4 places left to get 4.56. The exponent equals the number of places moved: 10⁴."
    },
    {
      question: "How many significant figures are in 1000?",
      options: ["1", "2", "3", "4"],
      correct: 0,
      explanation: "Trailing zeros WITHOUT a decimal point are ambiguous but typically considered NOT significant. So 1000 has 1 sig fig. To show 4 sig figs, write 1000. or 1.000 × 10³."
    },
    {
      question: "When multiplying 2.5 × 3.42, how many sig figs should your answer have?",
      options: ["2", "3", "4", "5"],
      correct: 0,
      explanation: "In multiplication/division, the answer has the same number of sig figs as the measurement with the FEWEST sig figs. 2.5 has 2, 3.42 has 3 → answer has 2."
    },
    {
      question: "What is 3.2 × 10⁴ in standard notation?",
      options: ["320", "3,200", "32,000", "320,000"],
      correct: 2,
      explanation: "Move the decimal 4 places to the right: 3.2 → 32 → 320 → 3200 → 32,000"
    },
    {
      question: "How many significant figures are in 50.00?",
      options: ["1", "2", "3", "4"],
      correct: 3,
      explanation: "All digits here are significant: the 5, the 0 between, and both trailing zeros after the decimal. Total: 4 sig figs."
    },
    {
      question: "When adding 12.5 + 1.234, how should you round your answer?",
      options: ["To 1 decimal place", "To 2 decimal places", "To 3 decimal places", "To 4 sig figs"],
      correct: 0,
      explanation: "In addition/subtraction, round to the LEAST number of decimal places. 12.5 has 1 decimal place, 1.234 has 3 → answer gets 1 decimal place."
    },
    {
      question: "Which number has exactly 4 significant figures?",
      options: ["0.0040", "4000", "4.000", "40.0"],
      correct: 2,
      explanation: "0.0040 has 2 (leading zeros don't count). 4000 has 1 (trailing zeros without decimal). 4.000 has 4 (all zeros after decimal count). 40.0 has 3."
    }
  ];

  const generateProblem = (type) => {
    switch(type) {
      case 'toScientific': {
        const magnitude = generateRandomNumber(-5, 8);
        const base = generateRandomNumber(1, 9.99, 2);
        const num = base * Math.pow(10, magnitude);
        return {
          question: `Convert to scientific notation: ${num.toLocaleString('fullwide', {useGrouping: false, maximumFractionDigits: 12})}`,
          answer: toScientificNotation(num),
          type: 'scientific',
          original: num
        };
      }
      case 'fromScientific': {
        const coef = generateRandomNumber(1, 9.99, 2);
        const exp = generateRandomNumber(-5, 6);
        const result = coef * Math.pow(10, exp);
        return {
          question: `Convert to standard notation: ${coef} × 10^${exp}`,
          answer: result,
          type: 'standard',
          coefficient: coef,
          exponent: exp
        };
      }
      case 'countSigFigs': {
        const patterns = [
          () => `0.00${generateRandomNumber(1, 9)}${generateRandomNumber(0, 9)}0`,
          () => `${generateRandomNumber(1, 9)}${generateRandomNumber(0, 9)}.${generateRandomNumber(0, 9)}0`,
          () => `${generateRandomNumber(1, 9)}000`,
          () => `${generateRandomNumber(1, 9)}.${generateRandomNumber(0, 9)}${generateRandomNumber(0, 9)}${generateRandomNumber(0, 9)}`,
          () => `0.${generateRandomNumber(1, 9)}${generateRandomNumber(0, 9)}`,
          () => `${generateRandomNumber(10, 99)}.00`,
          () => `0.000${generateRandomNumber(1, 9)}${generateRandomNumber(0, 9)}`,
          () => `${generateRandomNumber(1, 9)}0${generateRandomNumber(1, 9)}0`,
          () => `${generateRandomNumber(1, 9)}.0${generateRandomNumber(1, 9)}0`,
          () => `${generateRandomNumber(100, 999)}00`,
        ];
        const numStr = patterns[generateRandomNumber(0, patterns.length - 1)]();
        return {
          question: `How many significant figures are in: ${numStr}`,
          answer: countSigFigs(numStr),
          type: 'sigfigs',
          numStr
        };
      }
      case 'multiplyScientific': {
        const coef1 = generateRandomNumber(1, 9, 1);
        const exp1 = generateRandomNumber(-3, 4);
        const coef2 = generateRandomNumber(1, 9, 1);
        const exp2 = generateRandomNumber(-3, 4);
        const resultCoef = coef1 * coef2;
        let finalCoef = resultCoef;
        let finalExp = exp1 + exp2;
        if (resultCoef >= 10) {
          finalCoef = resultCoef / 10;
          finalExp += 1;
        }
        return {
          question: `Multiply: (${coef1} × 10^${exp1}) × (${coef2} × 10^${exp2})`,
          answer: { coefficient: parseFloat(finalCoef.toFixed(2)), exponent: finalExp },
          type: 'scientific',
          hint: 'Multiply coefficients, add exponents, then adjust if needed'
        };
      }
      case 'divideScientific': {
        const coef1 = generateRandomNumber(2, 9, 1);
        const exp1 = generateRandomNumber(-2, 5);
        const coef2 = generateRandomNumber(1, 5, 1);
        const exp2 = generateRandomNumber(-2, 3);
        let resultCoef = coef1 / coef2;
        let finalExp = exp1 - exp2;
        if (resultCoef < 1) {
          resultCoef = resultCoef * 10;
          finalExp -= 1;
        } else if (resultCoef >= 10) {
          resultCoef = resultCoef / 10;
          finalExp += 1;
        }
        return {
          question: `Divide: (${coef1} × 10^${exp1}) ÷ (${coef2} × 10^${exp2})`,
          answer: { coefficient: parseFloat(resultCoef.toFixed(2)), exponent: finalExp },
          type: 'scientific',
          hint: 'Divide coefficients, subtract exponents, then adjust if needed'
        };
      }
      case 'roundSigFigs': {
        const targetSigFigs = generateRandomNumber(2, 4);
        const num = generateRandomNumber(10, 99999, generateRandomNumber(1, 4));
        const magnitude = Math.floor(Math.log10(Math.abs(num)));
        const scale = Math.pow(10, magnitude - targetSigFigs + 1);
        const rounded = Math.round(num / scale) * scale;
        return {
          question: `Round ${num} to ${targetSigFigs} significant figures`,
          answer: rounded,
          type: 'rounded',
          targetSigFigs
        };
      }
      case 'multiplySigFigs': {
        const sigFigs1 = generateRandomNumber(2, 4);
        const sigFigs2 = generateRandomNumber(2, 4);
        const num1 = parseFloat((generateRandomNumber(1, 9) + generateRandomNumber(0, 99, 0) / 100).toFixed(sigFigs1 - 1));
        const num2 = parseFloat((generateRandomNumber(1, 9) + generateRandomNumber(0, 99, 0) / 100).toFixed(sigFigs2 - 1));
        const rawResult = num1 * num2;
        const minSigFigs = Math.min(sigFigs1, sigFigs2);
        const magnitude = Math.floor(Math.log10(Math.abs(rawResult)));
        const scale = Math.pow(10, magnitude - minSigFigs + 1);
        const rounded = Math.round(rawResult / scale) * scale;
        return {
          question: `Multiply with correct sig figs: ${num1} × ${num2}`,
          answer: parseFloat(rounded.toPrecision(minSigFigs)),
          type: 'number',
          hint: `${num1} has ${sigFigs1} sig figs, ${num2} has ${sigFigs2} sig figs → answer needs ${minSigFigs}`,
          rawResult
        };
      }
      case 'addSigFigs': {
        const decimals1 = generateRandomNumber(1, 3);
        const decimals2 = generateRandomNumber(1, 3);
        const num1 = generateRandomNumber(10, 99, decimals1);
        const num2 = generateRandomNumber(1, 20, decimals2);
        const rawResult = num1 + num2;
        const minDecimals = Math.min(decimals1, decimals2);
        const rounded = parseFloat(rawResult.toFixed(minDecimals));
        return {
          question: `Add with correct sig figs: ${num1} + ${num2}`,
          answer: rounded,
          type: 'number',
          hint: `${num1} has ${decimals1} decimal places, ${num2} has ${decimals2} → answer needs ${minDecimals}`,
          rawResult
        };
      }
      case 'compareScientific': {
        const coef1 = generateRandomNumber(1, 9, 1);
        const exp1 = generateRandomNumber(-3, 5);
        const coef2 = generateRandomNumber(1, 9, 1);
        const expDiff = generateRandomNumber(-2, 2);
        const exp2 = exp1 + expDiff;
        const val1 = coef1 * Math.pow(10, exp1);
        const val2 = coef2 * Math.pow(10, exp2);
        let answer;
        if (Math.abs(val1 - val2) < 0.0000001) answer = '=';
        else if (val1 > val2) answer = '>';
        else answer = '<';
        return {
          question: `Compare: ${coef1} × 10^${exp1}  ___  ${coef2} × 10^${exp2}`,
          answer: answer,
          type: 'compare',
          val1, val2
        };
      }
      case 'orderMagnitude': {
        const scenarios = [
          { desc: 'diameter of a human hair', answer: -5, unit: 'meters' },
          { desc: 'height of Mount Everest', answer: 4, unit: 'meters' },
          { desc: 'distance from Earth to Moon', answer: 8, unit: 'meters' },
          { desc: 'width of a bacterium', answer: -6, unit: 'meters' },
          { desc: 'mass of a car', answer: 3, unit: 'kilograms' },
          { desc: 'mass of a paperclip', answer: -3, unit: 'kilograms' },
          { desc: 'population of Earth', answer: 10, unit: 'people' },
          { desc: 'seconds in a year', answer: 7, unit: 'seconds' },
          { desc: 'speed of light', answer: 8, unit: 'm/s' },
          { desc: 'diameter of Earth', answer: 7, unit: 'meters' },
          { desc: 'thickness of a credit card', answer: -3, unit: 'meters' },
          { desc: 'mass of an electron', answer: -30, unit: 'kilograms' },
        ];
        const scenario = scenarios[generateRandomNumber(0, scenarios.length - 1)];
        return {
          question: `Estimate the order of magnitude (power of 10) for the ${scenario.desc} in ${scenario.unit}`,
          answer: scenario.answer,
          type: 'magnitude',
          tolerance: 1
        };
      }
      case 'sciNotationAdd': {
        const exp = generateRandomNumber(2, 6);
        const coef1 = generateRandomNumber(1, 5, 1);
        const coef2 = generateRandomNumber(1, 4, 1);
        const resultCoef = coef1 + coef2;
        let finalCoef = resultCoef;
        let finalExp = exp;
        if (resultCoef >= 10) {
          finalCoef = resultCoef / 10;
          finalExp += 1;
        }
        return {
          question: `Add: (${coef1} × 10^${exp}) + (${coef2} × 10^${exp})`,
          answer: { coefficient: parseFloat(finalCoef.toFixed(2)), exponent: finalExp },
          type: 'scientific',
          hint: 'When exponents are the same, add the coefficients'
        };
      }
      case 'mixed': {
        const allTypes = ['toScientific', 'fromScientific', 'countSigFigs', 'multiplyScientific', 'divideScientific', 'roundSigFigs', 'multiplySigFigs', 'addSigFigs', 'compareScientific', 'sciNotationAdd'];
        const randomType = allTypes[generateRandomNumber(0, allTypes.length - 1)];
        return generateProblem(randomType);
      }
      default:
        return null;
    }
  };

  useEffect(() => {
    if (currentView === 'practice' && !currentProblem) {
      setCurrentProblem(generateProblem(practiceType));
    }
  }, [currentView, practiceType, currentProblem]);

  const checkAnswer = () => {
    if (!currentProblem || !userAnswer.trim()) return;
    
    let isCorrect = false;
    const answer = userAnswer.trim().toLowerCase();
    
    if (currentProblem.type === 'scientific') {
      const match = answer.match(/^([\d.]+)\s*[x×\*]\s*10\^?\s*(-?\d+)$/i);
      if (match) {
        const userCoef = parseFloat(match[1]);
        const userExp = parseInt(match[2]);
        const correctCoef = currentProblem.answer.coefficient;
        const correctExp = currentProblem.answer.exponent;
        isCorrect = Math.abs(userCoef - correctCoef) < 0.05 && userExp === correctExp;
      }
    } else if (currentProblem.type === 'standard') {
      const userNum = parseFloat(answer.replace(/,/g, ''));
      isCorrect = Math.abs(userNum - currentProblem.answer) < Math.abs(currentProblem.answer * 0.001);
    } else if (currentProblem.type === 'sigfigs') {
      isCorrect = parseInt(answer) === currentProblem.answer;
    } else if (currentProblem.type === 'rounded' || currentProblem.type === 'number') {
      const userNum = parseFloat(answer.replace(/,/g, ''));
      isCorrect = Math.abs(userNum - currentProblem.answer) < Math.abs(currentProblem.answer * 0.01) || Math.abs(userNum - currentProblem.answer) < 0.01;
    } else if (currentProblem.type === 'compare') {
      isCorrect = answer === currentProblem.answer || 
                  (answer === 'greater' && currentProblem.answer === '>') ||
                  (answer === 'less' && currentProblem.answer === '<') ||
                  (answer === 'equal' && currentProblem.answer === '=');
    } else if (currentProblem.type === 'magnitude') {
      const userMag = parseInt(answer);
      isCorrect = Math.abs(userMag - currentProblem.answer) <= (currentProblem.tolerance || 0);
    }
    
    let correctAnswerDisplay;
    if (currentProblem.type === 'scientific') {
      correctAnswerDisplay = `${currentProblem.answer.coefficient} × 10^${currentProblem.answer.exponent}`;
    } else if (currentProblem.type === 'standard') {
      correctAnswerDisplay = currentProblem.answer.toLocaleString('fullwide', {useGrouping: false, maximumFractionDigits: 12});
    } else if (currentProblem.type === 'compare') {
      correctAnswerDisplay = currentProblem.answer;
    } else {
      correctAnswerDisplay = currentProblem.answer;
    }
    
    setFeedback({
      correct: isCorrect,
      correctAnswer: correctAnswerDisplay,
      hint: currentProblem.hint
    });
    
    setPracticeScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
    
    setStreak(isCorrect ? streak + 1 : 0);
  };

  const nextProblem = () => {
    setCurrentProblem(generateProblem(practiceType));
    setUserAnswer('');
    setFeedback(null);
  };

  const handleQuizAnswer = (index) => {
    if (quizAnswered) return;
    setSelectedAnswer(index);
    setQuizAnswered(true);
    if (index === quizQuestions[quizIndex].correct) {
      setQuizScore(quizScore + 1);
    }
  };

  const nextQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
      setQuizAnswered(false);
      setSelectedAnswer(null);
    } else {
      setCurrentView('quizComplete');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f0f1a 100%)',
      color: '#e0e0e0',
      fontFamily: "'DM Sans', sans-serif",
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        * { box-sizing: border-box; }
        
        .glow-text {
          text-shadow: 0 0 10px rgba(0, 255, 200, 0.5), 0 0 20px rgba(0, 255, 200, 0.3);
        }
        
        .card {
          background: linear-gradient(145deg, rgba(30, 30, 50, 0.9), rgba(20, 20, 35, 0.95));
          border: 1px solid rgba(0, 255, 200, 0.2);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }
        
        .btn {
          background: linear-gradient(135deg, #00ffc8 0%, #00b894 100%);
          color: #0a0a0f;
          border: none;
          padding: 12px 28px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'DM Sans', sans-serif;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 255, 200, 0.4);
        }
        
        .btn-secondary {
          background: transparent;
          border: 2px solid rgba(0, 255, 200, 0.5);
          color: #00ffc8;
        }
        
        .btn-secondary:hover {
          background: rgba(0, 255, 200, 0.1);
        }
        
        .nav-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #a0a0a0;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
        }
        
        .nav-btn:hover, .nav-btn.active {
          background: rgba(0, 255, 200, 0.15);
          border-color: rgba(0, 255, 200, 0.5);
          color: #00ffc8;
        }
        
        .quiz-option {
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.1);
          padding: 16px 20px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        
        .quiz-option:hover:not(.answered) {
          background: rgba(0, 255, 200, 0.1);
          border-color: rgba(0, 255, 200, 0.4);
        }
        
        .quiz-option.correct {
          background: rgba(0, 255, 100, 0.2);
          border-color: #00ff64;
        }
        
        .quiz-option.incorrect {
          background: rgba(255, 80, 80, 0.2);
          border-color: #ff5050;
        }
        
        .input-field {
          background: rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(255, 255, 255, 0.15);
          padding: 14px 18px;
          border-radius: 10px;
          color: #fff;
          font-size: 18px;
          width: 100%;
          font-family: 'JetBrains Mono', monospace;
          transition: all 0.3s ease;
        }
        
        .input-field:focus {
          outline: none;
          border-color: #00ffc8;
          box-shadow: 0 0 20px rgba(0, 255, 200, 0.2);
        }
        
        .rule-box {
          background: rgba(0, 255, 200, 0.05);
          border-left: 4px solid #00ffc8;
          padding: 16px 20px;
          margin: 12px 0;
          border-radius: 0 8px 8px 0;
        }
        
        .example-box {
          background: rgba(255, 200, 0, 0.08);
          border: 1px solid rgba(255, 200, 0, 0.3);
          padding: 14px 18px;
          border-radius: 8px;
          margin: 10px 0;
          font-family: 'JetBrains Mono', monospace;
        }
        
        .streak-badge {
          background: linear-gradient(135deg, #ff6b6b, #ffa502);
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        
        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ffc8, #00b894);
          transition: width 0.5s ease;
        }
        
        .fade-in {
          animation: fadeIn 0.4s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #00ffc8;
          border-radius: 50%;
          opacity: 0.3;
        }
      `}</style>
      
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(24px, 5vw, 42px)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #00ffc8 0%, #00b894 50%, #00d9a5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px',
            letterSpacing: '2px'
          }}>
            SCI-NOTATION LAB
          </h1>
          <p style={{ color: '#6a6a8a', fontSize: '14px', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Scientific Notation & Significant Figures
          </p>
        </header>
        
        {/* Navigation */}
        {currentView !== 'welcome' && (
          <nav style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className={`nav-btn ${currentView === 'rules' ? 'active' : ''}`} onClick={() => setCurrentView('rules')}>📖 Learn Rules</button>
            <button className={`nav-btn ${currentView === 'quiz' ? 'active' : ''}`} onClick={() => { setCurrentView('quiz'); setQuizIndex(0); setQuizScore(0); setQuizAnswered(false); setSelectedAnswer(null); }}>🧪 Test Knowledge</button>
            <button className={`nav-btn ${currentView === 'practice' ? 'active' : ''}`} onClick={() => { setCurrentView('practice'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>⚡ Practice</button>
          </nav>
        )}
        
        {/* Welcome View */}
        {currentView === 'welcome' && (
          <div className="card fade-in" style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔬</div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '28px', marginBottom: '16px', color: '#fff' }}>
              Master Scientific Notation
            </h2>
            <p style={{ color: '#a0a0b0', marginBottom: '30px', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto 30px' }}>
              Learn the rules, test your understanding, and practice until you're confident. 
              This interactive lab will guide you through everything you need to know.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn" onClick={() => setCurrentView('rules')}>Start Learning →</button>
            </div>
          </div>
        )}
        
        {/* Rules View */}
        {currentView === 'rules' && (
          <div className="fade-in">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <button className={`nav-btn ${rulesSection === 'scientific' ? 'active' : ''}`} onClick={() => setRulesSection('scientific')}>Scientific Notation</button>
              <button className={`nav-btn ${rulesSection === 'sigfigs' ? 'active' : ''}`} onClick={() => setRulesSection('sigfigs')}>Significant Figures</button>
              <button className={`nav-btn ${rulesSection === 'operations' ? 'active' : ''}`} onClick={() => setRulesSection('operations')}>Operations</button>
            </div>
            
            {rulesSection === 'scientific' && (
              <div className="card">
                <h2 style={{ color: '#00ffc8', fontFamily: "'DM Sans', sans-serif", marginBottom: '20px' }}>Scientific Notation</h2>
                
                <div className="rule-box">
                  <strong style={{ color: '#00ffc8' }}>Format:</strong> a × 10ⁿ where 1 ≤ |a| &lt; 10
                </div>
                
                <h3 style={{ color: '#fff', marginTop: '24px', marginBottom: '12px' }}>Converting TO Scientific Notation</h3>
                <ol style={{ color: '#c0c0d0', lineHeight: 1.8, paddingLeft: '20px' }}>
                  <li>Move the decimal point until you have a number between 1 and 10</li>
                  <li>Count how many places you moved the decimal</li>
                  <li>If you moved LEFT → positive exponent (large numbers)</li>
                  <li>If you moved RIGHT → negative exponent (small numbers)</li>
                </ol>
                
                <div className="example-box">
                  <div style={{ color: '#ffc800', marginBottom: '8px', fontWeight: 600 }}>Examples:</div>
                  <div>45,000 → 4.5 × 10⁴ (moved 4 places left)</div>
                  <div>0.0032 → 3.2 × 10⁻³ (moved 3 places right)</div>
                </div>
                
                <h3 style={{ color: '#fff', marginTop: '24px', marginBottom: '12px' }}>Converting FROM Scientific Notation</h3>
                <ol style={{ color: '#c0c0d0', lineHeight: 1.8, paddingLeft: '20px' }}>
                  <li>Look at the exponent</li>
                  <li>Positive exponent → move decimal RIGHT</li>
                  <li>Negative exponent → move decimal LEFT</li>
                  <li>Fill in zeros as needed</li>
                </ol>
                
                <div className="example-box">
                  <div style={{ color: '#ffc800', marginBottom: '8px', fontWeight: 600 }}>Examples:</div>
                  <div>2.7 × 10⁵ → 270,000</div>
                  <div>8.1 × 10⁻⁴ → 0.00081</div>
                </div>
              </div>
            )}
            
            {rulesSection === 'sigfigs' && (
              <div className="card">
                <h2 style={{ color: '#00ffc8', fontFamily: "'DM Sans', sans-serif", marginBottom: '20px' }}>Significant Figures Rules</h2>
                
                <div className="rule-box">
                  <strong style={{ color: '#00ffc8' }}>Rule 1:</strong> All non-zero digits are ALWAYS significant
                  <div className="example-box" style={{ marginTop: '10px' }}>
                    123 → 3 sig figs &nbsp;|&nbsp; 7.89 → 3 sig figs
                  </div>
                </div>
                
                <div className="rule-box">
                  <strong style={{ color: '#00ffc8' }}>Rule 2:</strong> Zeros BETWEEN non-zero digits are ALWAYS significant
                  <div className="example-box" style={{ marginTop: '10px' }}>
                    101 → 3 sig figs &nbsp;|&nbsp; 5.007 → 4 sig figs
                  </div>
                </div>
                
                <div className="rule-box">
                  <strong style={{ color: '#00ffc8' }}>Rule 3:</strong> Leading zeros are NEVER significant
                  <div className="example-box" style={{ marginTop: '10px' }}>
                    0.0025 → 2 sig figs &nbsp;|&nbsp; 0.00100 → 3 sig figs
                  </div>
                </div>
                
                <div className="rule-box">
                  <strong style={{ color: '#00ffc8' }}>Rule 4:</strong> Trailing zeros AFTER a decimal point ARE significant
                  <div className="example-box" style={{ marginTop: '10px' }}>
                    2.50 → 3 sig figs &nbsp;|&nbsp; 1.000 → 4 sig figs
                  </div>
                </div>
                
                <div className="rule-box">
                  <strong style={{ color: '#00ffc8' }}>Rule 5:</strong> Trailing zeros WITHOUT a decimal point are NOT significant (ambiguous)
                  <div className="example-box" style={{ marginTop: '10px' }}>
                    1500 → 2 sig figs &nbsp;|&nbsp; 1500. → 4 sig figs (decimal makes it explicit)
                  </div>
                </div>
              </div>
            )}
            
            {rulesSection === 'operations' && (
              <div className="card">
                <h2 style={{ color: '#00ffc8', fontFamily: "'DM Sans', sans-serif", marginBottom: '20px' }}>Operations with Sig Figs</h2>
                
                <div className="rule-box">
                  <strong style={{ color: '#00ffc8' }}>Multiplication & Division:</strong>
                  <p style={{ marginTop: '8px', color: '#c0c0d0' }}>
                    Answer has the same number of sig figs as the measurement with the <strong style={{ color: '#fff' }}>FEWEST</strong> sig figs
                  </p>
                  <div className="example-box" style={{ marginTop: '10px' }}>
                    <div>2.5 × 3.42 = 8.55 → rounds to <strong>8.6</strong> (2 sig figs)</div>
                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#888' }}>2.5 has 2 sig figs, 3.42 has 3 → answer gets 2</div>
                  </div>
                </div>
                
                <div className="rule-box">
                  <strong style={{ color: '#00ffc8' }}>Addition & Subtraction:</strong>
                  <p style={{ marginTop: '8px', color: '#c0c0d0' }}>
                    Answer has the same number of <strong style={{ color: '#fff' }}>DECIMAL PLACES</strong> as the measurement with the fewest decimal places
                  </p>
                  <div className="example-box" style={{ marginTop: '10px' }}>
                    <div>12.52 + 1.7 = 14.22 → rounds to <strong>14.2</strong></div>
                    <div style={{ marginTop: '4px', fontSize: '13px', color: '#888' }}>12.52 has 2 decimal places, 1.7 has 1 → answer gets 1</div>
                  </div>
                </div>
                
                <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(255, 100, 100, 0.1)', borderRadius: '10px', border: '1px solid rgba(255, 100, 100, 0.3)' }}>
                  <strong style={{ color: '#ff6b6b' }}>⚠️ Common Mistake:</strong>
                  <p style={{ color: '#c0c0d0', marginTop: '8px' }}>
                    Don't confuse the two rules! Multiplication/division uses sig figs count, 
                    while addition/subtraction uses decimal places.
                  </p>
                </div>
              </div>
            )}
            
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button className="btn" onClick={() => { setCurrentView('quiz'); setQuizIndex(0); setQuizScore(0); setQuizAnswered(false); }}>
                Test Your Knowledge →
              </button>
            </div>
          </div>
        )}
        
        {/* Quiz View */}
        {currentView === 'quiz' && (
          <div className="card fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ color: '#6a6a8a' }}>Question {quizIndex + 1} of {quizQuestions.length}</span>
              <span style={{ color: '#00ffc8' }}>Score: {quizScore}/{quizIndex + (quizAnswered ? 1 : 0)}</span>
            </div>
            
            <div className="progress-bar" style={{ marginBottom: '24px' }}>
              <div className="progress-fill" style={{ width: `${((quizIndex + (quizAnswered ? 1 : 0)) / quizQuestions.length) * 100}%` }} />
            </div>
            
            <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '24px', lineHeight: 1.5 }}>
              {quizQuestions[quizIndex].question}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {quizQuestions[quizIndex].options.map((option, idx) => (
                <button
                  key={idx}
                  className={`quiz-option ${quizAnswered ? 'answered' : ''} ${quizAnswered && idx === quizQuestions[quizIndex].correct ? 'correct' : ''} ${quizAnswered && idx === selectedAnswer && idx !== quizQuestions[quizIndex].correct ? 'incorrect' : ''}`}
                  onClick={() => handleQuizAnswer(idx)}
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '16px', color: '#e0e0e0' }}
                >
                  {option}
                </button>
              ))}
            </div>
            
            {quizAnswered && (
              <div style={{ marginTop: '24px' }} className="fade-in">
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '10px',
                  background: selectedAnswer === quizQuestions[quizIndex].correct 
                    ? 'rgba(0, 255, 100, 0.1)' 
                    : 'rgba(255, 80, 80, 0.1)',
                  border: `1px solid ${selectedAnswer === quizQuestions[quizIndex].correct ? '#00ff64' : '#ff5050'}`,
                  marginBottom: '20px'
                }}>
                  <div style={{ color: selectedAnswer === quizQuestions[quizIndex].correct ? '#00ff64' : '#ff5050', fontWeight: 600, marginBottom: '8px' }}>
                    {selectedAnswer === quizQuestions[quizIndex].correct ? '✓ Correct!' : '✗ Not quite'}
                  </div>
                  <div style={{ color: '#c0c0d0', lineHeight: 1.6 }}>
                    {quizQuestions[quizIndex].explanation}
                  </div>
                </div>
                <button className="btn" onClick={nextQuestion}>
                  {quizIndex < quizQuestions.length - 1 ? 'Next Question →' : 'See Results →'}
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Quiz Complete View */}
        {currentView === 'quizComplete' && (
          <div className="card fade-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>
              {quizScore >= 7 ? '🏆' : quizScore >= 5 ? '👍' : '📚'}
            </div>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", color: '#fff', marginBottom: '16px' }}>
              Quiz Complete!
            </h2>
            <div style={{ fontSize: '48px', fontFamily: "'DM Sans', sans-serif", color: '#00ffc8', marginBottom: '16px' }}>
              {quizScore}/{quizQuestions.length}
            </div>
            <p style={{ color: '#a0a0b0', marginBottom: '30px' }}>
              {quizScore >= 7 ? 'Excellent! You have a solid understanding!' : 
               quizScore >= 5 ? 'Good work! A bit more practice and you\'ll master it.' :
               'Keep studying the rules and try again!'}
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-secondary btn" onClick={() => setCurrentView('rules')}>Review Rules</button>
              <button className="btn" onClick={() => { setCurrentView('practice'); setCurrentProblem(null); }}>
                Start Practice →
              </button>
            </div>
          </div>
        )}
        
        {/* Practice View */}
        {currentView === 'practice' && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: '16px', padding: '16px' }}>
              <div style={{ marginBottom: '12px', color: '#00ffc8', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Scientific Notation</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button className={`nav-btn ${practiceType === 'toScientific' ? 'active' : ''}`} onClick={() => { setPracticeType('toScientific'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>To Scientific</button>
                <button className={`nav-btn ${practiceType === 'fromScientific' ? 'active' : ''}`} onClick={() => { setPracticeType('fromScientific'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>From Scientific</button>
                <button className={`nav-btn ${practiceType === 'multiplyScientific' ? 'active' : ''}`} onClick={() => { setPracticeType('multiplyScientific'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>Multiply</button>
                <button className={`nav-btn ${practiceType === 'divideScientific' ? 'active' : ''}`} onClick={() => { setPracticeType('divideScientific'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>Divide</button>
                <button className={`nav-btn ${practiceType === 'sciNotationAdd' ? 'active' : ''}`} onClick={() => { setPracticeType('sciNotationAdd'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>Add</button>
                <button className={`nav-btn ${practiceType === 'compareScientific' ? 'active' : ''}`} onClick={() => { setPracticeType('compareScientific'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>Compare</button>
              </div>
              
              <div style={{ marginBottom: '12px', color: '#00ffc8', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Significant Figures</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button className={`nav-btn ${practiceType === 'countSigFigs' ? 'active' : ''}`} onClick={() => { setPracticeType('countSigFigs'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>Count Sig Figs</button>
                <button className={`nav-btn ${practiceType === 'roundSigFigs' ? 'active' : ''}`} onClick={() => { setPracticeType('roundSigFigs'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>Round to Sig Figs</button>
                <button className={`nav-btn ${practiceType === 'multiplySigFigs' ? 'active' : ''}`} onClick={() => { setPracticeType('multiplySigFigs'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>Multiply w/ Sig Figs</button>
                <button className={`nav-btn ${practiceType === 'addSigFigs' ? 'active' : ''}`} onClick={() => { setPracticeType('addSigFigs'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>Add w/ Sig Figs</button>
              </div>
              
              <div style={{ marginBottom: '12px', color: '#00ffc8', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Estimation</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button className={`nav-btn ${practiceType === 'orderMagnitude' ? 'active' : ''}`} onClick={() => { setPracticeType('orderMagnitude'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>Order of Magnitude</button>
              </div>
              
              <div style={{ marginBottom: '12px', color: '#ffc800', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Challenge</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className={`nav-btn ${practiceType === 'mixed' ? 'active' : ''}`} style={practiceType === 'mixed' ? { background: 'rgba(255, 200, 0, 0.2)', borderColor: '#ffc800', color: '#ffc800' } : {}} onClick={() => { setPracticeType('mixed'); setCurrentProblem(null); setFeedback(null); setUserAnswer(''); }}>🎲 Mixed Practice</button>
              </div>
            </div>
            
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ color: '#6a6a8a' }}>
                  Score: <span style={{ color: '#00ffc8' }}>{practiceScore.correct}</span> / {practiceScore.total}
                  {practiceScore.total > 0 && (
                    <span style={{ marginLeft: '12px' }}>
                      ({Math.round((practiceScore.correct / practiceScore.total) * 100)}%)
                    </span>
                  )}
                </div>
                {streak >= 3 && (
                  <div className="streak-badge">
                    🔥 {streak} streak!
                  </div>
                )}
              </div>
              
              {currentProblem && (
                <>
                  <h3 style={{ color: '#fff', fontSize: '22px', marginBottom: '24px', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                    {currentProblem.question}
                  </h3>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <input
                      type="text"
                      className="input-field"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !feedback) checkAnswer(); else if (e.key === 'Enter' && feedback) nextProblem(); }}
                      placeholder={
                        currentProblem.type === 'scientific' ? 'e.g., 3.2 x 10^4' :
                        currentProblem.type === 'sigfigs' ? 'Enter a number' :
                        currentProblem.type === 'compare' ? 'Enter >, <, or =' :
                        currentProblem.type === 'magnitude' ? 'Enter exponent (e.g., 5 for 10^5)' :
                        currentProblem.type === 'rounded' || currentProblem.type === 'number' ? 'Enter your answer' :
                        'e.g., 32000'
                      }
                      disabled={feedback !== null}
                    />
                    <div style={{ color: '#6a6a8a', fontSize: '13px', marginTop: '8px' }}>
                      {currentProblem.type === 'scientific' && 'Format: coefficient x 10^exponent (e.g., 3.2 x 10^4 or 3.2 x 10^-3)'}
                      {currentProblem.type === 'standard' && 'Enter the number in standard form'}
                      {currentProblem.type === 'sigfigs' && 'Enter the count of significant figures'}
                      {currentProblem.type === 'compare' && 'Enter > (greater than), < (less than), or = (equal)'}
                      {currentProblem.type === 'magnitude' && 'Enter just the exponent (e.g., 5 means 10^5, -3 means 10^-3)'}
                      {currentProblem.type === 'rounded' && `Round to exactly ${currentProblem.targetSigFigs} significant figures`}
                      {currentProblem.type === 'number' && 'Enter your calculated answer with correct sig figs'}
                    </div>
                  </div>
                  
                  {!feedback ? (
                    <button className="btn" onClick={checkAnswer}>Check Answer</button>
                  ) : (
                    <div className="fade-in">
                      <div style={{
                        padding: '16px 20px',
                        borderRadius: '10px',
                        background: feedback.correct ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 80, 80, 0.1)',
                        border: `1px solid ${feedback.correct ? '#00ff64' : '#ff5050'}`,
                        marginBottom: '20px'
                      }}>
                        <div style={{ color: feedback.correct ? '#00ff64' : '#ff5050', fontWeight: 600 }}>
                          {feedback.correct ? '✓ Correct!' : `✗ Incorrect. The answer was: ${feedback.correctAnswer}`}
                        </div>
                        {!feedback.correct && feedback.hint && (
                          <div style={{ color: '#a0a0b0', marginTop: '8px', fontSize: '14px' }}>
                            💡 Hint: {feedback.hint}
                          </div>
                        )}
                      </div>
                      <button className="btn" onClick={nextProblem}>Next Problem →</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <footer style={{ textAlign: 'center', marginTop: '40px', color: '#4a4a6a', fontSize: '13px' }}>
          <p>Master scientific notation and significant figures with practice! 🧪</p>
        </footer>
      </div>
    </div>
  );
}
