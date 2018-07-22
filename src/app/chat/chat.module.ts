import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { SharedModule } from '../shared/shared.module';
import { RemoveSpecialCharPipe } from '../shared/pipe/remove-special-char.pipe';
import { FirstCharPipe } from './../shared/pipe/first-char.component';
import { ChatRouteGuardService } from './chat-route-guard.service';
import { ChatViewComponent } from './chat-view/chat-view.component';
import { FormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select'
import { ScrollbarModule } from 'ngx-scrollbar';
@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    RouterModule.forChild([
      {path:'chat',component:ChatViewComponent,canActivate:[ChatRouteGuardService]},
    ]),
    SharedModule,
    MatSelectModule,
    FormsModule,
    ScrollbarModule,
  ],
  declarations: [RemoveSpecialCharPipe, FirstCharPipe, ChatViewComponent],
  providers:[ChatRouteGuardService]
})
export class ChatModule { }
