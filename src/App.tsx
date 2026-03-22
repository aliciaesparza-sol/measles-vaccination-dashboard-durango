import React, { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { processStaticData, DashboardV4 } from './utils/dataProcessor';
import './styles/dashboard.css';

const App: React.FC = () => {
  const [data, setData] = useState<DashboardV4 | null>(null);
  const [activeTab, setActiveTab] = useState<string>('RESUMEN MUNICIPIOS');

  useEffect(() => {
    // Procesar datos estáticos al cargar la página
    const result = processStaticData();
    setData(result);
    setActiveTab(Object.keys(result.data)[0]);
  }, []);

  const currentRows = data ? data.data[activeTab] || [] : [];
  const isResumen = activeTab === 'RESUMEN MUNICIPIOS';

  if (!data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid #8b1a2e', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: '#8b1a2e', fontWeight: 600 }}>Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Compute header stats
  const resumenRows = data.data['RESUMEN MUNICIPIOS'] || [];
  const totalUniverso = resumenRows.reduce((a, r) => a + r.universo, 0);
  const totalMeta = resumenRows.reduce((a, r) => a + r.meta, 0);
  const totalDosis = resumenRows.reduce((a, r) => a + r.total, 0);
  const cobEstatal = totalMeta ? ((totalDosis / totalMeta) * 100).toFixed(1) : '0.0';

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', padding: '10px 15px', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <img
              src="/logo.png"
              alt="Logo Durango"
              style={{ width: '130px', height: 'auto', display: 'block' }}
            />
          </div>
          <h2 style={{ fontSize: '0.95rem', color: '#fff', letterSpacing: '1px', fontWeight: 800, lineHeight: 1.2 }}>
            VACUNACIÓN<br />DURANGO
          </h2>
        </div>
        
        <nav>
          <div className="nav-item active" style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px',
            borderRadius: '10px', background: 'rgba(255,255,255,0.15)', cursor: 'pointer',
            fontSize: '0.9rem', fontWeight: 500, marginBottom: '2rem'
          }}>
            <LayoutDashboard size={18} /> Tablero SRP/SR
          </div>
        </nav>

        {/* Semáforo Legend */}
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '10px', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.75rem', color: '#fff', opacity: 0.9, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Código Semáforo</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.75rem', color: '#eccdd2', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem' }}>🟢</span> ≥ 95% (Meta)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem' }}>🟡</span> 80% - 94% (Proceso)
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem' }}>🔴</span> &lt; 80% (Crítico)
            </li>
          </ul>
        </div>

        {/* Info Footer */}
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
          <strong style={{ color: '#fff' }}>Fuente:</strong> Cubos + Nominal SISCENSIA<br/>
          <strong style={{ color: '#fff' }}>Universo:</strong> CONAPO 2026<br/>
          <strong style={{ color: '#fff' }}>Semana Epi:</strong> Semana 12<br/>
          <strong style={{ color: '#fff' }}>Corte:</strong> {data.corteFecha}<br/>
          <span style={{ opacity: 0.5, display: 'block', marginTop: '4px' }}>v5.1 (Institucional)</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>🦠 COBERTURA SARAMPIÓN SRP/SR <span style={{ color: 'var(--secondary)' }}>· DURANGO</span></h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Universo CONAPO 2026 | Cubos ene-may 2025 | Nominal jun 2025–mar 2026 | Corte: {data.corteFecha}
            </p>
          </div>
          {/* Summary pills */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#666' }}>Universo</div>
              <div style={{ fontWeight: 800, color: '#8b1a2e', fontSize: '1rem' }}>{totalUniverso.toLocaleString()}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#666' }}>Meta Sectorial</div>
              <div style={{ fontWeight: 800, color: '#8b1a2e', fontSize: '1rem' }}>{totalMeta.toLocaleString()}</div>
            </div>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#666' }}>Total Dosis</div>
              <div style={{ fontWeight: 800, color: '#8b1a2e', fontSize: '1rem' }}>{totalDosis.toLocaleString()}</div>
            </div>
            <div style={{ background: cobEstatal >= '95' ? '#d4edda' : cobEstatal >= '80' ? '#fff3cd' : '#f8d7da', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#666' }}>Cob. Estatal</div>
              <div style={{ fontWeight: 800, color: '#8b1a2e', fontSize: '1rem' }}>{cobEstatal}%</div>
            </div>
          </div>
        </header>

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
                  <th className="sticky-col">Municipio</th>
                  <th>Universo 2026</th>
                  {!isResumen && <th>% Meta</th>}
                  <th>Meta Sect.</th>
                  <th>Cubos Ene-May 25</th>
                  {isResumen ? (
                    <>
                      <th>Nom. 2025*</th>
                      <th>Nom. 2026</th>
                    </>
                  ) : (
                    <th>Nominal Jun-Mar</th>
                  )}
                  <th>Total Dosis</th>
                  <th>{isResumen ? 'Pendientes vs Meta' : 'Pendientes'}</th>
                  <th>{isResumen ? '% Cob vs Meta' : 'Cob. vs Meta (%)'}</th>
                  {isResumen && <th>% Cob vs Univ</th>}
                  <th>Semáforo</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((r, i) => (
                  <tr key={i} className={r.municipio.toLowerCase() === 'durango' ? 'highlight-row' : ''}>
                    <td className="sticky-col">{r.municipio}</td>
                    <td>{r.universo.toLocaleString()}</td>
                    {!isResumen && <td>{r.pctMetaStr}</td>}
                    <td>{Math.round(r.meta).toLocaleString()}</td>
                    <td>{r.cubos.toLocaleString()}</td>
                    {isResumen ? (
                      <>
                        <td>{(r.nom2025 || 0).toLocaleString()}</td>
                        <td>{(r.nom2026 || 0).toLocaleString()}</td>
                      </>
                    ) : (
                      <td>{(r.nominal || 0).toLocaleString()}</td>
                    )}
                    <td style={{ fontWeight: 700 }}>{r.total.toLocaleString()}</td>
                    <td>{r.pendientes.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: r.cobertura >= 95 ? 'var(--success)' : r.cobertura < 80 ? 'var(--danger)' : 'var(--warning)' }}>
                      {r.cobertura.toFixed(1)}%
                    </td>
                    {isResumen && (
                      <td style={{ color: '#555' }}>{(r.cobUniv || 0).toFixed(1)}%</td>
                    )}
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
      </main>
    </div>
  );
};

export default App;
