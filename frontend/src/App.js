import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CreateCalendar from './components/CreateCalendar';
import './styles.css';
import './App.css';
import 'flowbite'


function App() {
  return (
    <Router>
      <div className="App">
        <Routes> {/* Use Routes instead of Switch */}
          <Route path="/dashboard/:userId" element={<Dashboard />} />
          <Route path="/create-calendar" element={<CreateCalendar />} />
          {/* Define other routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
