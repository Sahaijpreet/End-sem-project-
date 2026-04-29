import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import { WebSocketProvider } from './context/WebSocketContext';
import PWAInstallPrompt from './components/PWAInstall';
import { PerformanceDebugger } from './hooks/usePerformance';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import NotesRepository from './pages/NotesRepository';
import NoteDetail from './pages/NoteDetail';
import AISummary from './pages/AISummary';
import BookExchange from './pages/BookExchange';
import UploadPortal from './pages/UploadPortal';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import PYQRepository from './pages/PYQRepository';
import Chat from './pages/Chat';
import Inbox from './pages/Inbox';
import Leaderboard from './pages/Leaderboard';
import StudyGroups from './pages/StudyGroups';
import Timetable from './pages/Timetable';
import SyllabusTracker from './pages/SyllabusTracker';
import UserProfile from './pages/UserProfile';
import CGPACalculator from './pages/CGPACalculator';
import AssignmentTracker from './pages/AssignmentTracker';
import Flashcards from './pages/Flashcards';
import Notifications from './pages/Notifications';
import EmailVerification from './pages/EmailVerification';

function App() {
  console.log('App component rendering...');
  
  return (
    <ThemeProvider>
      <WebSocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="auth" element={<Auth />} />
              <Route path="verify-email" element={<EmailVerification />} />
              <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="notes" element={<NotesRepository />} />
              <Route path="notes/:id" element={<NoteDetail />} />
              <Route path="ai-summary" element={<ProtectedRoute><AISummary /></ProtectedRoute>} />
              <Route path="book-exchange" element={<BookExchange />} />
              <Route path="upload" element={<ProtectedRoute><UploadPortal /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="pyqs" element={<PYQRepository />} />
              <Route path="inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
              <Route path="chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="groups" element={<ProtectedRoute><StudyGroups /></ProtectedRoute>} />
              <Route path="timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
              <Route path="syllabus" element={<ProtectedRoute><SyllabusTracker /></ProtectedRoute>} />
              <Route path="user/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="cgpa" element={<ProtectedRoute><CGPACalculator /></ProtectedRoute>} />
              <Route path="assignments" element={<ProtectedRoute><AssignmentTracker /></ProtectedRoute>} />
              <Route path="flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
              <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
              <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            </Route>
          </Routes>
          <PWAInstallPrompt />
          <PerformanceDebugger />
        </BrowserRouter>
      </WebSocketProvider>
    </ThemeProvider>
  );
}

export default App;
