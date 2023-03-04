import { valueConverter } from '@aurelia/runtime';

@valueConverter('auth-filter')
export class AuthFilterValueConverter {
  toView(routes: any[] = [], isAuthenticated) {
    return routes?.filter((r) => r?.data?.auth === undefined || r?.data?.auth === isAuthenticated);
  }
}
