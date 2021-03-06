import * as utils from 'assets/utils';
import Page from './index';
import File from './file';
import CircuitItem from 'classes/circuitItem';
import Control from 'classes/control';
import Component from 'classes/component/Component';
import * as Components from 'classes/component/all/index';
import { Popup, PopupMode } from 'classes/popup';
import Tab from './tab';
import { ComponentError, NullError } from 'classes/errors';
import Wire from 'classes/wire';
import { Direction, State, CapacitorState } from 'models/enum';
import { ThermistorMode } from 'classes/component/all/Thermistor/index';
import { IComponentInfo } from 'models/ComponentInfo';
import Vars from './vars';
import ComponentInfo from 'assets/componentInfo';

/**
 * Class for controling and manipulating controls in circuit.php
 */
export class Controls {
	/**
	 * Component we are currently inserting
	 * - Triggered by click on buttons in "Components"  tab
	 * - Contains dataset.component of <a />
	 */
	public static insertingComponent: string | null = null;
	public static componentShowingInfo: CircuitItem | null = null; // Stores component whose info id being displayed by analyse()

	public static lightSlider: HTMLInputElement; // Slider for adjusting light value
	public static lightText: HTMLSpanElement; // Show value of light
	public static temperatureSlider: HTMLInputElement; // Slider for adjusting temperature value
	public static temperatureText: HTMLSpanElement; // Show value of temperature
	public static pixelMetreRange: HTMLInputElement; // px per cm range (extra options popup)
	public static pixelMetreText: HTMLSpanElement; // px per cm range TEXT (extra options popup)

	public static gcseMode: HTMLInputElement; // Slider - GCSE mode?
	public static showInfo: HTMLInputElement; // Slider - are we showing additional info?
	public static wireCreation: HTMLInputElement; // Slider - allow creation of wires?

	// Sidebar element
	public static readonly analyseSidebar: HTMLElement = utils.getElementById('analyse-section');

	public static readonly helpWindow: ComponentInfo = new ComponentInfo();
	public static readonly advancedControlsPopup: Popup = (function () {
		const popup: Popup = new Popup("More").autoDelete(false);

		const table = document.createElement('table');
		table.appendChild<HTMLTableRowElement>((function () {
			const row = document.createElement('tr');

			let th: HTMLTableHeaderCellElement = document.createElement('th');
			th.innerText = "Debug";
			row.appendChild(th);

			row.appendChild<HTMLTableDataCellElement>((function () {
				const dataCell = document.createElement('td');

				const slider: HTMLSpanElement = utils.createAppleSlider('control-debug', (e: Event, checked: boolean) => {
					if (Page.control == null) return console.warn("Page.control is null... Cannot handle event 'click' on slider 'isDebug'");
					Page.control.debug = checked;
				});
				dataCell.appendChild(slider);

				return dataCell;
			})());

			th = document.createElement('th');
			th.innerText = "Locked";
			row.appendChild(th);

			row.appendChild<HTMLTableDataCellElement>((function () {
				const dataCell = document.createElement('td');

				const slider: HTMLSpanElement = utils.createAppleSlider('control-locked', (e: Event, checked: boolean) => {
					if (Page.control == null) return console.warn("Page.control is null... Cannot handle event 'click' on slider 'isLocked'");
					Page.control.locked = checked;
				});
				dataCell.appendChild(slider);

				return dataCell;
			})());

			return row;
		})());
		table.appendChild<HTMLTableRowElement>((function () {
			const row = document.createElement('tr');

			const th = document.createElement('th');
			th.innerText = "Pixels per Cm";
			row.appendChild(th);

			row.appendChild<HTMLTableDataCellElement>((function () {
				const dataCell = document.createElement('td');

				const range = document.createElement('input');
				Controls.pixelMetreRange = range;
				range.setAttribute('type', 'range');
				range.setAttribute('min', '0.001');
				range.setAttribute('step', '0.001');
				range.setAttribute('max', '2.5');
				range.setAttribute('value', '1');
				range.addEventListener("input", (event: Event): void => {
					if (Page.control == null) return console.warn("Page.control is null... Cannot handle event 'input' on 'pixelMetreRange'");
					if (Page.control.locked) {
						Controls.advancedControlsPopup.close();
						Controls.lockedMessage("alter pixels per centimetre");
						return;
					}

					Page.control.pixelsPerCm = +range.value;
					pxPerCm.innerText = range.value + " px/cm";
				});
				dataCell.appendChild(range);

				const pxPerCm = document.createElement('span');
				Controls.pixelMetreText = pxPerCm;
				pxPerCm.innerText = range.getAttribute('value') + " px/cm";
				dataCell.appendChild(pxPerCm);

				return dataCell;
			})());

			return row;
		})());
		table.appendChild<HTMLTableRowElement>((function () {
			const row = document.createElement('tr');

			const th = document.createElement('th');
			th.innerText = 'Display Mode';
			row.appendChild(th);

			row.appendChild<HTMLTableDataCellElement>((function () {
				const dataCell = document.createElement('td');

				const select: HTMLSelectElement = document.createElement('select');
				dataCell.appendChild(select);

				let option: HTMLOptionElement = document.createElement('option');
				option.setAttribute('value', '0');
				option.innerText = 'Normal';
				option.setAttribute('selected', 'selected');
				select.appendChild(option);

				option = document.createElement('option');
				option.setAttribute('value', '1');
				option.innerText = 'Light';
				select.appendChild(option);

				option = document.createElement('option');
				option.setAttribute('value', '2');
				option.innerText = 'Heat';
				select.appendChild(option);

				select.addEventListener("change", (event: Event): void => {
					if (Page.control == null) return console.warn("Page.control is null... Cannot handle event 'change' on select menu 'displayMode'");
					Page.control.mode = +select.value;
				});

				return dataCell;
			})());

			return row;
		})());

		popup.htmlContent = table;
		return popup;
	})();

