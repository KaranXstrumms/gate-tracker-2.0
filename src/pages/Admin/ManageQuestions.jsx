import { useState, useEffect } from 'react';
import { storage } from '../../services/storage';

export default function ManageQuestions() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [subjects] = useState(storage.getSubjects());
  
  // Selection State
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // v1.0: Questions are sourced from backend API, not localStorage
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/questions');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const mappedQuestions = data.map(q => ({ ...q, id: q._id }));
        setAllQuestions(mappedQuestions);
      } catch (err) {
        console.error('Error fetching questions:', err);
        setAllQuestions([]);
      }
    };
    fetchQuestions();
  }, []);

  const normalize = (str) => String(str || '').trim().toLowerCase();

  const getSubjectName = (normalizedId) => {
    const match = subjects.find(s => normalize(s.id) === normalizedId);
    return match ? match.name : normalizedId;
  };

  const getTopicName = (normalizedSubId, normalizedTopicId) => {
    const subMatch = subjects.find(s => normalize(s.id) === normalizedSubId);
    const topics = subMatch ? (storage.getTopics(subMatch.id) || []) : [];
    const topicMatch = topics.find(t => normalize(t.id) === normalizedTopicId);
    return topicMatch ? topicMatch.name : normalizedTopicId;
  };

  // v1.0: Delete via backend API
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question? This cannot be undone.')) {
      try {
        const response = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Delete failed');
        setAllQuestions(prev => prev.filter(q => q.id !== id));
      } catch (err) {
        console.error('Error deleting question:', err);
        alert('Failed to delete question');
      }
    }
  };

  // --- Step 1: Subject Selection ---
  if (!selectedSubject) {
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
        <h1 style={{ marginBottom: '2rem', fontSize: '2rem', color: '#ef4444' }}>
          Manage Questions (Delete)
        </h1>
        {availableSubjectKeys.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
             No questions found.
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
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
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
    const subjectQuestions = allQuestions.filter(q => normalize(q.subjectId) === selectedSubject);
    
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
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem' }}
        >
          &larr; Back to Subjects
        </button>
        <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{getSubjectName(selectedSubject)} / </span>
          Select Topic to Manage
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
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

  // --- Step 3: Question List with Delete ---
  const filteredQuestions = allQuestions.filter(q => 
    normalize(q.subjectId) === selectedSubject && 
    normalize(q.topicId) === selectedTopic
  );

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <button 
        onClick={() => setSelectedTopic(null)}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem' }}
      >
        &larr; Back to Topics
      </button>

      <h1 style={{ marginBottom: '2rem', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
        Manage: {getSubjectName(selectedSubject)} &rsaquo; <span style={{ color: 'var(--text-primary)' }}>{getTopicName(selectedSubject, selectedTopic)}</span>
      </h1>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {filteredQuestions.map((q, index) => (
          <div key={q.id || index} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                {q.year} &bull; {q.marks} Mark{q.marks > 1 ? 's' : ''}
              </span>
              <button 
                onClick={() => handleDelete(q.id)}
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  color: '#ef4444', 
                  border: '1px solid #ef4444',
                  borderRadius: '0.25rem',
                  padding: '0.25rem 0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}
              >
                Delete
              </button>
            </div>
            
            <div style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
              {q.questionText}
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
               Correct: Option {q.correctOption}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
