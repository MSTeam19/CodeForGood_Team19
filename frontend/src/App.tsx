import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import Footer from './components/footer';
import Header from './components/header';
import Leaderboard from './pages/leaderboard';

function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
