import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Adjust path if your file is named client.js

export default function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at'); // 'created_at' or 'upvotes'

  // Fetch posts from Supabase when component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*');

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  // 1. Filter posts by search term (case-insensitive title matching)
  const filteredPosts = posts.filter((post) =>
    post.title ? post.title.toLowerCase().includes(searchTerm.toLowerCase()) : false
  );

  // 2. Robust sorting calculation
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'upvotes') {
      const upvotesA = Number(a.upvotes) || 0;
      const upvotesB = Number(b.upvotes) || 0;
      return upvotesB - upvotesA; // Highest upvotes first
    }

    // Default: Newest first (created_at)
    const timeA = new Date(a.created_at).getTime() || 0;
    const timeB = new Date(b.created_at).getTime() || 0;
    return timeB - timeA; // Most recent timestamp first
  });

  if (loading) return <p className="loading-state">Loading posts...</p>;

  return (
    <div className="home-feed-container">
      {/* Search & Sort Toolbar */}
      <div className="feed-toolbar">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="sort-controls">
          <span>Sort by: </span>
          <button
            type="button"
            className={`sort-btn ${sortBy === 'created_at' ? 'active' : ''}`}
            onClick={() => setSortBy('created_at')}
          >
            Newest
          </button>
          <button
            type="button"
            className={`sort-btn ${sortBy === 'upvotes' ? 'active' : ''}`}
            onClick={() => setSortBy('upvotes')}
          >
            Most Upvoted
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      {sortedPosts.length === 0 ? (
        <p className="no-posts">No matching posts found.</p>
      ) : (
        <div className="posts-grid">
          {sortedPosts.map((post) => (
            <div key={post.id} className="post-card">
              <div>
                <span className="post-time">
                  Posted {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'recently'}
                </span>
                
                {/* PUBLIC VIEW LINK: Routes all users to PostDetail (/post/:id) */}
                <Link to={`/post/${post.id}`} className="post-title-link">
                  <h2>{post.title}</h2>
                </Link>
              </div>

              <div className="post-card-footer">
                <span className="upvotes-badge">
                  👍 {post.upvotes || 0} Upvotes
                </span>
                
                {/* PUBLIC VIEW LINK: Directs to public post view & comments */}
                <Link to={`/post/${post.id}`} className="read-more-btn">
                  View Details & Comments →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}