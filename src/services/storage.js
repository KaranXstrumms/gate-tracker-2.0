const STORAGE_KEYS = {
  QUESTIONS: 'gate_questions',
  ATTEMPTS: 'gate_attempts'
};

const MOCK_SUBJECTS = [
  { id: 'signals', name: 'Signals and Systems', code: 'EC-SS' },
  { id: 'networks', name: 'Network Theory', code: 'EC-NT' },
  { id: 'emft', name: 'Electromagnetics', code: 'EC-EMFT' },
  { id: 'digital', name: 'Digital Circuits', code: 'EC-DC' },
  { id: 'control', name: 'Control Systems', code: 'EC-CS' },
  { id: 'analog', name: 'Analog Circuits', code: 'EC-AC' },
  { id: 'comms', name: 'Communications', code: 'EC-CM' },
  { id: 'edo', name: 'Electronic Devices', code: 'EC-ED' }
];

const MOCK_TOPICS = {
  'signals': [
    { id: 'basics', name: 'Basics of Signals' },
    { id: 'lti', name: 'LTI Systems' },
    { id: 'fourier', name: 'Fourier Series & Transform' },
    { id: 'laplace', name: 'Laplace Transform' },
    { id: 'z-transform', name: 'Z-Transform' }
  ],
  'networks': [
    { id: 'basics-kcl-kvl', name: 'KCL, KVL & Nodal/Mesh' },
    { id: 'theorems', name: 'Network Theorems' },
    { id: 'transients', name: 'Transient Analysis' },
    { id: 'ac-analysis', name: 'Sinusoidal Steady State' },
    { id: 'two-port', name: 'Two Port Networks' }
  ]
};

export const storage = {
  getSubjects: () => MOCK_SUBJECTS,
  
  getTopics: (subjectId) => MOCK_TOPICS[subjectId] || [],
  
  // v1.0: Questions are sourced from backend API, not localStorage
  // saveQuestion, getQuestions, deleteQuestion removed
  
  saveAttempt: (attempt) => {
    const attempts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '[]');
    const newAttempt = {
      ...attempt,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    attempts.push(newAttempt);
    localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
    return newAttempt;
  },

  getAttempts: () => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTEMPTS) || '[]');
  }
};
