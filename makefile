dev:
	 cnpm install && bower install && gulp dev

dist:
	git pull origin master && cnpm install && bower install && \
	gulp dist && echo BUILT AT: `date` > build.log && \
	cat server.log | awk '{ print $1}' | xargs -I{} kill -9 {} \
	| nohup node server.js > server.log &
