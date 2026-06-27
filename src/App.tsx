import { useState } from 'react'
import { useExcelParser } from './hooks/useExcelParser'
import { FileUploader } from './components/FileUploader'
import { DataExplorer } from './components/DataExplorer'
import { StatisticsView } from './components/StatisticsView'
import './App.css'

type MainTab = 'data' | 'stats'

function App() {
  const { data, loading, error, parse, reset } = useExcelParser()
  const [tab, setTab] = useState<MainTab>('data')

  const handleNewFile = () => {
    reset()
    setTab('data')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📊 지방지 데이터 분석</h1>
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
            className={`tab ${tab === 'data' ? 'tab-active' : ''}`}
            onClick={() => setTab('data')}
          >
            📋 데이터 조회
          </button>
          <button
            className={`tab ${tab === 'stats' ? 'tab-active' : ''}`}
            onClick={() => setTab('stats')}
          >
            📊 통계
          </button>
        </nav>
      )}

      <main className="app-main">
        {!data ? (
          <div className="upload-area">
            <FileUploader onFile={parse} loading={loading} />
            {error && <p className="error">{error}</p>}
          </div>
        ) : tab === 'data' ? (
          <DataExplorer rows={data.rows} />
        ) : (
          <StatisticsView rows={data.rows} />
        )}
      </main>
    </div>
  )
}

export default App
