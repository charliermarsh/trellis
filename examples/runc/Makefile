init:
	rm -rf rootfs
	mkdir rootfs
	docker export $$(docker create busybox) | tar -C rootfs -xvf -

.PHONY: init
