import { useState } from 'react';
import { storage } from '../../services/storage';
import { API_BASE_URL } from '../../config/api';


export default function AddQuestion() {
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    subjectId: '',
    topicId: '',
    marks: 1,
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    solutionText: ''
  });

  const [subjects] = useState(storage.getSubjects());
  const [topics, setTopics] = useState([]);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubjectChange = (e) => {
    const subId = e.target.value;
    setFormData(prev => ({ ...prev, subjectId: subId, topicId: '' }));
    setTopics(storage.getTopics(subId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!formData.questionText || !formData.optionA || !formData.optionB) {
      setStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save question');
      }

      setStatus({ type: 'success', message: 'Question saved successfully!' });
      // Reset form
      setFormData(prev => ({
        ...prev,
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        solutionText: ''
      }));

    } catch (err) {
      console.error('Error saving question:', err);
      setStatus({ type: 'error', message: err.message || 'Failed to save question' });
    }
  };

  return (
    <div className="add-question-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.875rem', color: '#9ca3af', marginBottom: '0.5rem' }}>
          Question Bank › Add New Question
        </div>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '700', 
          color: '#f3f4f6'
        }}>
          New Question Entry
        </h1>
      </div>

      {status.message && (
        <div style={{ 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginBottom: '2rem',
          background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          color: status.type === 'error' ? '#fca5a5' : '#86efac',
          border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span>{status.type === 'error' ? '⚠️' : '✅'}</span>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Question Metadata */}
        <div className="form-section">
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: '#4b8aaf', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📁 Question Metadata
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Subject Area
              </label>
              <select 
                value={formData.subjectId} 
                onChange={handleSubjectChange} 
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#f3f4f6',
                  fontSize: '0.9375rem'
                }}
              >
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Specific Topic
              </label>
              <select 
                value={formData.topicId} 
                onChange={e => setFormData({...formData, topicId: e.target.value})}
                disabled={!formData.subjectId}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#f3f4f6',
                  fontSize: '0.9375rem',
                  opacity: !formData.subjectId ? 0.5 : 1
                }}
              >
                <option value="">Select Topic</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Exam Year
              </label>
              <input 
                type="number" 
                value={formData.year} 
                onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#f3f4f6',
                  fontSize: '0.9375rem'
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Difficulty / Marks
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2].map(mark => (
                  <button
                    key={mark}
                    type="button"
                    onClick={() => setFormData({...formData, marks: mark})}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: formData.marks === mark ? 'rgba(75, 138, 175, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                      border: `1px solid ${formData.marks === mark ? '#4b8aaf' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '0.5rem',
                      color: formData.marks === mark ? '#4b8aaf' : '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    {mark} Mark{mark > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Problem Statement */}
        <div className="form-section">
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: '#4b8aaf', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📄 Problem Statement
          </div>
          
          <div className="form-group">
            <textarea 
              rows={6}
              value={formData.questionText}
              onChange={e => setFormData({...formData, questionText: e.target.value})}
              required
              placeholder="Enter question text here... Support for Markdown enabled."
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: '#f3f4f6',
                fontSize: '1rem',
                lineHeight: '1.6',
                resize: 'vertical',
                fontFamily: 'monospace'
              }}
            />
            <div style={{ textAlign: 'right', marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
              Markdown Supported
            </div>
          </div>
        </div>

        {/* Section 3: Multiple Choice Options */}
        <div className="form-section">
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#4b8aaf', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ✅ Multiple Choice Options
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#4b8aaf', 
              background: 'rgba(75, 138, 175, 0.1)',
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              fontWeight: '600'
            }}>
              Single Correct Answer
            </div>
          </div>

          <div className="options-grid">
            {['A', 'B', 'C', 'D'].map(opt => (
              <div key={opt} style={{ 
                background: 'rgba(0, 0, 0, 0.2)', 
                border: formData.correctOption === opt ? '1px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.1)', 
                borderRadius: '0.5rem',
                padding: '1rem',
                display: 'flex',
                gap: '1rem',
                transition: 'border-color 0.2s'
              }}>
                <div style={{ paddingTop: '0.5rem' }}>
                  <input 
                    type="radio"
                    name="correctOption"
                    value={opt}
                    checked={formData.correctOption === opt}
                    onChange={e => setFormData({...formData, correctOption: e.target.value})}
                    style={{ 
                      width: '1.25rem', 
                      height: '1.25rem',
                      cursor: 'pointer',
                      accentColor: '#22c55e'
                    }}
                    title="Mark as correct answer"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: formData.correctOption === opt ? '#22c55e' : '#9ca3af', 
                    fontWeight: '700', 
                    marginBottom: '0.5rem' 
                  }}>
                    Option {opt} {formData.correctOption === opt && '(Correct Answer)'}
                  </div>
                  <textarea 
                    rows={2}
                    value={formData[`option${opt}`]}
                    onChange={e => setFormData({...formData, [`option${opt}`]: e.target.value})}
                    required
                    placeholder={`Enter content for option ${opt}...`}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: '#f3f4f6',
                      fontSize: '0.9375rem',
                      resize: 'none',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Detailed Solution */}
        <div className="form-section">
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: '#4b8aaf', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            💡 Detailed Solution
          </div>
          
          <div className="form-group">
            <textarea 
              rows={4}
              value={formData.solutionText}
              onChange={e => setFormData({...formData, solutionText: e.target.value})}
              placeholder="Explain the derivation and step-by-step logic here..."
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.5rem',
                color: '#f3f4f6',
                fontSize: '0.9375rem',
                lineHeight: '1.6',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            type="button"
            onClick={() => window.history.back()}
            style={{ 
              padding: '0.75rem 1.5rem',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.5rem',
              color: '#9ca3af',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            style={{ 
              padding: '0.75rem 2rem',
              background: '#4b8aaf',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '0.9375rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            Save Question
          </button>
        </div>
      </form>
    </div>
  );

}
