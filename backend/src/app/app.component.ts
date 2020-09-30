import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthGuard } from './authGuard/auth.guard';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent 
{
  title = 'jobbyAdmin';
  isAdmin:boolean = false;
  isLogin:boolean = false;

  constructor(  public router: Router,
                public activateroute: ActivatedRoute,
                private _router: Router,
                private authguard: AuthGuard)
             {

             }


  ngOnInit() {
            
                this.isLogin = false;
                if (this.authguard.isLoggedIn()) {
                  this.isLogin = true;
                }
            
                if (localStorage.getItem('adminemail') != null) {
                  this.isAdmin = true;
                }
                // console.log('after', this.isLogin);
              }
  logoutAdmin() {
    this.isLogin = false;
    localStorage.clear();
    this.router.navigate(['/account/login-page']);
    
  }

  addFeed(){

  }
  
  gotoDashboard(){
    this._router.navigate(['/dashboard']);

  }

}
