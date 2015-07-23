vender:
	git pull origin master && \
	npm --registry=https://r.cnpmjs.org install

clean:
	gulp clean && bower install

dev: vender clean
	gulp dev

dist: vender clean
	gulp dist && gulp api && echo BUILT AT: `date` > build.log && \
	forever start server.js > server.log &
