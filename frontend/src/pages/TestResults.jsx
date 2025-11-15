import { useState, useEffect, useCallback } from 'react';
import { FiFileText, FiRefreshCw } from 'react-icons/fi';
import { testResultService } from '../services/userService';

export default function TestResults() {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadTestResults = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const response = await testResultService.getAll();
      setTestResults(response.data?.data || []);
    } catch (err) {
      console.error('Error loading test results:', err);
      setTestResults([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTestResults();
    const interval = setInterval(() => loadTestResults(true), 30000);
    return () => clearInterval(interval);
  }, [loadTestResults]);

  const filteredTestResults = testResults.filter(t =>
    t.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.testType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return { bg: '#d1fae5', color: '#065f46' };
      case 'PENDING': return { bg: '#fef3c7', color: '#92400e' };
      case 'REVIEWED': return { bg: '#dbeafe', color: '#1e40af' };
      default: return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#666' }}>Loading test results...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '700' }}>Test Results Management</h1>
          <p style={{ color: '#666' }}>Monitor all laboratory and diagnostic test results</p>
        </div>
        <button onClick={() => loadTestResults(true)} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: refreshing ? '#9ca3af' : '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: refreshing ? 'not-allowed' : 'pointer' }}>
          <FiRefreshCw style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <input type="text" placeholder="🔍 Search by test name, type, or patient..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', marginBottom: '1.5rem' }} />

      {filteredTestResults.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧪</p>
          <p style={{ color: '#9ca3af', fontSize: '1.1rem' }}>No test results found</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Test Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Patient</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Type</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestResults.map((test) => {
                const statusStyle = getStatusColor(test.status);
                return (
                  <tr key={test.id} style={{ borderTop: '1px solid #e5e7eb', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiFileText style={{ color: '#6b7280' }} />
                        <span style={{ fontWeight: '600' }}>{test.testName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>{test.patient?.firstName} {test.patient?.lastName}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>ID: {test.patientId}</div>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>{test.testType}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ padding: '0.25rem 0.75rem', background: statusStyle.bg, color: statusStyle.color, borderRadius: '12px', fontSize: '0.875rem', fontWeight: '600', display: 'inline-block' }}>
                        {test.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
                      {new Date(test.testDate).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Showing {filteredTestResults.length} of {testResults.length} test results</p>
      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
