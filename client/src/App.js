import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route} from 'react-router-dom'
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
import Login from './components/layout/auth/Login';
import Register from './components/layout/auth/Register';

function App() {
  return (
    <Router>
    <div className="App">
      <Navbar/>
      <Route exact path='/' component={ Landing}/>
      <div className="container">
        <Route exact path='/register' component={ Register}/>
        <Route exact path='/login' component={ Login}/>
      </div>
      <Footer/>

    
    
    </div>
    </Router>
  );
}

export default App;
