TARGET = main

all: $(TARGET)

run: $(TARGET)
	eval time ./main

$(TARGET): main.cpp Makefile
	#g++ -O0 -g main.cpp -o main
	g++ -O3 -g -c main.cpp -o main.o
	g++ main.o -o main
	objdump -S main.o > main.s

clean:
	rm -f main main.o main.s
