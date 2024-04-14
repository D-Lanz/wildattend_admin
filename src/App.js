import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Login from './pages/login/loginpage';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <nav>
          <ul>
            <li>
              <Link to="/login">Login</Link>
            </li>
            {/* Add more navigation links as needed */}
          </ul>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Add more routes as needed */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
