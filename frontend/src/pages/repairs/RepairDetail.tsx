import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRepairDetail, cancelRepair } from '../../api/repairs';
import { RepairRequest } from '../../types/repair';
import './RepairDetail.css';

export const RepairDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [repair, setRepair] = useState<RepairRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRepairDetail(id);
      setRepair(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repair details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to cancel this repair request?')) {
      try {
        await cancelRepair(id);
        await fetchDetail();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to cancel repair');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="repair-detail"><div className="loading">Loading...</div></div>;
  }

  if (error) {
    return <div className="repair-detail"><div className="error">Error: {error}</div></div>;
  }

  if (!repair) {
    return <div className="repair-detail"><div className="error">Repair not found</div></div>;
  }

  return (
    <div className="repair-detail">
      <div className="repair-detail-header">
        <h1>Repair Details</h1>
        <button className="btn-secondary" onClick={() => navigate('/repairs')}>
          Back to List
        </button>
      </div>

      <div className="repair-detail-content">
        <div className="detail-section">
          <div className="detail-item">
            <label>ID</label>
            <div>{repair.id}</div>
          </div>
          <div className="detail-item">
            <label>Title</label>
            <div>{repair.title}</div>
          </div>
          <div className="detail-item">
            <label>Description</label>
            <div>{repair.description}</div>
          </div>
          <div className="detail-item">
            <label>Status</label>
            <div>
              <span className={`status-badge status-${repair.status.toLowerCase()}`}>
                {repair.status}
              </span>
            </div>
          </div>
          <div className="detail-item">
            <label>Approval Status</label>
            <div>
              <span className={`status-badge status-${repair.approvalStatus.toLowerCase()}`}>
                {repair.approvalStatus}
              </span>
            </div>
          </div>
          <div className="detail-item">
            <label>Created Time</label>
            <div>{formatDate(repair.createdTime)}</div>
          </div>
          {repair.approvalStatus === 'Quoted' && repair.electricianQuote !== undefined && (
            <div className="detail-item">
              <label>Quote Amount</label>
              <div>${repair.electricianQuote.toFixed(2)}</div>
            </div>
          )}
          {(repair.status === 'Approved' || repair.status === 'Rejected') && repair.adminNote && (
            <div className="detail-item">
              <label>{repair.status === 'Approved' ? 'Approval Note' : 'Rejection Note'}</label>
              <div>{repair.adminNote}</div>
            </div>
          )}
        </div>

        <div className="detail-actions">
          {repair.status === 'Pending' && (
            <>
              <button
                className="btn-primary"
                onClick={() => navigate(`/repairs/${repair.id}/edit`)}
              >
                Edit
              </button>
              <button className="btn-danger" onClick={handleCancel}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
