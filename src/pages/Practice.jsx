import { useState, useEffect } from 'react';
import { storage } from '../services/storage';

export default function Practice() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [subjects] = useState(storage.getSubjects());
  
  // Selection State (Normalized IDs)
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Attempt State
  const [selections, setSelections] = useState({});
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // Use relative URL to leverage Vite proxy
        const response = await fetch('/api/questions');
        
        if (!response.ok) {
           const text = await response.text();
           throw new Error(`Failed to fetch: ${text.slice(0, 100)}`);
        }
        
        const data = await response.json();
        // Map MongoDB _id to frontend id for compatibility
        const mappedQuestions = data.map(q => ({ ...q, id: q._id }));
        
        setAllQuestions(mappedQuestions);
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading questions from database...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '1rem' }}>Unable to load questions</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{error}</div>
      </div>
    );
  }

  const normalize = (str) => String(str || '').trim().toLowerCase();

  const getSubjectName = (normalizedId) => {
    // Try to find a subject that matches the normalized ID
    const match = subjects.find(s => normalize(s.id) === normalizedId);
    return match ? match.name : normalizedId; // Fallback to ID if not found
  };

  const getTopicName = (normalizedSubId, normalizedTopicId) => {
    // Find the original subject ID to look up topics (best effort)
    const subMatch = subjects.find(s => normalize(s.id) === normalizedSubId);
    // If we can't find the subject definition, we can't reliably look up topic names from storage
    // But we can try to guess or just use the ID
    const topics = subMatch ? (storage.getTopics(subMatch.id) || []) : [];
    
    const topicMatch = topics.find(t => normalize(t.id) === normalizedTopicId);
    return topicMatch ? topicMatch.name : normalizedTopicId;
  };

  // --- Step 1: Subject Selection ---
  if (!selectedSubject) {
    // Group questions by normalized subject ID
    const subjectGroups = {};
    allQuestions.forEach(q => {
      const key = normalize(q.subjectId);
      if (!key) return;
      if (!subjectGroups[key]) subjectGroups[key] = 0;
      subjectGroups[key]++;
    });

    const availableSubjectKeys = Object.keys(subjectGroups);
    
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <h1 style={{ marginBottom: '2rem', fontSize: '2rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Select Subject
        </h1>
        {availableSubjectKeys.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
             No questions available. Add some from Admin.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {availableSubjectKeys.map(key => (
              <button 
                key={key}
                className="glass-panel"
                onClick={() => setSelectedSubject(key)}
                style={{ 
                  padding: '2rem', 
                  textAlign: 'left', 
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  transition: 'transform 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                {getSubjectName(key)}
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '400' }}>
                  {subjectGroups[key]} Qs
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Step 2: Topic Selection ---
  if (!selectedTopic) {
    // Filter questions by normalized subject
    const subjectQuestions = allQuestions.filter(q => normalize(q.subjectId) === selectedSubject);
    
    // Group by normalized topic ID
    const topicGroups = {};
    subjectQuestions.forEach(q => {
      const key = normalize(q.topicId);
      if (!key) return;
      if (!topicGroups[key]) topicGroups[key] = 0;
      topicGroups[key]++;
    });

    const availableTopicKeys = Object.keys(topicGroups);

    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <button 
          onClick={() => setSelectedSubject(null)}
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          &larr; Back to Subjects
        </button>
        <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{getSubjectName(selectedSubject)} / </span>
          Select Topic
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {availableTopicKeys.map(key => (
            <button 
              key={key}
              className="glass-panel"
              onClick={() => setSelectedTopic(key)}
              style={{ 
                padding: '2rem', 
                textAlign: 'left', 
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '1.1rem',
                fontWeight: '600',
                transition: 'transform 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              {getTopicName(selectedSubject, key)}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '400' }}>
                {topicGroups[key]} Qs
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Step 3: Question List ---
  const filteredQuestions = allQuestions.filter(q => 
    normalize(q.subjectId) === selectedSubject && 
    normalize(q.topicId) === selectedTopic
  );

  const handleSelect = (questionId, option) => {
    if (submissions[questionId]) return;
    setSelections(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = (question) => {
    const selectedOption = selections[question.id];
    if (!selectedOption) return;

    const isCorrect = selectedOption === question.correctOption;
    
    storage.saveAttempt({
      questionId: question.id,
      selectedOption,
      isCorrect
    });

    setSubmissions(prev => ({
      ...prev,
      [question.id]: {
        isCorrect,
        correctOption: question.correctOption
      }
    }));
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <button 
        onClick={() => setSelectedTopic(null)}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
      >
        &larr; Back to Topics
      </button>

      <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
        {getSubjectName(selectedSubject)} &rsaquo; <span style={{ color: 'var(--text-primary)' }}>{getTopicName(selectedSubject, selectedTopic)}</span>
      </h1>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {filteredQuestions.map((q, index) => {
          const isSubmitted = !!submissions[q.id];
          const result = submissions[q.id];
          
          return (
            <div key={q.id || index} className="glass-panel" style={{ padding: '1.5rem', border: result ? (result.isCorrect ? '1px solid #22c55e' : '1px solid #ef4444') : 'var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                  ID: {index + 1} &bull; {q.year}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {q.marks} Mark{q.marks > 1 ? 's' : ''}
                </span>
              </div>
              
              <div style={{ marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                {q.questionText}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {['A', 'B', 'C', 'D'].map(opt => {
                  const isSelected = selections[q.id] === opt;
                  let bgColor = 'var(--bg-primary)';
                  let borderColor = 'var(--border-color)';

                  if (isSubmitted) {
                    if (opt === q.correctOption) {
                      bgColor = 'rgba(34, 197, 94, 0.1)';
                      borderColor = '#22c55e';
                    } else if (isSelected && !result.isCorrect) {
                      bgColor = 'rgba(239, 68, 68, 0.1)';
                      borderColor = '#ef4444';
                    }
                  } else if (isSelected) {
                    borderColor = 'var(--accent-primary)';
                    bgColor = 'rgba(59, 130, 246, 0.1)';
                  }

                  return (
                    <div 
                      key={opt} 
                      onClick={() => handleSelect(q.id, opt)}
                      style={{ 
                        padding: '0.75rem', 
                        background: bgColor, 
                        borderRadius: '0.5rem',
                        border: `1px solid ${borderColor}`,
                        display: 'flex',
                        gap: '0.5rem',
                        cursor: isSubmitted ? 'default' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{opt}.</span>
                      <span>{q[`option${opt}`]}</span>
                    </div>
                  );
                })}
              </div>
              
              {!isSubmitted ? (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', opacity: selections[q.id] ? 1 : 0.5, pointerEvents: selections[q.id] ? 'auto' : 'none' }}
                    onClick={() => handleSubmit(q)}
                  >
                    Submit Answer
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ fontWeight: '600', color: result.isCorrect ? '#22c55e' : '#ef4444', marginBottom: '0.5rem' }}>
                    {result.isCorrect ? 'Correct!' : `Incorrect. Correct Option: ${q.correctOption}`}
                  </p>
                  {q.solutionText && (
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <strong>Solution:</strong><br/>
                      {q.solutionText}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