	/**
	 * Initiate all controls
	 */
	public static init(): void {
		Controls.gcseMode = <HTMLInputElement>utils.getElementById("control-gcse"); // Handler is set further down in "Components" section
		Controls.showInfo = <HTMLInputElement>utils.getElementById("control-showInfo");
		Controls.wireCreation = <HTMLInputElement>utils.getElementById("control-wireCreation");

		Controls.lightSlider = <HTMLInputElement>utils.getElementById("control-light-range");
		Controls.lightText = <HTMLSpanElement>utils.getElementById("control-light-text");
		Controls.temperatureSlider = <HTMLInputElement>utils.getElementById("control-temp-range");
		Controls.temperatureText = <HTMLSpanElement>utils.getElementById("control-temp-text");

		Controls.lightSlider.addEventListener("input", (event: Event): void => {
			if (Page.control == null) return console.warn("Page.control is null... Cannot handle event 'input' on 'lightSlider'");

			const target: HTMLInputElement = <HTMLInputElement>event.target;
			Page.control.lightLevel(+target.value);
			Controls.lightText.innerText = target.value;
		});

		Controls.temperatureSlider.addEventListener("input", (event: Event): void => {
			if (Page.control == null) return console.warn("Page.control is null... Cannot handle event 'input' on 'temperatureSlider'");

			const target: HTMLInputElement = <HTMLInputElement>event.target;
			Page.control.temperature(+target.value);
			Controls.temperatureText.innerText = target.value;
		});

		Controls.showInfo.addEventListener("click", (event: Event): void => {
			if (Page.control == null) return console.warn("Page.control is null... Cannot handle event 'click' on slider 'showInfo'");

			const target: HTMLInputElement = <HTMLInputElement>event.target;
			Page.control.showInfo = target.checked;
		});

		Controls.wireCreation.addEventListener("click", (event: Event): void => {
			if (Page.control == null) return console.warn("Page.control is null... Cannot handle event 'click' on slider 'wireCreation'");
			if (Page.control.locked && Controls.wireCreation.checked) {
				Controls.lockedMessage("create new wires");
				Controls.wireCreation.checked = false;
				return;
			}

			const target = <HTMLInputElement>event.target;

			Page.control.isRunning = !target.checked;
			Page.control.enableCreateWire = target.checked;
		});

		// "Advanced" popup
		utils.getElementById('control-advancedBtn').addEventListener('click', (e: Event) => {
			Controls.advancedControlsPopup.open();
		});

		// Components button
		utils.querySelector('.menu-tab[tab-target="components"]').appendChild<HTMLTableElement>((function () {
			/**
			 * Create a <td /> for the component name
			 * @param first         If this the first component in a group?
			 * @param componentName   Name of component
			 * @param textDestination   Where should help be placed?
			 */
			function createTableData(first: boolean, componentName: string, textDestination?: HTMLElement): HTMLTableDataCellElement {
				const td: HTMLTableDataCellElement = document.createElement('td');
				const klassName = utils.toClassName(componentName);
				const data = Vars.componentInfo[klassName];

				if (first) {
					td.setAttribute('class', 'padLeft');
				}

				const a: HTMLAnchorElement = document.createElement('a');
				td.appendChild(a);
				a.classList.add('insert-component');

				const img: HTMLImageElement = document.createElement("img");
				img.dataset.component = componentName;
				img.src = "assets/images/" + klassName + ".png";
				img.setAttribute("click", utils.capitalise(componentName));
				img.setAttribute('title', data.name);
				if (data.tags != null) img.setAttribute('data-gcse', (data.tags.indexOf('GCSE') != -1).toString());
				a.appendChild(img);

				a.addEventListener("click", (event: Event): void => {
					const target: HTMLElement = <HTMLElement>event.target;
					Controls.clickInsertComponentBtn(target);
					event.stopPropagation();
				});

				if (textDestination != void 0) {
					// When hover, show button with component name. Button redirects to help popup.
					a.addEventListener("mouseenter", (e: Event) => {
						const btn: HTMLButtonElement = document.createElement("button");
						btn.innerHTML = `<small>${componentName}</small>`;
						btn.addEventListener("click", () => Controls.componentHelp(klassName));
						textDestination.appendChild(btn);
					});
					a.addEventListener("mouseleave", (e: Event) => {
						// Delay - give user time to press button
						setTimeout(() => {
							textDestination.innerHTML = "";
						}, 1500);
					});
				}

				return td;
			}

			const insertComponentNames: string[][] = [
				["Cell", /*"Battery",*/ "DC Power Supply", "AC Power Supply"],
				["Ammeter", "Voltmeter", "Thermometer", "Lightmeter"],
				["Bulb", "Light Emitting Diode", "Buzzer", "Heater", "Motor"],
				["Switch", "Two-Way Switch", "Connector", "Diode", "Fuse", "Push Switch", "Touch Switch", "Capacitor"],
				["Resistor", "Variable Resistor", "Light-Dependant Resistor", "Thermistor", "Wire Container", "Material Container"],
			];

			const table = document.createElement('table');

			// First row
			const rows: HTMLTableRowElement[] = (function () {
				const rows: HTMLTableRowElement[] = [document.createElement('tr'), document.createElement('tr')];

				// Empty
				rows[0].appendChild(document.createElement('td'));

				// Button : General Help
				rows[1].appendChild<HTMLTableDataCellElement>((function () {
					const dataCell = document.createElement('td');
					const btn: HTMLButtonElement = document.createElement('button');
					dataCell.appendChild(btn);
					btn.innerText = 'Help';
					btn.addEventListener("click", () => Controls.helpWindow.open());
					return dataCell;
				})());

				for (const group of insertComponentNames) {
					for (let i = 0; i < group.length; i++) {
						const td = document.createElement('td');

						rows[0].appendChild(createTableData(i === 0, group[i], td));
						rows[1].appendChild(td);
					}
				}

				return rows;
			})();
			for (const row of rows) table.appendChild(row);

			// Handler for gcseMode - hide/show insert component things
			Controls.gcseMode.addEventListener('click', () => {
				Vars.gcseMode = Controls.gcseMode.checked;
				const children: HTMLCollection = rows[0].children;
				for (let i = 1; i < children.length; i++) {
					const anchor: HTMLAnchorElement = <HTMLAnchorElement>children[i].firstChild;
					const img: HTMLImageElement = <HTMLImageElement>anchor.firstChild;
					if (img.dataset.gcse == 'false') anchor.hidden = Vars.gcseMode;
				}
				if (Controls.componentShowingInfo != null) Controls.reAnalyse();
			});
			if (Vars.gcseMode) Controls.gcseMode.click();

			return table;
		})());

		// Event listener for inserting components
		document.body.addEventListener("click", (event: MouseEvent): void => {
			if (typeof Controls.insertingComponent === "string" && Page.openPopups.length === 0) {
				Controls.clickInsertComponentBody(event.clientX, event.clientY);
			}
		});

		// File button actions
		const buttons = <HTMLButtonElement[]>utils.querySelectorAll('.menu-tab[tab-target="file"] button[data-action]');
		for (const button of buttons) {
			let fn: Function | undefined = void 0;

			switch (button.dataset.action) {
				case 'open':
					fn = () => File.openFilePopup.open();
					break;
				case 'close':
					fn = () => File.closeFilePopup.open();
					break;
				case 'new':
					fn = File.new;
					break;
				case 'save':
					fn = File.save;
					break;
				case 'delete':
					fn = File.delete;
					break;
			}

			if (fn == null) {
				throw new NullError(`Unknown data-action '${button.dataset.action}' where button is ${button} [error: no event handler]`);
			} else {
				button.addEventListener('click', function () {
					if (fn != null) fn();
				}, false);
			}
		}
	}

