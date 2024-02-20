export const convertMillisecondsToTime = (time: number) => {
  // 총 밀리초 수 계산
  const totalMilliseconds = time * 1000
  // 분 계산
  const minutes = Math.floor(totalMilliseconds / 60000)
  // 남은 밀리초 수 계산
  const remainingMilliseconds = totalMilliseconds % 60000
  // 초 계산
  const remainingSeconds = Math.floor(remainingMilliseconds / 1000)
  // 밀리초 계산
  const milliseconds = Math.round((remainingMilliseconds % 1000) / 10)

  // 시:분:초 형식으로 반환
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`
}
