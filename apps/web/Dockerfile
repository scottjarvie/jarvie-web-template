FROM node:18-alpine

WORKDIR /app

# Copy package.json files for all workspaces
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/db/package.json ./packages/db/
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile

# Copy project files
COPY . .

# Build the Next.js application
RUN cd apps/web && pnpm build

# Set the working directory to the web directory
WORKDIR /app/apps/web

# Expose the port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"] 