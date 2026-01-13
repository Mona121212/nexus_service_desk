import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRepairDetail, cancelRepair } from "../../api/repairs";
import { RepairRequest } from "../../types/repair";
import { Layout } from "../../components/Layout";
import "./RepairDetail.css";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRepairDetail(id);
      setRepair(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        "Failed to fetch repair details";
      setError(errorMessage);
      console.error("Error fetching repair detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    const reason = window.prompt("Please provide a reason for cancellation:");
    if (reason === null) return; // User clicked Cancel

    if (reason.trim() === "") {
      alert("Cancellation reason is required");
      return;
    }

    if (
      window.confirm("Are you sure you want to cancel this repair request?")
    ) {
      try {
        await cancelRepair(id, reason.trim());
        await fetchDetail();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Failed to cancel repair");
      }
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="repair-detail">
          <div className="loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="repair-detail">
          <div className="error">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  if (!repair) {
    return (
      <Layout>
        <div className="repair-detail">
          <div className="error">Repair not found</div>
        </div>
      </Layout>
    );
  }

  // --- Defensive logic to prevent .toLowerCase() crashes ---
  // 1. Determine Display Status
  const displayStatus =
    repair.status || ((repair as any).isCancelled ? "Cancelled" : "Pending");

  // 2. Determine Approval Status
  const displayApproval = (repair as any).approvalStatus || "Pending";

  // 3. Determine Creation Date (handling ABP naming conventions)
  // Priority: submittedAt (business field) > creationTime (ABP audit field) > createdTime (legacy)
  const displayDate =
    repair.submittedAt ||
    repair.creationTime ||
    repair.createdTime ||
    (repair as any).submittedAt ||
    (repair as any).creationTime;

  return (
    <Layout>
      <div className="repair-detail">
        <div className="repair-detail-header">
          <h1>Repair Details</h1>
          <button
            className="btn-secondary"
            onClick={() => navigate("/repairs")}
          >
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
              <label>Building</label>
              <div>{repair.building || "N/A"}</div>
            </div>
            <div className="detail-item">
              <label>Room</label>
              <div>{repair.room || "N/A"}</div>
            </div>
            <div className="detail-item">
              <label>Description</label>
              <div>{repair.description}</div>
            </div>

            <div className="detail-item">
              <label>Status</label>
              <div>
                {/* SAFE: Using displayStatus which is guaranteed to be a string */}
                <span
                  className={`status-badge status-${displayStatus.toLowerCase()}`}
                >
                  {displayStatus}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <label>Approval Status</label>
              <div>
                {/* SAFE: Using displayApproval which is guaranteed to be a string */}
                <span
                  className={`status-badge status-${displayApproval
                    .toString()
                    .toLowerCase()}`}
                >
                  {displayApproval}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <label>Created Time</label>
              <div>{formatDate(displayDate)}</div>
            </div>

            {/* Optional electrician quote section */}
            {(repair as any).electricianQuote !== undefined &&
              (repair as any).electricianQuote !== null && (
                <div className="detail-item">
                  <label>Quote Amount</label>
                  <div>${(repair as any).electricianQuote.toFixed(2)}</div>
                </div>
              )}

            {/* Optional admin notes for approval/rejection */}
            {(repair as any).adminNote && (
              <div className="detail-item">
                <label>
                  {displayStatus === "Approved"
                    ? "Approval Note"
                    : "Rejection Note"}
                </label>
                <div>{(repair as any).adminNote}</div>
              </div>
            )}

            {/* Cancellation information */}
            {repair.isCancelled && (
              <>
                {(repair as any).cancelledReason && (
                  <div className="detail-item">
                    <label>Cancellation Reason</label>
                    <div>{(repair as any).cancelledReason}</div>
                  </div>
                )}
                {(repair as any).cancelledAt && (
                  <div className="detail-item">
                    <label>Cancelled At</label>
                    <div>{formatDate((repair as any).cancelledAt)}</div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="detail-actions">
            {!(repair as any).isCancelled && displayStatus === "Pending" && (
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
    </Layout>
  );
};
