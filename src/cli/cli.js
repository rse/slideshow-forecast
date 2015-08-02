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
var sprintf = require("sprintfjs")
var chalk   = require("chalk")

/*  intermal requirements  */
var ssfapi  = require("../api")

var slideshowCLI = function (myProg, mySpeed, myFocus) {
    var ssf = new ssfapi(myProg)
    ssf.start()
    ssf.forecast(function (FC) {
        /*  helper function for formatting time  */
        var ppt = function (t) {
            var S = Math.floor(t % 60); t /= 60
            var M = Math.floor(t % 60); t /= 60
            var H = Math.floor(t % 24); t /= 24
            return sprintf("%02.0f:%02.0f:%02.0f", H, M, S)
        }

        /*  show results  */
        var out = ""
        out += chalk.grey("+------------+---------------------+---------------------+---------------------+") + "\n"
        out += chalk.grey("|") + chalk.bold("focus/speed:") +
            chalk.grey("| ") + chalk.bold("fast:               ") +
            chalk.grey("|") + chalk.bold(" normal:             ") +
            chalk.grey("|") + chalk.bold(" slow:               ") +
            chalk.grey("|") + "\n"
        out += chalk.grey("+------------+---------------------+---------------------+---------------------+") + "\n"
        Object.keys(FC.T).forEach(function (focus) {
            out += chalk.grey("|") + chalk.bold(sprintf("%-11s", focus + ":")) + chalk.grey(" |")
            Object.keys(FC.T[focus]).forEach(function (speed) {
                var min = ppt(Math.round(FC.T[focus][speed].min))
                var exp = ppt(Math.round(FC.T[focus][speed].exp))
                var x = " " + exp + " (" + min + ") "
                if (focus === myFocus && speed === mySpeed)
                    x = chalk.inverse.red(x)
                out += x + chalk.grey("|")
            })
            out += "\n"
        })
        out += chalk.grey("+------------+---------------------+---------------------+---------------------+") + "\n"
        out += "(total slides: " + chalk.bold(sprintf("%d", FC.slidesTotal)) +
            ", tagged slides: " + chalk.bold(sprintf("%d", FC.slidesTagged)) +
            ", statements: " + chalk.bold(sprintf("%d", FC.slidesStatements)) + ")"
        if (!chalk.supportsColor)
            out = chalk.stripColor(out)
        console.log(out)

        ssf.end()
        process.exit(0)
    })
}

module.exports = slideshowCLI

