import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { getElectricianRepairDetail, submitQuote, updateQuote } from '../../api/electrician';
import { RepairRequest } from '../../types/repair';
import './ElectricianQuote.css';

export const ElectricianQuote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [repair, setRepair] = useState<RepairRequest | null>(null);
  const [price, setPrice] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRepairDetail();
    }
  }, [id]);

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
    return String(status);
  };

  const fetchRepairDetail = async () => {
    if (!id) return;
    setFetching(true);
    setError(null);
    try {
      const data = await getElectricianRepairDetail(id);
      setRepair(data);
      // Pre-fill price and note if already quoted
      if (data.electricianQuote) {
        setPrice(data.electricianQuote.toString());
      }
      if ((data as any).electricianNote) {
        setNote((data as any).electricianNote);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to fetch repair details';
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

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a positive number');
      return;
    }

    setLoading(true);
    try {
      const quoteData = {
        quotedAmount: priceNum,
        currency: 'CAD',
        electricianNote: note.trim() || undefined,
      };

      const hasQuote = repair?.electricianQuote != null;
      if (hasQuote) {
        await updateQuote(id, quoteData);
        alert('Quote updated successfully!');
      } else {
        await submitQuote(id, quoteData);
        alert('Quote submitted successfully!');
      }

      navigate('/electrician/repairs');
    } catch (err: any) {
      console.error('Error submitting quote:', err);
      const errorMessage =
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to submit quote';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  const getDisplayDate = (repair: RepairRequest | null) => {
    if (!repair) return undefined;
    return (
      repair.submittedAt ||
      repair.creationTime ||
      repair.createdTime ||
      (repair as any).submittedAt ||
      (repair as any).creationTime
    );
  };

  if (fetching) {
    return (
      <Layout>
        <div className="electrician-quote">
          <div className="loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error && !repair) {
    return (
      <Layout>
        <div className="electrician-quote">
          <div className="error">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  if (!repair) {
    return (
      <Layout>
        <div className="electrician-quote">
          <div className="error">Repair not found</div>
        </div>
      </Layout>
    );
  }

  const hasQuote = repair.electricianQuote != null;
  const displayDate = getDisplayDate(repair);

  return (
    <Layout>
      <div className="electrician-quote">
        <div className="electrician-quote-header">
          <h1>{hasQuote ? 'Update Quote' : 'Submit Quote'}</h1>
          <button className="btn-secondary" onClick={() => navigate('/electrician/repairs')}>
            Back to List
          </button>
        </div>

        <div className="electrician-quote-content">
          {/* Repair Request Info (Read-only) */}
          <div className="repair-info-section">
            <h2>Repair Request Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Request No</label>
                <div>{(repair as any).requestNo || repair.id}</div>
              </div>
              <div className="info-item">
                <label>Title</label>
                <div>{repair.title}</div>
              </div>
              <div className="info-item">
                <label>Building</label>
                <div>{repair.building || 'N/A'}</div>
              </div>
              <div className="info-item">
                <label>Room</label>
                <div>{repair.room || 'N/A'}</div>
              </div>
              <div className="info-item">
                <label>Description</label>
                <div>{repair.description}</div>
              </div>
              <div className="info-item">
                <label>Submitted At</label>
                <div>{formatDate(displayDate)}</div>
              </div>
              <div className="info-item">
                <label>Status</label>
                <div>
                  <span
                    className={`status-badge status-${String(
                      repair.approvalStatus ?? 'Pending'
                    ).toLowerCase()}`}
                  >
                    {getApprovalStatusText(repair.approvalStatus)}
                  </span>
                </div>
              </div>
              {hasQuote && (
                <div className="info-item">
                  <label>Current Quote</label>
                  <div>${repair.electricianQuote?.toFixed(2) || '0.00'}</div>
                </div>
              )}
            </div>
          </div>

          {/* Quote Form */}
          <div className="quote-form-section">
            <h2>Quote Information</h2>
            <form onSubmit={handleSubmit} className="quote-form">
              <div className="form-group">
                <label htmlFor="price">
                  Quote Price (CAD) *
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter quote amount"
                />
              </div>

              <div className="form-group">
                <label htmlFor="note">Note (Optional)</label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={loading}
                  rows={4}
                  placeholder="Add any additional notes about the quote"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading
                    ? 'Submitting...'
                    : hasQuote
                    ? 'Update Quote'
                    : 'Submit Quote'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/electrician/repairs')}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};