	/**
	 * Help popup for a component
	 * @param c Component to get help for (constructor's name)
	 * @return component information
	 */
	public static componentHelp(ctype: string): IComponentInfo {
		const cinfo: IComponentInfo = Vars.componentInfo[ctype];

		const popup: Popup = new Popup("Help - " + ctype);
		popup.htmlContent = document.createElement("section");
		popup.htmlContent.appendChild<HTMLSpanElement>(ComponentInfo.getHeader(ctype));
		popup.htmlContent.appendChild<HTMLDivElement>(ComponentInfo.getInfo(ctype));

		popup.open();

		return cinfo;
	}

	/**
	 * Start running Page.control
	 */
	public static start(): void {
		if (Page.control == null) return console.warn("Page.control is null... Cannot call start()");
		// Page.control.start();
		Page.control.isRunning = true;
	}

	/**
	 * Stop running Page.control
	 */
	public static stop(): void {
		if (Page.control == null) return console.warn("Page.control is null... Cannot call stop()");
		Page.control.isRunning = false;
	}

	/**
	 * Prepare controls (called after new circuit is installed)
	 */
	public static prep(): void {
		if (Page.control == null) return console.warn("Page.control is null... Cannot call prep()");

		Controls.lightSlider.value = Page.control.lightLevel().toString();
		utils.eventOn(Controls.lightSlider, "input");

		Controls.temperatureSlider.setAttribute("min", Control.MIN_TEMP.toString());
		Controls.temperatureSlider.setAttribute("max", Control.MAX_TEMP.toString());
		Controls.temperatureSlider.value = Page.control.temperature().toString();
		utils.eventOn(Controls.temperatureSlider, "input");

		Controls.pixelMetreRange.value = Page.control.pixelsPerCm.toString();
		Controls.pixelMetreText.innerText = Page.control.pixelsPerCm.toString() + " px/cm";

		// Toggle certain options
		if (Page.control.showInfo != Controls.showInfo.checked) Controls.showInfo.click();
		if (Page.control.enableCreateWire != Controls.wireCreation.checked && !Page.control.locked) Controls.wireCreation.click();
	}

