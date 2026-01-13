import { useState, useCallback } from 'react';
import { RepairRequest } from '../types/repair';
import {
  getElectricianRepairList,
  submitQuote as apiSubmitQuote,
  updateQuote as apiUpdateQuote,
  deleteElectricianRepair as apiDeleteRepair,
  QuoteRequest,
} from '../api/electrician';

export const useElectrician = () => {
  const [waitingRepairs, setWaitingRepairs] = useState<RepairRequest[]>([]);
  const [processedRepairs, setProcessedRepairs] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all repair requests and separate into waiting and processed
   */
  const fetchRepairs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getElectricianRepairList(1, 1000); // Get all for now
      const allRepairs = response.items || [];

      // Separate into waiting (no quote) and processed (has quote)
      const waiting = allRepairs.filter(
        (repair) => !repair.electricianQuote && repair.approvalStatus === 'Pending'
      );
      const processed = allRepairs.filter(
        (repair) => repair.electricianQuote != null && repair.approvalStatus === 'Pending'
      );

      setWaitingRepairs(waiting);
      setProcessedRepairs(processed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch repairs';
      setError(errorMessage);
      console.error('Error fetching electrician repairs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch only waiting repairs (no quote yet)
   */
  const fetchWaitingRepairs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getElectricianRepairList(1, 1000);
      const allRepairs = response.items || [];
      const waiting = allRepairs.filter(
        (repair) => !repair.electricianQuote && repair.approvalStatus === 'Pending'
      );
      setWaitingRepairs(waiting);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch waiting repairs';
      setError(errorMessage);
      console.error('Error fetching waiting repairs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch only processed repairs (has quote)
   */
  const fetchProcessedRepairs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getElectricianRepairList(1, 1000);
      const allRepairs = response.items || [];
      const processed = allRepairs.filter(
        (repair) => repair.electricianQuote != null && repair.approvalStatus === 'Pending'
      );
      setProcessedRepairs(processed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch processed repairs';
      setError(errorMessage);
      console.error('Error fetching processed repairs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit quote for a repair request
   */
  const submitQuote = useCallback(
    async (id: string, quote: QuoteRequest) => {
      setLoading(true);
      setError(null);
      try {
        await apiSubmitQuote(id, quote);
        // Refresh the list after submitting quote
        await fetchRepairs();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to submit quote';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRepairs]
  );

  /**
   * Update quote for a repair request
   */
  const updateQuote = useCallback(
    async (id: string, quote: QuoteRequest) => {
      setLoading(true);
      setError(null);
      try {
        await apiUpdateQuote(id, quote);
        // Refresh the list after updating quote
        await fetchRepairs();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update quote';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRepairs]
  );

  /**
   * Delete a repair request
   */
  const deleteRepair = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await apiDeleteRepair(id);
        // Refresh the list after deleting
        await fetchRepairs();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete repair';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRepairs]
  );

  return {
    waitingRepairs,
    processedRepairs,
    loading,
    error,
    fetchRepairs,
    fetchWaitingRepairs,
    fetchProcessedRepairs,
    submitQuote,
    updateQuote,
    deleteRepair,
  };
};
