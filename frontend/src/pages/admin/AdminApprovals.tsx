import React, { useState, useEffect } from 'react';
import { Layout } from '../../components/Layout';
import { getAdminApprovals, approveRepairRequest, rejectRepairRequest } from '../../api/admin';
import { RepairRequest } from '../../types/repair';
import { useAuth } from '../../hooks/useAuth';
import { Permissions } from '../../constants/permissions';
import './AdminApprovals.css';

export const AdminApprovals: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairRequest | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [processing, setProcessing] = useState(false);
  const { hasPermission } = useAuth();

  useEffect(() => {
    // Check permission
    if (!hasPermission(Permissions.RepairRequests.Approve)) {
      setError('You do not have permission to access this page');
      return;
    }
    fetchApprovals();
  }, [hasPermission]);

  const fetchApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminApprovals({
        skipCount: 0,
        maxResultCount: 100,
      });
      setRepairs(result.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (repair: RepairRequest) => {
    setSelectedRepair(repair);
    setApprovalNote('');
    setShowApproveModal(true);
  };

  const handleRejectClick = (repair: RepairRequest) => {
    setSelectedRepair(repair);
    setRejectNote('');
    setShowRejectModal(true);
  };

  const handleApprove = async () => {
    if (!selectedRepair) return;

    setProcessing(true);
    try {
      await approveRepairRequest(selectedRepair.id, {
        adminDecisionNote: approvalNote || undefined,
      });
      setShowApproveModal(false);
      setSelectedRepair(null);
      setApprovalNote('');
      await fetchApprovals();
      alert('Repair request approved successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve repair request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRepair) return;

    if (!rejectNote.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      await rejectRepairRequest(selectedRepair.id, {
        adminDecisionNote: rejectNote,
      });
      setShowRejectModal(false);
      setSelectedRepair(null);
      setRejectNote('');
      await fetchApprovals();
      alert('Repair request rejected successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject repair request');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  // Convert approvalStatus number to text (0 = Pending, 1 = Approved, 2 = Rejected)
  const getApprovalStatusText = (status: string | number | undefined): string => {
    if (status === undefined || status === null) return 'Pending';
    if (typeof status === 'number') {
      switch (status) {
        case 0: return 'Pending';
        case 1: return 'Approved';
        case 2: return 'Rejected';
        default: return 'Pending';
      }
    }
    if (typeof status === 'string') {
      return status;
    }
    return 'Pending';
  };

  const getStatusBadgeClass = (status: string | number | undefined) => {
    const statusText = getApprovalStatusText(status);
    const lowerStatus = statusText.toLowerCase();
    if (lowerStatus.includes('approved')) return 'status-approved';
    if (lowerStatus.includes('rejected')) return 'status-rejected';
    if (lowerStatus.includes('pending')) return 'status-pending';
    return 'status-pending';
  };

  if (!hasPermission(Permissions.RepairRequests.Approve)) {
    return (
      <Layout>
        <div className="admin-approvals">
          <div className="error">You do not have permission to access this page</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-approvals">
        <div className="admin-approvals-header">
          <h1>Pending Approvals</h1>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && (
          <>
            {repairs.length === 0 ? (
              <div className="empty-state">No pending approvals</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Applicant</th>
                    <th>Quote</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {repairs.map((repair) => (
                    <tr key={repair.id}>
                      <td title={repair.id}>{repair.id?.substring(0, 8)}...</td>
                      <td>{repair.title}</td>
                      <td>
                        {repair.teacherId
                          ? repair.teacherId.substring(0, 8) + '...'
                          : repair.requestNo || 'N/A'}
                      </td>
                      <td>
                        {repair.electricianQuote
                          ? `$${repair.electricianQuote.toFixed(2)}`
                          : 'N/A'}
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            repair.approvalStatus
                          )}`}
                        >
                          {getApprovalStatusText(repair.approvalStatus)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-success"
                            onClick={() => handleApproveClick(repair)}
                            disabled={processing}
                          >
                            Approve
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleRejectClick(repair)}
                            disabled={processing}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* Approve Modal */}
        {showApproveModal && selectedRepair && (
          <div className="modal-overlay" onClick={() => !processing && setShowApproveModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Approve Repair Request</h2>
              <p>
                <strong>Title:</strong> {selectedRepair.title}
              </p>
              <div className="modal-form-group">
                <label htmlFor="approval-note">Approval Note (Optional):</label>
                <textarea
                  id="approval-note"
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  rows={4}
                  placeholder="Enter approval note..."
                />
              </div>
              <div className="modal-actions">
                <button
                  className="btn-primary"
                  onClick={handleApprove}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Confirm Approve'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowApproveModal(false);
                    setApprovalNote('');
                  }}
                  disabled={processing}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedRepair && (
          <div className="modal-overlay" onClick={() => !processing && setShowRejectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Reject Repair Request</h2>
              <p>
                <strong>Title:</strong> {selectedRepair.title}
              </p>
              <div className="modal-form-group">
                <label htmlFor="reject-note">
                  Rejection Reason <span className="required">*</span>:
                </label>
                <textarea
                  id="reject-note"
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows={4}
                  placeholder="Enter rejection reason..."
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  className="btn-primary btn-danger"
                  onClick={handleReject}
                  disabled={processing || !rejectNote.trim()}
                >
                  {processing ? 'Processing...' : 'Confirm Reject'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectNote('');
                  }}
                  disabled={processing}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
