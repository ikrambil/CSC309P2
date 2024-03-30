import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CreateCalendar from './components/CreateCalendar';
import Login from './components/Login';
import SignUp from './components/Signup';
import './styles.css';
import './App.css';
import 'flowbite';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    // AuthProvider makes the auth context available to all components/routes that are wrapped by it. (i.e. the access token)
    <AuthProvider>
      <Router>
        <Routes>
          {/*  put an example below for how to protect route using helper component. Use it for future routes! */}
          {/* <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} /> */}
          <Route path="/dashboard/:userId" element={<Dashboard />} />
          <Route path="/create-calendar" element={<CreateCalendar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
