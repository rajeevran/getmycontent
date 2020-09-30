import { Component, OnInit } from '@angular/core';
import { UserServiceService } from 'src/app/userService/user-service.service';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/userService/message.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  updatePasswordData        :       any=[]
  loader                    :       boolean=false;


  constructor(   
    private _appservice      :      UserServiceService,
    private _message         :      MessageService,
    private authguard        :      AuthGuard,
    private _router          :      Router) { }

  ngOnInit() 
  {
            if (!this.authguard.isLoggedIn()) 
            {
                this._router.navigate(['/account/login']);
            }

  }


  updatePassword() {

    var obj={
                 email     :     localStorage.getItem('adminemail'),
                 password  :     this.updatePasswordData.password
            }

    if (this.updatePasswordData.password == '') {
        let errorMessage = ('Please enter a password');
        this._message.showError(errorMessage);
    } else if (this.updatePasswordData.password.length < 6) {
        let errorMessage = ('Password must be minimum 6 characters');
        this._message.showError(errorMessage);
    } else if (this.updatePasswordData.password != this.updatePasswordData.repassword) {
        let errorMessage = ('Both password must be same');
        this._message.showError(errorMessage);
    } else {

        this.updatePasswordData.useremail = localStorage.getItem('adminemail');
        this.loader=true;
        this._appservice.postApi('admin/adminChangePassword',obj).then(Response => 
            {
                this.loader=false;

                if (Response.STATUSCODE == 4002)
                {
                    this._message.showError(Response.message);
                    this.authguard.logOut();
                }
                 else 
                {
                    if (Response.response_code == 2000) 
                    {
                        this._message.showSuccess(Response.response_message);
                        location.reload();
                        this.authguard.logOut(); 

                    }
                     else 
                    {
                        this._message.showError(Response.message)
                    }
                }
            }).catch(err => {
                   this._message.showError(err.message)
            });
    }

}

    cancel()
    {
    this._router.navigate(['/dashboard']);

    }
}
