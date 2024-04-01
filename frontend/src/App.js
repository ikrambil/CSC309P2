import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CreateCalendar from './components/CreateCalendar';
import Login from './components/Login';
import ViewCalendar from './components/ViewCalendar';
import SignUp from './components/Signup';
import EditCalendar from './components/EditCalendar';
import AddInvite from './components/AddInvitation.js';
import ViewInvite from './components/ViewInvitation.js';
import './styles.css';
import './App.css';
import 'flowbite';
import FinalizedCalendar from './components/FinalizedCalendar';
import CalendarRecommendation from './components/CalendarRecommendation';
import ContactPage from './components/Contacts/ContactPage.jsx';
import BrowsePage from './components/BrowsePage.js'
import BrowseViewCalendar from './components/BrowseViewCalendar.js'


import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext.js';

function App() {
  return (
    // AuthProvider makes the auth context available to all components/routes that are wrapped by it. (i.e. the access token)
    <AuthProvider>
      <Router>
        <Routes>
          {/*  put an example below for how to protect route using helper component. Use it for future routes! */}
          {/* <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} /> */}
          <Route path="/" element={<Navigate replace to="/dashboard" />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-calendar" element={<ProtectedRoute><CreateCalendar /></ProtectedRoute>} />
          <Route path="/view-calendar/:calendarId" element={<ProtectedRoute><ViewCalendar /></ProtectedRoute>} />
          <Route path="/view-browse-calendar/:calendarId" element={<ProtectedRoute><BrowseViewCalendar /></ProtectedRoute>} />
          <Route path="/edit-calendar/:calendarId" element={<ProtectedRoute><EditCalendar /></ProtectedRoute>} />
          <Route path="/edit-invite/:token" element={<ProtectedRoute><AddInvite /></ProtectedRoute>} />
          <Route path="/view-invite/:token" element={<ProtectedRoute><ViewInvite /></ProtectedRoute>} />
          <Route path="/finalizedCalendar/:calendarId" element={<ProtectedRoute><FinalizedCalendar /></ProtectedRoute>} />
          <Route path='/recommendedCalendars/:calendarId' element={<ProtectedRoute><CalendarRecommendation /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
          <Route path="/browse" element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
