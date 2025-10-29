import { HttpInterceptorFn } from '@angular/common/http';
import { Auth} from '../../auth/auth';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authservices = inject(Auth);
  const token = authservices.getToken()

  if (token){
    const cloned = req.clone({
      setHeaders:{Authorization: `Bearer ${token}` }
    })
    return next(cloned)
  }
  return next(req);
};
