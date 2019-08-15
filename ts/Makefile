TARGET = dist/main.js

all: $(TARGET)

run: $(TARGET)
	eval time node $(TARGET)

$(TARGET): main.ts tsconfig.json Makefile node_modules
	./node_modules/.bin/tsc

clean:
	rm ./dist/* -r -f
	
node_modules:
	npm install typescript
	npm install @types/node
	chmod 755 ./node_modules/.bin/tsc
	

