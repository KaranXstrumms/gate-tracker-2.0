# GATE ECE Tracker 2.0

**v1.0 – Stable Release**

A full-stack web application for GATE ECE (Electronics and Communication Engineering) exam preparation. Practice subject-wise questions, track performance, and manage question banks with a modern, intuitive interface.

---

## Problem Statement

GATE ECE aspirants need a focused platform to:

- Practice questions organized by subject and topic
- Track performance and identify weak areas
- Access a growing question bank with solutions
- Manage and curate questions efficiently

**GATE ECE Tracker 2.0** solves this by providing a streamlined practice environment with real-time feedback and analytics.

---

## Tech Stack

### Frontend

- **React 18** with **Vite** (Fast HMR, optimized builds)
- **React Router** for navigation
- **Vanilla CSS** with custom design system (glassmorphism, gradients)

### Backend

- **Node.js** + **Express** (RESTful API)
- **Mongoose** (MongoDB ODM)
- **CORS**, **dotenv** for configuration

### Database

- **MongoDB Atlas** (Cloud-hosted, scalable)
- Local MongoDB support

---

## Key Features (v1.0)

### Practice Module

- Subject-wise and topic-wise question filtering
- Interactive MCQ interface with 4 options
- Immediate feedback on answer submission
- Solution explanations for incorrect answers
- Attempt tracking (localStorage)

### Dashboard

- Overall accuracy and performance metrics
- Subject-wise breakdown with accuracy percentages
- Total attempts and correct/incorrect counts

### Admin Panel

- **Add Question**: Comprehensive form with validation
- **Manage Questions**: View and delete questions by subject/topic
- Direct MongoDB integration via API

### Design

- Modern dark theme with glassmorphism effects
- Responsive grid layouts
- Smooth animations and hover effects
- Google Fonts (Inter)

---

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Vite Dev Server        │
│  (Port 5173)            │
│  - React App            │
│  - Proxy: /api → 5002   │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Express Server         │
│  (Port 5002)            │
│  - GET /api/questions   │
│  - POST /api/questions  │
│  - DELETE /api/:id      │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  MongoDB Atlas          │
│  - Questions Collection │
└─────────────────────────┘
```

---

## How to Run Locally

### Prerequisites

- Node.js (v16+)
- MongoDB Atlas account (or local MongoDB)

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd "gate tracker 2.0"
   ```

2. **Install dependencies**

   ```bash
   # Frontend
   npm install

   # Backend
   cd backend
   npm install
   cd ..
   ```

3. **Configure environment**

   Create `backend/.env`:

   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
   PORT=5002
   ```

4. **Start the servers**

   **Terminal 1 (Backend):**

   ```bash
   cd backend
   npm run dev
   ```

   **Terminal 2 (Frontend):**

   ```bash
   npm run dev
   ```

5. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5002/api`

---

## API Endpoints

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| GET    | `/api`               | Health check            |
| GET    | `/api/questions`     | Fetch all questions     |
| POST   | `/api/questions`     | Add a new question      |
| DELETE | `/api/questions/:id` | Delete a question by ID |

---

## Current Limitations

- **No User Authentication**: Mock authentication only (single admin user)
- **Attempt Persistence**: Attempts stored in localStorage (not synced across devices)
- **No Image Support**: Questions are text-only (no diagrams or images)
- **No Search**: Cannot search questions by keyword
- **No Pagination**: All questions loaded at once (may slow down with large datasets)
- **Basic Analytics**: Limited to accuracy percentages (no charts or graphs)

---

## Future Roadmap (v1.1+)

- [ ] **User Authentication**: JWT-based auth with user roles (admin/student)
- [ ] **Attempt Sync**: Move attempts to MongoDB for cross-device tracking
- [ ] **Image Upload**: Support for question images and circuit diagrams
- [ ] **Advanced Analytics**: Charts, graphs, and detailed performance insights
- [ ] **Search & Filters**: Full-text search and advanced filtering
- [ ] **Pagination**: Efficient loading for large question sets
- [ ] **Bulk Import**: CSV/JSON import for questions
- [ ] **Mobile App**: React Native version for iOS/Android
- [ ] **Offline Mode**: PWA support for offline access
- [ ] **Discussion Forum**: Collaborative learning and doubt resolution

---

## Project Structure

```
gate tracker 2.0/
├── backend/
│   ├── models/
│   │   └── Question.js          # Mongoose schema
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express server
│   └── package.json
├── src/
│   ├── context/
│   │   └── AuthContext.jsx       # Mock authentication
│   ├── pages/
│   │   ├── Admin/
│   │   │   ├── AddQuestion.jsx
│   │   │   └── ManageQuestions.jsx
│   │   ├── Dashboard.jsx
│   │   └── Practice.jsx
│   ├── services/
│   │   └── storage.js            # LocalStorage utilities
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## Database Schema

### Question Model

```javascript
{
  subjectId: String,      // e.g., "signals"
  topicId: String,        // e.g., "laplace"
  year: Number,           // e.g., 2023
  marks: Number,          // 1 or 2
  questionText: String,   // Question content
  optionA: String,
  optionB: String,
  optionC: String,
  optionD: String,
  correctOption: String,  // "A", "B", "C", or "D"
  solutionText: String,   // Optional explanation
  createdAt: Date         // Auto-generated
}
```

---

## Contributing

This is a personal project for GATE ECE preparation. Contributions are welcome for bug fixes and feature enhancements.

---

## License

MIT License - Feel free to use this project for learning and personal use.

---

## Acknowledgments

- Built with ❤️ for GATE ECE aspirants
- Powered by React, Express, and MongoDB
- Design inspired by modern web aesthetics

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Status**: ✅ Production Ready
