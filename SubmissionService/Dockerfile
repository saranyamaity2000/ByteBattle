FROM node:22-alpine

WORKDIR /usr/src/app

# Only copy the files needed for install
COPY package.json package-lock.jso[n]* ./

# Run install (This will now be cached perfectly!)
RUN if [ -f package-lock.json ]; then npm i; else npm ci; fi

# Copy your actual code
COPY . .

EXPOSE 3001
CMD ["npm", "start"]