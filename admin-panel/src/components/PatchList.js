import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function PatchList({ patches, onEdit, onDelete, onRefresh }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const itemsPerPage = 10;

  // Pagination
  const totalPages = Math.ceil(patches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPatches = patches.slice(startIndex, endIndex);

  const handleRefresh = async () => {
    if (!window.confirm('Refresh patches from Liquipedia? This may take a while.')) {
      return;
    }

    setIsRefreshing(true);
    try {
      const response = await axios.post(`${API_URL}/patches/refresh`, { limit: 20 });
      alert(`Successfully refreshed ${response.data.count} patches`);
      onRefresh();
    } catch (error) {
      console.error('Error refreshing patches:', error);
      alert('Error refreshing patches: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Total patches:</strong> {patches.length}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          style={{
            padding: '8px 16px',
            fontSize: '0.9rem',
            background: isRefreshing ? '#9ca3af' : '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: isRefreshing ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}
        >
          {isRefreshing ? '⏳ Refreshing...' : '🔄 Refresh from Liquipedia'}
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #d1d5db' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Version</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Release Date</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>New Hero</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Hero Adjustments</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPatches.map((patch, index) => (
              <tr 
                key={patch.version || index} 
                style={{ 
                  borderBottom: '1px solid #e5e7eb',
                  background: index % 2 === 0 ? '#ffffff' : '#f9fafb'
                }}
              >
                <td style={{ padding: '12px', fontWeight: '600', color: '#1f2937' }}>
                  {patch.version}
                </td>
                <td style={{ padding: '12px', color: '#6b7280' }}>
                  {formatDate(patch.release_date)}
                </td>
                <td style={{ padding: '12px', color: '#6b7280' }}>
                  {patch.new_hero?.name || 'None'}
                </td>
                <td style={{ padding: '12px', color: '#6b7280' }}>
                  {patch.hero_adjustments ? Object.keys(patch.hero_adjustments).length : 0} heroes
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => onEdit(patch)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.875rem',
                        background: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(patch.version)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.875rem',
                        background: '#ef4444',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ 
          marginTop: '20px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: '8px'
        }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              fontSize: '0.9rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: currentPage === 1 ? '#f3f4f6' : '#ffffff',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: currentPage === 1 ? '#9ca3af' : '#374151'
            }}
          >
            ← Prev
          </button>

          {[...Array(totalPages)].map((_, i) => i + 1).filter(page => {
            return page === 1 || 
                   page === totalPages || 
                   (page >= currentPage - 1 && page <= currentPage + 1);
          }).map((page, idx, arr) => (
            <React.Fragment key={page}>
              {idx > 0 && arr[idx - 1] !== page - 1 && (
                <span style={{ padding: '8px 4px', color: '#9ca3af' }}>...</span>
              )}
              <button
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.9rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: currentPage === page ? '#3b82f6' : '#ffffff',
                  color: currentPage === page ? '#ffffff' : '#374151',
                  cursor: 'pointer',
                  fontWeight: currentPage === page ? 'bold' : 'normal'
                }}
              >
                {page}
              </button>
            </React.Fragment>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              fontSize: '0.9rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: currentPage === totalPages ? '#f3f4f6' : '#ffffff',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              color: currentPage === totalPages ? '#9ca3af' : '#374151'
            }}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}

export default PatchList;
