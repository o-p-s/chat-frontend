import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomCreatorComponent } from './room-creator/room-creator.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select'

@NgModule({
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    MatSelectModule,
    FormsModule
  ],
  declarations: [RoomCreatorComponent],
  exports:[RoomCreatorComponent,
  CommonModule,
  FormsModule]
})
export class SharedModule { }
