/**
 * VEL(구속) 능력치 스케일(20-80) → km/h 변환
 *
 * 기준: 우완 선발 투수 평균 속구 구속 (img/pitch speed, 20-80.png)
 *   scale 20 = 87 mph 이하 ≈ 140 km/h
 *   scale 80 = 98+ mph ≈ 158 km/h
 * 중간 값은 구간 선형 보간으로 계산.
 */

/** [스케일, km/h] 기준점 — 우완 선발 mph 값을 ×1.60934 변환 후 반올림 */
const BREAKPOINTS: [number, number][] = [
  [20, 140], // 87 mph
  [30, 142], // 88.5 mph
  [40, 146], // 90.5 mph
  [45, 148], // 92 mph
  [50, 150], // 93 mph
  [55, 151], // 94 mph
  [60, 153], // 95 mph
  [65, 154], // 96 mph
  [70, 156], // 97 mph
  [80, 158], // 98 mph
]

/** VEL 스케일(20-80) → km/h (반올림 정수) */
export function velToKph(scale: number): number {
  const clamped = Math.max(20, Math.min(80, scale))

  for (let i = 0; i < BREAKPOINTS.length - 1; i++) {
    const [s0, k0] = BREAKPOINTS[i]
    const [s1, k1] = BREAKPOINTS[i + 1]
    if (clamped <= s1) {
      const t = (clamped - s0) / (s1 - s0)
      return Math.round(k0 + t * (k1 - k0))
    }
  }

  return BREAKPOINTS[BREAKPOINTS.length - 1][1]
}
