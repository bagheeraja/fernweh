import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Adjust path if your client file is named client.js

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  
  // Stored key for validation (if applicable)
  const [storedSecretKey, setStoredSecretKey] = useState(null);
  const [enteredSecretKey, setEnteredSecretKey] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch initial post data on mount
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching post for edit:', error);
        setErrorMessage('Post not found or could not be loaded.');
      } else if (data) {
        setTitle(data.title || '');
        setContent(data.content || '');
        setImageUrl(data.image_url || '');
        setStoredSecretKey(data.secret_key || null);
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  // Helper check for secret key authorization
  const isAuthorized = () => {
    if (!storedSecretKey) return true; // No key required if post has none
    return enteredSecretKey === storedSecretKey;
  };

  // 1. UPDATE POST
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Title cannot be empty.');
      return;
    }

    if (!isAuthorized()) {
      setErrorMessage('Incorrect secret key. You are not authorized to edit this post.');
      return;
    }

    setSaving(true);
    setErrorMessage('');

    const { error } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        content: content.trim() || null,
        image_url: imageUrl.trim() || null,
      })
      .eq('id', id);

    setSaving(false);

    if (error) {
      console.error('Error updating post:', error);
      setErrorMessage('Failed to update post. Please try again.');
    } else {
      // Redirect back to the post detail page
      navigate(`/post/${id}`);
    }
  };

  // 2. DELETE POST
  const handleDelete = async () => {
    if (!isAuthorized()) {
      setErrorMessage('Incorrect secret key. You are not authorized to delete this post.');
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    setSaving(true);

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    setSaving(false);

    if (error) {
      console.error('Error deleting post:', error);
      setErrorMessage('Failed to delete post. Please try again.');
    } else {
      // Redirect back to home feed after successful deletion
      navigate('/');
    }
  };

  if (loading) return <p className="loading-state">Loading post details...</p>;

  return (
    <div className="edit-post-container">
      <h2>Edit Experience</h2>

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <form onSubmit={handleUpdate} className="edit-post-form">
        {/* Secret Key Input (Only rendered if post was created with a secret key) */}
        {storedSecretKey && (
          <div className="form-group key-prompt">
            <label htmlFor="enteredSecretKey">Secret Key / Password *</label>
            <input
              id="enteredSecretKey"
              type="password"
              placeholder="Enter the secret key used when creating this post"
              value={enteredSecretKey}
              onChange={(e) => setEnteredSecretKey(e.target.value)}
              required
            />
          </div>
        )}

        {/* Title Input */}
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Content Input */}
        <div className="form-group">
          <label htmlFor="content">Content / Description</label>
          <textarea
            id="content"
            rows="5"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Image URL Input */}
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        {/* Action Controls */}
        <div className="form-actions-split">
          <button
            type="button"
            className="delete-btn"
            onClick={handleDelete}
            disabled={saving}
          >
            Delete Post
          </button>

          <div className="form-actions-right">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate(`/post/${id}`)}
            >
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Update Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}