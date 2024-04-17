import React, { Children, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate} from 'react-router-dom';

import AdminDashboard from './pages/admin_dashboard/dashboard';
import { AuthContext } from './context/AuthContext';
import Login from './pages/login/loginpage';
import List from './pages/list/list';
import New from './pages/new/new';
import Single from './pages/single/single';
import { userInputs, classInputs } from './formSource';

function App() {

  const {currentUser} = useContext(AuthContext)

  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  console.log(currentUser)

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route path="login" element={<Login />} />
            <Route
                index
                element={
                  <RequireAuth>
                    <AdminDashboard />
                  </RequireAuth>
                }
            />
            <Route path="users">
              <Route index element={<List />} />
              <Route path=":userId" element={<Single />} />
              <Route path="new" element={<New inputs={userInputs} title="Add New User"/>} />
            </Route>
            <Route path="classes">
              <Route index element={<List />} />
              <Route path=":classId" element={<Single />} />
              <Route path="new" element={<New inputs={classInputs} title="Add New Class"/>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;