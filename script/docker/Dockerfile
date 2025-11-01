# 1. Build Stage
# Use a Node.js image for building the application
FROM node:22-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# --- PNPM Integration Steps ---
# 1. Install pnpm globally
# The 'add --global pnpm' command will install the package manager
RUN npm install -g pnpm 

# Copy package.json and pnpm-lock.yaml for dependency installation
# Make sure your lock file is named 'pnpm-lock.yaml'
COPY package.json pnpm-lock.yaml ./

# 2. Install dependencies using pnpm
# 'pnpm install' is the equivalent of 'npm install'
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# 3. Build the Nuxt.js application
# 'pnpm run build' is the equivalent of 'npm run build'
RUN pnpm run build

# 2. Production Stage
# Use a smaller, more secure base image for the final runtime
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# --- PNPM Integration Steps ---
# 1. Install pnpm globally in the production image as well (needed for execution if package scripts use pnpm)
RUN npm install -g pnpm

# Copy only the necessary files from the build stage
# This includes the server bundle and the package files
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# 2. Install only production dependencies using pnpm
# '--prod' is the equivalent of '--omit=dev'
RUN pnpm install --prod --frozen-lockfile

# Expose the port the application will run on (NITRO_PORT)
EXPOSE 3443

# Set the command to run the application
# No change here, as the final execution is a direct node command
CMD ["node", ".output/server/index.mjs"]