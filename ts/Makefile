TARGET = dist/main.js

all: $(TARGET)

run: $(TARGET)
	eval time node $(TARGET)

run-all: $(TARGET)
	eval time node $(TARGET) interpreter
	eval time node $(TARGET) compiled
	eval time node $(TARGET) compiled2

$(TARGET): main.ts tsconfig.json Makefile node_modules
	./node_modules/.bin/tsc

clean:
	rm ./dist/* -r -f
	
node_modules:
	npm install typescript
	npm install @types/node
	chmod 755 ./node_modules/.bin/tsc
	

