FROM mcr.microsoft.com/playwright:v1.44.1-jammy
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .

CMD ["npm", "start"]
