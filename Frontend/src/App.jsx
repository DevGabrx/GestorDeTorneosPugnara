import { BrowserRouter as Router, Route, Routes, Navigate,Link } from 'react-router-dom';
import Inicio from './components/Pages/Inicio/Inicio'
import Creartorneo from './components/Pages/Creartorneo/Creartorneo'
import './App.css'

// index.css define .badge (forma) + un modificador de color: .badge-active,
// .badge-pending, .badge-cancelled, .badge-staff. Este helper elige el
// modificador según el texto de estado que venga del backend.

function App() {
  return (
    <>
    <Router>
      <nav className='navbar'>
        <div className='logo'>
          <Link to='/'><img src='/logo-Pugnara-oficial.svg' alt='logo'/></Link>
        </div>
        <div className='nav-links'>
          <Link to="/">Inicio</Link>
          <Link to="/Creartorneo">Crear</Link>
        </div>
        
      </nav>
      <main className="page-content">
        <Routes>
          <Route path='/' element={<Inicio/>}/>  
          <Route path='/Creartorneo' element={<Creartorneo/>}/>
        </Routes>
      </main>
    </Router>
    </>
  )
}

export default App