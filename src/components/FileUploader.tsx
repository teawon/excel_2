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
      className={styles.dropzone}
      onClick={() => inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      {loading ? (
        <p>파일 파싱 중...</p>
      ) : (
        <>
          <p>엑셀 파일을 드래그하거나 클릭해서 업로드</p>
          <span>.xlsx / .xls / .csv 지원</span>
        </>
      )}
    </div>
  )
}
