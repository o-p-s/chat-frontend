import { Component, OnInit } from '@angular/core';
import { AppService } from './../../app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  public newPassword;
  public verifyPassword;
  private token;
  constructor(public appService: AppService,public router: Router, private toastr: ToastrService,private _route:ActivatedRoute) {
  }
  ngOnInit() {
    this.token=this._route.snapshot.queryParamMap.get('token')
    if(this.token==''||this.token==null||this.token==undefined)
    this.goToSignIn();
  }
  public goToSignIn: any = () => {
    this.router.navigate(['/']);
  } // end goToSignIn
  public resetPassword=()=>{
    if(!this.newPassword && !this.verifyPassword)
    this.toastr.warning('Password Required')
    else  if (!this.newPassword.match(/^[A-Za-z0-9]\w{7,}$/)){
      /* Minimum 8 characters which contain only characters,numeric digits, underscore and first character must be a letter */ 
      this.toastr.warning('Passwrod does not meet requirements')
    }
    else if(this.newPassword!=this.verifyPassword)
    this.toastr.warning('Password mismatch')
    else{
      let data={
        newPassword:this.newPassword,
        verifyPassword:this.verifyPassword,
        token:this.token
      }
      this.appService.resetPassword(data).subscribe((apiResponse)=>{
        if (apiResponse.status === 200) {
          this.toastr.success('Password Reset successful!');
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
