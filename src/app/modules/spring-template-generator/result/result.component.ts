import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { FormInitial } from "../form-initial/form-initial.component";

interface Field {
	name: string;
	type: string;
}

interface FieldMod extends Field {
	progName: string;
	progNameVar: string;
	progType: string;
	progTypeClass: string;
}

interface SFormObject {
	tableName: string,
	className: string,
	fields: Field[]
}

@Component({
	"selector": "template-result",
	"templateUrl": "result.component.html",
	"styleUrls": ["result.component.css"]
})

export class TemplateResult {

	@ViewChild("theTab") private theTab: ElementRef;
	private contentEntity: string = "Entity";
	private contentRepository: string = "Repository";
	private contentService: string = "Service";

	private show: string;
	private activeElement: HTMLLIElement;

	constructor() {
		this.show = "entity";
	}

	ngAfterViewInit() {
		this.activeElement = this.theTab.nativeElement.getElementsByTagName("li")[0];
	}

	private active(show: string, e) {
		this.show = show;
		this.activeElement.classList.remove("active");
		this.activeElement = e.target.parentNode;
		this.activeElement.classList.add("active");
	}

	private strToProgName(str: string): string {
		let result = "";
		let isBig = true;
		for (let i = 0, l = str.length; i < l; i++) {
			let c = str.charAt(i);
			if (c == '_') {
				isBig = true;
				continue;
			}
			if (isBig) {
				result += c.toUpperCase();
				isBig = false;
			}
			else {
				result += c.toLowerCase();
			}
		}
		return result;
	}

	private modFields(fields: Field[]): FieldMod[] {
		let result: FieldMod[] = [];
		for (let i = 0, l = fields.length; i < l; i++) {
			let name = fields[i].name;
			let progType;
			let progTypeClass;
			switch (fields[i].type) {
				case "INTEGER":
					progType = "int";
					progTypeClass = "Int";
				break;
				case "LONG":
					progType = "long";
					progTypeClass = "Long";
				break;
				case "DOUBLE":
					progType = "double";
					progTypeClass = "Double";
				break;
				case "FLOAT":
					progType = "float";
					progTypeClass = "Float";
				break;
				case "TIMESTAMP":
					progType = progTypeClass = "Timestamp";
				break;
				default:
					progType = progTypeClass = "String";
			}
			let progName: string = this.strToProgName(fields[i].name);
			let progNameVar: string = progName.charAt(0).toLowerCase() + progName.substr(1);
			result.push({
				name: fields[i].name,
				type: fields[i].type,
				progName: this.strToProgName(fields[i].name),
				progNameVar: progNameVar,
				progType: progType,
				progTypeClass: progTypeClass
			});
		}
		return result;
	}

	private generateEntity(obj: SFormObject, fields: FieldMod[]) {

		let nl = "\r\n";
		let nlnl = "\r\n\r\n";
		let result = "class " + obj.className + " {" + nlnl;

		result += "\tprivate static final long serialVersionUID = 4055318420502290942L;" + nlnl;

		//vars
		for (let i = 0, l = fields.length; i < l; i++) {
			let field: FieldMod = fields[i];
			result += "\t@Getter @Setter private " + field.progType + " " + field.progNameVar + ";" + nl;
		}

		result += nl + "\t@Getter @Setter private transient boolean persisted;" + nlnl;

		result += "}" + nl;

		return result;
	}

	private generateRepository(obj: SFormObject, fields: FieldMod[]): string {
		let nl = "\r\n";
		let nlnl = "\r\n\r\n";
		let result: string = "public class " + obj.className + "Repository extends JdbcRepository<" + obj.className + ", " + fields[0].progTypeClass + "> {" + nlnl;

		//constructor
		result += "\tpublic " + obj.className + "Repository() {" + nl;
		result += "\t\tsuper(ROW_MAPPER, ROW_UNMAPPER, " + obj.className + ".TABLE, \"" + fields[0].name + "\");" + nl;
		result += "\t\tthis.setSqlGenerator(new MssqlSqlGenerator());" + nl;
		result += "\t}" + nlnl;

		//row mapper
		result += "\tpublic static final RowMapper<" + obj.className + "> ROW_MAPPER = new RowMapper<" + obj.className + ">() {" + nlnl;
		result += "\t\t@Override" + nl;
		result += "\t\tpublic " + obj.className + " mapRow(ResultSet rs, int rowNum) throws SQLException {" + nl;
		result += "\t\t\t" + obj.className + " result = new " + obj.className + "();" + nl;
		for (let i = 0, l = fields.length; i < l; i++) {
			let field: FieldMod = fields[i];
			result += "\t\t\tresult.set" + field.progName + "(rs.get" + field.progTypeClass + "(\"" + field.name + "\"));" + nl;
		}
		result += "\t\t\treturn result;" + nl;
		result += "\t\t}" + nlnl;
		result += "\t};" + nlnl;

		//row unmapper
		result += "\tprivate static final RowUnmapper<" + obj.className + "> ROW_UNMAPPER = new RowUnmapper<" + obj.className + ">() {" + nlnl;
		result += "\t\t@Override" + nl;
		result += "\t\tpublic Map<String, Object> mapColumns(" + obj.className + " e) {" + nl;
		result += "\t\t\tMap<String, Object> mapping = new LinkedHashMap<String, Object>();" + nl;
		for (let i = 0, l = fields.length; i < l; i++) {
			let field: FieldMod = fields[i];
			result += "\t\t\tif (e.get" + field.progName + "() != null) mapping.put(\"" + field.name + "\", e.get" + field.progName + "());" + nl;
		}
		result += "\t\t\treturn mapping;" + nl;
		result += "\t\t}" + nlnl;
		result += "\t};" + nlnl;

		result += "}" + nl;
		return result;
	}

	public generate(obj: SFormObject) {
		let fields: FieldMod[] = this.modFields(obj.fields);
		this.contentEntity = this.generateEntity(obj, fields);
		this.contentRepository = this.generateRepository(obj, fields);
	}
}