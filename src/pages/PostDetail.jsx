import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Adjust path if your client file is named client.js

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Post & Comments State
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [upvoting, setUpvoting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch Post Details & Comments on Mount
  useEffect(() => {
    const fetchPostAndComments = async () => {
      setLoading(true);

      // Fetch single post
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (postError) {
        console.error('Error fetching post:', postError);
        setErrorMsg('Post not found or could not be loaded.');
      } else {
        setPost(postData);

        // Fetch associated comments ordered by newest first
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', id)
          .order('created_at', { ascending: false });

        if (commentsError) {
          console.error('Error fetching comments:', commentsError);
        } else {
          setComments(commentsData || []);
        }
      }

      setLoading(false);
    };

    fetchPostAndComments();
  }, [id]);

  // 2. Increment Upvotes
  const handleUpvote = async () => {
    if (!post || upvoting) return;

    setUpvoting(true);
    const newCount = (post.upvotes || 0) + 1;

    // Optimistic UI update
    setPost((prev) => ({ ...prev, upvotes: newCount }));

    const { error } = await supabase
      .from('posts')
      .update({ upvotes: newCount })
      .eq('id', id);

    if (error) {
      console.error('Error updating upvotes:', error);
      // Rollback optimistic state if query fails
      setPost((prev) => ({ ...prev, upvotes: prev.upvotes - 1 }));
    }

    setUpvoting(false);
  };

  // 3. Option A Author Verification (Secret Key Check for Editing Post)
  const handleAuthorEdit = (e) => {
    e.preventDefault();

    if (post.secret_key) {
      const enteredKey = prompt('Author Verification Required:\nPlease enter the Secret Key for this post to edit or delete it:');

      if (enteredKey === null) return; // User canceled prompt

      if (enteredKey.trim() === post.secret_key.trim()) {
        navigate(`/edit/${post.id}`);
      } else {
        alert('Incorrect Secret Key. Only the author of this post can edit or delete it.');
      }
    } else {
      // Fallback if post has no secret key set
      navigate(`/edit/${post.id}`);
    }
  };

  // 4. Add a New Comment (Matches 'content' column name in Supabase)
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setSubmittingComment(true);

    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: id,
          content: newComment.trim() // Changed from 'text' to 'content'
        }
      ])
      .select();

    setSubmittingComment(false);

    if (error) {
      console.error('Error adding comment:', error);
      alert('Could not submit comment. Please try again.');
    } else if (data && data.length > 0) {
      setComments([data[0], ...comments]);
      setNewComment('');
    }
  };

  if (loading) return <p className="loading-state">Loading post details...</p>;
  if (errorMsg || !post) return <div className="error-banner">{errorMsg || 'Post not found.'}</div>;

  return (
    <div className="post-detail-container">
      {/* Header Navigation */}
      <div className="post-detail-header">
        <Link to="/" className="back-link">← Back to Home Feed</Link>

        {/* Option A: Secret Key Edit Button */}
        <button
          type="button"
          onClick={handleAuthorEdit}
          className="edit-link-btn"
          style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}
        >
          ✏️ Edit Post (Author Only)
        </button>
      </div>

      {/* Main Post Content */}
      <article className="post-detail-card">
        <div className="post-meta">
          <span>Posted on {new Date(post.created_at).toLocaleString()}</span>
        </div>

        <h1 className="post-title">{post.title}</h1>

        {post.image_url && (
          <div className="post-image-wrapper">
            <img
              src={post.image_url}
              alt={post.title}
              className="post-image"
              onError={(e) => {
                e.target.style.display = 'none'; // Hide broken image links
              }}
            />
          </div>
        )}

        {post.content && (
          <div className="post-content">
            <p>{post.content}</p>
          </div>
        )}

        {/* Upvote Interactive Counter */}
        <div className="upvote-section">
          <button
            onClick={handleUpvote}
            disabled={upvoting}
            className="upvote-button"
          >
            👍 Upvote ({post.upvotes || 0})
          </button>
        </div>
      </article>

      <hr className="divider" />

      {/* Visitor Comment Chain */}
      <section className="comments-section">
        <h3>Community Comments ({comments.length})</h3>

        {/* New Comment Form */}
        <form onSubmit={handleAddComment} className="comment-form">
          <textarea
            rows="3"
            placeholder="Leave a comment or share your experience..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <button type="submit" className="submit-comment-btn" disabled={submittingComment}>
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        {/* Comments List */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first to start the discussion!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="comment-card">
                {/* Renders 'content' column from Supabase */}
                <p className="comment-text">{comment.content}</p>
                <small className="comment-date">
                  {new Date(comment.created_at).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}