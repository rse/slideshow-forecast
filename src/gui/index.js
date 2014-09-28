/*
**  slideshow-forecast -- Slideshow Duration Forecasting
**  Copyright (c) 2014 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global require: false */
/* global document: false */
/* global $: false */
/* global store: false */
/* global setInterval: false */

/*  load node-webkit resources  */
var gui       = require("nw.gui")

/*  load node resources  */
var os        = require("os")
var sprintf   = require("sprintfjs")
var ssfapi    = require("../api")

/*  await the markup to be ready...  */
$(document).ready(function () {
    /*  fetch main window reference  */
    var win = gui.Window.get()

    /*  create a native menu bar  */
    var nativeMenuBar = new gui.Menu({ type: "menubar" })
    if (os.platform() === "darwin") {
        nativeMenuBar.createMacBuiltin("Slideshow Forecast", {
            hideEdit:   true,
            hideWindow: true
        })
    }
    win.menu = nativeMenuBar

    /*  show the main window (is by default hidden, see "package.json")  */
    win.show()

    /*  support "minimize to tray/dock"  */
    var tray = null
    win.on("minimize", function() {
        win.hide()
        tray = new gui.Tray({ icon: "icon.png" })
        tray.on("click", function() {
            win.show()
            win.width  = 550
            win.height = 182
            tray.remove()
            tray = null
        })
    })

    /*  support persistent speaker information  */
    var myProg  = store.get("slideshow-forecast-prog")  || "powerpoint"
    var mySpeed = store.get("slideshow-forecast-speed") || "normal"
    var myFocus = store.get("slideshow-forecast-focus") || "focused"
    var updateStorage = function () {
        store.set("slideshow-forecast-prog",  myProg)
        store.set("slideshow-forecast-speed", mySpeed)
        store.set("slideshow-forecast-focus", myFocus)
    }
    updateStorage()

    /*  allow the speaker speed/focus highlighter to be changed  */
    $("td[data-select]").click(function (ev) {
        var data = $(ev.target).data("select")
        var m = data.match(/^(.+)-(.+)$/)
        if (m) {
            myFocus = m[1]
            mySpeed = m[2]
            updateStorage()
            $("td[data-select]").removeClass("inverse")
            $(ev.target).addClass("inverse")
        }
    })

    /*  instanciate the Slideshow Forecast API  */
    var ssf = new ssfapi(myProg)
    ssf.start()

    /*  allow the Slideshow Forecast API to change the program  */
    $("select.program").change(function (ev) {
        ssf.end()
        myProg = $(ev.target).val()
        ssf = new ssfapi(myProg)
        ssf.start()
    })

    /*  update the forecast grid once  */
    var updating = false
    var updateOnce = function () {
        if (updating)
            return
        updating = true
        $("i.refresh").addClass("fa-spin")
        ssf.forecast(function (FC) {
            /*  helper function for formatting time  */
            var ppt = function (t) {
                var S = Math.floor(t % 60); t /= 60
                var M = Math.floor(t % 60); t /= 60
                var H = Math.floor(t % 24); t /= 24
                return sprintf("%02.0f:%02.0f:%02.0f", H, M, S)
            }

            /*  show results  */
            Object.keys(FC.T).forEach(function (focus) {
                Object.keys(FC.T[focus]).forEach(function (speed) {
                    var min = ppt(Math.round(FC.T[focus][speed].min))
                    var exp = ppt(Math.round(FC.T[focus][speed].exp))
                    var x = " " + exp + " (" + min + ") "
                    if (focus === myFocus && speed === mySpeed)
                        $("." + focus + " ." + speed).addClass("inverse")
                    else
                        $("." + focus + " ." + speed).removeClass("inverse")
                    $("." + focus + " ." + speed).html(x)
                })
            })
            $(".info .slides-total").html(FC.slidesTotal)
            $(".info .slides-tagged").html(FC.slidesTagged)
            $(".info .statements").html(FC.slidesStatements)
            $("i.refresh").removeClass("fa-spin")
            updating = false
        })
    }

    /*  trigger forecast grid update once initially, on refresh click and every 10s  */
    updateOnce()
    $("i.refresh").click(function () {
        updateOnce()
    })
    setInterval(function () {
        updateOnce()
    }, 10 * 1000)

    /*  do a graceful shutdown on main window close event  */
    win.on("close", function () {
        win.hide()
        ssf.end()
        win.close(true)
    })
})

