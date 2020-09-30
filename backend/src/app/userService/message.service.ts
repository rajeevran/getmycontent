  import { Injectable } from '@angular/core';
  import { ToastrService } from 'ngx-toastr';

  @Injectable({
    providedIn: 'root'
  })
  export class MessageService {

    constructor(private toastr: ToastrService) 
    {

    }
    
    showSuccess(msessage: any) {
      
      this.toastr.success(msessage, '', {
          timeOut: 4000,
          progressBar: true,
          progressAnimation: 'decreasing',
          closeButton: true,
          positionClass: "toast-top-right",
          tapToDismiss: false

      });
  }

    showError(message: any) {

      this.toastr.error(message, '', {
          timeOut: 4000,
          progressBar: true,
          progressAnimation: 'decreasing',
          closeButton: true,
          positionClass: "toast-top-right",
          tapToDismiss: false

      });
    }

    showWarning(message: any) {
      this.toastr.warning(message, '', {
          timeOut: 4000,
          progressBar: true,
          progressAnimation: 'decreasing',
          closeButton: true,
          positionClass: "toast-top-right",
          tapToDismiss: false

      });
    }

    showInfo(message: any) {
      this.toastr.info(message, '', {
          timeOut: 4000,
          progressBar: true,
          progressAnimation: 'decreasing',
          closeButton: true,
          positionClass: "toast-top-right",
          tapToDismiss: false

      });
    }
  }
