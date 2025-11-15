import { useState, useEffect, useCallback } from 'react';
import { FiPackage, FiRefreshCw } from 'react-icons/fi';
import { prescriptionService } from '../services/userService';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadPrescriptions = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const response = await prescriptionService.getAll();
      setPrescriptions(response.data?.data || []);
    } catch (err) {
      console.error('Error loading prescriptions:', err);
      setPrescriptions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPrescriptions();
    const interval = setInterval(() => loadPrescriptions(true), 30000);
    return () => clearInterval(interval);
  }, [loadPrescriptions]);

  const filteredPrescriptions = prescriptions.filter(p =>
    p.medicationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patient?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctor?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctor?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: '#666' }}>Loading prescriptions...</p>
        </div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: '700' }}>Prescriptions Management</h1>
          <p style={{ color: '#666' }}>Monitor all prescriptions and medications</p>
        </div>
        <button onClick={() => loadPrescriptions(true)} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: refreshing ? '#9ca3af' : '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: refreshing ? 'not-allowed' : 'pointer' }}>
          <FiRefreshCw style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <input type="text" placeholder="🔍 Search by medication, patient, or doctor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '1rem', marginBottom: '1.5rem' }} />

      {filteredPrescriptions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>💊</p>
          <p style={{ color: '#9ca3af', fontSize: '1.1rem' }}>No prescriptions found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                  <FiPackage />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem' }}>{prescription.medicationName}</h3>
                  <span style={{ padding: '0.25rem 0.75rem', background: '#dbeafe', color: '#1e40af', borderRadius: '12px', fontSize: '0.875rem', fontWeight: '600' }}>
                    {prescription.status}
                  </span>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>👤 Patient:</span>
                  <span style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>{prescription.patient?.firstName} {prescription.patient?.lastName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>👨‍⚕️ Doctor:</span>
                  <span style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>💊 Dosage:</span>
                  <span style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>{prescription.dosage}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>🔢 Frequency:</span>
                  <span style={{ fontWeight: '600', color: '#374151', fontSize: '0.875rem' }}>{prescription.frequency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Showing {filteredPrescriptions.length} of {prescriptions.length} prescriptions</p>
      </div>

      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }}`}</style>
    </div>
  );
}
