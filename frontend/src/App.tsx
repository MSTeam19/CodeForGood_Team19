import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext';
import Home from './pages/home';
import Footer from './components/footer/footer';
import Header from './components/header/header';
import Leaderboard from './pages/leaderboard';
import NeedsMap from './pages/needs-map';
import PostPage from './pages/postPage';
import AdminPage from './pages/adminPage';
import Champion from './pages/champion';
import ChampionRegion from './pages/champion-region';
import ChampionNFC from './pages/champion-nfc';
import Dashboard from './pages/dashboard';
import { ProtectedRoute } from './components/protectedRoute';

function App() {
  const location = useLocation();
  const isNFCView = location.pathname.startsWith('/champion-nfc');

  return (
    <AuthProvider>
      <div className="app-root">
        {!isNFCView && <Header />}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/needs-map" element={<NeedsMap />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/stories" element={<PostPage />} />
            <Route path="/champion" element={<Champion />} />
            <Route path="/region/:regionId/champions" element={<ChampionRegion />} />
            <Route path="/champion-nfc/:token" element={<ChampionNFC />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="Staff">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        {!isNFCView && <Footer />}
      </div>
    </AuthProvider>
  );
}

export default App;
