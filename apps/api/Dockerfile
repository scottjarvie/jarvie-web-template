FROM oven/bun:1.2.3

WORKDIR /app

# Copy package.json files for all workspaces
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/db/package.json ./packages/db/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
RUN pnpm install --no-frozen-lockfile

# Copy project files
COPY . .

# Set the working directory to the API directory
WORKDIR /app/apps/api

# Expose the port
EXPOSE 3004

# Start the application
CMD ["bun", "run", "src/index.ts"] 