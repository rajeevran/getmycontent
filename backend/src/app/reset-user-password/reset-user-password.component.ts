import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../userService/user-service.service';
import { MessageService } from '../userService/message.service';
import { AuthGuard } from '../authGuard/auth.guard';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-user-password',
  templateUrl: './reset-user-password.component.html',
  styleUrls: ['./reset-user-password.component.css']
})
export class ResetUserPasswordComponent implements OnInit {

  token                     : any ;
  showTextBox               : boolean = true;
  showActivediv             : boolean = false;

  showEmailAlreadyVerified  : boolean = false;
  footerDiv                 : boolean = false;
  showerrorDiv              : boolean = false;
  showExpireLinkDiv         : boolean = false;
  item                      : any     = [] ;
  loader                    : boolean = false;

  





  constructor(   
      private _appservice   :   UserServiceService,
      private _message      :   MessageService,
      private authguard     :   AuthGuard,
      private _router       :   Router,
      private activeRoute   :   ActivatedRoute ) { }



      ngOnInit(): void 
      {
          this.activeRoute.params.subscribe(param=>
          {
                this.token = param.token;
                console.log("token",this.token);
          });
    
      
      }

      
  changePassword()
  {
   

    if (this.item.password == '' || this.item.password == undefined) {
      let errorMessage = 'Please provide password';
      this._message.showError(errorMessage);
      return false;
    
    } else if (this.item.cpassword == '' || this.item.cpassword == undefined) {
      let errorMessage = 'Please provide confirm password';
      this._message.showError(errorMessage);
      return false;

    } else if (this.item.password.length < 6) {
      let errorMessage = ('Password must be minimum 6 characters');
      this._message.showError(errorMessage);

    } else if (this.item.password !=  this.item.cpassword ) {
      let errorMessage = 'Both password must be same';
      this._message.showError(errorMessage);
      return false;
  
    }  else {

      var  obj = { 
                    password : this.item.password 
                 }

    this.loader=true;

      this._appservice.verifyUserEmail('api/reset-password', obj ,this.token).then(Response => 
        {
            this.loader=false;

            if (Response.response_code == 5002)
            {
                this._message.showError(Response.response_message);
  
                
            } else if( Response.response_code == 4000)
            {
  
                  this._message.showError("Verification link  expired ");
  
                  this.showExpireLinkDiv = true;

                  this.showTextBox =false;
  
            } else 
            {
                if (Response.response_code == 2000) 
                {
                    this._message.showSuccess(Response.response_message);

                    this.showTextBox=false;

                    this.showActivediv=true
  
                }
                 else 
                {
                    this._message.showError(Response.message);
  
                }
            }
        }).catch(err => {
               this._message.showError(err.message)
        });
  
       

    }



  }








}
