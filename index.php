﻿<!DOCTYPE html>
<html lang="en" dir="ltr">

<head>
    <meta charset="utf-8">
    <title>Circuit | Build</title>

    <script src="src/util/p5.js" charset="utf-8"></script>
    <script src="src/app.js" type="module" charset="utf-8"></script>

    <link rel="shortcut icon" href="favicon.ico" />
    <link rel="stylesheet" href="src/styles/nav.css" />
    <link rel="stylesheet" href="src/styles/toggle.css" />
    <link rel="stylesheet" href="src/styles/scroll.css" />
    <link rel="stylesheet" href="src/styles/general.css" />
</head>

<body>
    <!-- Everything in the seeable window -->
    <div id='window'>
        <!-- Tab section -->
        <section>
            <nav>
                <ul class="mainnav menu" id='menu'>
                    <li><a href="javascript:void(0);" data-target='file'>File</a></li>
                    <li><a href="javascript:void(0);" class='ifFileOpen' data-target='control'>Control</a></li>
                    <li><a href="javascript:void(0);" class='ifFileOpen' data-target='components'>Components</a></li>
                    <li><a href="javascript:void(0);" class='ifFileOpen' data-target='analyse'>Analyse <i id='analyse-name'>none</i></a></li>
                    <!-- <li class="search"><input type="text"></input></li> -->
                </ul>
            </nav>
            <div class='menu-tabs'>
                <!-- File Controls -->
                <div class='mainnav menu-tab' tab-target='file'>
                    <span class='ifFileClosed'>
                        <button class='btn' onclick='Page.file.openFilePopup.open();'>Open File</button>
                    </span>
                    <span class='ifFileOpen'>
                        <button class='btn' onclick='Page.file.closeFilePopup.open();'>Close File</button>
                    </span>
                    <!-- <button class='btn' onclick='Page.file.closeFile.openPopup();'>Close File</button> |&nbsp; -->
                    <span class='ifFileClosed'>
                        <button class='btn' onclick='Page.file.new();'>New</button>
                    </span>
                    <span class='ifFileOpen'>
                        <button class='btn green' onclick='Page.file.save();'>Save</button>
                    </span>
                    <span class='ifFileOpen'>
                        <button class='btn red' onclick='Page.file.delete();'>Delete</button>
                    </span>
                </div>

                <!-- Options to control Page.control -->
                <div class='mainnav menu-tab' tab-target='control'>
                    <table>
                        <tr>
                            <th colspan='2'>Environment</th>
                            <th>Running</th>
                            <th>Extra Info</th>
                            <th>View Mode</th>
                            <th><abbr title="Wires are drawn when you click on components">Wire Creation</abbr></th>
                            <th><abbr title="Change (some) circuit symbols to US style">US</abbr></th>
                            <th><abbr title="Show bounding boxes of components">Debug</abbr></th>
                            <!-- <th>FPS</th> -->
                        </tr>
                        <tr>
                            <!-- Control Light -->
                            <td>Light </td>
                            <td>
                                <input type='range' min='0' max='1000' id='control-light-range' />&nbsp;
                                <abbr title='Lumens'><span id='control-light-text'></span>lm</abbr>
                            </td>

                            <!-- Running -->
                            <td rowspan="2" class="middle">
                                <span class='appleSlider' data-id="control-running"></span>
                            </td>

                            <!-- Show additional info -->
                            <td rowspan="2" class="middle">
                                <span class='appleSlider' data-id="control-showInfo"></span>
                            </td>

                            <!-- View Mode -->
                            <td class="middle">
                                <select id="control-displayMode">
                                    <option value="0" selected>Normal</option>
                                    <option value="1">Light</option>
                                    <option value="2">Heat</option>
                                </select>
                            </td>

                            <!-- Wire Creation -->
                            <td rowspan="2" class="middle">
                                <span class='appleSlider' data-id="control-wireCreation"></span>
                            </td>

                            <!-- American style -->
                            <td rowspan="2" class="middle">
                                <span class='appleSlider' data-id="control-US"></span>
                            </td>

                            <!-- Debug? -->
                            <td rowspan="2" class="middle">
                                <span class='appleSlider' data-id="control-debug"></span>
                            </td>

                            <!-- FPS range -->
                            <!-- <td rowspan="2" class="middle">
                                    <input type='range' min='1' max='60' id='control-fps-range' />&nbsp;
                                    <span id='control-fps-text'></span> fps
                                </td> -->
                        </tr>
                        <tr>
                            <td>Temperature </td>
                            <td>
                                <input type='range' id='control-temp-range' />&nbsp;
                                <abbr title='Degrees Celcius'><span id='control-temp-text'></span>°C</abbr>
                            </td>
                        </tr>
                        <tr>
                            <!-- PIXELS_PER_CM -->
                            <td>Pixels per cm </td>
                            <td>
                                <input type='range' min='0.001' max='2.5' step="0.001" id='control-pxm-range' />&nbsp;
                                <span id='control-pxm-text'></span> px/cm
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Insert component "buttons" -->
                <div class="mainnav menu-tab" tab-target="components">
                    <table>
                        <tr>
                            <th><a target='_blank' href='components.php#power'>Power Sources</a></th>
                            <td><a data-component="Cell"></a></td>
                            <!-- <td><a data-component="Battery"></a></td> -->
                            <td><a data-component="DC Power Supply"></a></td>
                            <td><a data-component="AC Power Supply"></a></td>
                            <td><a data-component="Capacitor"></a></td>

                            <th><a target='_blank' href='components.php#analytical'>Measuring Components</a></th>
                            <td><a data-component="Ammeter"></a></td>
                            <td><a data-component="Voltmeter"></a></td>
                            <td><a data-component="Thermometer"></a></td>
                            <td><a data-component="Lightmeter"></a></td>
                            <!-- <td><a data-component="Wattmeter"></a></td> -->

                            <th><a target='_blank' href='components.php#output'>Output Components</a></th>
                            <td><a data-component="Bulb"></a></td>
                            <td><a data-component="LED"></a></td>
                            <td><a data-component="Buzzer"></a></td>
                            <td><a data-component="Heater"></a></td>
                            <td><a data-component="Motor"></a></td>

                            <th><a target='_blank' href='components.php#flow'>Flow Managing</a></th>
                            <td><a data-component="Switch"></a></td>
                            <!-- <td><a data-component="Two-Way Switch"></a></td> -->
                            <td><a data-component="Connector"></a></td>
                            <td><a data-component="Diode"></a></td>
                            <td><a data-component="Fuse"></a></td>

                            <th><a target='_blank' href='components.php#resistors'>Resistors</a></th>
                            <td><a data-component="Resistor"></a></td>
                            <td><a data-component="Variable Resistor"></a></td>
                            <td><a data-component="Light-Dependant Resistor"></a></td>
                            <td><a data-component="Thermistor"></a></td>
                            <td><a data-component="Wire Container"></a></td>
                            <td><a data-component="Material Container"></a></td>
                        </tr>
                    </table>
                </div>
                <!-- Analyse hovered component -->
                <div class="mainnav menu-tab" tab-target="analyse">
                    <div id='analyse-circuit'>
                        <ul>
                            <li>
                                <table border='1'>
                                    <tr>
                                        <th colspan='6'>Component: <i id='analyse-c-name'></i> [<span class='del-btn' title='Delete' onclick='Page.controls.clickDeleteComponent();'>&times;</span>]</th>
                                    </tr>
                                    <tr>
                                        <th>Resistance</th>
                                        <td><span id='analyse-c-resistance'></span>Ω</td>

                                        <th>Current</th>
                                        <td><span id='analyse-c-current'></span>A</td>

                                        <th>Is Blown?</th>
                                        <td id='analyse-c-isBlown'></td>
                                    </tr>
                                    <tr>
                                        <th><abbr title="Potential difference across component.">Voltage</abbr></th>
                                        <td><span id='analyse-c-voltage'></span>V</td>

                                        <th>Max Current</th>
                                        <td><span id='analyse-c-maxCurrent'></span>A</td>

                                        <th>Is On?</th>
                                        <td id='analyse-c-isOn'></td>
                                    </tr>
                                    <tr>
                                        <th>Power</th>
                                        <td><span id='analyse-c-power'></span>W</td>

                                        <th>Extern. Light.</th>
                                        <td><span id='analyse-c-externLight'></span>lm</td>

                                        <th>Extern. Temp.</th>
                                        <td><span id='analyse-c-externTemp'></span>°C</td>
                                    </tr>
                                </table>
                            </li>
                            <li>
                                <table border='1'>
                                    <thead>
                                        <tr>
                                            <th colspan='10'>Additional Info</th>
                                        </tr>
                                    </thead>
                                    <tbody id='analyse-c-other'></tbody>
                                </table>
                            </li>
                            <li>
                                <table border="1">
                                    <thead>
                                        <tr>
                                            <th colspan='10'>Configure Component</th>
                                        </tr>
                                    </thead>
                                    <tbody id='analyse-config'></tbody>
                                </table>
                            </li>
                            <li>
                                <table border="1">
                                    <thead>
                                        <tr>
                                            <th colspan='2'>Inputs</th>
                                            <th colspan='2'>Outputs</th>
                                        </tr>
                                    </thead>
                                    <tbody id='analyse-c-conns'></tbody>
                                </table>
                            </li>
                        </ul>
                    </div>

                    <div id='analyse-wire'>
                        <ul>
                            <li>
                                <table border='1'>
                                    <thead>
                                        <tr>
                                            <th colspan='4'>Info</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th>Has Resistance? </th>
                                            <td id='analyse-w-hasRes'></td>

                                            <th>Length </th>
                                            <td id='analyse-w-length'></td>
                                        </tr>
                                        <tr>
                                            <th>Resistance </th>
                                            <td><span id='analyse-w-res'></span>Ω</td>

                                            <th>Cross-Section Radius </th>
                                            <td id='analyse-w-radius'></td>
                                        </tr>
                                        <tr>
                                            <th>Material </th>
                                            <td id='analyse-w-material'></td>

                                            <th>Volume </th>
                                            <td><span id='analyse-w-volume'></span>cm³</td>
                                        </tr>
                                    </tbody>
                                </table>
                        </ul>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- Main (canvas) -->
        <main style='margin: 10px;'>
            <center>
                <div id='canvas-container'></div>
            </center>
            <br>
            <span id='lastUpdate'></span>
        </main>
    </div>

    <!-- Popup elements -->
    <div class="popups">
        <div id='popupCover'></div>
    </div>

    <!-- <script src="src/scripts/display/popup.js" charset="utf-8"></script> -->
    <!-- <script src="src/scripts/display/page.js" charset="utf-8"></script> -->
    <!-- <script src="src/__main__.js" charset="utf-8"></script> -->
    <!-- <script src="src/scripts/display/setup.js" charset="utf-8"></script> -->
</body>

</html>