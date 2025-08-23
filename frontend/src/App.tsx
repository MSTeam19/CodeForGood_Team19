import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/authContext';
import Home from './pages/home';
import Footer from './components/footer/footer';
import Header from './components/header/header';
import Leaderboard from './pages/leaderboard';
import NeedsMap from './pages/needs-map';
import PostPage from './pages/postPage';

function App() {
  return (
    <AuthProvider>
      <div className="app-root">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/needs-map" element={<NeedsMap />} />
            <Route path="/stories" element={<PostPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
