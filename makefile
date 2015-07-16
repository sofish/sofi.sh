vender:
	git pull origin master && \
	npm --registry=https://r.cnpmjs.org install

clean:
	gulp clean && bower install

dev: vender clean
	gulp dev

dist: vender clean
	NODE_ENV=production gulp dist && NODE_ENV=production gulp api && \
	mv .tmp/* .dist && echo BUILT AT: `date` > build.log && \
	nohup node server.js > server.log
