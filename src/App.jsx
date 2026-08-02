import { Routes, Route, Link } from 'react-router-dom';
import HomeFeed from './pages/HomeFeed';
import CreatePost from './pages/CreatePost';
import PostDetail from './pages/PostDetail';
import EditPost from './pages/EditPost';

function App() {
  return (
    <div className="app-container">
      {/* Shared Header & Navbar */}
      <header className="navbar">
        <Link to="/" className="brand-logo">
          <h1>Fernweh</h1>
        </Link>
        <p>Find places you&apos;ve never been, and already miss.</p>
        
        <nav>
          <Link to="/">Home Feed</Link> | {' '}
          <Link to="/create">+ New Post</Link>
        </nav>
      </header>

      <hr />

      {/* Main Page Routing */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomeFeed />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/edit/:id" element={<EditPost />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;