	/**
	 * Handle onClick event of .insert-component button
	 * @param  {HTMLElement} a    Element clicked on (<img /> or <a />)
	 */
	public static clickInsertComponentBtn(a: HTMLElement): void {
		if (Page.control == null) return console.warn("Page.control is null... Cannot call clickInsertComponentBtn");;
		if (typeof Controls.insertingComponent === "string") return;

		const component = a.dataset.component;
		if (typeof component !== "string" || component.length === 0) {
			console.log(a);
			throw new TypeError(`Cannot find dataset.component(^).`);
		}

		if (Page.control.locked) {
			Controls.lockedMessage("insert component " + component);
			return;
		}

		Controls.insertingComponent = component;
		Controls.afterInsertInit();
	}

	static lockedMessage(action: string): Popup {
		const popup: Popup = new Popup("Circuit is Locked", "Cannot " + action);
		popup.mode(PopupMode.Warn).open();
		return popup;
	}

	/**
	 * Handle the "drop" of the component
	 * @param  {Number} x   X coordinate to insert component
	 * @param  {Number} y   Y coordinate to insert component
	 * @return {Boolean}    Was the insert successful
	 */
	public static clickInsertComponentBody(x: number, y: number): boolean {
		if (Page.control == null) {
			console.warn("Page.control is null... Cannot call clickInsertComponentBody");
			return false;
		}

		// Check if canvas contains coords
		const contains = Page.control.contains(x, y);

		if (contains) {
			const component: string | null = Controls.insertingComponent;
			if (component == null) return false;

			Controls.afterInsertEnd();
			const coords: [number, number] = Page.control.coordsOnCanvas(x, y);

			try {
				const c: Component = Page.control.createComponent(component, ...coords);
				Page.control.render();
				if (c.isConfigurable) c.openConfigPopup();
				return true;
			} catch (e) {
				// 'Harmless' ComponentError
				if (e instanceof ComponentError) {
					new Popup("Cannot Insert Component", e.message)
						.mode(PopupMode.Error)
						.open();
					console.error(e);
				} else {
					// Other error. Throw as this was un-generated.
					throw e;
				}
				return false;
			}
		} else {
			new Popup("Unable to Insert Component", "You didn't click on the circuit - cannot insert component outside of the circuit")
				.mode(PopupMode.Warn)
				.open();
			Controls.afterInsertEnd();
			return false;
		}
	}

	/**
	 * Stuff to execute after a file/instance is opened
	 */
	public static afterFileOpened(): void {
		if (Page.control == null) return console.warn("Page.control is null... Cannot call afterFileOpened");

		// Show all "if-file-open" tabs
		let els: HTMLElement[] = utils.querySelectorAll(".ifFileOpen");
		for (let el of els) Page.show(<HTMLElement>el);

		// Hide all "if-file-closed" tabs
		els = utils.querySelectorAll(".ifFileClosed");
		for (let el of els) Page.hide(<HTMLElement>el);

		Tab.file.innerText = "File: " + (Page.control.file || "(new)");
		Controls.prep();

		// if (Page.autoStartCircuit) Page.control.start();
		if (Page.autoStartCircuit) Page.control.isRunning = true;
	}

	/**
	 * Stuff to execute after the control instance is closed
	 */
	public static afterFileClosed(): void {
		// Show all "if-file-open" tabs
		let els: HTMLElement[] = utils.querySelectorAll(".ifFileOpen");
		for (let el of els) Page.hide(<HTMLElement>el);

		// Hide all "if-file-closed" tabs
		els = utils.querySelectorAll(".ifFileClosed");
		for (let el of els) Page.show(<HTMLElement>el);

		Tab.file.innerText = "File";
		Tab.hide(Tab.control);
		Tab.hide(Tab.components);
	}

