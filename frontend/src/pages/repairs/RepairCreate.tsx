import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRepair } from '../../api/repairs';
import { Layout } from '../../components/Layout';
import './RepairCreate.css';

export const RepairCreate: React.FC = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [building, setBuilding] = useState('');
    const [room, setRoom] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate all mandatory fields required by the DTO
        if (!title.trim() || !description.trim() || !building.trim() || !room.trim()) {
            setError('All fields marked with * are required');
            return;
        }

        setLoading(true);
        try {
            await createRepair({
                title: title.trim(),
                description: description.trim(),
                building: building.trim(),
                room: room.trim()
            });

            alert('Repair request created successfully!');

            setTimeout(() => {
                navigate('/repairs');
            }, 1000);
        } catch (err: any) {
            // Catching specific ABP validation errors if available
            const backendError = err.response?.data?.error?.validationErrors;
            setError(backendError ? 'Validation failed. Please check your input.' : 'Failed to create repair request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="repair-create">
                <h1>Create Repair Request</h1>
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
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate(-1)}
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