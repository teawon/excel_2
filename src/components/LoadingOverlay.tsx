import styles from './LoadingOverlay.module.css'

interface Props {
  message?: string
}

export function LoadingOverlay({ message = '분석 중입니다...' }: Props) {
  return (
    <div className={styles.overlay}>
      <div className={styles.box}>
        <div className={styles.spinner} />
        <p className={styles.message}>{message}</p>
        <span className={styles.sub}>잠시만 기다려 주세요</span>
      </div>
    </div>
  )
}
