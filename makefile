vender:
	git pull origin master && \
	npm --registry=https://r.cnpmjs.org install

clean:
	gulp clean && bower install

dev: vender clean
	gulp dev

dist: vender
	gulp clean && gulp dist && gulp api && echo BUILT AT: `date` > build.log && \
	cat server.log | awk '{ print $1}' | xargs -I{} kill -9 {} \
	| nohup node server.js > server.log &
