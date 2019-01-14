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
	progTypeFunc: string;
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
	@ViewChild("theTextArea") private theTextArea: ElementRef;
	private contentEntity: string = "Entity";
	private contentRepository: string = "Repository";
	private contentService: string = "Service";
	private contentTestRepoInterface: string = "Test Repo Interface";
	private contentRepositoryMock: string = "RepositoryMock";
	private contentTestFile: string = "Test File";

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
			let progTypeFunc;
			switch (fields[i].type) {
				case "INTEGER":
					progType = "int";
					progTypeClass = "Integer";
					progTypeFunc = "Int";
				break;
				case "LONG":
					progType = "long";
					progTypeClass = "Long";
					progTypeFunc = "Long";
				break;
				case "DOUBLE":
					progType = "double";
					progTypeClass = "Double";
					progTypeFunc = "Double";
				break;
				case "FLOAT":
					progType = "float";
					progTypeClass = "Float";
					progTypeFunc = "Float";
				break;
				case "TIMESTAMP":
					progType = progTypeClass = progTypeFunc = "Timestamp";
				break;
				default:
					progType = progTypeClass = progTypeFunc = "String";
			}
			let progName: string = this.strToProgName(fields[i].name);
			let progNameVar: string = progName.charAt(0).toLowerCase() + progName.substr(1);
			result.push({
				name: fields[i].name,
				type: fields[i].type,
				progName: this.strToProgName(fields[i].name),
				progNameVar: progNameVar,
				progType: progType,
				progTypeClass: progTypeClass,
				progTypeFunc: progTypeFunc
			});
		}
		return result;
	}

	private lowerFirst(str: string): string {
		return str.charAt(0).toLowerCase() + str.substr(1);
	}

	private generateEntity(obj: SFormObject, fields: FieldMod[]): string {

		let nl: string = "\r\n";
		let nlnl: string = "\r\n\r\n";
		let result: string = "@JsonIgnoreProperties(value = { \"id\", \"new\", \"persisted\" }, ignoreUnknown = true)" + nl +
		"@JsonInclude(JsonInclude.Include.NON_NULL)" + nl +
		"@NoArgsConstructor" + nl +
		"@ToString(exclude = {\"persisted\", \"new\"})" + nl +
		"@EqualsAndHashCode" + nl +
		"public class " + obj.className + " implements Persistable<" + fields[0].progTypeClass + "> {" + nlnl;

		let max: number = 9999999999999999999;
		let min: number = 1000000000000000000;
		let x: number = Math.random() * (max - min) + min;

		result += "\tprivate static final long serialVersionUID = " + x + "L;" + nlnl;

		//vars
		for (let i = 0, l = fields.length; i < l; i++) {
			let field: FieldMod = fields[i];
			result += "\t@Getter @Setter private " + field.progTypeClass + " " + field.progNameVar + ";" + nl;
		}

		result += nl + "\t@Getter @Setter private transient boolean persisted;" + nlnl;

		result += "\t@Override" + nl;
		result += "\tpublic boolean isNew() {" + nl;
		result += "\t\treturn !persisted;" + nl;
		result += "\t}" + nlnl;

		result += "}" + nl;

		return result;
	}

	private generateRepository(obj: SFormObject, fields: FieldMod[]): string {
		let nl: string = "\r\n";
		let nlnl: string = "\r\n\r\n";
		let result: string = "@Repository" + nl + "public class " + obj.className + "Repository extends JdbcRepository<" + obj.className + ", " + fields[0].progTypeClass + "> {" + nlnl;

		result += "\tprivate static String TABLE = \"" + obj.tableName + "\";" + nl;
		result += "\tprivate String tableMock = null;" + nlnl;

		//constructor
		result += "\tpublic " + obj.className + "Repository() {" + nl;
		result += "\t\tsuper(ROW_MAPPER, ROW_UNMAPPER, TABLE, \"" + fields[0].name + "\");" + nl;
		result += "\t\tthis.setSqlGenerator(new MssqlSqlGenerator());" + nl;
		result += "\t}" + nlnl;

		result += "\tpublic " + obj.className + "Repository(String sessionPrefix) {" + nl;
		result += "\t\tsuper(ROW_MAPPER, ROW_UNMAPPER, sessionPrefix + TABLE, \"" + fields[0].name + "\");" + nl;
		result += "\t\tthis.setSqlGenerator(new MssqlSqlGenerator());" + nl;
		result += "\t\ttableMock = sessionPrefix + TABLE;" + nl;
		result += "\t}" + nlnl;

		result += "\tpublic String getTableName() {" + nl;
		result += "\t\tif (tableMock == null) {" + nl;
		result += "\t\t\treturn TABLE;" + nl;
		result += "\t\t}" + nl;
		result += "\t\treturn tableMock;" + nl;
		result += "\t}" + nlnl;

		//row mapper
		result += "\tpublic static final RowMapper<" + obj.className + "> ROW_MAPPER = new RowMapper<" + obj.className + ">() {" + nlnl;
		result += "\t\t@Override" + nl;
		result += "\t\tpublic " + obj.className + " mapRow(ResultSet rs, int rowNum) throws SQLException {" + nl;
		result += "\t\t\t" + obj.className + " entity = new " + obj.className + "();" + nl;
		for (let i = 0, l = fields.length; i < l; i++) {
			let field: FieldMod = fields[i];
			result += "\t\t\tentity.set" + field.progName + "(rs.get" + field.progTypeFunc + "(\"" + field.name + "\"));" + nl;
		}
		//result += "\t\t\tentity.setPersisted(true);" + nl;
		result += "\t\t\treturn entity;" + nl;
		result += "\t\t}" + nlnl;
		result += "\t};" + nlnl;

		//row unmapper
		result += "\tprivate static final RowUnmapper<" + obj.className + "> ROW_UNMAPPER = new RowUnmapper<" + obj.className + ">() {" + nlnl;
		result += "\t\t@Override" + nl;
		result += "\t\tpublic Map<String, Object> mapColumns(" + obj.className + " entity) {" + nl;
		result += "\t\t\tMap<String, Object> mapping = new LinkedHashMap<String, Object>();" + nl;
		for (let i = 0, l = fields.length; i < l; i++) {
			let field: FieldMod = fields[i];
			result += "\t\t\tif (entity.get" + field.progName + "() != null) mapping.put(\"" + field.name + "\", entity.get" + field.progName + "());" + nl;
		}
		result += "\t\t\treturn mapping;" + nl;
		result += "\t\t}" + nlnl;
		result += "\t};" + nlnl;

		result += "}" + nl;
		return result;
	}

	public generateService(obj: SFormObject, fields: FieldMod[]): string {
		let nl: string = "\r\n";
		let nlnl: string = "\r\n\r\n";
		let result: string = "@Service(\"" + obj.className + "Service\")" + nl;
		result += "public class " + obj.className + "Service {" + nlnl;
		result += "\t@Autowired" + nl;
		result += "\t@Setter" + nl;

		let repo: string = obj.className.charAt(0).toLowerCase() + obj.className.substr(1) + "Repository";
		result += "\tprivate " + obj.className + "Repository " + repo + ";" + nlnl;
		
		result += "}" + nl;
		return result;
	}

	private generateTestRepoInterface(): string {
		let nl: string = "\r\n";
		let nlnl: string = "\r\n\r\n";
		let result: string = "public interface UnitTestRepositoryInterface {" + nl;
		result += "\tvoid createTable(DataSource dataSource) throws IOException;" + nl;
		result += "\tvoid dropTable(DataSource dataSource);" + nl;
		result += "\tvoid initialData(DataSource dataSource);" + nl;
		result += "\tvoid cleanData(DataSource dataSource);" + nl;
		result += "}"
		return result;
	}

	private generateRepositoryMock(obj: SFormObject, fields: FieldMod[]): string {
		let nl: string = "\r\n";
		let nlnl: string = "\r\n\r\n";
		let result: string = "@Repository" + nl;
		result += "@Profile(\"unit-test\")" + nl;
		result += "public class " + obj.className + "RepositoryMock extends " + obj.className + "Repository implements UnitTestRepositoryInterface {" + nlnl;
		result += "\tprivate static String sessionPrefix = UnitTestDatabaseUtil.generateTableSessionName() + \"_GEN_\";" + nlnl;
		result += "\tprivate DataSource dataSource;" + nlnl;
		result += "\tpublic " + obj.className + "RepositoryMock() {" + nlnl;
		result += "\t\tsuper(sessionPrefix);" + nlnl;
		result += "\t\ttry {" + nl;
		result += "\t\t\tif (dataSource == null) {" + nl;
		result += "\t\t\t\tdataSource = new DataSourceMySqlConfiguration().dataSource();" + nl;
		result += "\t\t\t\tthis.setDataSource(dataSource);" + nl;
		result += "\t\t\t}" + nl;
		result += "\t\t} catch (Exception e) {" + nl;
		result += "\t\t\te.printStackTrace();" + nl;
		result += "\t\t}" + nl;
		result += "\t}" + nlnl;
		result += "\t@Override" + nl;
		result += "\tpublic void createTable(DataSource dataSource) throws IOException {" + nl;
		result += "\t\tUnitTestDatabaseUtil.createTable(dataSource, \"./schema/mysql/" + obj.tableName.toLowerCase() + ".sql\", this.getTableName());" + nl;
		result += "\t}" + nlnl;
		result += "\tpublic void createTable() throws IOException {" + nl;
		result += "\t\tcreateTable(dataSource);" + nl;
		result += "\t}" + nlnl;
		result += "\t@Override" + nl;
		result += "\tpublic void dropTable(DataSource dataSource) {" + nl;
		result += "\t\tUnitTestDatabaseUtil.dropTable(dataSource, this.getTableName());" + nl;
		result += "\t}" + nlnl;
		result += "\tpublic void dropTable() {" + nl;
		result += "\t\tdropTable(dataSource);" + nl;
		result += "\t}" + nlnl;
		result += "\t@Override" + nl;
		result += "\tpublic void initialData(DataSource dataSource) {" + nl;
		result += "\t\tUnitTestDatabaseUtil.createData(dataSource, \"./data/mysql/" + obj.tableName.toLowerCase() + ".sql\", this.getTableName());" + nl;
		result += "\t}" + nlnl;
		result += "\tpublic void initialData() {" + nl;
		result += "\t\tinitialData(dataSource);" + nl;
		result += "\t}" + nlnl;
		result += "\t@Override" + nl;
		result += "\tpublic void cleanData(DataSource dataSource) {" + nl;
		result += "\t\tUnitTestDatabaseUtil.cleanData(dataSource, this.getTableName());" + nl;
		result += "\t}" + nlnl;
		result += "\tpublic void cleanData() {" + nl;
		result += "\t\tcleanData(dataSource);" + nl;
		result += "\t}" + nlnl;
		result += "}"
		return result;
	}

	public generateTestFile(obj: SFormObject): string {
		let nl: string = "\r\n";
		let nlnl: string = "\r\n\r\n";
		let result: string = "//@RunWith(SpringRunner.class)" + nl;
		result += "//@SpringBootTest" + nl;
		result += "//@WebAppConfiguration" + nl;
		result += "//@ActiveProfiles(\"unit-test\")" + nl;
		result += "public class " + obj.className + "Test {" + nlnl;
		// result += "\tprivate static List<" + obj.className + "> modelMocks = null;" + nl;
		result += "\tprivate static " + obj.className + "RepositoryMock " + this.lowerFirst(obj.className) + "Repository;" + nlnl;
		result += "\t@BeforeClass" + nl;
		result += "\tpublic static void before_class() throws IOException {" + nl;
		result += "\t\t" + this.lowerFirst(obj.className) + "Repository = new " + obj.className + "RepositoryMock();" + nl;
		result += "\t\t" + this.lowerFirst(obj.className) + "Repository.createTable();" + nl;
		result += "\t}" + nlnl;
		result += "\t@AfterClass" + nl;
		result += "\tpublic static void after_class() {" + nl;
		result += "\t\t" + this.lowerFirst(obj.className) + "Repository.dropTable();" + nl;
		result += "\t}" + nlnl;
		result += "}"
		return result;
	}

	public generate(obj: SFormObject) {
		let fields: FieldMod[] = this.modFields(obj.fields);
		this.contentEntity = this.generateEntity(obj, fields);
		this.contentRepository = this.generateRepository(obj, fields);
		this.contentService = this.generateService(obj, fields);
		this.contentTestRepoInterface = this.generateTestRepoInterface();
		this.contentRepositoryMock = this.generateRepositoryMock(obj, fields);
		this.contentTestFile = this.generateTestFile(obj);
	}

	public copyContent() {
		let ta: HTMLTextAreaElement = this.theTextArea.nativeElement;
		switch (this.show) {
			case "entity":
				ta.value = this.contentEntity;
			break;
			case "repository":
				ta.value = this.contentRepository;
			break;
			case "service":
				ta.value = this.contentService;
			break;
			case "repoInterface":
				ta.value = this.contentTestRepoInterface;
			break;
			case "repositoryMock":
				ta.value = this.contentRepositoryMock;
			break;
			case "testFile":
				ta.value = this.contentTestFile;
			break;
		}
		ta.focus();
		ta.select();
		window.document.execCommand("copy");
	}
}