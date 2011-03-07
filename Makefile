#!/usr/bin/make
# to automatize repeatitive actions


clean	: brequire_clean

build	: brequire_build doc_build

test	: jshint

doc	: doc_build

#################################################################################
#		misc								#
#################################################################################

jshint	:
	jshint lib/*.js

doc_build:
	dox --title "jsbattle - the war of the bots"			\
		--desc "coders vs coders figthing over tank bots"	\
		lib/*.js > doc/index.html

#################################################################################
#		brequire							#
#################################################################################

brequire_build:
	brequire lib www/brequired

brequire_clean:
	rm -f www/brequired/*.js
	
brequire_monitor: brequire_build
	(while inotifywait -r -e modify,attrib,create lib ; do make brequire_build; done)

#################################################################################
#		deploy								#
#################################################################################

deploy:	deployGhPage;

deployGhPage:
	rm -rf /tmp/jsbattleGhPages
	(cd /tmp && git clone git@github.com:jeromeetienne/jsbattle.git jsbattleGhPages)
	(cd /tmp/jsbattleGhPages && git checkout gh-pages)
	cp -a Makefile lib/ www/ /tmp/jsbattleGhPages
	(cd /tmp/jsbattleGhPages && rm www/brequired/.gitignore && make brequire_build)
	(cd /tmp/jsbattleGhPages && git add . && git commit -a -m "Another deployement" && git push origin gh-pages)
	#rm -rf /tmp/jsbattleGhPages
