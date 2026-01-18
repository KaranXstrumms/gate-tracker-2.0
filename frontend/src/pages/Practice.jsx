import { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import API_BASE_URL from '../config/api';


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
  
  // Navigation State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [visitedQuestions, setVisitedQuestions] = useState(new Set());
  const [markedForReview, setMarkedForReview] = useState(new Set());
  
  // Timer State
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Start timer when topic is selected
  useEffect(() => {
    if (selectedTopic) {
      setTimerActive(true);
      setElapsedTime(0);
    } else {
      setTimerActive(false);
    }
  }, [selectedTopic]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/questions`);
        
        if (!response.ok) {
           const text = await response.text();
           throw new Error(`Failed to fetch: ${text.slice(0, 100)}`);
        }
        
        const data = await response.json();
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
      <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: '500' }}>Loading questions from database...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600' }}>Unable to load questions</div>
        <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>{error}</div>
      </div>
    );
  }

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

    // Subject icon mapping
    const subjectIcons = {
      'signals': '📡',
      'digital': '💻',
      'network': '⚡',
      'control': '🎛️',
      'electronic': '🔌',
      'electromagnetics': '🧲',
      'mathematics': '∑',
      'aptitude': '💡',
      'communication': '📶',
      'analog': '📊'
    };

    const getSubjectIcon = (subjectName) => {
      const lowerName = subjectName.toLowerCase();
      for (const [key, icon] of Object.entries(subjectIcons)) {
        if (lowerName.includes(key)) return icon;
      }
      return '📚'; // Default icon
    };
    
    return (
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '2.25rem', 
            fontWeight: '700',
            color: '#f3f4f6',
            marginBottom: '0.5rem'
          }}>
            Subject Selection
          </h1>
          <p style={{ fontSize: '0.9375rem', color: '#9ca3af' }}>
            Master the GATE ECE curriculum, one topic at a time.
          </p>
        </div>

        {availableSubjectKeys.length === 0 ? (
          <div style={{ 
            padding: '4rem 2rem', 
            textAlign: 'center', 
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
            <p style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#f3f4f6', fontWeight: '600' }}>
              No questions available
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.9375rem' }}>
              Add some from Admin to get started.
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {availableSubjectKeys.map(key => {
              const subjectName = getSubjectName(key);
              const questionCount = subjectGroups[key];
              const icon = getSubjectIcon(subjectName);

              return (
                <button 
                  key={key}
                  onClick={() => setSelectedSubject(key)}
                  style={{ 
                    padding: '0',
                    textAlign: 'left', 
                    cursor: 'pointer',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '0.75rem',
                    transition: 'all 0.2s',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = '#4b8aaf';
                    e.currentTarget.style.background = 'rgba(75, 138, 175, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Card Content */}
                  <div style={{ padding: '2rem' }}>
                    {/* Icon */}
                    <div style={{ 
                      width: '3.5rem', 
                      height: '3.5rem', 
                      borderRadius: '0.75rem',
                      background: 'rgba(75, 138, 175, 0.15)',
                      border: '1px solid rgba(75, 138, 175, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                      marginBottom: '1.25rem'
                    }}>
                      {icon}
                    </div>

                    {/* Subject Name */}
                    <h3 style={{ 
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#f3f4f6',
                      marginBottom: '0.5rem',
                      lineHeight: '1.4'
                    }}>
                      {subjectName}
                    </h3>

                    {/* Question Count */}
                    <div style={{ 
                      fontSize: '0.875rem',
                      color: '#9ca3af',
                      marginBottom: '1rem'
                    }}>
                      {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
                    </div>

                    {/* Action Hint */}
                    <div style={{ 
                      fontSize: '0.8125rem',
                      color: '#4b8aaf',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      Start Practice
                      <span style={{ fontSize: '0.75rem' }}>→</span>
                    </div>
                  </div>
                </button>
              );
            })}
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
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <button 
          onClick={() => setSelectedSubject(null)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#9ca3af', 
            cursor: 'pointer', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'color 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.color = '#4b8aaf'}
          onMouseOut={e => e.currentTarget.style.color = '#9ca3af'}
        >
          ← Back to Subjects
        </button>
        <h1 style={{ marginBottom: '2rem', fontSize: '1.875rem', fontWeight: '700' }}>
          <span style={{ color: '#9ca3af' }}>{getSubjectName(selectedSubject)} / </span>
          <span style={{ color: '#f3f4f6' }}>Select Topic</span>
        </h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {availableTopicKeys.map(key => (
            <button 
              key={key}
              onClick={() => {
                setSelectedTopic(key);
                setCurrentQuestionIndex(0);
                setVisitedQuestions(new Set([0]));
              }}
              style={{ 
                padding: '2rem', 
                textAlign: 'left', 
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '0.75rem',
                color: '#f3f4f6',
                fontSize: '1.125rem',
                fontWeight: '600',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = '#4b8aaf';
                e.currentTarget.style.background = 'rgba(75, 138, 175, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {getTopicName(selectedSubject, key)}
              <span style={{ 
                fontSize: '0.875rem', 
                color: '#9ca3af', 
                fontWeight: '500',
                background: 'rgba(75, 138, 175, 0.1)',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px'
              }}>
                {topicGroups[key]} Qs
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Step 3: Question View (GATE CBT Style) ---
  const filteredQuestions = allQuestions.filter(q => 
    normalize(q.subjectId) === selectedSubject && 
    normalize(q.topicId) === selectedTopic
  );

  if (filteredQuestions.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#9ca3af', marginBottom: '1rem' }}>No questions found for this topic.</div>
        <button 
          onClick={() => setSelectedTopic(null)}
          style={{ 
            background: '#4b8aaf', 
            color: '#fff', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '0.5rem', 
            cursor: 'pointer' 
          }}
        >
          Back to Topics
        </button>
      </div>
    );
  }

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const isSubmitted = !!submissions[currentQuestion.id];
  const result = submissions[currentQuestion.id];

  const handleSelect = (option) => {
    if (isSubmitted) return;
    setSelections(prev => ({ ...prev, [currentQuestion.id]: option }));
  };

  const handleSubmit = () => {
    const selectedOption = selections[currentQuestion.id];
    if (!selectedOption) return;

    const isCorrect = selectedOption === currentQuestion.correctOption;
    
    storage.saveAttempt({
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect
    });

    setSubmissions(prev => ({
      ...prev,
      [currentQuestion.id]: {
        isCorrect,
        correctOption: currentQuestion.correctOption
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setVisitedQuestions(prev => new Set([...prev, nextIndex]));
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setVisitedQuestions(prev => new Set([...prev, prevIndex]));
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setVisitedQuestions(prev => new Set([...prev, index]));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex);
      } else {
        newSet.add(currentQuestionIndex);
      }
      return newSet;
    });
  };

  const getQuestionStatus = (index) => {
    const q = filteredQuestions[index];
    if (submissions[q.id]) return 'attempted';
    if (markedForReview.has(index)) return 'marked';
    if (visitedQuestions.has(index)) return 'visited';
    return 'not-visited';
  };

  return (
    <div className="practice-wrapper">
      {/* Main Content Area */}
      <div className="practice-main">
        {/* Header */}
        <div className="practice-header">
          <div className="practice-header-left">
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
              {getSubjectName(selectedSubject)} › {getTopicName(selectedSubject, selectedTopic)}
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#f3f4f6' }}>
              Question {currentQuestionIndex + 1} of {filteredQuestions.length}
            </div>
          </div>
          <div className="practice-header-right">
            {/* Timer */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(45, 212, 191, 0.1)',
              border: '1px solid rgba(45, 212, 191, 0.2)',
              borderRadius: '0.5rem'
            }}>
              <div style={{ fontSize: '1.25rem' }}>⏱️</div>
              <div style={{ 
                fontSize: '1rem', 
                fontWeight: '700', 
                color: '#2dd4bf',
                fontVariantNumeric: 'tabular-nums'
              }}>
                {formatTime(elapsedTime)}
              </div>
            </div>
            <button 
              onClick={() => {
                setSelectedTopic(null);
                setCurrentQuestionIndex(0);
                setVisitedQuestions(new Set());
                setMarkedForReview(new Set());
              }}
              style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                color: '#9ca3af', 
                padding: '0.5rem 1rem', 
                borderRadius: '0.5rem', 
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Exit Practice
            </button>
          </div>
        </div>

        {/* Question Content */}
        <div className="question-container">
          <div className="question-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div>
                <span style={{ 
                  background: 'rgba(75, 138, 175, 0.1)', 
                  color: '#4b8aaf', 
                  fontSize: '0.625rem', 
                  fontWeight: '700', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '0.25rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em',
                  display: 'inline-block'
                }}>
                  MCQ
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Year: {currentQuestion.year}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f3f4f6' }}>
                  Marks: {currentQuestion.marks}
                </div>
              </div>
            </div>

            <div style={{ 
              fontSize: '1.125rem', 
              lineHeight: '1.75', 
              color: '#e5e7eb', 
              marginBottom: '2rem',
              whiteSpace: 'pre-wrap'
            }}>
              {currentQuestion.questionText}
            </div>

            {/* Vertical Radio Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['A', 'B', 'C', 'D'].map(opt => {
                const isSelected = selections[currentQuestion.id] === opt;
                const isCorrectOption = opt === currentQuestion.correctOption;
                let bgColor = 'rgba(255, 255, 255, 0.02)';
                let borderColor = 'rgba(255, 255, 255, 0.1)';
                let textColor = '#e5e7eb';

                if (isSubmitted) {
                  if (isCorrectOption) {
                    bgColor = 'rgba(34, 197, 94, 0.1)';
                    borderColor = '#22c55e';
                    textColor = '#22c55e';
                  } else if (isSelected && !result.isCorrect) {
                    bgColor = 'rgba(239, 68, 68, 0.1)';
                    borderColor = '#ef4444';
                    textColor = '#ef4444';
                  }
                } else if (isSelected) {
                  bgColor = 'rgba(75, 138, 175, 0.1)';
                  borderColor = '#4b8aaf';
                }

                return (
                  <label 
                    key={opt}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem', 
                      padding: '1rem 1.25rem', 
                      background: bgColor,
                      border: `2px solid ${borderColor}`,
                      borderRadius: '0.5rem',
                      cursor: isSubmitted ? 'default' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input 
                      type="radio"
                      name="option"
                      checked={isSelected}
                      onChange={() => handleSelect(opt)}
                      disabled={isSubmitted}
                      style={{ 
                        width: '1.25rem', 
                        height: '1.25rem', 
                        cursor: isSubmitted ? 'default' : 'pointer',
                        accentColor: '#4b8aaf'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: '600', color: textColor, marginRight: '0.5rem' }}>{opt}.</span>
                      <span style={{ color: textColor }}>{currentQuestion[`option${opt}`]}</span>
                    </div>
                    {isSubmitted && isCorrectOption && (
                      <span style={{ color: '#22c55e', fontSize: '1.25rem' }}>✓</span>
                    )}
                    {isSubmitted && isSelected && !result.isCorrect && (
                      <span style={{ color: '#ef4444', fontSize: '1.25rem' }}>✗</span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Result Display */}
            {isSubmitted && (
              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  marginBottom: '1rem',
                  color: result.isCorrect ? '#22c55e' : '#ef4444',
                  fontWeight: '700',
                  fontSize: '1rem'
                }}>
                  {result.isCorrect ? '✓ Correct!' : `✗ Incorrect. Correct Answer: ${currentQuestion.correctOption}`}
                </div>
                {currentQuestion.solutionText && (
                  <div style={{ 
                    background: 'rgba(75, 138, 175, 0.05)', 
                    padding: '1.25rem', 
                    borderRadius: '0.5rem', 
                    border: '1px solid rgba(75, 138, 175, 0.2)'
                  }}>
                    <div style={{ 
                      color: '#4b8aaf', 
                      fontWeight: '700', 
                      fontSize: '0.875rem', 
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Solution
                    </div>
                    <div style={{ color: '#d1d5db', fontSize: '0.9375rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {currentQuestion.solutionText}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="practice-footer">
          <div className="nav-group">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              style={{
                padding: '0.75rem 1.5rem',
                background: currentQuestionIndex === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: currentQuestionIndex === 0 ? '#6b7280' : '#f3f4f6',
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              ← Previous
            </button>
            <button
              onClick={toggleMarkForReview}
              style={{
                padding: '0.75rem 1.5rem',
                background: markedForReview.has(currentQuestionIndex) ? 'rgba(251, 146, 60, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${markedForReview.has(currentQuestionIndex) ? '#fb923c' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '0.5rem',
                color: markedForReview.has(currentQuestionIndex) ? '#fb923c' : '#9ca3af',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}
            >
              {markedForReview.has(currentQuestionIndex) ? '★ Marked' : '☆ Mark for Review'}
            </button>
          </div>

          <div className="nav-group" style={{ justifyContent: 'flex-end', gap: '0.75rem' }}>
            {!isSubmitted && (
              <button
                onClick={handleSubmit}
                disabled={!selections[currentQuestion.id]}
                style={{
                  padding: '0.75rem 2rem',
                  background: selections[currentQuestion.id] ? '#2dd4bf' : 'rgba(45, 212, 191, 0.2)',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: selections[currentQuestion.id] ? '#151a1d' : '#6b7280',
                  cursor: selections[currentQuestion.id] ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  boxShadow: selections[currentQuestion.id] ? '0 2px 8px rgba(45, 212, 191, 0.3)' : 'none'
                }}
              >
                Submit Answer
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === filteredQuestions.length - 1}
              style={{
                padding: '0.75rem 1.5rem',
                background: currentQuestionIndex === filteredQuestions.length - 1 ? 'rgba(255, 255, 255, 0.05)' : '#4b8aaf',
                border: 'none',
                borderRadius: '0.5rem',
                color: currentQuestionIndex === filteredQuestions.length - 1 ? '#6b7280' : '#fff',
                cursor: currentQuestionIndex === filteredQuestions.length - 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '700'
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <div className="practice-sidebar">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#f3f4f6', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Question Palette
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', background: '#22c55e' }}></div>
              <span style={{ color: '#9ca3af' }}>Attempted</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', background: '#3b82f6' }}></div>
              <span style={{ color: '#9ca3af' }}>Visited</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', background: '#fb923c' }}></div>
              <span style={{ color: '#9ca3af' }}>Marked</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '1rem', height: '1rem', borderRadius: '0.25rem', background: 'rgba(255, 255, 255, 0.1)' }}></div>
              <span style={{ color: '#9ca3af' }}>Not Visited</span>
            </div>
          </div>
        </div>

        <div className="palette-grid">
            {filteredQuestions.map((q, index) => {
              const status = getQuestionStatus(index);
              let bgColor = 'rgba(255, 255, 255, 0.05)';
              let borderColor = 'rgba(255, 255, 255, 0.1)';
              
              if (status === 'attempted') {
                bgColor = '#22c55e';
                borderColor = '#22c55e';
              } else if (status === 'marked') {
                bgColor = '#fb923c';
                borderColor = '#fb923c';
              } else if (status === 'visited') {
                bgColor = '#3b82f6';
                borderColor = '#3b82f6';
              }

              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => handleJumpToQuestion(index)}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: bgColor,
                    border: isCurrent ? '2px solid #fff' : `1px solid ${borderColor}`,
                    borderRadius: '0.375rem',
                    color: status === 'not-visited' ? '#9ca3af' : '#fff',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isCurrent ? '0 0 0 3px rgba(255, 255, 255, 0.2)' : 'none'
                  }}
                >
                  {index + 1}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );

}
