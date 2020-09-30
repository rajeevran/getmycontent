
import { Component, OnInit } from '@angular/core';
import { UserServiceService } from 'src/app/userService/user-service.service';
import { MessageService } from 'src/app/userService/message.service';
import { AuthGuard } from 'src/app/authGuard/auth.guard';
import { Router } from '@angular/router';
declare var $:any; 
import Swal from 'sweetalert2/dist/sweetalert2.js'
import { PaginationService } from 'src/app/userService/pagination.service';
@Component({
  selector: 'app-ph',
  templateUrl: './ph.component.html',
  styleUrls: ['./ph.component.css']
})
export class PhComponent implements OnInit {


  loader           :   boolean=false    ;
  page             :   number=1         ;
  limit            :   number=10        ;
  data             :   any = []         ;
  edit             :   boolean=false    ;
  item             :   any=[]           ;
  selected_id      :   any              ;
  totalPages       :   number           ;
  allItems_length  :   number           ;
  pager            :   any = {}         ;
  pagedItems       :   any[]            ;
  offset_limit     :   any ={
                            offset: 0,
                            limit: 10,
                            page : 1,
                            searchTerm: ''
                         } ;


  
  constructor(  
                private _appservice: UserServiceService,
                private _message: MessageService,
                private authguard: AuthGuard,
                private _router: Router,
                private pagerService : PaginationService

            ) { }

  ngOnInit(): void 
  {
       this.getDegreeList(this.offset_limit.page, 0);
  }

  
  setPage(page: number) {

    this.pager = this.pagerService.getPager(this.allItems_length, page);

    console.log('pager', this.pager);

    if (this.pager.totalPages > 0) {

        this.offset_limit.offset = this.pager.startIndex;

        this.offset_limit.limit = this.pager.endIndex + 1;

        console.log('this.offset_limit',this.offset_limit);

        this.page=this.offset_limit.offset/10 +1;

        this.limit=10;

        this.getDegreeList(this.page, 1);
        
        
       }
    }

   
   getDegreeList(page, onLoad: any){


    this.loader = true;
      var url="admin/list-fvalue-pH?page=" + page + "&limit=" +this.limit;

      this._appservice.getApi(url)
      .then((Response) => 
       {
            
            this.loader = false;

            if(Response.STATUSCODE == 4002)
            {
                    this._message.showError(Response.message);
                    this.authguard.logOut();
            }
            else
            {
                    if (Response.response_code == 2000) 
                    {
                        // this._message.showSuccess(Response.response_message);
                        this.data=Response.response_data.docs;
                        
                        this.totalPages = Response.response_data.total;

                        this.allItems_length=  this.totalPages ;

                        if (onLoad === 0) 
                        {
                            this.setPage(1);
                        }

                    } else {
                        this._message.showError(Response.response_message);

                    }

            }
          }, (Error) => {
              this._message.showError(Error.message);
          });


   }


   addNew(){

              this.item=[];
              
              this.edit=false;

   }
   saveData(){

    
    
    if (this.item.name == '' || this.item.name == undefined) {
        let errorMessage = 'please provide ph name';
        this._message.showError(errorMessage);
        return false;
    
      } 
      else
      {


            this.edit=false;

            this.loader=true;

            var obj=
                    { 
                            "name"    :   this.item.name,
                    }

            var url="admin/add-fvalue-pH" ;

            this._appservice.postApi(url,obj).then((Response) => 
            {
                this.loader=false;
                if(Response.STATUSCODE == 4002)
                {
                            this._message.showError(Response.message);
                            this.authguard.logOut();
                }
                else
                {
                            if (Response.response_code == 2000) 
                            {
                                this._message.showSuccess(Response.response_message);
                                $('#addEditModal').modal('hide');

                                this.getDegreeList(1, 0);


                            } else {
                                this._message.showError(Response.response_message);

                            }

                }
                }, (Error) => {
                    this._message.showError(Error.message);
                });


        }

   }



   getDetailsEditBtn(item){
    

    this.selected_id = item._id;

    this.item = item;

    this.edit=true;

    // this.loader=true;

    $('#addEditModal').modal('show');

 
    }



   updateData(){

    if (this.item.name == '' || this.item.name == undefined) {
        let errorMessage = 'please provide ph name ';
        this._message.showError(errorMessage);
        return false;
     }
      else
      {

            this.edit=true;

            this.loader=true;

            var obj =
                    { 
                            "_id"     :   this.selected_id,
                            "name"    :   this.item.name,
                    }

            var url="admin/edit-fvalue-pH" ;

            this._appservice.postApi(url,obj).then((Response) => 
            {
                this.loader=false;

                if(Response.STATUSCODE == 4002)
                {
                            this._message.showError(Response.message);
                            this.authguard.logOut();
                }
                else
                {
                            if (Response.response_code == 2000) 
                            {
                                this._message.showSuccess(Response.response_message);
                                $('#addEditModal').modal('hide');

                                this.getDegreeList(this.page, 1);


                            } else {
                                this._message.showError(Response.response_message);

                            }

                }
                }, (Error) => {
                    this._message.showError(Error.message);
                });

            }
   }




  deleteData(item_id)
  {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-success',
              cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
          })
          
          swalWithBootstrapButtons.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
          }).then((result) => 
          {
              
            if (result.value)                                     //when click on ok button execute the delete data code
            {                                                     // else  display cancelled message
         // =============== Code for delete record is here=============================//

                this.edit=true;
        
                var obj=
                            { 
                                "_id"    :   item_id
                            }
        
                var url="admin/delete-fvalue-pH" ;
        
                this._appservice.postApi(url,obj).then((Response) => 
                {
                        if(Response.STATUSCODE == 4002)
                        {
                                this._message.showError(Response.message);
                                this.authguard.logOut();
                        }
                        else
                        {
                                if (Response.response_code == 2000) 
                                {

                              // ========== show successfully deleted dialog box ===========//

                                    swalWithBootstrapButtons.fire(                                   
                                                                      'Deleted!',
                                                                      'Your file has been deleted.',
                                                                      'success'
                                                                  )

                                  this._message.showSuccess(Response.response_message);

                                  this.getDegreeList(this.page, 1);



        
                                } else {
                                    this._message.showError(Response.response_message);
        
                                }
        
                        }
                    }, (Error) => {
                        this._message.showError(Error.message);
                    });
                                  
         // =============== Code for delete record is finished  here=============================//


            } 
            else if ( result.dismiss === Swal.DismissReason.cancel) 
            { 
                swalWithBootstrapButtons.fire(
                                                'Cancelled',
                                                'Your imaginary file is safe :)',
                                                'error'
                                            )
            }
          })


    }




}
