import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'absencehub_token';

/** Inyecta el JWT Bearer token en todas las peticiones al backend. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return next(req);
  }

  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(cloned);
};
