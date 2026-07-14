export function shouldClearLocalStudyData(authEvent: string) {
  return authEvent === 'SIGNED_OUT';
}
