import { Component, OnInit } from '@angular/core';
import { UserServiceService } from 'src/app/userService/user-service.service';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/userService/message.service';
declare var $ : any;
@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})


// export class LoginData {
//   email: string;
//   password: string;
// }
// export class forgotpassAdmin {
//   email: string;
// }

export class LoginPageComponent implements OnInit {
  
  loginData:any=[];
  forgotpwd_email
  loading: boolean = false;
  loader:boolean=false;
  valiemail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  constructor( private _appservice: UserServiceService,
                private _message: MessageService,
                private authguard: AuthGuard,
                private _router: Router) { }

  ngOnInit() 
  {
        const tokenchk = localStorage.getItem('admintoken');
        
        if (tokenchk != null) {
          this._router.navigate(['/dashboard']);
        } else{
          this._router.navigate(['/account/login-page']);

        }
        this.loginData = {
            email: '',
            password: ''
        };
  
  }



  doLogin()
  {

        this.loginData = 
        {
            email: this.loginData.email,
            password: this.loginData.password,
            type : "getmycontent"

        };
        
        if (this.loginData.email.trim() === '' || !this.valiemail.test(this.loginData.email)) {
            const errorMessage = 'Please Provide  Email';
            this._message.showError(errorMessage);
            return false;
        } else if (this.loginData.password === '') {
            const errorMessage = ' Please Provide Password';
            this._message.showError(errorMessage);
            return false;
        } else {
            this.loader=true;
            this._appservice.postApi("auth/local",this.loginData).then((Response) => 
            {
                    this.loader=false;
                    console.log('Response---',Response);

                    if (Response.statuscode == 200) 
                    {
                        this._message.showSuccess(Response.message);

                        localStorage.setItem('adminemail', Response.response.email);
                        localStorage.setItem('admintoken', Response.token);
                        localStorage.setItem('userId', Response.response._id);
                        // this._router.navigate(['/dashboard']);
                        location.reload();

                   } else {
                        this._message.showError(Response.message);

                    }
                }, (Error) => {
                    this._message.showError(Error.message);
                });
        }
  }


  forgotpassLinksend() 
  {
    var obj = {  email: this.forgotpwd_email };
    if (this.forgotpwd_email.trim() == '' || !this.valiemail.test(this.forgotpwd_email)) {
        let errorMessage ='Please provide registered email address';
        // alert(errorMessage);

        // this._message.showError(errorMessage);
    } else {

        this._appservice.postApi('admin/adminForgotPassword',obj)
            .then(Response => {
                if (Response.response_code == 2000) {
                    this._message.showSuccess(Response.response_message);
                    $("#forgotpasswordmodal").modal("hide");
                } else {
                    // this._message.showError(Response.message)
                }
            }).catch(err => {
                this._message.showError(err.message)
            });
    }
}



}
