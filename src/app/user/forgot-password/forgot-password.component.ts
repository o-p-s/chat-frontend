import { Component, OnInit } from '@angular/core';
import { AppService } from './../../app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  public email:string;
  constructor( public appService: AppService,public router: Router, private toastr: ToastrService) {
  }
  ngOnInit() {
  } 
  public goToSignUp: any = () => {
    this.router.navigate(['/sign-up']);
  } // end goToSignUp

  public goToSignIn: any = () => {
    this.router.navigate(['/']);
  } // end goToSignIn

  public forgotPassword:any=()=>{
    if(!this.email)
    this.toastr.warning('Email is required.')
    else{
      let data={
        email:this.email
      }
      this.appService.forgotPassword(data).subscribe((apiResponse)=>{
        if (apiResponse.status === 200) {
          this.toastr.success('Password reset link mailed.');
            setTimeout(() => {
              this.goToSignIn();
            }, 2000);
        }else{
          this.toastr.error(apiResponse.message);
        }
      },(err) => {

        this.toastr.error('some error occured');

      })
    }
  }
}
