import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else {
        console.log('Fetched Fernweh posts:', data);
        setPosts(data);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <h1>Fernweh</h1>
      <p>Find places you&apos;ve never been, and already miss.</p>
      
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            {post.title} — Upvotes: {post.upvotes}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;