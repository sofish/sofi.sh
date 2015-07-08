dev:
	cnpm install && bower install && gulp dev

dist:
	cnpm install && bower install && gulp dist && echo BUILT AT: `date` > build.log && node server.js > server.log &
