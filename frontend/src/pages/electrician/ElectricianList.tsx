import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useElectrician } from '../../hooks/useElectrician';
import { RepairRequest } from '../../types/repair';
import './ElectricianList.css';

export const ElectricianList: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'waiting' | 'processed'>('waiting');
  const navigate = useNavigate();
  const {
    waitingRepairs,
    processedRepairs,
    loading,
    error,
    fetchRepairs,
    deleteRepair,
  } = useElectrician();

  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  const handleQuote = (id: string) => {
    navigate(`/electrician/repairs/${id}/quote`);
  };

  const handleViewDetail = (id: string) => {
    navigate(`/repairs/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this repair request?')) {
      try {
        await deleteRepair(id);
        alert('Repair request deleted successfully');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete repair request');
      }
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  const getDisplayDate = (repair: RepairRequest) => {
    return (
      repair.submittedAt ||
      repair.creationTime ||
      repair.createdTime ||
      (repair as any).submittedAt ||
      (repair as any).creationTime
    );
  };

  const currentRepairs = activeTab === 'waiting' ? waitingRepairs : processedRepairs;

  return (
    <Layout>
      <div className="electrician-list">
        <div className="electrician-list-header">
          <h1>Repair Records</h1>
        </div>

        {/* Tabs */}
        <div className="electrician-tabs">
          <button
            className={`tab-button ${activeTab === 'waiting' ? 'active' : ''}`}
            onClick={() => setActiveTab('waiting')}
          >
            Pending Repairs ({waitingRepairs.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'processed' ? 'active' : ''}`}
            onClick={() => setActiveTab('processed')}
          >
            Processed Repairs ({processedRepairs.length})
          </button>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && (
          <>
            {currentRepairs.length === 0 ? (
              <div className="empty-state">
                No {activeTab === 'waiting' ? 'pending' : 'processed'} repairs found
              </div>
            ) : (
              <table className="electrician-table">
                <thead>
                  <tr>
                    <th>Request No</th>
                    <th>Title</th>
                    <th>Building</th>
                    <th>Room</th>
                    <th>Submitted At</th>
                    <th>Quote Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRepairs.map((repair) => {
                    const displayDate = getDisplayDate(repair);
                    const hasQuote = repair.electricianQuote != null;

                    return (
                      <tr key={repair.id}>
                        <td>{(repair as any).requestNo || repair.id?.substring(0, 8)}</td>
                        <td>{repair.title}</td>
                        <td>{repair.building || 'N/A'}</td>
                        <td>{repair.room || 'N/A'}</td>
                        <td>{formatDate(displayDate)}</td>
                        <td>
                          {hasQuote
                            ? `$${repair.electricianQuote?.toFixed(2) || '0.00'}`
                            : 'Not quoted'}
                        </td>
                        <td>
                          <span
                            className={`status-badge status-${(
                              repair.approvalStatus || 'Pending'
                            ).toLowerCase()}`}
                          >
                            {repair.approvalStatus || 'Pending'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {!hasQuote && (
                              <button
                                className="btn-link btn-primary"
                                onClick={() => handleQuote(repair.id)}
                              >
                                Quote
                              </button>
                            )}
                            {hasQuote && (
                              <button
                                className="btn-link btn-primary"
                                onClick={() => handleQuote(repair.id)}
                              >
                                Update Quote
                              </button>
                            )}
                            <button
                              className="btn-link"
                              onClick={() => handleViewDetail(repair.id)}
                            >
                              View Details
                            </button>
                            {!hasQuote && (
                              <button
                                className="btn-link btn-danger"
                                onClick={() => handleDelete(repair.id)}
                              >
                                Delete
                              </button>
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
    </Layout>
  );
};
