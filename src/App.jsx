import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showElementInfo, setShowElementInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- STYLING CONSTANTS ---
  const colors = {
    bg: '#f8fafc',
    surface: '#ffffff',
    primary: '#0f172a',
    text: '#1e293b',
    textSecondary: '#64748b',
    accent: '#3b82f6',
    border: '#e2e8f0',
    shadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  // Country data (Same as before)
  const countries = {
    USA: { flag: '🇺🇸', name: 'United States' },
    JPN: { flag: '🇯🇵', name: 'Japan' },
    CAN: { flag: '🇨🇦', name: 'Canada' },
    FRA: { flag: '🇫🇷', name: 'France' },
    ITA: { flag: '🇮🇹', name: 'Italy' },
    GER: { flag: '🇩🇪', name: 'Germany' },
    GBR: { flag: '🇬🇧', name: 'Great Britain' },
    GEO: { flag: '🇬🇪', name: 'Georgia' },
    KOR: { flag: '🇰🇷', name: 'South Korea' },
    BEL: { flag: '🇧🇪', name: 'Belgium' },
    SUI: { flag: '🇨🇭', name: 'Switzerland' },
    EST: { flag: '🇪🇪', name: 'Estonia' },
    FIN: { flag: '🇫🇮', name: 'Finland' },
    CHN: { flag: '🇨🇳', name: 'China' },
    CZE: { flag: '🇨🇿', name: 'Czech Republic' },
    LTU: { flag: '🇱🇹', name: 'Lithuania' },
    POL: { flag: '🇵🇱', name: 'Poland' },
    AIN: { flag: '🏳️', name: 'Individual Neutral Athletes' }
  };

  // --- MOCK DATA (Truncated for brevity, use your full list) ---
  const events = [
    { id: 1, name: "Men's Short Program", date: "Feb 10", time: "18:30", location: "Milano Arena", status: "Upcoming" },
    { id: 2, name: "Ice Dance Rhythm Dance", date: "Feb 11", time: "19:00", location: "Milano Arena", status: "Upcoming" },
    { id: 3, name: "Women's Short Program", date: "Feb 17", time: "18:45", location: "Milano Arena", status: "Upcoming" },
  ];

  // Helper to generate image path
  const getThumbnailPath = (name) => {
    const filename = name.toLowerCase().replace(/ /g, "_").replace(/'/g, "").replace(/-/g, "_") + ".jpg";
    return `thumbnails/${filename}`;
  };

  // --- COMPONENTS ---

  // 1. Mobile-First Layout Container
  const Layout = ({ children, title, showBack = false }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      backgroundColor: colors.bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflowX: 'hidden' 
    }}>
      {/* Top Header (Sticky) */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${colors.border}`,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        height: '60px',
        boxSizing: 'border-box'
      }}>
        {showBack && (
          <button 
            onClick={() => {
              if (currentView === 'athlete-detail') setCurrentView('athletes');
              else if (currentView === 'event-detail') setCurrentView('events');
              else setCurrentView('home');
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              marginRight: '16px',
              cursor: 'pointer',
              padding: '8px', // larger touch target
              marginLeft: '-8px'
            }}
          >
            ←
          </button>
        )}
        <h1 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          margin: 0, 
          color: colors.primary,
          flex: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {title}
        </h1>
      </header>

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        padding: '16px', 
        paddingBottom: '100px', // Extra space for bottom nav
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {children}
      </main>

      {/* Bottom Navigation (Fixed) */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0 24px 0', // Extra bottom padding for iPhone home bar
        zIndex: 100,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
      }}>
        <NavButton icon="🏠" label="Home" active={currentView === 'home'} onClick={() => setCurrentView('home')} />
        <NavButton icon="📅" label="Events" active={currentView === 'events'} onClick={() => setCurrentView('events')} />
        <NavButton icon="⛸️" label="Skaters" active={currentView === 'athletes'} onClick={() => setCurrentView('athletes')} />
        <NavButton icon="⭐" label="Favorites" active={currentView === 'favorites'} onClick={() => setCurrentView('favorites')} />
      </nav>
    </div>
  );

  const NavButton = ({ icon, label, active, onClick }) => (
    <button 
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        color: active ? colors.accent : colors.textSecondary,
        fontSize: '11px',
        fontWeight: '500',
        padding: '8px 12px',
        cursor: 'pointer',
        flex: 1
      }}
    >
      <span style={{ fontSize: '24px', opacity: active ? 1 : 0.7 }}>{icon}</span>
      {label}
    </button>
  );

  // 2. Optimized Image Component
  const AthletePhoto = ({ athlete, size = 60 }) => {
    const [imgSrc, setImgSrc] = useState(getThumbnailPath(athlete.name));

    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: `2px solid ${colors.border}`,
        flexShrink: 0,
        backgroundColor: '#e2e8f0',
        position: 'relative'
      }}>
        <img 
          src={imgSrc} 
          alt={athlete.name}
          onError={() => setImgSrc('https://via.placeholder.com/150?text=Skater')}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  };

  // 3. Screens

  const HomeScreen = () => (
    <Layout title="IcePath Milano 2026">
      {/* Live Now Card */}
      <div style={{
        backgroundColor: colors.surface,
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: colors.shadow,
        borderLeft: `6px solid ${colors.accent}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '1px' }}>● LIVE NOW</span>
          <span style={{ fontSize: '13px', color: colors.textSecondary }}>Milano Arena</span>
        </div>
        <h2 style={{ fontSize: '22px', margin: '0 0 8px 0', color: colors.primary }}>Men's Short Program</h2>
        <div style={{ fontSize: '15px', color: colors.textSecondary }}>Current Group: 4 (Final)</div>
      </div>

      <h3 style={{ margin: '0 0 16px 0', color: colors.primary }}>Top Contenders</h3>
      <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', margin: '0 -16px', padding: '0 16px 16px 16px' }}>
        {/* Horizontal Scroll List */}
        {['Ilia Malinin', 'Kaori Sakamoto', 'Yuma Kagiyama'].map((name, i) => (
          <div key={i} style={{ 
            minWidth: '140px', 
            backgroundColor: colors.surface, 
            padding: '12px', 
            borderRadius: '12px', 
            boxShadow: colors.shadow,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
             <AthletePhoto athlete={{ name }} size={80} />
             <div style={{ fontWeight: '600', marginTop: '8px', fontSize: '14px' }}>{name}</div>
          </div>
        ))}
      </div>
    </Layout>
  );

  const AthletesScreen = () => {
    // Mock athletes list for display
    const athletesList = useMemo(() => [
      { id: 1, name: "Ilia Malinin", country: "USA", bestScore: "332.29" },
      { id: 2, name: "Yuma Kagiyama", country: "JPN", bestScore: "306.39" },
      { id: 3, name: "Kaori Sakamoto", country: "JPN", bestScore: "234.36" },
      { id: 4, name: "Adam Siao Him Fa", country: "FRA", bestScore: "306.78" },
      { id: 5, name: "Loena Hendrickx", country: "BEL", bestScore: "221.28" },
    ].filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())), [searchQuery]);

    return (
      <Layout title="Skaters">
        <input 
          type="text" 
          placeholder="Search athletes..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            fontSize: '16px',
            marginBottom: '20px',
            boxSizing: 'border-box',
            backgroundColor: colors.surface
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {athletesList.map(athlete => (
            <button 
              key={athlete.id}
              onClick={() => { setSelectedAthlete(athlete); setCurrentView('athlete-detail'); }}
              style={{
                backgroundColor: colors.surface,
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                textAlign: 'left',
                boxShadow: colors.shadow,
                width: '100%',
                cursor: 'pointer'
              }}
            >
              <AthletePhoto athlete={athlete} size={64} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '17px', fontWeight: '600', color: colors.primary, marginBottom: '4px' }}>
                  {athlete.name}
                </div>
                <div style={{ fontSize: '14px', color: colors.textSecondary }}>
                  {countries[athlete.country]?.flag} {countries[athlete.country]?.name}
                </div>
              </div>
              <div style={{ fontSize: '20px', color: colors.border }}>›</div>
            </button>
          ))}
        </div>
      </Layout>
    );
  };

  const EventsScreen = () => (
    <Layout title="Schedule">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {events.map(event => (
          <button 
            key={event.id}
            onClick={() => { setSelectedEvent(event); setCurrentView('event-detail'); }}
            style={{
              backgroundColor: colors.surface,
              border: 'none',
              borderRadius: '16px',
              padding: '0', // Reset padding for internal layout
              overflow: 'hidden',
              boxShadow: colors.shadow,
              width: '100%',
              textAlign: 'left',
              display: 'flex',
              cursor: 'pointer'
            }}
          >
            {/* Date Column */}
            <div style={{ 
              backgroundColor: colors.primary, 
              color: 'white', 
              padding: '16px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              minWidth: '70px'
            }}>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>FEB</div>
              <div style={{ fontSize: '24px', fontWeight: '700' }}>{event.date.split(' ')[1]}</div>
            </div>
            {/* Details Column */}
            <div style={{ padding: '16px', flex: 1 }}>
              <div style={{ fontSize: '14px', color: colors.accent, fontWeight: '600', marginBottom: '4px' }}>{event.time}</div>
              <div style={{ fontSize: '17px', fontWeight: '700', color: colors.primary, marginBottom: '4px' }}>{event.name}</div>
              <div style={{ fontSize: '14px', color: colors.textSecondary }}>📍 {event.location}</div>
            </div>
          </button>
        ))}
      </div>
    </Layout>
  );

  // --- RENDER ---
  return (
    <>
      {currentView === 'home' && <HomeScreen />}
      {currentView === 'events' && <EventsScreen />}
      {currentView === 'athletes' && <AthletesScreen />}
      {/* Add detail screens here using the Layout component */}
      {currentView === 'favorites' && <Layout title="Favorites"><div>Favorites content...</div></Layout>}
      {currentView === 'event-detail' && <Layout title="Event Details" showBack><div>Details for {selectedEvent?.name}</div></Layout>}
      {currentView === 'athlete-detail' && <Layout title="Athlete Profile" showBack>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ margin: '0 auto 16px', width: '120px' }}>
             <AthletePhoto athlete={selectedAthlete} size={120} />
          </div>
          <h2 style={{ fontSize: '28px', margin: '0 0 8px 0' }}>{selectedAthlete?.name}</h2>
          <div style={{ fontSize: '18px', color: colors.textSecondary }}>
            {countries[selectedAthlete?.country]?.flag} {countries[selectedAthlete?.country]?.name}
          </div>
        </div>
        
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: colors.surface, padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: colors.textSecondary }}>Season Best</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: colors.accent }}>{selectedAthlete?.bestScore}</div>
          </div>
          <div style={{ background: colors.surface, padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: colors.textSecondary }}>World Rank</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: colors.primary }}>#1</div>
          </div>
        </div>
      </Layout>}
    </>
  );
};

export default App;

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
