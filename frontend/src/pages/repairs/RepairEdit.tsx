import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRepairDetail, updateRepair } from '../../api/repairs';
import { Layout } from '../../components/Layout';
import './RepairEdit.css';

export const RepairEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
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
      setBuilding(data.building || '');
      setRoom(data.room || '');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message 
        || err.message 
        || 'Failed to fetch repair details';
      setError(errorMessage);
      console.error('Error fetching repair detail:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);

    if (!title.trim() || !description.trim() || !building.trim() || !room.trim()) {
      setError('All fields marked with * are required');
      return;
    }

    setLoading(true);
    try {
      await updateRepair(id, {
        title: title.trim(),
        description: description.trim(),
        building: building.trim(),
        room: room.trim()
      });
      alert('Repair request updated successfully!');
      navigate(`/repairs/${id}`);
    } catch (err: any) {
      console.error('Error updating repair:', err);
      const errorMessage = err.response?.data?.error?.message 
        || err.response?.data?.error?.details
        || err.message 
        || 'Failed to update repair request';
      const validationErrors = err.response?.data?.error?.validationErrors;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const firstError = Object.values(validationErrors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Layout>
        <div className="repair-edit">
          <div className="loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
          <label htmlFor="building">Building *</label>
          <input
            id="building"
            type="text"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            required
            disabled={loading}
            placeholder="e.g. Building A"
          />
        </div>

        <div className="form-group">
          <label htmlFor="room">Room *</label>
          <input
            id="room"
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
            disabled={loading}
            placeholder="e.g. Room 302"
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
            rows={5}
            placeholder="Describe the issue in detail"
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
    </Layout>
  );
};
