import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Home from './home'
import Login from './login/login'
import UserDetails from './userDetails/userDetails'
import { useCurrentUser } from './userProvider'
import Register from './register/register'
import Info from './info';
import TodoList from './todoList/todoList';
import PostList from "./postList/postList"
import Albums from './albums/albums';
import NoPage from "./noPage"
function MainApp() {
  const { currentUser } = useCurrentUser();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />}/>
        <Route path="/login" element={<Login />}/>
        <Route path="/register" element={<Register />}/>
        <Route path='/userDetails' element={(localStorage.getItem('currentUser')) ? <Login /> : <UserDetails />} />
        <Route path='/home' element={(currentUser.id != -1) ? <Home /> : <NoPage />} />
        <Route path='/info' element={(currentUser.id != -1) ? <Info /> : <NoPage />} />
        <Route path={`/users/${currentUser.id}/todos`} element={<TodoList />} />
        <Route path={`/users/${currentUser.id}/posts/*`} element={<PostList />} />
        <Route path={`/users/${currentUser.id}/albums/*`} element={<Albums />} />
        <Route path="*" element={<NoPage />} />
      </Routes>
    </BrowserRouter >
  )
}

export default MainApp;
