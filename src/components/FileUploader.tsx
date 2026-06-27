import { useRef } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import styles from './FileUploader.module.css'

interface Props {
  onFile: (file: File) => void
  loading: boolean
}

export function FileUploader({ onFile, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      className={`${styles.dropzone} ${loading ? styles.loading : ''}`}
      onClick={() => !loading && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.xlsm,.csv"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      {loading ? (
        <>
          <div className={styles.spinner} />
          <p className={styles.title}>분석 중입니다...</p>
          <span className={styles.sub}>잠시만 기다려 주세요</span>
        </>
      ) : (
        <>
          <div className={styles.icon}>📄</div>
          <p className={styles.title}>여기에 엑셀 파일을 올려주세요</p>
          <span className={styles.sub}>파일을 끌어다 놓거나, 눌러서 선택하세요</span>
        </>
      )}
    </div>
  )
}
