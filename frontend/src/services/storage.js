const STORAGE_KEYS = {
  QUESTIONS: 'gate_questions',
  ATTEMPTS: 'gate_attempts'
};

const MOCK_SUBJECTS = [
  { id: 'math', name: 'Engineering Mathematics', code: 'EC-EM' },
  { id: 'signals', name: 'Signals & Systems', code: 'EC-SS' },
  { id: 'networks', name: 'Network Theory', code: 'EC-NT' },
  { id: 'edo', name: 'Electronic Devices', code: 'EC-ED' },
  { id: 'analog', name: 'Analog Circuits', code: 'EC-AC' },
  { id: 'digital', name: 'Digital Circuits', code: 'EC-DC' },
  { id: 'control', name: 'Control Systems', code: 'EC-CS' },
  { id: 'comms', name: 'Communications', code: 'EC-CM' },
  { id: 'emft', name: 'Electromagnetics', code: 'EC-EMFT' },
  { id: 'aptitude', name: 'General Aptitude', code: 'EC-GA' }
];

const MOCK_TOPICS = {
  'math': [
    { id: 'linear-algebra', name: 'Linear Algebra' },
    { id: 'calculus', name: 'Calculus' },
    { id: 'diff-eq', name: 'Differential Equations' },
    { id: 'prob-stats', name: 'Probability and Statistics' },
    { id: 'numerical', name: 'Numerical Methods' }
  ],
  'networks': [
    { id: 'theorems', name: 'Network Theorems' },
    { id: 'transients', name: 'Transient Analysis' },
    { id: 'ac-analysis', name: 'Sinusoidal Steady State Analysis' },
    { id: 'two-port', name: 'Two Port Networks' },
    { id: 'graph-theory', name: 'Network Graphs' }
  ],
  'signals': [
    { id: 'basics', name: 'Basics of Signals & Systems' },
    { id: 'lti', name: 'LTI Systems' },
    { id: 'fourier-series', name: 'Fourier Series' },
    { id: 'fourier-transform', name: 'Fourier Transform' },
    { id: 'laplace', name: 'Laplace Transform' },
    { id: 'z-transform', name: 'Z-Transform' }
  ],
  'edo': [
    { id: 'semiconductors', name: 'Semiconductor Physics' },
    { id: 'pn-junction', name: 'PN Junction Diode' },
    { id: 'bjt', name: 'Bipolar Junction Transistor (BJT)' },
    { id: 'mosfet', name: 'MOSFET' },
    { id: 'special-diodes', name: 'Special Diodes & Optoelectronics' }
  ],
  'analog': [
    { id: 'diode-circuits', name: 'Diode Circuits & Rectifiers' },
    { id: 'bjt-biasing', name: 'BJT Biasing & Amplifiers' },
    { id: 'mosfet-biasing', name: 'MOSFET Biasing & Amplifiers' },
    { id: 'opamp', name: 'Operational Amplifiers' },
    { id: 'opamp-apps', name: 'Op-Amp Applications' },
    { id: 'freq-response', name: 'Frequency Response of Amplifiers' },
    { id: 'feedback', name: 'Feedback Amplifiers' },
    { id: 'oscillators', name: 'Oscillators' },
    { id: 'filters', name: 'Filters' }
  ],
  'digital': [
    { id: 'number-systems', name: 'Number Systems' },
    { id: 'boolean', name: 'Boolean Algebra & K-Maps' },
    { id: 'logic-gates', name: 'Logic Gates' },
    { id: 'combinational', name: 'Combinational Circuits' },
    { id: 'sequential', name: 'Sequential Circuits' },
    { id: 'flip-flops', name: 'Flip-Flops & Latches' },
    { id: 'counters', name: 'Counters and Registers' },
    { id: 'data-converters', name: 'ADC and DAC' },
    { id: 'logic-families', name: 'Logic Families' }
  ],
  'control': [
    { id: 'modeling', name: 'Mathematical Modeling' },
    { id: 'block-diagram', name: 'Block Diagram & Signal Flow' },
    { id: 'time-response', name: 'Time Response Analysis' },
    { id: 'stability', name: 'Stability Analysis (Routh-Hurwitz)' },
    { id: 'root-locus', name: 'Root Locus' },
    { id: 'bode-plot', name: 'Bode Plot' },
    { id: 'nyquist', name: 'Nyquist Plot & Polar Plot' },
    { id: 'state-space', name: 'State Space Analysis' },
    { id: 'controllers', name: 'Compensators & Controllers' }
  ],
  'comms': [
    { id: 'analog-comm', name: 'Analog Communication (AM/FM/PM)' },
    { id: 'random-process', name: 'Random Processes' },
    { id: 'digital-comm', name: 'Digital Communication (PCM/DPCM/DM)' },
    { id: 'modulation', name: 'Digital Modulation (ASK/FSK/PSK/QAM)' },
    { id: 'info-theory', name: 'Information Theory' },
    { id: 'coding', name: 'Error Control Coding' }
  ],
  'emft': [
    { id: 'vector-calc', name: 'Vector Calculus' },
    { id: 'electrostatics', name: 'Electrostatics' },
    { id: 'magnetostatics', name: 'Magnetostatics' },
    { id: 'maxwell', name: 'Maxwell’s Equations' },
    { id: 'plane-waves', name: 'Plane Waves' },
    { id: 'transmission-lines', name: 'Transmission Lines' },
    { id: 'waveguides', name: 'Waveguides' },
    { id: 'antennas', name: 'Antennas' }
  ],
  'aptitude': [
    { id: 'verbal', name: 'Verbal Ability' },
    { id: 'numerical', name: 'Numerical Ability' },
    { id: 'logical', name: 'Logical Reasoning' },
    { id: 'data-interpretation', name: 'Data Interpretation' }
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
