import { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import API_BASE_URL from '../config/api';


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
        const response = await fetch(`${API_BASE_URL}/api/questions`);
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
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '2.25rem', 
          fontWeight: '700', 
          color: '#f3f4f6',
          marginBottom: '0.5rem'
        }}>
          Welcome back, Student
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#9ca3af' }}>
          {stats.total > 0 
            ? `You've attempted ${stats.total} question${stats.total !== 1 ? 's' : ''}. Keep going!`
            : 'Start practicing to track your progress.'}
        </p>
      </div>

      {stats.total === 0 ? (
        <div style={{ 
          padding: '4rem 2rem', 
          textAlign: 'center', 
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <p style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#f3f4f6', fontWeight: '600' }}>
            No attempts recorded yet
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.9375rem' }}>
            Go to the Practice page to start solving questions!
          </p>
        </div>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '1.5rem', 
            marginBottom: '3rem' 
          }}>
            {/* Overall Accuracy */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                fontSize: '2.5rem',
                opacity: 0.1
              }}>
                🎯
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                color: '#9ca3af',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>
                Overall Accuracy
              </div>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '700',
                color: stats.accuracy >= 70 ? '#22c55e' : stats.accuracy >= 40 ? '#eab308' : '#ef4444',
                marginBottom: '0.5rem',
                lineHeight: 1
              }}>
                {stats.accuracy}%
              </div>
              <div style={{ 
                fontSize: '0.8125rem', 
                color: '#9ca3af'
              }}>
                {stats.accuracy >= 70 ? '🎉 Excellent performance!' : stats.accuracy >= 40 ? '📈 Keep improving!' : '💪 Practice more!'}
              </div>
            </div>

            {/* Questions Solved */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                fontSize: '2.5rem',
                opacity: 0.1
              }}>
                ✅
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                color: '#9ca3af',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>
                Questions Solved
              </div>
              <div style={{ 
                fontSize: '3rem', 
                fontWeight: '700',
                color: '#4b8aaf',
                marginBottom: '0.5rem',
                lineHeight: 1
              }}>
                {stats.total}
              </div>
              <div style={{ 
                fontSize: '0.8125rem', 
                color: '#9ca3af'
              }}>
                Total lifetime
              </div>
            </div>

            {/* Correct / Incorrect */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              padding: '2rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                fontSize: '2.5rem',
                opacity: 0.1
              }}>
                📊
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                textTransform: 'uppercase', 
                letterSpacing: '0.05em',
                color: '#9ca3af',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>
                Score Breakdown
              </div>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: '700',
                marginBottom: '0.5rem',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ color: '#22c55e' }}>{stats.correct}</span>
                <span style={{ color: '#6b7280', fontSize: '1.5rem' }}>/</span>
                <span style={{ color: '#ef4444' }}>{stats.incorrect}</span>
              </div>
              <div style={{ 
                fontSize: '0.8125rem', 
                color: '#9ca3af'
              }}>
                Correct / Incorrect
              </div>
            </div>
          </div>

          {/* Performance by Subject */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700',
              color: '#f3f4f6',
              marginBottom: '0.5rem'
            }}>
              Performance by Subject
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '1.5rem' }}>
              Mastery levels across core ECE modules
            </p>
          </div>

          <div style={{ 
            background: 'rgba(255, 255, 255, 0.03)', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            padding: '2rem',
            overflowX: 'auto'
          }}>
            {stats.bySubject.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                No subject data available yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {stats.bySubject.map(s => (
                  <div key={s.id}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600',
                          color: '#f3f4f6',
                          marginBottom: '0.25rem'
                        }}>
                          {s.name}
                        </div>
                        <div style={{ 
                          fontSize: '0.75rem', 
                          color: '#9ca3af'
                        }}>
                          {s.correct} / {s.total} questions correct
                        </div>
                      </div>
                      <div style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: '700',
                        color: s.accuracy >= 70 ? '#22c55e' : s.accuracy >= 40 ? '#eab308' : '#ef4444'
                      }}>
                        {s.accuracy}%
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div style={{ 
                      width: '100%', 
                      height: '0.5rem', 
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${s.accuracy}%`, 
                        height: '100%',
                        background: s.accuracy >= 70 
                          ? 'linear-gradient(90deg, #22c55e, #16a34a)' 
                          : s.accuracy >= 40 
                            ? 'linear-gradient(90deg, #eab308, #ca8a04)'
                            : 'linear-gradient(90deg, #ef4444, #dc2626)',
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

}
