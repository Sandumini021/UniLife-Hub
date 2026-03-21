import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import TaskManager from './pages/TaskManager';
import CountdownManager from './pages/CountdownManager';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Main Dashboard Route */}
          <Route path="/" element={<Dashboard />} />
          
          {/* Task Manager Route (expects a category ID in the URL) */}
          <Route path="/category/:categoryId" element={<TaskManager />} />

          {/* Countdown Manager Route */}
          <Route path="/countdowns" element={<CountdownManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;