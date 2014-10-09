##
##  slideshow-forecast -- Slideshow Duration Forecasting
##  Copyright (c) 2014 Ralf S. Engelschall <http://engelschall.com>
##
##  This Source Code Form is subject to the terms of the Mozilla Public
##  License (MPL), version 2.0. If a copy of the MPL was not distributed
##  with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
##

NPM   = npm
GRUNT = ./node_modules/grunt-cli/bin/grunt

all: build

bootstrap:
	@if [ ! -x $(GRUNT) ]; then $(NPM) install; fi

build: bootstrap
	@$(GRUNT)

clean: bootstrap
	@$(GRUNT) clean:clean

distclean: bootstrap
	@$(GRUNT) clean:clean clean:distclean

package: bootstrap
	@$(GRUNT) package

update-package-json: bootstrap
	$(NPM) install npm-check-updates
	./node_modules/npm-check-updates/bin/npm-check-updates -u

