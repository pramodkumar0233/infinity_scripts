import React, { useState } from 'react';
import './Math.css';

const MathSolver = () => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const solveExpression = async () => {
    if (!expression.trim()) {
      setResult('❌ Please enter a math expression.');
      return;
    }

    setLoading(true);
    setResult('⏳ Solving...');

    try {
      const response = await fetch('http://localhost:5050/api/mathsolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expression }),
      });

      const data = await response.json();

      if (data.result) {
        setResult(`✅ Result: ${data.result}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setResult('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mathsolver-container">
      <h2> Math Expression Solver</h2>
      <textarea
        className="mathsolver-input"
        placeholder="Enter expression like 23 + 12 + 002 or log(16, 2)"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        disabled={loading}
      />
      <button className="mathsolver-button" onClick={solveExpression} disabled={loading}>
        {loading ? 'Solving...' : 'Solve'}
      </button>
      <div className="mathsolver-result">{result}</div>
    </div>
  );
};

export default MathSolver;
