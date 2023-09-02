import React from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import './App.css';


function App() {
  return (
    <div>
      <Toaster />
      <Navbar />
    </div>
  );
}

export default App;
