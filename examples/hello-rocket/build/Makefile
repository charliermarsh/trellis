build:
	typekit -f typekit.ts -t app > Dockerfile

preview:
	typekit -f typekit.ts -t app | bat --file-name Dockerfile --language Dockerfile

.PHONY: build preview
