/**
 * 연봉 표기 포맷
 * - display: 1억 미만 "X,XXX만" / 1억 이상 "X.X억" (소수점 1자리)
 * - tooltip: 1억 이상일 때 "X억X,XXX만" 형태의 정확한 값
 */
export function formatSalary(val: number | null): { display: string; tooltip: string } {
  if (val == null) return { display: '—', tooltip: '—' }

  if (val < 10000) {
    const s = `${val.toLocaleString()}만`
    return { display: s, tooltip: s }
  }

  const eok = Math.floor(val / 10000)
  const remainder = val % 10000
  const tooltip =
    remainder === 0 ? `${eok}억` : `${eok}억 ${remainder.toLocaleString()}만`

  const rounded = Math.round(val / 1000) / 10
  const display = `${rounded}억`

  return { display, tooltip }
}
