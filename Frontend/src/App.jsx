import { BrowserRouter as Router, Route, Routes, Navigate,Link } from 'react-router-dom';
import Inicio from './components/Pages/Inicio'
import Creartorneo from './components/Pages/Creartorneo';
import './App.css'

function App() {
  return (
    <>
    <Router>
      <nav className='c-menu'>
        <Link to="/">Inicio</Link>
        <Link to="/Creartorneo">Crear</Link>
      </nav>
      <Routes>
      <Route path='/' element={<Inicio/>}/>  
      <Route path='/Creartorneo' element={<Creartorneo/>}/>
      </Routes>
    </Router>
    </>
  )
}

export default App
