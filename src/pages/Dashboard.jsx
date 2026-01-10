import { useState, useEffect } from 'react';
import { storage } from '../services/storage';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    incorrect: 0,
    accuracy: 0,
    bySubject: []
  });

  // v1.0: Questions are sourced from backend API, not localStorage
  useEffect(() => {
    const fetchData = async () => {
      const attempts = storage.getAttempts();
      const subjects = storage.getSubjects();

      if (attempts.length === 0) return;

      // Fetch questions from API
      let questions = [];
      try {
        const response = await fetch('/api/questions');
        if (response.ok) {
          const data = await response.json();
          questions = data.map(q => ({ ...q, id: q._id }));
        }
      } catch (err) {
        console.error('Error fetching questions for dashboard:', err);
      }

      // Calculate Global Stats
      const total = attempts.length;
      const correct = attempts.filter(a => a.isCorrect).length;
      const incorrect = total - correct;
      const accuracy = Math.round((correct / total) * 100);

      // Calculate Subject Stats
      // Map questionId -> subjectId
      const qMap = {};
      questions.forEach(q => {
        qMap[q.id] = q.subjectId;
      });

      const subjectStats = {}; // { subjectId: { total, correct } }
      
      attempts.forEach(a => {
        const subId = qMap[a.questionId];
        if (!subId) return;

        if (!subjectStats[subId]) {
          subjectStats[subId] = { total: 0, correct: 0 };
        }
        subjectStats[subId].total += 1;
        if (a.isCorrect) subjectStats[subId].correct += 1;
      });

      const bySubject = Object.entries(subjectStats).map(([subId, s]) => {
        const subjectName = subjects.find(sub => sub.id === subId)?.name || subId;
        return {
          id: subId,
          name: subjectName,
          total: s.total,
          correct: s.correct,
          accuracy: Math.round((s.correct / s.total) * 100)
        };
      }).sort((a, b) => b.total - a.total);

      setStats({ total, correct, incorrect, accuracy, bySubject });
    };

    fetchData();
  }, []);

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Performance Dashboard
      </h1>

      {stats.total === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No attempts recorded yet.</p>
          <p>Go to the Practice page to start solving questions!</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Attempts</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>{stats.total}</div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Accuracy</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: stats.accuracy >= 70 ? '#22c55e' : stats.accuracy >= 40 ? '#eab308' : '#ef4444' }}>
                {stats.accuracy}%
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Correct / Incorrect</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700' }}>
                <span style={{ color: '#22c55e' }}>{stats.correct}</span>
                <span style={{ margin: '0 0.5rem', color: 'var(--text-secondary)', fontSize: '1.5rem' }}>/</span>
                <span style={{ color: '#ef4444' }}>{stats.incorrect}</span>
              </div>
            </div>
          </div>

          {/* Subject Breakdown */}
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Subject Breakdown</h2>
          <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Subject</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Attempts</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Score</th>
                  <th style={{ textAlign: 'center', padding: '1rem', fontWeight: '600' }}>Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {stats.bySubject.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{s.name}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{s.total}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ color: '#22c55e' }}>{s.correct}</span> / {s.total}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.875rem',
                        background: s.accuracy >= 70 ? 'rgba(34, 197, 94, 0.1)' : s.accuracy >= 40 ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: s.accuracy >= 70 ? '#22c55e' : s.accuracy >= 40 ? '#eab308' : '#ef4444',
                        fontWeight: '600'
                      }}>
                        {s.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
