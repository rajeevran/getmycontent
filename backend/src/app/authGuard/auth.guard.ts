import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate 
{
  constructor(private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree 
    {
      if(localStorage.getItem('admintoken')){
        return true;

      }
      this.router.navigate(['']);
      return false;

    }
  

logOut() {

    localStorage.removeItem('admintoken');
    localStorage.removeItem('adminemail');
    this.router.navigate(['/account/login-page']);
    location.reload(true);

}

isLoggedIn() {

  if (localStorage.getItem('admintoken')) {
      // logged in so return true
      return true;
  } else {
      return false;
  }
}
}
