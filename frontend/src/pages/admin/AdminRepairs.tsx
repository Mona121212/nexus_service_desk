import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { getAdminRepairRequests } from '../../api/admin';
import { RepairRequest } from '../../types/repair';
import { useAuth } from '../../hooks/useAuth';
import { Permissions } from '../../constants/permissions';
import './AdminRepairs.css';

export const AdminRepairs: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  useEffect(() => {
    // Check permission
    if (!hasPermission(Permissions.RepairRequests.AdminList)) {
      setError('You do not have permission to access this page');
      return;
    }
    fetchRepairs();
  }, [hasPermission, currentPage]);

  const fetchRepairs = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminRepairRequests({
        skipCount: (currentPage - 1) * pageSize,
        maxResultCount: pageSize,
      });
      setRepairs(result.items || []);
      setTotalCount(result.totalCount || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repair requests');
    } finally {
      setLoading(false);
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
    if (lowerStatus.includes('completed')) return 'status-completed';
    return 'status-pending';
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (!hasPermission(Permissions.RepairRequests.AdminList)) {
    return (
      <Layout>
        <div className="admin-repairs">
          <div className="error">You do not have permission to access this page</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admin-repairs">
        <div className="admin-repairs-header">
          <h1>全部报修</h1>
        </div>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && (
          <>
            {repairs.length === 0 ? (
              <div className="empty-state">No repair requests found</div>
            ) : (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>标题</th>
                      <th>申请人</th>
                      <th>报价</th>
                      <th>状态</th>
                      <th>创建时间</th>
                      <th>操作</th>
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
                              repair.approvalStatus ?? repair.status
                            )}`}
                          >
                            {getApprovalStatusText(repair.approvalStatus ?? repair.status)}
                          </span>
                        </td>
                        <td>{formatDate(repair.submittedAt || repair.creationTime)}</td>
                        <td>
                          <button
                            className="btn-link"
                            onClick={() => navigate(`/repairs/${repair.id}`)}
                          >
                            查看详情
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="btn-secondary"
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      上一页
                    </button>
                    <span className="pagination-info">
                      第 {currentPage} 页，共 {totalPages} 页（总计 {totalCount} 条）
                    </span>
                    <button
                      className="btn-secondary"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
