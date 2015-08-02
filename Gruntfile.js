/*
**  slideshow-forecast -- Slideshow Duration Forecasting
**  Copyright (c) 2014 Ralf S. Engelschall <http://engelschall.com>
**
**  This Source Code Form is subject to the terms of the Mozilla Public
**  License (MPL), version 2.0. If a copy of the MPL was not distributed
**  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

/* global module: true */
module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-bower-install-simple");
    grunt.loadNpmTasks("grunt-nw-builder");

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            options: {
                jshintrc: "jshint.json"
            },
            gruntfile:   [ "Gruntfile.js" ],
            sourcefiles: [ "src/**/*.js", "!src/gui/lib/**/*.js" ]
        },
        eslint: {
            options: {
                config: "eslint.json"
            },
            target: [ "src/**/*.js", "!src/gui/lib/**/*.js" ]
        },
        "bower-install-simple": {
            "main": {
                options: {
                    color:       true,
                    production:  true,
                    directory:   "bower_components"
                }
            }
        },
        copy: {
            "normalize": {
                src: [ "bower_components/normalize.css/normalize.css" ],
                dest: "src/gui/lib/normalize/normalize.css"
            },
            "jquery": {
                src: [ "bower_components/jquery/dist/jquery.js" ],
                dest: "src/gui/lib/jquery/jquery.js"
            },
            "font-awesome-css": {
                src: [ "bower_components/fontawesome/css/font-awesome.css" ],
                dest: "src/gui/lib/fontawesome/fontawesome.css",
                options: {
                    process: function (content /*, srcpath */) {
                        return content.replace(/\.\.\/fonts\/fontawesome-webfont/g, "fontawesome");
                    }
                }
            },
            "font-awesome-fonts": {
                files: [{
                    expand: true, flatten: false, cwd: "bower_components/fontawesome/fonts",
                    src: "fontawesome-webfont.*", dest: "src/gui/lib/fontawesome/",
                    rename: function (src, dest) { return src + dest.replace(/fontawesome-webfont/, "fontawesome"); }
                }]
            },
            "typopro": {
                files: [
                    { expand: true, flatten: false, cwd: "bower_components/typopro-web/web",
                      src: "TypoPRO-OpenSans/TypoPRO-OpenSans-Regular*", dest: "src/gui/lib/typopro/" },
                    { expand: true, flatten: false, cwd: "bower_components/typopro-web/web",
                      src: "TypoPRO-OpenSans/TypoPRO-OpenSans-Bold*", dest: "src/gui/lib/typopro/" },
                    { expand: true, flatten: false, cwd: "bower_components/typopro-web/web",
                      src: "TypoPRO-DejaVu/TypoPRO-DejaVuSans-Regular*", dest: "src/gui/lib/typopro/" }
                ]
            },
            "store.js": {
                src: [ "bower_components/store.js/store.js" ],
                dest: "src/gui/lib/store/store.js"
            },
        },
        nwjs: {
            options: {
                platforms: [ "win", "osx" ],
                buildDir: "../dst",
                cacheDir: "../cache",
                macZip: false
            },
            src: [
                "package.json",
                "LICENSE",
                "src/**/*",
                "node_modules/slideshow/**/*",
                "!node_modules/slideshow/node_modules/event-stream/test/*",
                "node_modules/sprintfjs/**/*"
            ]
        },
        clean: {
            clean:     [ ],
            distclean: [ "node_modules", "bower_components" ]
        }
    });

    grunt.registerTask("default", [
        "jshint",
        "eslint",
        "bower-install-simple",
        "copy"
    ]);

    grunt.registerTask("package", [
        "nwjs"
    ]);
};

