import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Footer from './components/footer';
import Header from './components/header';
import Leaderboard from './pages/leaderboard';
import NeedsMap from './pages/needs-map';
import PostPage from './pages/postPage';

function App() {
  return (
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
  );
}

export default App;