	/**
	 * Stuff to execute after inert button has been pressed (component)
	 */
	public static afterInsertInit(): void {
		utils.querySelector('img[data-component="' + Controls.insertingComponent + '"]').classList.add("inserting");
		Tab.components.innerHTML = "Components: inserting " + Controls.insertingComponent;
		Page.window.classList.add("insertingComponent");
		// Page.tab.hide(Page.controls.componentTab);
	}

	/**
	 * Stuff to execute after inserted component
	 */
	public static afterInsertEnd(): void {
		utils.querySelector('img[data-component="' + Controls.insertingComponent + '"]').classList.remove("inserting");
		Controls.insertingComponent = null;
		Page.window.classList.remove("insertingComponent");
		Tab.components.innerHTML = "Components";
	}

	/**
	 * Click on delete (x) button in analyse component
	 * @param  {Number} id  ID of component. Default is Page.componentShowingInfo.id;
	 * @param  {Boolean} reanalyse  Call Page.controls.analyse() after?
	 */
	public static clickDeleteComponent(id: number, reanalyse: boolean = true): void {
		if (Page.control == null) return console.warn("Page.control is null... Cannot call clickDeleteComponent");
		if (Page.control.locked) {
			Controls.lockedMessage("delete component");
			return;
		}

		if (id === void 0 && Controls.componentShowingInfo instanceof Component)
			id = Controls.componentShowingInfo.id;

		if (typeof id === 'number') {
			const c = Page.control.components[id];
			if (c instanceof Component && window.confirm(`Remove component '${c.toString()}' from the circuit ? `)) {
				c.remove();

				// If reanalyse, update analysis section...
				if (reanalyse) Controls.reAnalyse();
			}
		} else {
			console.warn('clickDeleteComponent: no ID provided');
		}
	}

	/**
	 * Click on delete (x) button in analyse component
	 * @param  {Component} wire Wire to remove
	 * @param  {Boolean} reanalyse  Call Page.controls.analyse() after?
	 */
	public static clickDeleteWire(wire: Wire | null, reanalyse: boolean = true) {
		if (Page.control == null) return console.warn("Page.control is null... Cannot call clickDeleteWire");
		if (wire == null && Controls.componentShowingInfo instanceof Wire) wire = Controls.componentShowingInfo;

		if (Page.control.locked) {
			Controls.lockedMessage("delete wire");
			return;
		}

		if (wire instanceof Wire) {
			if (window.confirm(`Remove wire connecting ${wire.input.toString()} and ${wire.output.toString()} from the circuit?`)) {
				wire.remove();

				if (reanalyse) Controls.reAnalyse();
			}
		} else {
			console.warn('clickDeleteWire: no wire provided/found');
		}
	}

	/**
	 * Event handler for "analyse-c-configButton"
	 */
	private static _configButtonEventHandler(): void {
		if (Page.control != null && Controls.componentShowingInfo != null) {
			if (Page.control.locked) {
				Controls.lockedMessage("configure component");
				return;
			}

			if (Controls.componentShowingInfo instanceof Component) {
				Controls.componentShowingInfo.openConfigPopup();
			}
		}
	}

