import * as utils from 'assets/utils';
import type Circuit from "classes/circuit";
import Component from 'classes/component/Component';
import { IAdditionalComponentData, IComponentData } from 'models/saveData';
import IBulbData from './interface';
import p5 from 'p5';
import { NBoolean, MouseButton } from 'models/enum';
import { IConfig } from 'models/Config';
import Config from 'assets/config';
import Vars from 'page/vars';

/**
 * Bulb: light
 * @extends Component
 *
 * @property oldSymbol        Should we render the old bulb symbol?
 * @property voltage          Voltage at which bulb is 100% brightness
 *
 * @method brightness()         Get brightness of bulb (0..1)
 * @method render()             Render the cell onto the global p5 sketch
 * @method getColour()          Get colour (fill) of bulb
 * @method getInputCoords()     Where should we connect the input to?
 * @method getOutputCoords()    Where should we connect the output from?
 * @method onRightClick()       Toggle between the old and the new symbols
 * @method getData()
 */
export class Bulb extends Component {
  public oldSymbol: boolean = false; // Old / New rendering?

  protected _maxVoltage: number = 10; // Maximum power this can handle

  public constructor(parentCircuit: Circuit) {
    super(parentCircuit);

    this._resistance = 2;
    this._lpw = 15; // between 12.5 - 17.5, (https://www.rapidtables.com/calc/light/how-watt-to-lumen.html)
    this._maxCurrent = 5;
    this._isConfigurable = true;
  }

  protected _updateConfigStuff(clear: boolean = true): void {
    if (clear) this.configOptions.length = 0;

    // Change maxVoltage
    this.configOptions.push(Config.newMultiOption("Voltage", this.maxVoltage, Vars.defaultVoltageOptions, (c: Bulb, value: number) => {
      c.maxVoltage = +value;
    })(this));

    super._updateConfigStuff(false);
  }

  public get maxVoltage(): number { return this._maxVoltage; }
  public set maxVoltage(v: number) { if (isFinite(v) && !isNaN(v)) this._maxVoltage = Math.abs(v); }

  /**
   * Get brightness of bulb
   * @return {Number} Brightness as fraction [0..1]
   */
  public brightness(): number {
    // return this.isOn() ? Math.abs(this.current) / this.maxCurrent : 0;
    return this.isOn() ? Math.abs(this.voltage) / this.maxVoltage : 0;
  }

  /**
   * Evaluate the Bulb on to the global canvas
   */
  public eval(): void {
    super.eval((circuitBroken: boolean): void => {
      const voltage: number = this.voltage;
      if (this.control.isRunning && !circuitBroken && Math.abs(this.voltage) > this.maxVoltage) {
        super.blow(`Component ${this.toString()} blew as the voltage over it (${this.voltage} W) exceeded its limit of ±${this.maxVoltage}V`);
      }
    });
  }

  /**
   * Render the Bulb on to the global canvas
   */
  public render(): void {
    super.render((p: p5, colour: p5.Color, running: boolean) => {
      const isOn = this.isOn();

      // Circle
      if (running) {
        if (this._blown) {
          // Flicker
          p.fill(p.random(100));
        } else if (!isOn) {
          p.noFill();
        } else {
          p.fill(...this.getColour());
        }
      } else {
        p.noFill();
      }

      p.stroke(colour);
      p.strokeWeight(1);
      p.ellipse(0, 0, this._w, this._w);

      // Only do innards if not blown
      if (!this._blown) {
        if (this.oldSymbol) {
          // Line extensions from each end
          p.strokeWeight(1.5);
          let len = this._w / 4;
          p.line(-this._w / 2, 0, -this._w / 2 + len, 0);
          p.line(this._w / 2 - len, 0, this._w / 2, 0);

          const w = this._w - len * 2;
          const h = this._h / 1.7;
          p.arc(-this._w / 2 + len + w / 2, 0, w, h, p.PI, 0);
          p.strokeWeight(1);
        } else {
          // Cross thing
          let d = this._w / 1.45;

          p.push();
          p.translate(...utils.polToCart(Math.PI / 4, -this._w / 2));
          p.line(0, 0, d, d);
          p.pop();

          p.push();
          p.translate(...utils.polToCart(-Math.PI / 4, -this._w / 2));
          p.line(0, 0, d, -d);
          p.pop();
        }
      }

      // Show brightness in green box
      if (running && this.control.showInfo && !this._blown) {
        p.textAlign(p.CENTER, p.CENTER);
        p.strokeWeight(1);
        p.stroke(0, 100, 0);
        p.fill(160, 255, 200);
        p.rect(0, this._h / 1.3, this._w, this._h / 3);

        p.textSize(Component.SMALL_TEXT);
        p.noStroke();
        p.fill(0);
        let text = isOn ?
          utils.roundTo(this.brightness() * 100, 1).toFixed(1) + "%" :
          "- - -";
        p.text(text, 0, this._h / 1.25);

        p.textAlign(p.LEFT, p.TOP);
      }
    });
  }

  /**
  * Get RGB fill colour of bulb
  * @return {Number[]} RGB array
  */
  public getColour(): [number, number, number] {
    const x: number = utils.roundTo(this.brightness() * 100, 2);
    let rgb: number[] = utils.hsb2rgb(60, 100, x);
    rgb = rgb.map((n) => utils.roundTo(n, 1));
    return <[number, number, number]>rgb;
    // const a = utils.roundTo(this.brightness() * 255, 2);
    // const rgb = [...this._baseColour, a];
    // return rgb;
  }

  /**
   * Toggle between the old and new circuit symbols
   */
  public onMouseDown(event: MouseEvent): void {
    if (event.button === MouseButton.Right) {
      this.oldSymbol = !this.oldSymbol;
    }
  }

  /**
   * Get data for this component
   * @param {IAdditionalComponentData} customData More data to add
   * @return {IComponentData} Data
   */
  public getData(customData?: IAdditionalComponentData): IComponentData {
    const data: IAdditionalComponentData = {
      oldSymbol: this.oldSymbol ? NBoolean.True : NBoolean.False,
      voltage: this._maxVoltage,
      ...customData
    };
    return super.getData(data);
  }

  /**
   * Given data, load into object
   * @param  {IBulbData} data
   * @return {PowerSource} this
   */
  public apply(data: IBulbData): Bulb {
    super.apply(data);

    if (typeof data.voltage === 'number' && !isNaN(data.voltage)) this.maxVoltage = data.voltage;
    if (data.oldSymbol === NBoolean.True || data.oldSymbol === NBoolean.False) this.oldSymbol = data.oldSymbol === NBoolean.True;

    return this;
  }
}

export default Bulb;