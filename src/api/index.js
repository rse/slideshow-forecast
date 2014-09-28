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

/*  external requirements  */
var SlideShow = require("slideshow")

/*  classify speaker speed by mapping onto seconds for expressing single statement  */
var speakerTime = {
    slow:   { duration: 13.0, gap: 2.0 },
    normal: { duration:  9.0, gap: 1.5 },
    fast:   { duration:  6.0, gap: 1.0 }
}

/*  classify speaker focus by mapping onto a speaking time penalty  */
var speakerPenalty = {
    digressive: 2.20, /* express core plus many addon information, regular amount of sentences */
    decorative: 1.80, /* express core plus some addon information, regular amount of sentences */
    focused:    1.40, /* express core information, regular amount of sentences */
    selective:  1.20, /* express core information, reduced amount of sentences */
    staccato:   1.00  /* express core information, absolute minimum amount of sentences (plain facts only) */
}

/*  API class constructor  */
var slideshowForecast = function (prog) {
    this.prog = prog || "powerpoint"
    if (this.prog.match(/^(?:powerpoint|keynote)$/) === null)
        throw new Error("unknown program type")
    this.slideshow = null
}

/*  API class methods  */
slideshowForecast.prototype = {

    /*  start slideshow forecast connector  */
    start: function () {
        if (this.slideshow !== null)
            throw new Error("slideshow connector already started")
        this.slideshow = new SlideShow(this.prog)
    },

    /*  make a slideshow forecast  */
    forecast: function (cb) {
        this.slideshow.info().then(function (info) {
            /*  determine total duration for each speaker focus and speed  */
            var FC = {
                T: {
                    digressive: { fast: { min: 0, exp: 0 }, normal: { min: 0, exp: 0 }, slow: { min: 0, exp: 0 } },
                    decorative: { fast: { min: 0, exp: 0 }, normal: { min: 0, exp: 0 }, slow: { min: 0, exp: 0 } },
                    focused:    { fast: { min: 0, exp: 0 }, normal: { min: 0, exp: 0 }, slow: { min: 0, exp: 0 } },
                    selective:  { fast: { min: 0, exp: 0 }, normal: { min: 0, exp: 0 }, slow: { min: 0, exp: 0 } },
                    staccato:   { fast: { min: 0, exp: 0 }, normal: { min: 0, exp: 0 }, slow: { min: 0, exp: 0 } }
                },
                slidesTotal: 0,
                slidesTagged: 0,
                slidesStatements: 0
            }

            /*  fetch all notes...  */
            var notes = info.notes

            /*  iterate over all notes...  */
            notes.forEach(function (notice) {

                /*  iterate over all statement tags...   */
                notice.replace(/<\s*(\d+\??(?:\s*\+\s*\d+\??)*)\s*>/g, function (m0, m1) {
                    var isTagged = false

                    /*  iterate over all statement counts...  */
                    m1.replace(/\s+/, "").split(/\+/).forEach(function (statements) {

                        /*  parse statement count  */
                        var m = statements.match(/^(\d+)(\?)?$/)
                        statements = parseInt(m[1])
                        var isOptional = (m[2] === "?")

                        /*  calculate times  */
                        Object.keys(FC.T).forEach(function (focus) {
                            Object.keys(FC.T[focus]).forEach(function (speed) {
                                var ts = speakerTime[speed]
                                var t = (ts.duration + ts.gap) * statements + ts.gap
                                var tx = t * speakerPenalty[focus]
                                FC.T[focus][speed].exp += tx
                                if (!isOptional)
                                    FC.T[focus][speed].min += tx
                            })
                        })

                        /*  update total information  */
                        FC.slidesStatements += statements
                        isTagged = true
                    })

                    /*  update total information  */
                    if (isTagged)
                        FC.slidesTagged++
                })

                /*  update total information  */
                FC.slidesTotal++
            })

            /*  deliver result  */
            cb(FC)
        }).done()
    },

    /*  end slideshow forecast connector  */
    end: function () {
        if (this.slideshow !== null) {
            this.slideshow.end()
            this.slideshow = null
        }
    }
}

/*  export API class  */
module.exports = slideshowForecast

