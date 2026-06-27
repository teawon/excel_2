import { useMemo, useState } from 'react'
import { useExcelParser } from './hooks/useExcelParser'
import { FileUploader } from './components/FileUploader'
import { OverallStats } from './components/OverallStats'
import { NewspaperDetail } from './components/NewspaperDetail'
import './App.css'

const OVERALL = '__overall__'

function App() {
  const { data, loading, error, parse, reset } = useExcelParser()
  const [activeTab, setActiveTab] = useState<string>(OVERALL)

  const newspapers = useMemo(() => {
    if (!data) return []
    return [...new Set(data.rows.map((r) => String(r['신문사'] ?? '')).filter(Boolean))].sort()
  }, [data])

  const handleNewFile = () => {
    reset()
    setActiveTab(OVERALL)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📊 지방지 통계 분석</h1>
        {data && (
          <div className="header-right">
            <span className="sheet-badge">{data.sheetName ?? ''} 시트</span>
            <span className="file-name">{data.fileName}</span>
            <button className="btn-reset" onClick={handleNewFile}>다른 파일</button>
          </div>
        )}
      </header>

      {data && (
        <nav className="tab-bar">
          <button
            className={`tab ${activeTab === OVERALL ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(OVERALL)}
          >
            📈 전체 통계
          </button>
          <div className="tab-divider" />
          {newspapers.map((paper) => (
            <button
              key={paper}
              className={`tab ${activeTab === paper ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(paper)}
            >
              {paper}
            </button>
          ))}
        </nav>
      )}

      <main className="app-main">
        {!data ? (
          <div className="upload-area">
            <FileUploader onFile={parse} loading={loading} />
            {error && <p className="error">{error}</p>}
          </div>
        ) : activeTab === OVERALL ? (
          <OverallStats rows={data.rows} />
        ) : (
          <NewspaperDetail rows={data.rows} newspaper={activeTab} />
        )}
      </main>
    </div>
  )
}

export default App
