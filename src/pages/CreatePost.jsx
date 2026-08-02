import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Adjust path if your client file is named client.js or in another directory

export default function CreatePost() {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  
  // UI Loading & Error State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation: Title is required by rubric
    if (!title.trim()) {
      setErrorMessage('Please provide a title for your post.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    // Insert new post into Supabase 'posts' table
    const { data, error } = await supabase
      .from('posts')
      .insert([
        {
          title: title.trim(),
          content: content.trim() || null,
          image_url: imageUrl.trim() || null,
          secret_key: secretKey.trim() || null,
          upvotes: 0 // Initialize upvotes at 0
        }
      ])
      .select();

    setLoading(false);

    if (error) {
      console.error('Error inserting post:', error);
      setErrorMessage(error.message || 'Failed to create post. Please try again.');
    } else {
      console.log('Post created successfully:', data);
      // Redirect back to the Home Feed
      navigate('/');
    }
  };

  return (
    <div className="create-post-container">
      <h2>Create a New Experience</h2>
      <p className="subtitle">Share a place you&apos;ve never been, or already miss.</p>

      {errorMessage && <div className="error-banner">{errorMessage}</div>}

      <form onSubmit={handleSubmit} className="create-post-form">
        {/* Title Input (Required) */}
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Watching sunrise over Kyoto's Arashiyama Bamboo Grove"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Content Input (Optional) */}
        <div className="form-group">
          <label htmlFor="content">Content / Description (Optional)</label>
          <textarea
            id="content"
            rows="5"
            placeholder="Describe the experience, mood, or travel story..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Image URL Input (Optional) */}
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL (Optional)</label>
          <input
            id="imageUrl"
            type="url"
            placeholder="https://images.unsplash.com/photo-..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>

        {/* Secret Key Input (Optional - for edit/delete authorization) */}
        <div className="form-group">
          <label htmlFor="secretKey">Secret Key / Password (Optional)</label>
          <input
            id="secretKey"
            type="password"
            placeholder="Used if you want to edit or delete this post later"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
          />
          <small className="help-text">Leave blank if you don&apos;t need password protection for this post.</small>
        </div>

        {/* Submit & Cancel Actions */}
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Publishing...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
}