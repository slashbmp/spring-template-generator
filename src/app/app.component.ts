import { Component, ViewChild } from '@angular/core';

import { FormInitial } from "./modules/spring-template-generator/form-initial/form-initial.component";
import { TemplateResult } from "./modules/spring-template-generator/result/result.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild("theForm") private theForm: FormInitial;
  @ViewChild("theResult") private theResult: TemplateResult;
  private generated: boolean = false;
  title = 'app';

  private generate() {
    this.theResult.generate(this.theForm.export());
    this.generated = true;
  }

  private copyContent() {
    this.theResult.copyContent();
  }
}
