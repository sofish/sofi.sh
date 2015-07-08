dev:
	npm install && bower install && gulp dev

dist:
	npm install && bower install && gulp dist && echo BUILT AT: `date` > build.log && node server.js > server.log &
