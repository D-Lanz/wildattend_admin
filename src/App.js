import React, { Children, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate} from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import AdminDashboard from './pages/admin_dashboard/dashboard';
import Login from './pages/login/loginpage';
import List from './pages/list/list';
import New from './pages/new/new';
import Single from './pages/single/single';
import Edit from './pages/edit/edit';
import SelectList from './pages/selectList/selectList';
import Connect from './pages/connect/connect';

// FOR INPUTS IN NEW.JS & EDIT.JS
import { userInputs, classInputs } from './formSource';

// FOR LIST.JS
import { classColumns, userColumns, userClassColumns } from './datatablesource';

// FOR SINGLE.JS DETAILS
import { classSingle, userSingle } from './singleSource';


function App() {
  const {currentUser} = useContext(AuthContext)

  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  // console.log(currentUser)

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/">

            {/* route for login */}
            <Route path="login" element={<Login />} />

            {/* route for admin dashboard(index) */}
            <Route index element={
                  <RequireAuth>
                    <AdminDashboard />
                  </RequireAuth>
              }
            />
            

            {/* route for "users" entity*/}
            <Route path="users">
              {/* route for list of "users"*/}
              <Route index element={
                <RequireAuth>
                  <List entity="users" tableTitle="List of Users" entityColumns={userColumns}/>
                </RequireAuth>
                }
              />

              {/* route for reading single user page*/}
              <Route path=":id" element={
                  <RequireAuth>
                    <Single entitySingle={userSingle} entity="users"
                      // INSIDE USERS, THEIR DATA TABLE SHOWS THEIR CLASSES INVOLVED
                      entityAssign="users" entityTable="classes" entityConnect="userClasses" tableTitle="Assign to a Class" entityColumns={classColumns}/>
                  </RequireAuth>
                }
              />

              {/* route for editing user info */}
              <Route path=":id/edit" element={
                  <RequireAuth>
                    <Edit inputs={userInputs} title="Edit User" entityType="user"/>
                  </RequireAuth>
                }
              />

              {/* INSIDE SELECTING, USERS ARE ADDED INTO A CLASS */}
              <Route path=":id/select" element={
                  <RequireAuth>
                    <SelectList entity="classes" tableTitle="Assign User to a Class" entityColumns={classColumns}/>
                  </RequireAuth>
                }
              />

              {/* Adding a new user */}
              <Route path="new" element={
                <RequireAuth>
                  <New inputs={userInputs} title="Add New User" entityType="user" />
                </RequireAuth>
                }
              />
            </Route>


            {/* route for "classes" entity*/}
            <Route path="classes">
              
               {/* route for list of "classes"*/}
              <Route index element={
                  <RequireAuth>
                    <List entity="classes" tableTitle="List of Classs" entityColumns={classColumns}/>
                  </RequireAuth>
                }
              />

              {/* route for viewing a single class*/}
              <Route path=":id" element={
                <RequireAuth>
                  <Single entitySingle={classSingle} entity="classes"
                    // INSIDE CLASSES, THEIR DATA TABLE SHOWS THEIR LIST OF USERS INVOLVED
                    entityTable="users" entityAssign="classes" tableTitle="List of Students Enrolled" entityColumns={userColumns} 
                  />
                </RequireAuth>
                }
              />

              {/* route for editing class entity*/}
              <Route path=":id/edit" element={
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


            {/* route for "userClasses" entity*/}
            <Route path="userClasses">
              
              {/* route for viewing a single class*/}
              <Route path=":id" element={
                <RequireAuth>
                  <Connect userColumns={userSingle} classColumns={classSingle} entityColumns={userClassColumns} entityTable="attendRecord" tableTitle="Attendance"/>
                </RequireAuth>
                }
              />

            </Route>


            {/* route for "rooms" entity*/}
            <Route path="rooms">
              <Route index element={
                <RequireAuth>
                  <List title="List of Rooms" entity="rooms" tableTitle="Add New Room" entityColumns={classColumns}/>
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