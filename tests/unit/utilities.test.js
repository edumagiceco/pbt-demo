const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Unit Tests - Basic Utilities', () => {
  
  describe('bcrypt 비밀번호 해싱', () => {
    it('비밀번호를 해싱할 수 있어야 함', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('해싱된 비밀번호를 검증할 수 있어야 함', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
      
      const isInvalid = await bcrypt.compare('wrongpassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });

    it('같은 비밀번호라도 매번 다른 해시가 생성되어야 함', async () => {
      const password = 'testpassword123';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);
      
      expect(hash1).not.toBe(hash2);
      
      // 하지만 둘 다 원본 비밀번호와 매치되어야 함
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
  });

  describe('JWT 토큰 처리', () => {
    const secret = 'test-secret-key';
    const payload = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      userType: 'student'
    };

    it('JWT 토큰을 생성할 수 있어야 함', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT는 3개 부분으로 구성
    });

    it('JWT 토큰을 검증하고 디코딩할 수 있어야 함', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      const decoded = jwt.verify(token, secret);
      
      expect(decoded.id).toBe(payload.id);
      expect(decoded.username).toBe(payload.username);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.userType).toBe(payload.userType);
      expect(decoded.iat).toBeDefined(); // issued at
      expect(decoded.exp).toBeDefined(); // expires at
    });

    it('잘못된 비밀키로 토큰 검증 시 오류가 발생해야 함', () => {
      const token = jwt.sign(payload, secret, { expiresIn: '1h' });
      
      expect(() => {
        jwt.verify(token, 'wrong-secret');
      }).toThrow('invalid signature');
    });
  });

  describe('기본 유틸리티 함수들', () => {
    it('이메일 형식 검증 함수', () => {
      const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.kr')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@invalid.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('사용자명 형식 검증 함수', () => {
      const isValidUsername = (username) => {
        if (!username || typeof username !== 'string') return false;
        return username.length >= 3 && 
               username.length <= 50 && 
               /^[a-zA-Z0-9_-]+$/.test(username);
      };

      expect(isValidUsername('validuser123')).toBe(true);
      expect(isValidUsername('user_name')).toBe(true);
      expect(isValidUsername('user-name')).toBe(true);
      expect(isValidUsername('ab')).toBe(false); // 너무 짧음
      expect(isValidUsername('a'.repeat(51))).toBe(false); // 너무 김
      expect(isValidUsername('user name')).toBe(false); // 공백 포함
      expect(isValidUsername('user@name')).toBe(false); // 특수문자 포함
      expect(isValidUsername('')).toBe(false);
      expect(isValidUsername(null)).toBe(false);
      expect(isValidUsername(undefined)).toBe(false);
    });

    it('비밀번호 강도 검증 함수', () => {
      const isStrongPassword = (password) => {
        if (!password || typeof password !== 'string') return false;
        return password.length >= 6 && 
               password.length <= 128;
      };

      expect(isStrongPassword('password123')).toBe(true);
      expect(isStrongPassword('123456')).toBe(true);
      expect(isStrongPassword('12345')).toBe(false); // 너무 짧음
      expect(isStrongPassword('a'.repeat(129))).toBe(false); // 너무 김
      expect(isStrongPassword('')).toBe(false);
      expect(isStrongPassword(null)).toBe(false);
      expect(isStrongPassword(undefined)).toBe(false);
    });
  });
});
