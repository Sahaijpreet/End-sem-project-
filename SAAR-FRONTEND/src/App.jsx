import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { AdminRoute, ProtectedRoute } from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import NotesRepository from './pages/NotesRepository';
import AISummary from './pages/AISummary';
import BookExchange from './pages/BookExchange';
import UploadPortal from './pages/UploadPortal';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import PYQRepository from './pages/PYQRepository';
import Chat from './pages/Chat';
import Inbox from './pages/Inbox';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="auth" element={<Auth />} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="notes" element={<NotesRepository />} />
            <Route path="ai-summary" element={<ProtectedRoute><AISummary /></ProtectedRoute>} />
            <Route path="book-exchange" element={<BookExchange />} />
            <Route path="upload" element={<ProtectedRoute><UploadPortal /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="pyqs" element={<PYQRepository />} />
            <Route path="inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
            <Route path="chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
