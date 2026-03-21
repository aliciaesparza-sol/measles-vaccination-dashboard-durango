import React, { useState } from 'react';
import { 
  LayoutDashboard,
  FileSpreadsheet,
  TrendingUp,
  AlertCircle,
  Table as TableIcon
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

  const handleProcess = async () => {
    if (!popFile || !cubosFile || !nominalFile) {
      alert('Por favor selecciona los tres archivos.');
      return;
    }
    setLoading(true);
    try {
      const result = await processV4Data(popFile, cubosFile, nominalFile);
      setData(result);
      setActiveTab(Object.keys(result.data)[0]);
    } catch (e) {
      alert('Error procesando datos.');
    } finally {
      setLoading(false);
    }
  };

  const currentRows = data ? data.data[activeTab] || [] : [];

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>V4.0 SAFE</h2>
        <nav style={{ marginTop: '2rem' }}>
          <div className="nav-item active"><LayoutDashboard size={18} /> Dashboard</div>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>COBERTURAS <span style={{ color: 'var(--accent-gold)' }}>SARAMPION</span></h1>
          <button className="btn-update" onClick={handleProcess} disabled={loading || !popFile || !cubosFile || !nominalFile}>
            {loading ? 'Procesando...' : 'Generar Tablero'}
          </button>
        </header>

        {!data ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '2rem' }}>Carga de Fuentes</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className={`upload-zone ${popFile ? 'success' : ''}`}>
                <FileSpreadsheet size={24} />
                <p>Población</p>
                <input type="file" onChange={e => setPopFile(e.target.files?.[0] || null)} />
              </div>
              <div className={`upload-zone ${cubosFile ? 'success' : ''}`}>
                <FileSpreadsheet size={24} />
                <p>Cubos</p>
                <input type="file" onChange={e => setCubosFile(e.target.files?.[0] || null)} />
              </div>
              <div className={`upload-zone ${nominalFile ? 'success' : ''}`}>
                <TableIcon size={24} />
                <p>Nominal</p>
                <input type="file" onChange={e => setNominalFile(e.target.files?.[0] || null)} />
              </div>
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
              <div className="table-container large">
                <table className="excel-table">
                  <thead>
                    <tr>
                      <th className="sticky-col">MUNICIPIO</th>
                      <th>UNIVERSO</th>
                      <th>META</th>
                      <th>NOMINAL</th>
                      <th>TOTAL</th>
                      <th>COB %</th>
                      <th>SEMÁFORO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRows.map((r, i) => (
                      <tr key={i}>
                        <td className="sticky-col">{r.municipio}</td>
                        <td>{r.universo.toLocaleString()}</td>
                        <td>{Math.round(r.meta).toLocaleString()}</td>
                        <td>{r.nominal.toLocaleString()}</td>
                        <td>{r.total.toLocaleString()}</td>
                        <td>{r.cobertura.toFixed(1)}%</td>
                        <td>{r.semaforo}</td>
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
