all:
	cd cpp;	$(MAKE) run
	cd python; $(MAKE) run
	cd ts; $(MAKE) run-all

clean:
	cd cpp;	$(MAKE) clean
	cd python; $(MAKE) clean
	cd ts; $(MAKE) clean
	
