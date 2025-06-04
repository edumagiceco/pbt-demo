module.exports = async () => {
  console.log('🧹 전역 테스트 환경 정리 시작...');
  
  // 전역 정리 작업
  if (global.testDb) {
    await global.testDb.close();
    console.log('   ✅ 테스트 데이터베이스 연결 종료');
  }
  
  if (global.testServer) {
    global.testServer.close();
    console.log('   ✅ 테스트 서버 종료');
  }
  
  console.log('✅ 전역 테스트 환경 정리 완료');
};
