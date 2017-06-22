import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { FormInitial } from "./modules/spring-template-generator/form-initial/form-initial.component";
import { TemplateResult } from "./modules/spring-template-generator/result/result.component";

@NgModule({
  declarations: [
    AppComponent,
    FormInitial,
    TemplateResult
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
