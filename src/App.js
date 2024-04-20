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
              <Route index element={
                <RequireAuth>
                  <List title="List of Users" entity="users" tableTitle="Add New User"/>
                </RequireAuth>
                } />
              <Route path=":userId" element={
                <RequireAuth>
                  <Single />
                </RequireAuth>
              } />
              <Route path="new" element={
                <RequireAuth>
                  <New inputs={userInputs} title="Add New User"/>
                </RequireAuth>
              } />
            </Route>
            <Route path="classes">
              <Route index element={
                <RequireAuth>
                  <List title="List of Classes" entity="classes" tableTitle="Add New Class"/>
                </RequireAuth>
              } />
              <Route path=":classId" element={
                <RequireAuth>
                  <Single />
                </RequireAuth>
                } />
              <Route path="new" element={
                <RequireAuth>
                  <New inputs={classInputs} title="Add New Class"/>
                </RequireAuth>
                } />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;