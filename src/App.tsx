import { useExcelParser } from './hooks/useExcelParser'
import { FileUploader } from './components/FileUploader'
import { DataTable } from './components/DataTable'
import { SummaryStats } from './components/SummaryStats'
import './App.css'

function App() {
  const { data, loading, error, parse, reset } = useExcelParser()

  return (
    <div className="app">
      <header className="app-header">
        <h1>Excel Analyzer</h1>
        <p>엑셀 파일을 업로드하면 데이터를 분석하고 통계를 보여드립니다.</p>
      </header>

      <main className="app-main">
        {!data ? (
          <FileUploader onFile={parse} loading={loading} />
        ) : (
          <div>
            <div className="file-info">
              <span>{data.fileName}</span>
              <button onClick={reset}>다른 파일 업로드</button>
            </div>
            <SummaryStats data={data} />
            <DataTable data={data} />
          </div>
        )}
        {error && <p className="error">{error}</p>}
      </main>
    </div>
  )
}

export default App
