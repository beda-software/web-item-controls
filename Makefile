build-seeds:
	docker compose -f docker-compose.seeds.yaml up
seeds:
	docker compose -f docker-compose.seeds.yaml up
	docker compose up -d --force-recreate --no-deps devbox

up:
	docker compose pull --quiet
	docker compose build
	docker compose up -d

stop:
	docker compose stop

down:
	docker compose down

up-video:
	docker compose -f compose.yaml -f compose.video.yaml pull --quiet
	docker compose build
	docker compose -f compose.yaml -f compose.video.yaml up -d

up-matchbox:
	docker compose -f compose.yaml -f compose.matchbox.yaml pull --quiet
	docker compose build
	docker compose -f compose.yaml -f compose.matchbox.yaml up -d

stop-matchbox:
	docker compose -f compose.yaml -f compose.matchbox.yaml stop

down-matchbox:
	docker compose -f compose.yaml -f compose.matchbox.yaml down

up-test:
	docker compose -f docker-compose.tests.yaml pull --quiet
	docker compose -f docker-compose.tests.yaml up -d

down-test:
	docker compose -f docker-compose.tests.yaml down

logs-test:
	docker compose -f docker-compose.tests.yaml logs -f

test:
	@if [ -f ".env" ]; then \
		export `cat .env | xargs`; \
	fi
	docker compose -f docker-compose.tests.yaml pull --quiet
	docker compose -f docker-compose.tests.yaml up -d
	yarn test
