import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  FileSpreadsheet,
  FileCheck,
  TrendingUp,
  AlertCircle,
  Table as TableIcon,
  RefreshCw,
  Download
} from 'lucide-react';
import { processV4Data, DashboardV4 } from './utils/dataProcessor';
import './styles/dashboard.css';

const App: React.FC = () => {
  const [data, setData] = useState<DashboardV4 | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('Resumen');
  
  const [popFile, setPopFile] = useState<File | null>(null);
  const [cubosFile, setCubosFile] = useState<File | null>(null);
  const [nominalFile, setNominalFile] = useState<File | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('last_processed_dashboard');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed);
        setActiveTab(Object.keys(parsed.data)[0]);
      } catch (e) {
        console.error("Error loading saved data", e);
      }
    }
  }, []);

  const handleProcess = async () => {
    if (!popFile || !cubosFile || !nominalFile) {
      alert('Por favor selecciona los tres archivos requeridos.');
      return;
    }
    setLoading(true);
    try {
      const result = await processV4Data(popFile, cubosFile, nominalFile);
      setData(result);
      setActiveTab(Object.keys(result.data)[0]);
      // Save to localStorage (Careful with size, but should fit)
      localStorage.setItem('last_processed_dashboard', JSON.stringify(result));
    } catch (e) {
      alert('Error procesando datos. Verifica el formato de los archivos.');
    } finally {
      setLoading(false);
    }
  };

  const currentRows = data ? data.data[activeTab] || [] : [];

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Logo Durango" style={{ width: '80px', height: 'auto', marginBottom: '0.5rem' }} />
          <h2 style={{ fontSize: '0.9rem', color: '#fff', letterSpacing: '1px', fontWeight: 800 }}>DURANGO</h2>
          <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)' }}>Secretaría de Salud</p>
        </div>
        <nav style={{ marginTop: '2rem' }}>
          <div className="nav-item active" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            padding: '12px 15px', 
            borderRadius: '10px', 
            background: 'rgba(255,255,255,0.15)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            <LayoutDashboard size={18} /> Tablero SRP/SR
          </div>
          
          <div style={{ marginTop: 'auto', padding: '1rem', fontSize: '0.7rem', opacity: 0.6, position: 'absolute', bottom: 0 }}>
            v5.0 Permanente | 2026
          </div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>Tablero de Cobertura <span style={{ color: 'var(--secondary)' }}>SISCENSIA</span></h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Seguimiento en tiempo real | Metas CONAPO 2026</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {data && (
              <button className="btn-update" style={{ background: '#fff', color: 'var(--primary)', border: '1px solid var(--primary)' }} onClick={() => setData(null)}>
                <RefreshCw size={16} /> Nueva Carga
              </button>
            )}
            <button className="btn-update" onClick={handleProcess} disabled={loading || (!data && (!popFile || !cubosFile || !nominalFile))}>
              {loading ? 'Procesando...' : (data ? 'Actualizar Datos' : 'Generar Dashboard')}
            </button>
          </div>
        </header>

        {!data ? (
          <div className="card" style={{ maxWidth: '800px', margin: '2rem auto', padding: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <TrendingUp size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h2>Bienvenido al Tablero Digital</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Carga los reportes oficiales para visualizar el avance estatal.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem' }}>
              <div className={`upload-zone ${popFile ? 'success' : ''}`}>
                <div style={{ flex: 1 }}>
                  <strong>Base de Población (CONAPO 2026)</strong>
                  <p style={{ fontSize: '0.75rem' }}>{popFile ? popFile.name : 'Archivo Excel .xlsx'}</p>
                </div>
                <input type="file" onChange={e => setPopFile(e.target.files?.[0] || null)} />
                {popFile ? <FileCheck size={20} /> : <FileSpreadsheet size={20} />}
              </div>

              <div className={`upload-zone ${cubosFile ? 'success' : ''}`}>
                <div style={{ flex: 1 }}>
                  <strong>Cubo de Regularización (Dosis Totales)</strong>
                  <p style={{ fontSize: '0.75rem' }}>{cubosFile ? cubosFile.name : 'Archivo Excel .xlsx'}</p>
                </div>
                <input type="file" onChange={e => setCubosFile(e.target.files?.[0] || null)} />
                {cubosFile ? <FileCheck size={20} /> : <FileSpreadsheet size={20} />}
              </div>

              <div className={`upload-zone ${nominalFile ? 'success' : ''}`}>
                <div style={{ flex: 1 }}>
                  <strong>Reporte Nominal SISCENSIA</strong>
                  <p style={{ fontSize: '0.75rem' }}>{nominalFile ? nominalFile.name : 'Archivo CSV .csv'}</p>
                </div>
                <input type="file" onChange={e => setNominalFile(e.target.files?.[0] || null)} />
                {nominalFile ? <FileCheck size={20} /> : <TableIcon size={20} />}
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', background: '#fff9eb', padding: '1rem', borderRadius: '8px', border: '1px solid #ffeeba', fontSize: '0.8rem' }}>
              <AlertCircle size={14} style={{ marginRight: '8px' }} />
              <strong>Nota:</strong> Los datos se procesan localmente en tu navegador. No se almacenan en ningún servidor externo para garantizar la privacidad institucional.
            </div>
          </div>
        ) : (
          <>
            <div className="tab-nav">
              {Object.keys(data.data).map(t => (
                <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                  {t}
                </button>
              ))}
            </div>
            
            <div className="table-card">
              <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>COBERTURA: {activeTab}</span>
                <span style={{ fontSize: '0.8rem' }}>Total Municipios: {currentRows.length}</span>
              </div>
              <div className="table-container">
                <table className="excel-table">
                  <thead>
                    <tr>
                      <th className="sticky-col">MUNICIPIO</th>
                      <th>UNIVERSO</th>
                      <th>META 95%</th>
                      <th>NOMINAL</th>
                      <th>CUBOS</th>
                      <th>TOTAL</th>
                      <th>% COB</th>
                      <th>AVANCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((r, i) => (
                      <tr key={i} className={r.municipio.toLowerCase().includes('durango') ? 'highlight-row' : ''}>
                        <td className="sticky-col">{r.municipio}</td>
                        <td>{r.universo.toLocaleString()}</td>
                        <td>{Math.round(r.meta).toLocaleString()}</td>
                        <td>{r.nominal.toLocaleString()}</td>
                        <td>{r.pendientes.toLocaleString()}</td>
                        <td style={{ fontWeight: 700 }}>{r.total.toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: r.cobertura >= 95 ? 'var(--success)' : r.cobertura < 80 ? 'var(--danger)' : 'var(--warning)' }}>
                          {r.cobertura.toFixed(1)}%
                        </td>
                        <td>
                          <span className={`badge ${r.cobertura >= 95 ? 'green' : r.cobertura < 80 ? 'red' : 'yellow'}`}>
                            {r.semaforo}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;

