import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRepairs, cancelRepair } from '../../api/repairs';
import { RepairRequest } from '../../types/repair';
import './RepairList.css';

export const RepairList: React.FC = () => {
    const [repairs, setRepairs] = useState<RepairRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRepairs();
    }, []);

    const fetchRepairs = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMyRepairs();
            // Ensure we always have an array to map over
            setRepairs(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch repairs');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: string) => {
        if (window.confirm('Are you sure you want to cancel this repair request?')) {
            try {
                await cancelRepair(id);
                await fetchRepairs();
            } catch (err) {
                alert(err instanceof Error ? err.message : 'Failed to cancel repair');
            }
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
    };

    return (
        <div className="repair-list">
            <div className="repair-list-header">
                <h1>My Repairs</h1>
                <button className="btn-primary" onClick={() => navigate('/repairs/create')}>
                    + Create Repair
                </button>
            </div>

            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">Error: {error}</div>}

            {!loading && !error && (
                <>
                    {repairs.length === 0 ? (
                        <div className="empty-state">No repairs found</div>
                    ) : (
                        <table className="repair-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Created Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {repairs.map((repair) => {
                                    // Fix for the 400/crash issue: 
                                    // If 'status' is missing, determine it from isCancelled or default to 'Pending'
                                    const displayStatus = repair.status || (repair.isCancelled ? 'Cancelled' : 'Pending');

                                    // Fix for possible date field name mismatch (createdTime vs creationTime)
                                    const displayDate = repair.createdTime || (repair as any).creationTime;

                                    return (
                                        <tr key={repair.id}>
                                            {/* Using substring for ID to keep the table clean if it's a GUID */}
                                            <td title={repair.id}>{repair.id?.substring(0, 8)}...</td>
                                            <td>{repair.title}</td>
                                            <td>
                                                <span className={`status-badge status-${displayStatus.toLowerCase()}`}>
                                                    {displayStatus}
                                                </span>
                                            </td>
                                            <td>{formatDate(displayDate)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-link"
                                                        onClick={() => navigate(`/repairs/${repair.id}`)}
                                                    >
                                                        View Details
                                                    </button>

                                                    {/* Logic to show Edit/Cancel only if not cancelled and still pending */}
                                                    {!repair.isCancelled && displayStatus === 'Pending' && (
                                                        <>
                                                            <button
                                                                className="btn-link"
                                                                onClick={() => navigate(`/repairs/${repair.id}/edit`)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="btn-link btn-danger"
                                                                onClick={() => handleCancel(repair.id)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </>
            )}
        </div>
    );
};