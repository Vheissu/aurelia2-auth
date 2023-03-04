import { AuthFilterValueConverter } from '../src/auth-filter';

describe('AuthFilterValueConverter', () => {
  let converter: AuthFilterValueConverter;

  beforeEach(() => {
    converter = new AuthFilterValueConverter();
  });

  it('should be defined', () => {
    expect(converter).toBeDefined();
  });

  describe('toView', () => {
    it('should filter routes based on authentication status', () => {
        const routes = [
          { path: '/public', data: { auth: false } },
          { path: '/private', data: { auth: true } },
          { path: '/admin', data: { auth: 'admin' } },
        ];
        const isAuthenticated = true;
        const expected = [
            { path: '/private', data: { auth: true } },
        ];
  
        const result = converter.toView(routes, isAuthenticated);
  
        expect(result).toEqual(expected);
      });
  
      it('should return an empty array if routes is undefined', () => {
        const routes = undefined;
        const isAuthenticated = true;
  
        const result = converter.toView(routes, isAuthenticated);
  
        expect(result).toEqual([]);
      });
  });
});
