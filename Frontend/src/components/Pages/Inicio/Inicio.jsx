import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-page-wrapper">
      
      {/* SECCIÓN 1: HERO (El video vive EXCLUSIVAMENTE aquí adentro) */}
      <section className="landing-hero-section">
        <div className="hero-video-container">
          <video className="hero-video-bg" autoPlay loop muted playsInline>
            <source src="/Hero-video.mp4" type="video/mp4" />
            Tu navegador no soporta videos.
          </video>
          <div className="video-overlay-mask"></div>
        </div>

        {/* Contenido sobre el video */}
        <div className="hero-content-box">
          <span className="hero-tag-dorado">Orgullo Agustiniano</span>
          <h1>La Arena de electronic Sports de la Uniagustiniana</h1>
          <p>
            Demuestra tu nivel, representa a tu facultad y compite en los torneos 
            más intensos de la comunidad universitaria. ¿Tienes lo necesario para ser el campeón?
          </p>
          <div className="hero-actions">
            <Link to="/torneos" className="btn-primary">Explorar Torneos</Link>
            {!user && <Link to="/register" className="btn-secondary">Unirse a la Liga</Link>}
          </div>
        </div>
      </section>

      <div className="landing-solid-content">
        
        <section className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: '10px' }}>
            ¿Por qué competir con nosotros?
          </h2>
          
          <div className="grid">
            {/* Tarjeta 1 */}
            <div className="card">
              <h2 style={{ color: '#8b5cf6', marginBottom: '10px' }}>Brackets en Vivo</h2>
              <p>Sigue tus partidas en tiempo real con nuestro sistema de emparejamiento automatizado.</p>
            </div>

            {/* Tarjeta 2 */}
            <div className="card">
              <h2 style={{ color: '#8b5cf6', marginBottom: '10px' }}>Soporte Multi-juego</h2>
              <p>Tenemos torneos de League of Legends, Rocket League y próximamente más.</p>
            </div>

            {/* Tarjeta 3 */}
            <div className="card">
              <h2 style={{ color: '#8b5cf6', marginBottom: '10px' }}>Comunidad Universitaria</h2>
              <p>Espacio exclusivo diseñado para conectar con la escena gamer de la institución.</p>
            </div>
          </div>
        </section>

        <section className="landing-cta-section">
          <div className="cta-container-box">
            <h2>No te quedes fuera de la próxima temporada</h2>
            <p>Las inscripciones para el torneo interfacultades cierran pronto. Reúne a tu squad hoy mismo.</p>
            {user ? (
              <Link to="/create-tournament" className="btn-primary">Organizar un Torneo</Link>
            ) : (
              <Link to="/register" className="btn-primary">Registrarme Ahora</Link>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default LandingPage;