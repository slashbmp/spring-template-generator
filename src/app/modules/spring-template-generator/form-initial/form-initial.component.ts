import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from "@angular/forms";

interface Field {
	name: string;
	type: string;
}

interface SFormObject {
	tableName: string,
	className: string,
	fields: Field[]
}

@Component({
	"selector": "form-initial",
	"templateUrl": "form-initial.component.html",
	"styleUrls": ["form-initial.component.css"]
})

export class FormInitial {

	@ViewChild("tableNameRef") private tableNameRef: ElementRef;
	@ViewChild("theFieldsRef") private theFieldsRef: ElementRef;

	private fields: Field[] = [];
	private tableName: string;
	private className: string;

	constructor() {
		this.fields.push(this.createNewField());
		this.tableName = "TEST";
		this.className = "Test";
	}

	ngAfterViewInit() {
		//
	}

	private createNewField(): Field {
		return {
			name: "",
			type: "VARCHAR"
		};
	}
	
	private addField(index: number) {
		this.fields.splice(index + 1, 0, this.createNewField());
		console.log("Table: ", this.tableName);
	}

	private removeField(index: number) {
		this.fields.splice(index, 1);
	}

	private tableNameUpdate() {
		console.log("Updated: ", this.tableName);
	}

	private addTestData() {
		this.tableName = "DIMI_SHARED_DAILY";
		this.className = "ShareDaily";
		this.fields = [
			{
				name: "ID",
				type: "VARCHAR"
			},
			{
				name: "USER_ID",
				type: "VARCHAR"
			},
			{
				name: "CREATE_DATE",
				type: "TIMESTAMP"
			},
			{
				name: "CONTENT",
				type: "VARCHAR"
			}
		];

		setTimeout(() => {
			let table: HTMLTableElement = this.theFieldsRef.nativeElement;
			let rows: HTMLCollectionOf<HTMLTableRowElement> = table.tBodies[0].rows;
			let sel: HTMLSelectElement = rows[2].cells[1].getElementsByTagName("select")[0];
			sel.selectedIndex = 5;
		}, 0);

	}

	public export(): SFormObject {
		let table: HTMLTableElement = this.theFieldsRef.nativeElement;
		let rows: HTMLCollectionOf<HTMLTableRowElement> = table.tBodies[0].rows;
		let exFields: Field[] = [];
		for (let i = 0, l = rows.length; i < l; i++) {
			let inp: HTMLInputElement = rows[i].cells[0].getElementsByTagName("input")[0];
			let sel: HTMLSelectElement = rows[i].cells[1].getElementsByTagName("select")[0];
			exFields.push({
				"name": inp.value.trim(),
				"type": sel.value
			});
		}
		return {
			tableName: this.tableName,
			className: this.className,
			fields: exFields
		};
	}

}