import { Component, OnInit } from '@angular/core';
import { UserServiceService } from '../userService/user-service.service';
import { MessageService } from '../userService/message.service';
import { AuthGuard } from '../authGuard/auth.guard';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent implements OnInit {

  id                        : any ;
  showActivediv             : boolean = false;
  showEmailAlreadyVerified  : boolean = false;
  footerDiv                 : boolean = false;
  showerrorDiv              : boolean = false;
  showExpireLinkDiv         : boolean = false;
  loader                    : boolean = false;

  constructor(   
    private _appservice   :   UserServiceService,
    private _message      :   MessageService,
    private authguard     :   AuthGuard,
    private _router       :   Router,
    private activeRoute   :   ActivatedRoute) { }

  

  ngOnInit(): void 
  {
      this.activeRoute.params.subscribe(param=>
      {
            this.id = param.id;
            // console.log("id",this.id);
      });

      this.ActivateAccountComponent();
   
  }
  

  ActivateAccountComponent()
  {

    let obj = { }

    this.loader=true;

    this._appservice.verifyUserEmail('api/verify-account', obj ,this.id).then(Response => 
      {
          this.loader=false;

          if (Response.response_code == 5002)
          {
              this._message.showSuccess("Email already verified");

              this.showEmailAlreadyVerified =true;

              this.footerDiv=true;
              
          } else if( Response.response_code == 4000)
          {

            this._message.showError("Verification link  expired ");

            this.showExpireLinkDiv = true;

            this.footerDiv=true;

          } else 
          {
              if (Response.response_code == 2000) 
              {
                  this._message.showSuccess(Response.response_message);

                  this.showActivediv = true;

                  this.footerDiv=true;
              }
               else 
              {
                  this._message.showError(Response.message);

                  this.showerrorDiv = true;

                  this.footerDiv    =true;
              }
          }
      }).catch(err => {
             this._message.showError(err.message)
      });
  }
  

}
