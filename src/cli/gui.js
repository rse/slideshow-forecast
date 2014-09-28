/*
**  slideshow-forecast -- Slideshow Duration Forecasting
**  Copyright (c) 2014 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global require: false */
/* global module: false */
/* global console: false */
/* global process: false */

/*  external requirements  */
var path       = require("path")
var spawn      = require("win-spawn")
var nodewebkit = require("nodewebkit").findpath()

var slideshowGUI = function (/* myProg, mySpeed, myFocus */) {
    /*  FIXME: parameters  */
    var basedir = path.join(__dirname, "../gui")
    var nw = spawn(nodewebkit, [ basedir ], {
        cwd: basedir,
        env: process.env
    })
    nw.stderr.on("data", function (data) {
        var msg = data.toString()
        msg = msg.replace(/.*?""(.+?)"".*/, "$1").replace(/\r?\n/, "")
        if (msg.match(/process.mainModule.filename/))
            return
        console.log(msg)
    })
    nw.stdout.on("data", function (data) {
        var msg = data.toString()
        msg = msg.replace(/.*?""(.+?)"".*/, "$1").replace(/\r?\n/, "")
        console.log(msg)
    })
    nw.on("close", function (code) {
        process.exit(code)
    })
}

module.exports = slideshowGUI

