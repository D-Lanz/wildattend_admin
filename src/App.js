import React, { Children, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate} from 'react-router-dom';
import AdminDashboard from './pages/admin_dashboard/dashboard';
import { AuthContext } from './context/AuthContext';
import Login from './pages/login/loginpage';
import List from './pages/list/list';
import New from './pages/new/new';
import Single from './pages/single/single';
import Edit from './pages/edit/edit';

import { userInputs, classInputs } from './formSource';
import { classColumns, userColumns } from './datatablesource';
import { classSingle, userSingle } from './singleSource';

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
                  <List
                    title="List of Users"
                    entity="users"
                    tableTitle="Add New User"
                    entityColumns={userColumns}/>
                </RequireAuth>
                } />
              <Route
                path=":id"
                element={
                  <RequireAuth>
                    <Single
                      entitySingle={userSingle}
                      entity="users"
                    />
                  </RequireAuth>
                }
              />
              <Route
                path=":id/edit"
                element={
                  <RequireAuth>
                    <Edit inputs={userInputs} title="Edit User" entityType="user"/>
                  </RequireAuth>
                }
              />
              <Route path="new" element={
                <RequireAuth>
                  <New inputs={userInputs} title="Add New User" entityType="user" />
                </RequireAuth>
              } />
            </Route>
            <Route path="classes">
              <Route index element={
                <RequireAuth>
                  <List
                    title="List of Classes"
                    entity="classes"
                    tableTitle="Add New Class"
                    entityColumns={classColumns}/>
                </RequireAuth>
              } />
              <Route path=":id" element={
                <RequireAuth>
                  <Single
                    entitySingle={classSingle}
                    entity="classes"
                  />
                </RequireAuth>
                } />
              <Route
                path=":id/edit"
                element={
                  <RequireAuth>
                    <Edit inputs={classInputs} title="Edit Class" entityType="class"/>
                  </RequireAuth>
                }
              />
              <Route path="new" element={
                <RequireAuth>
                  <New inputs={classInputs} title="Add New Class" entityType="class" />
                </RequireAuth>
                } />
            </Route>
            <Route path="rooms">
              <Route index element={
                <RequireAuth>
                  <List
                    title="List of Rooms"
                    entity="rooms"
                    tableTitle="Add New Room"
                    entityColumns={classColumns}/>
                </RequireAuth>
              } />
              <Route path=":classId" element={
                <RequireAuth>
                  <Single />
                </RequireAuth>
                } />
              <Route path="new" element={
                <RequireAuth>
                  <New inputs={classInputs} title="Add New Room" entityType="room" />
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