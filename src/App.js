import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Navbar from './components/Navbar';
import InfoPage from './components/InfoPage';
import ReservationPage from './components/ReservationPage';
import AuthPage from './components/AuthPage';
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/categories')
      .then(response => {
        setCategories(response.data);
        console.log(response.data);
      })
      .catch(error => {
        console.error('An error occurred:', error);
      });
  }, []);

  const [services, setServices] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/services')
      .then(response => {
        setServices(response.data);
        console.log(response.data);
      })
      .catch(error => {
        console.error('An error occurred:', error);
      });
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path='/' element = {<InfoPage categories = {categories} services = {services}/>}/>
          <Route path='/reservation' element = {<ReservationPage/>}/>
          <Route path='/auth' element = {<AuthPage categories = {categories} services = {services}/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
