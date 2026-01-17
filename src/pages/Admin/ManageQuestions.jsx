import { useState, useEffect } from 'react';
import { storage } from '../../services/storage';
import { Link } from 'react-router-dom';

export default function ManageQuestions() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [subjects] = useState(storage.getSubjects());
  
  // Filter State
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filtering Logic
  const filteredQuestions = allQuestions.filter(q => {
    const matchSubject = selectedSubject ? normalize(q.subjectId) === selectedSubject : true;
    const matchTopic = selectedTopic ? normalize(q.topicId) === selectedTopic : true;
    const matchSearch = searchQuery 
      ? q.questionText?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.id?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchSubject && matchTopic && matchSearch;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
            Admin Portal / Question Bank
          </div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '700', 
            color: '#f3f4f6'
          }}>
            Manage Questions
          </h1>
        </div>
        <Link 
          to="/admin/add-question" 
          style={{ 
            padding: '0.75rem 1.5rem',
            background: '#4b8aaf',
            color: '#fff',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.9375rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <span>＋</span> Create New Question
        </Link>
      </div>

      {/* Filters Bar */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.03)', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ flex: 2, minWidth: '250px', position: 'relative' }}>
          <span style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#9ca3af' 
          }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search by keyword or ID..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              background: 'rgba(0, 0, 0, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              color: '#f3f4f6',
              fontSize: '0.9375rem'
            }}
          />
        </div>

        {/* Subject Filter */}
        <select 
          value={selectedSubject} 
          onChange={e => {
            setSelectedSubject(e.target.value);
            setSelectedTopic('');
          }}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.75rem',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem',
            color: '#f3f4f6',
            fontSize: '0.9375rem'
          }}
        >
          <option value="">Subject: All</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {/* Topic Filter */}
        <select 
          value={selectedTopic} 
          onChange={e => setSelectedTopic(e.target.value)}
          disabled={!selectedSubject}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '0.75rem',
            background: 'rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem',
            color: '#f3f4f6',
            fontSize: '0.9375rem',
            opacity: !selectedSubject ? 0.5 : 1
          }}
        >
          <option value="">Topic: All</option>
          {selectedSubject && (storage.getTopics(selectedSubject) || []).map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        
        {/* Reset Button */}
        <button 
          onClick={() => {
            setSelectedSubject('');
            setSelectedTopic('');
            setSearchQuery('');
          }}
          title="Reset Filters"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            color: '#9ca3af',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={e => {
            e.currentTarget.style.color = '#f3f4f6';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.color = '#9ca3af';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
        >
          ↻
        </button>
      </div>

      {/* Questions List */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.03)', 
        border: '1px solid rgba(255, 255, 255, 0.1)', 
        borderRadius: '0.75rem',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '80px 180px 1fr 100px 100px', 
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.2)',
          fontSize: '0.75rem',
          fontWeight: '700',
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <div>ID</div>
          <div>Subject</div>
          <div>Question Preview</div>
          <div>Level</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>

        {/* Table Body */}
        {filteredQuestions.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
            No questions found matching your filters.
          </div>
        ) : (
          <div>
            {filteredQuestions.map(q => {
              const subjectName = getSubjectName(normalize(q.subjectId));
              const topicName = getTopicName(normalize(q.subjectId), normalize(q.topicId));
              
              return (
                <div key={q.id} style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '80px 180px 1fr 100px 100px', 
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  alignItems: 'center',
                  transition: 'background 0.2s',
                  fontSize: '0.9375rem'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                    #{q.id.slice(-4)}
                  </div>
                  
                  <div style={{ paddingRight: '1rem' }}>
                    <div style={{ 
                      display: 'inline-block',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#f3f4f6',
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}>
                      {subjectName}
                    </div>
                  </div>

                  <div style={{ paddingRight: '1rem' }}>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#f3f4f6', 
                      marginBottom: '0.25rem'
                    }}>
                      {topicName}
                    </div>
                    <div style={{ 
                      color: '#9ca3af', 
                      fontSize: '0.875rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '90%'
                    }}>
                      {q.questionText}
                    </div>
                  </div>

                  <div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '700',
                      color: q.marks === 2 ? '#ef4444' : '#22c55e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span style={{ 
                        width: '6px', 
                        height: '6px', 
                        borderRadius: '50%', 
                        background: q.marks === 2 ? '#ef4444' : '#22c55e' 
                      }}></span>
                      {q.marks === 2 ? 'HARD' : 'EASY'}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(q.id)}
                      title="Delete Question"
                      style={{ 
                        background: 'transparent', 
                        border: 'none',
                        color: '#ef4444', 
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '0.25rem',
                        transition: 'background 0.2s',
                        fontSize: '1rem'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '1.5rem', 
        textAlign: 'center', 
        color: '#6b7280', 
        fontSize: '0.875rem' 
      }}>
        Showing {filteredQuestions.length} of {allQuestions.length} questions
      </div>
    </div>
  );

}
