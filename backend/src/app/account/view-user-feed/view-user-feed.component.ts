import { Component, OnInit } from '@angular/core';
import { UserServiceService } from 'src/app/userService/user-service.service';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { Router } from '@angular/router';
import { MessageService } from 'src/app/userService/message.service';

@Component({
  selector: 'app-view-user-feed',
  templateUrl: './view-user-feed.component.html',
  styleUrls: ['./view-user-feed.component.css']
})
export class ViewUserFeedComponent implements OnInit {

  userFeedData              :       any=[]
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

    viewFeed()
    {
        
        this.loader=true;
        let userId= localStorage.getItem('userId')
        this._appservice.getApi('api/v1/getMyContent/users/'+userId).then(Response => 
            {
                this.loader=false;

                if (Response.statuscode == 200) 
                {
                    this._message.showSuccess(Response.message);
                    this.userFeedData = Response.response;
                    location.reload();

                } else {
                    this._message.showError(Response.message);

                }
            }).catch(err => {
                this._message.showError(err.message)
            });
    }

    cancel()
    {
    this._router.navigate(['/dashboard']);

    }
}
