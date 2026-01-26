FROM node:22-alpine

WORKDIR /usr/src/app

# PHASE 1: Only copy the files needed for install
# This layer is ONLY rebuilt if you change your dependencies
COPY package.json pnpm-lock.yam[l]* ./

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Run install (This will now be cached perfectly!)
RUN if [ -f pnpm-lock.yaml ]; then pnpm i --frozen-lockfile; else pnpm i; fi

# PHASE 2: Copy your actual code
# Changing code now DOES NOT trigger a re-install
COPY . .

EXPOSE 3000
CMD ["pnpm", "start"]