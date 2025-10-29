import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 400) {
        console.error('⚠️ Bad Request:', error.error?.message || 'Invalid input.');
      } 
      else if (error.status === 401) {
        console.error('🔒 Unauthorized: Please login again.');
        router.navigate(['/login']);
      } 
      else if (error.status === 403) {
        console.error('🚫 Forbidden: You don’t have permission to access this resource.');
      } 
      else if (error.status === 404) {
        console.error('❓ Not Found: The requested resource was not found.');
      } 
      else if (error.status >= 500) {
        console.error('💥 Server Error:', error.message);
      } 
      else {
        console.error('❌ Unknown Error:', error.message);
      }

      // Re-throw error so components can also handle it if needed
      return throwError(() => error);
    })
  );
};
