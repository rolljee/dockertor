# syntax=docker/dockerfile:1
FROM oven/bun:1 AS runtime
WORKDIR /app

# The API shells out to the Docker CLI (`docker ps`). It talks to the host
# daemon through a /var/run/docker.sock mounted at runtime, so only the CLI
# (not the full engine) is needed inside the image.
RUN apt-get update -y \
	&& apt-get install -y --no-install-recommends ca-certificates curl gnupg \
	&& install -m 0755 -d /etc/apt/keyrings \
	&& curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
	&& chmod a+r /etc/apt/keyrings/docker.gpg \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list \
	&& apt-get update -y \
	&& apt-get install -y --no-install-recommends docker-ce-cli \
	&& rm -rf /var/lib/apt/lists/*

# Dependencies first, for layer caching.
COPY package.json bun.lockb* ./
RUN bun install --production

COPY . .

ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "index.ts"]
