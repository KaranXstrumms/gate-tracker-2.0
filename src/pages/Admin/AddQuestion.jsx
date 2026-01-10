import { useState } from 'react';
import { storage } from '../../services/storage';

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
      const response = await fetch("/api/questions", {
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
    <div className="container" style={{ padding: '2rem 0' }}>
      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem', fontSize: '1.8rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Add New Question
        </h1>

        {status.message && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            background: status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            color: status.type === 'error' ? '#fca5a5' : '#86efac',
            border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)'}`
          }}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Year</label>
              <input 
                type="number" 
                value={formData.year} 
                onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} 
              />
            </div>
            <div className="form-group">
              <label>Marks</label>
              <select 
                value={formData.marks} 
                onChange={e => setFormData({...formData, marks: parseInt(e.target.value)})}
              >
                <option value={1}>1 Mark</option>
                <option value={2}>2 Marks</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Subject</label>
              <select value={formData.subjectId} onChange={handleSubjectChange} required>
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Topic</label>
              <select 
                value={formData.topicId} 
                onChange={e => setFormData({...formData, topicId: e.target.value})}
                disabled={!formData.subjectId}
              >
                <option value="">Select Topic</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Question Text (Markdown supported)</label>
            <textarea 
              rows={4}
              value={formData.questionText}
              onChange={e => setFormData({...formData, questionText: e.target.value})}
              required
              placeholder="Enter the question here..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {['A', 'B', 'C', 'D'].map(opt => (
              <div key={opt} className="form-group">
                <label>Option {opt}</label>
                <textarea 
                  rows={2}
                  value={formData[`option${opt}`]}
                  onChange={e => setFormData({...formData, [`option${opt}`]: e.target.value})}
                  required
                />
              </div>
            ))}
          </div>

          <div className="form-group">
            <label>Correct Answer</label>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              {['A', 'B', 'C', 'D'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  <input 
                    type="radio" 
                    name="correctOption" 
                    value={opt}
                    checked={formData.correctOption === opt}
                    onChange={e => setFormData({...formData, correctOption: e.target.value})}
                    style={{ width: 'auto' }}
                  />
                  Option {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Solution / Explanation</label>
            <textarea 
              rows={4}
              value={formData.solutionText}
              onChange={e => setFormData({...formData, solutionText: e.target.value})}
              placeholder="Explain the solution..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '150px' }}>
              Save Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
