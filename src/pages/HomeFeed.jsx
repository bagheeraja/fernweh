import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Adjust path if your file is named client.js

export default function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at'); // 'created_at' or 'upvotes'

  // Fetch posts from Supabase when the component mounts
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
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Sort the filtered posts based on user selection
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return (b.upvotes || 0) - (a.upvotes || 0); // Highest upvotes first
    }
    // Default: Newest first (created_at)
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (loading) return <p className="loading-state">Loading Fernweh posts...</p>;

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
            className={`sort-btn ${sortBy === 'created_at' ? 'active' : ''}`}
            onClick={() => setSortBy('created_at')}
          >
            Newest
          </button>
          <button
            className={`sort-btn ${sortBy === 'upvotes' ? 'active' : ''}`}
            onClick={() => setSortBy('upvotes')}
          >
            Most Upvoted
          </button>
        </div>
      </div>

      {/* Posts List */}
      {sortedPosts.length === 0 ? (
        <p className="no-posts">No matching posts found.</p>
      ) : (
        <div className="posts-grid">
          {sortedPosts.map((post) => (
            <div key={post.id} className="post-card">
              <span className="post-time">
                Posted {new Date(post.created_at).toLocaleDateString()}
              </span>
              
              <Link to={`/post/${post.id}`} className="post-title-link">
                <h2>{post.title}</h2>
              </Link>

              <div className="post-card-footer">
                <span className="upvotes-badge">
                  👍 {post.upvotes || 0} Upvotes
                </span>
                <Link to={`/post/${post.id}`} className="read-more-btn">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}