	/**
	 * Analyse a certain component
	 * @param  {Component} c    Component to analyse, or '1' to re-analyse current component
	 */
	public static analyse(c: CircuitItem | null): void {
		if (Page.control == null) return console.warn("Page.control is null... Cannot call analyse()");

		Controls.componentShowingInfo = c;

		Controls.analyseSidebar.innerHTML = '';

		mainIf: {
			if (c instanceof Component) {
				// Title
				Controls.analyseSidebar.appendChild<HTMLHeadingElement>((function () {
					const title = document.createElement('h1');
					title.insertAdjacentText('beforeend', utils.nicifyString(c.constructor.name, ' ') + ' [');
					title.insertAdjacentElement('beforeend', utils.createDeleteButton('Remove Component', (e: Event): void => {
						if (Controls.componentShowingInfo instanceof Component) {
							const id: number = Controls.componentShowingInfo.id;
							Controls.clickDeleteComponent(id);
						} else {
							throw new TypeError('Expected Controls.componentShowingInfo to be Component inside event handler');
						}
					}));
					title.insertAdjacentText('beforeend', ']');

					return title;
				})());

				// Buttons
				{
					// Config button (temp)
					Controls.analyseSidebar.insertAdjacentElement('beforeend', ((function () {
						const btn: HTMLButtonElement = document.createElement('button');
						btn.innerText = 'Configure';
						btn.addEventListener('click', Controls._configButtonEventHandler);

						return btn;
					})()));

					// Help button
					Controls.analyseSidebar.insertAdjacentElement('beforeend', ((function () {
						const btn: HTMLButtonElement = document.createElement('button');
						btn.innerText = 'Help';
						btn.addEventListener('click', () => {
							const c: CircuitItem | null = Controls.componentShowingInfo;
							if (c instanceof Component) {
								Controls.componentHelp(c.constructor.name);
							} else {
								throw new TypeError('Expected Controls.componentShowingInfo to be component in event handler of \'Help\' button ');
							}
						});

						return btn;
					})()));

					Controls.analyseSidebar.insertAdjacentHTML('beforeend', '<br><br>');
				}

				// Global info table
				Controls.analyseSidebar.appendChild<HTMLTableElement>((function () {
					const table: HTMLTableElement = document.createElement("table");
					table.insertAdjacentHTML('beforeend', `<tr><th>Resistance</th><td>${utils.numberFormat(c.resistance, 3)}Ω</td></tr>`);
					table.insertAdjacentHTML('beforeend', `<tr><th><abbr title='Potential difference across component'>Voltage</abbr></th><td>${utils.numberFormat(c.voltage, 3)}V</td></tr>`);
					table.insertAdjacentHTML('beforeend', `<tr><th>Current</th><td>${utils.numberFormat(c.current, 3)}A</td></tr>`);
					if (c.isBlowable())
						table.insertAdjacentHTML('beforeend', `<tr><th>Max Current</th><td>${(!isFinite(c.maxCurrent) || Number.MAX_SAFE_INTEGER <= c.maxCurrent) ? "&infin;" : utils.numberFormat(c.maxCurrent, 3)}A</td></tr>`);
					table.insertAdjacentHTML('beforeend', `<tr><th>Power</th><td>${utils.numberFormat(c.power(), 3)}W</td></tr>`);

					if (!Vars.gcseMode) {
						table.insertAdjacentHTML('beforeend', `<tr><th>Is Blown?</th><td>${utils.getHtmlBoolString(c.isBlown())}</td></tr>`);
						table.insertAdjacentHTML('beforeend', `<tr><th>Is On?</th><td>${utils.getHtmlBoolString(c.isOn())}</td></tr>`);
						table.insertAdjacentHTML('beforeend', `<tr><th>Extern. Light</th><td>${utils.roundTo(c.lightRecieving(), 2).toString()}lm</td></tr>`);
						table.insertAdjacentHTML('beforeend', `<tr><th>Extern. Temp.</th><td>${utils.roundTo(c.heatRecieving(), 2).toString()}°C</td></tr>`);
					}
					return table;
				})());
				Controls.analyseSidebar.insertAdjacentHTML('beforeend', '<br><br>');

				/** Additional component info */
				Controls.analyseSidebar.appendChild<HTMLTableElement>((function () {
					const table = document.createElement('table');
					const rowData: [string, string][] = (function () {
						const data: [string, string][] = [];

						// If luminous...
						if (!Vars.gcseMode && c.isLuminous()) data.push(["Luminoscity", utils.roundTo(c.luminoscity(), 2) + "lm @ " + c.lumensPerWatt + "lm/w"]);

						if (c instanceof Components.Bulb) {
							// info.cName.innerHTML = utils.roundTo(c.maxVoltage, 1) + "V " + c.constructor.name;
							data.push(
								["Brightness", utils.roundTo(c.brightness() * 100, 1) + "%"],
								["Max Voltage", utils.roundTo(c.maxVoltage, 1).toString()],
							);
						}

						if (c instanceof Components.Resistor) data.push(["<abbr title='American circuit symbol'>US</abbr>", utils.getHtmlBoolString(c.american)]);
						if (c.isPowerSource()) data.push(["Direction", c.direction === Direction.Left ? "Left" : "Right"]);
						if (c instanceof Components.Ammeter) data.push(["Units", c.units]);
						if (c instanceof Components.ACPowerSupply) data.push(["Freq", c.hertz() + "Hz"]);
						if (c instanceof Components.DCPowerSupply)
							data.push(
								["Max Voltage", c.maxVoltage + "V"],
								["<abbr title='What to change voltage by onScroll'>Sensitivity</abbr>", "&Delta;" + c.sensitivity() + "V"]
							);
						if (c instanceof Components.Switch) data.push(["Closed?", utils.getHtmlBoolString(c.state === State.Closed)]);
						if (c instanceof Components.Buzzer)
							data.push(
								["Volume", c.volume() * 100 + "%"],
								["Mute", utils.getHtmlBoolString(c.isMuted)],
								["Freq", c.frequency + "Hz"]
							);
						if (c instanceof Components.Battery) {
							// info.cName.innerHTML = c.cells + "-Cell Battery";
							data.push(["Cells", c.cells.toString()]);
						}
						if (c instanceof Components.Diode) data.push(["Direction", c.direction === Direction.Left ? "Left" : "Right"]);
						if (c instanceof Components.LightEmittingDiode) {
							const rgb: string = "rgb(" + c.getColour().join(", ") + ")";
							data.push(["Colour", `<span style='background-color: ${rgb}'>hsb(${c.getColour(true).join(', ')})<br>${rgb}</span>`]);
						}
						if (c instanceof Components.Fuse) {
							data.push(["Current", `${utils.roundTo(c.current, 1)} / ${c.maxCurrent} (${utils.roundTo(c.closeToBreak() * 100, 1)}%)`]);
						}
						if (c instanceof Components.Connector) {
							if (!(c instanceof Components.TwoWaySwitch)) data.push(["Type", c.isEnd ? "Joiner" : "Splitter"]);
						}
						if (c instanceof Components.TwoWaySwitch) data.push(["Switch Pos", c.executing.toString()]);
						if (c instanceof Components.Capacitor)
							data.push(
								["Capacitance", c.capacitance + "µF"],
								["Target", c.targetVoltage + "V"],
								["State", CapacitorState[c.state]]
							);
						if (c instanceof Components.Motor)
							data.push([`<abbr title='If current = maxCurrent'>Max Speed</abbr>`, utils.roundTo(utils.rad2deg(c.K), 1) + "&deg;"],
								["Speed", utils.roundTo(utils.rad2deg(c.delta()), 2) + "&deg; / frame"],
								["Angle", c.angle()]
							);
						if (c instanceof Components.Heater)
							data.push(
								["Temp", c.temp() + "°C"],
								["Max Temp", c.maxTemp + "°C"],
								["Capacity", utils.roundTo(c.percent()) + "%"],
								["Efficiency", utils.roundTo(c.efficiency, 1) + "%"]
							);
						if (c instanceof Components.Thermistor)
							data.push(
								["temp:resistance", (c.mode === ThermistorMode.NTC ? "Negative" : "Positive ") + " Correlation"],
								["Temp Range", c.min + "°C to " + c.max + "°C"]
							);
						if (c instanceof Components.MaterialContainer)
							data.push(
								["Material", utils.nicifyString(c.materialData.name, ' ')],
								["Length", utils.roundTo(c.length / Page.control.pixelsPerCm, 3) + 'cm (' + Math.round(c.length) + 'px)'],
								["Volume", utils.numberFormat(c.volume(true), 3) + 'cm³ (' + Math.round(c.volume(false)) + 'px)'],
								["On-Scroll", c.changeMaterial ? "Change material" : "Change length"],
							);
						if (c instanceof Components.WireContainer)
							data.push(
								["Material", utils.nicifyString(c.materialData.name, ' ')],
								["Length", utils.roundTo(c.length / Page.control.pixelsPerCm, 3) + 'cm (' + Math.round(c.length) + 'px)'],
								["Volume", utils.numberFormat(c.volume(true), 3) + 'cm³ (' + Math.round(c.volume(false)) + 'px)'],
								["On-Scroll", c.changeMaterial ? "Change material" : "Change length"],
							);

						return data;
					})();

					for (let row of rowData) {
						table.insertAdjacentHTML('beforeend', `<tr><th>${row[0]}</th><td>${row[1]}</td></tr>`);
					}

					return table;
				})());
				Controls.analyseSidebar.insertAdjacentHTML('beforeend', '<br><br>');

				// Connection info
				Controls.analyseSidebar.appendChild<HTMLTableElement>((function () {
					const table: HTMLTableElement = document.createElement('table');

					const inputs: number = c.inputs.length;
					const outputs: number = c.outputs.length;
					const rows: number = Math.max(inputs, outputs);
					let tmp: Component;
					table.insertAdjacentHTML('beforeend', `<thead><tr><th colspan='2'>Inputs</th><th colspan='2'>Outputs</th></tr></thead>`);
					table.setAttribute('border', '1');

					table.appendChild<HTMLTableSectionElement>((function () {
						const tbody: HTMLTableSectionElement = document.createElement('tbody');
						for (let i = 0; i < rows; i++) {
							const tableRow: HTMLTableRowElement = document.createElement('tr');

							if (i >= inputs) {
								tableRow.insertAdjacentHTML('beforeend', '<td colspan="2" />');
							} else {
								tmp = c.inputs[i].input;

								const delbtn: HTMLSpanElement = utils.createDeleteButton('Remove Component', (e: Event): void => {
									Controls.clickDeleteComponent(tmp.id, true)
								});
								const td = document.createElement('td');
								td.appendChild(delbtn);

								tableRow.insertAdjacentHTML('beforeend', `<td>${tmp.toString()}</td>`);
								tableRow.insertAdjacentElement('beforeend', td);
							}

							if (i >= outputs) {
								tableRow.insertAdjacentHTML('beforeend', '<td colspan="2" />');
							} else {
								tmp = c.outputs[i].output;

								const delbtn: HTMLSpanElement = utils.createDeleteButton('Remove Component', (e: Event): void => {
									Controls.clickDeleteComponent(tmp.id, true)
								});
								const td = document.createElement('td');
								td.insertAdjacentElement('beforeend', delbtn);

								tableRow.insertAdjacentHTML('beforeend', `<td>${tmp.toString()}</td>`);
								tableRow.appendChild(td);
							}

							tbody.appendChild(tableRow);
						}

						return tbody;
					})());

					return table;
				})());
			} else if (c instanceof Wire) {
				// Title
				const title: HTMLHeadingElement = document.createElement('h1');
				title.insertAdjacentText('beforeend', c.toString() + ' [');
				title.appendChild(utils.createDeleteButton("Remove Wire", (e: Event) => {
					if (Controls.componentShowingInfo instanceof Wire) {
						Controls.clickDeleteWire(Controls.componentShowingInfo);
					}
				}));
				title.insertAdjacentText('beforeend', ']');
				Controls.analyseSidebar.appendChild(title);

				if (Vars.gcseMode) break mainIf;

				// Table info
				const table: HTMLTableElement = document.createElement('table');

				table.insertAdjacentHTML('beforeend', `<tr><th>Has Resistance?</th><td>`);
				table.appendChild((function () {
					const input: HTMLInputElement = document.createElement('input');
					input.setAttribute('type', 'radio');
					input.setAttribute('name', 'analyse-w-hasRes-radio');
					if (c.hasResistance) input.setAttribute('checked', 'checked');
					input.addEventListener('click', (e: Event) => {
						c.hasResistance = true;
						Controls.reAnalyse();
					});

					return input;
				})());
				table.insertAdjacentHTML('beforeend', '<span style="color: green;">Yes</span>');
				table.appendChild((function () {
					const input: HTMLInputElement = document.createElement('input');
					input.setAttribute('type', 'radio');
					input.setAttribute('name', 'analyse-w-hasRes-radio');
					if (!c.hasResistance) input.setAttribute('checked', 'checked');
					input.addEventListener('click', (e: Event) => {
						c.hasResistance = false;
						Controls.reAnalyse();
					});

					return input;
				})());
				table.insertAdjacentHTML('beforeend', '<span style="color: crimson;">No</span></td></tr>');

				table.insertAdjacentHTML('beforeend', `<tr><th>Resistance</th><td>${utils.numberFormat(c.resistance, 4)}</td></tr>`);

				const length = c.length;
				table.insertAdjacentHTML('beforeend', `<tr><th>Length</th><td>${utils.roundTo(length / Page.control.pixelsPerCm, 2)}cm (${Math.round(length)}px)</td></tr>`);

				table.insertAdjacentHTML('beforeend', `<tr><th>Resistance</th><td>`);
				if (c.hasResistance) {
					const input: HTMLInputElement = document.createElement("input");
					input.setAttribute('type', 'range');
					input.setAttribute('min', Wire.MIN_RADIUS.toString());
					input.setAttribute('max', Wire.MAX_RADIUS.toString());
					input.setAttribute('value', c.radiusPx().toString());
					input.setAttribute('step', '0.1');

					const span: HTMLSpanElement = document.createElement('span');
					span.innerText = `${utils.roundTo(c.radiusCm(), 3)}cm (${utils.roundTo(c.radiusPx(), 1)}px)`;

					input.addEventListener('change', Controls.reAnalyse);
					input.addEventListener('input', (e: Event) => {
						c.radiusPx(+input.value);
						span.innerText = `${utils.roundTo(c.radiusCm(), 3)}cm (${utils.roundTo(c.radiusPx(), 1)}px)`;
					});

					table.appendChild(input);
					table.appendChild(span);
				} else {
					table.insertAdjacentHTML('beforeend', utils.roundTo(1.5 / Page.control.pixelsPerCm, 3) + 'cm');
				}
				table.insertAdjacentHTML('beforeend', '</td></tr>');

				table.insertAdjacentHTML('beforeend', `<tr><th>Volume</th><td>${utils.numberFormat(c.volume(true), 3)}cm<sup>3</sup></td></tr>`);

				table.insertAdjacentHTML('beforeend', `<tr><th>Material</th><td>`);
				table.appendChild<HTMLSelectElement>((function () {
					const select: HTMLSelectElement = document.createElement('select');
					select.addEventListener('change', (e: Event) => {
						c.materialIndex = +select.value; // c._material
						Controls.reAnalyse();
					});

					for (let i = 0; i < Wire.MATERIALS_KEYS.length; i++) {
						const material: string = Wire.MATERIALS_KEYS[i];

						select.appendChild<HTMLOptionElement>((function () {
							const option: HTMLOptionElement = document.createElement('option');
							option.setAttribute('value', i.toString());
							if (c.materialIndex === i) option.setAttribute('selected', 'selected');
							option.innerText = `${utils.nicifyString(material, ' ')} (${utils.numberFormat(Wire.MATERIALS[i].resistance, 2, false)} Ω/m³)`;
							return option;
						})());
					}

					return select;
				})());
				table.insertAdjacentHTML('beforeend', '</td></tr>');

				Controls.analyseSidebar.appendChild(table);
			}
		}

		return;
	}

	/**
	 * Re-analyse the current component
	 */
	public static reAnalyse(): void {
		Controls.analyse(Controls.componentShowingInfo);
	}
}

export default Controls;