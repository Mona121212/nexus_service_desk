import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRepairDetail, updateRepair } from '../../api/repairs';
import './RepairEdit.css';

export const RepairEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    if (!id) return;
    setFetching(true);
    setError(null);
    try {
      const data = await getRepairDetail(id);
      setTitle(data.title);
      setDescription(data.description);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repair details');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }

    setLoading(true);
    try {
      await updateRepair(id, { title: title.trim(), description: description.trim() });
      alert('Repair request updated successfully!');
      navigate(`/repairs/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update repair request');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="repair-edit"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="repair-edit">
      <h1>Edit Repair</h1>
      <form onSubmit={handleSubmit} className="repair-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            placeholder="Enter repair title"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
            rows={6}
            placeholder="Enter repair description"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(`/repairs/${id}`)}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
