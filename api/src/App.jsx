import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MainApp from './components/mainApp';
import { UserProvider } from './components/userProvider';

function App() {
  return (
    <UserProvider>
      <MainApp />
    </UserProvider>
  )
}

export default App
