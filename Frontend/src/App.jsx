import { useState } from 'react'
import { LoginContext } from './context/LoginContext'
import Navbar from './components/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'

import Home from './pages/Home'
import Profile from './pages/Profile'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import Reset from './pages/Reset'
import CreatePost from './pages/CreatePost'
import Modal from './components/Modal'
import UserProfile from './components/UserProfile'
import Chat from './pages/Chat'

import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

import Myfollowingpost from './pages/Myfollowingpost'


const App = () => {

  const [userLogin, setuserLogin] = useState(() => Boolean(localStorage.getItem('jwt')));
  const [modalOpen, setmodalOpen] = useState(false);


  return (
    <>
      <LoginContext.Provider value={{ userLogin, setuserLogin, setmodalOpen }}>

        <Navbar login={userLogin} />

        <Routes>
          <Route path='/' element={userLogin ? <Home /> : <Navigate to="/Signin" replace />}> </Route>
          <Route path='/Signup' element={<Signup />}> </Route>
          <Route path='/Signin' element={<Signin />}> </Route>
          <Route path='/reset' element={<Reset />}> </Route>
          <Route path='/Profile' element={userLogin ? <Profile /> : <Navigate to="/Signin" replace />}> </Route>
          <Route path='/CreatePost' element={userLogin ? <CreatePost /> : <Navigate to="/Signin" replace />}> </Route>
          <Route path='/profile/:userid' element={userLogin ? <UserProfile /> : <Navigate to="/Signin" replace />}> </Route>
          <Route path='/followingpost' element={userLogin ? <Myfollowingpost /> : <Navigate to="/Signin" replace />}> </Route>
          <Route path='/Chat' element={userLogin ? <Chat /> : <Navigate to="/Signin" replace />}> </Route>
        </Routes>
        <ToastContainer theme='dark' />
        {modalOpen && <Modal />}
      </LoginContext.Provider >
    </>

  )
}

export default App

