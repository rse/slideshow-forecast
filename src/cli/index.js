#!/usr/bin/env node
/*
**  slideshow-forecast -- Slideshow Duration Forecasting
**  Copyright (c) 2014 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global require: false */
/* global process: false */
/* global console: false */

/*  external requirements  */
var dashdash     = require("dashdash")

/*  internal requirements  */
var slideshowCLI = require("./cli")
var slideshowGUI = require("./gui")

/*  die the reasonable way  */
process.on("uncaughtException", function (exc) {
    console.error("slideshow-forecast: ERROR: %s", exc.message)
    console.error("slideshow-forecast: TRACE: %s", exc.stack)
    process.exit(1)
})

/*  always add a help option  */
var opts = [
    {   names: [ "help", "h" ], type: "bool", "default": false,
        help: "Print this help and exit." },
    {   names: [ "gui", "g" ], type: "bool", "default": false,
        help: "Run Graphical User Interface" },
    {   names: [ "program", "p" ], type: "string", "default": "powerpoint",
        help: "Connect to the program \"powerpoint\" or \"keynote\"" },
    {   names: [ "speed", "s" ], type: "string", "default": "normal",
        help: "Highlight Speaker by Speed" },
    {   names: [ "focus", "f" ], type: "string", "default": "focused",
        help: "Highlight Speaker by Focus" }
]

/*  create a suitable parser instance  */
var parser = dashdash.createParser({
    options: opts,
    interspersed: false,
    allowUnknown: false
})

/*  parse the supplied argument vector  */
var result = {}
try {
    result.opts = parser.parse(process.argv)
    result.args = result.opts._args
    delete result.opts._args
    delete result.opts._order
} catch (e) {
    throw new Error("failed to parse options: %s", e.message)
}

/*  process the added help option  */
if (result.opts.help) {
    var help = parser.help({ includeEnv: false }).trimRight()
    console.log(
        "slideshow-forecast: USAGE: slideshow-forecast [options]\n" +
        "slideshow-forecast: USAGE: options are:\n" +
        help.replace(/^/mg, "slideshow-forecast: USAGE: "))
    process.exit(0)
}

/*  dispatch into the implementations...  */
if (result.opts.gui)
    slideshowGUI(result.opts.program, result.opts.speed, result.opts.focus)
else
    slideshowCLI(result.opts.program, result.opts.speed, result.opts.focus)

