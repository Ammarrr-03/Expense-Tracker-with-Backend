FROM node:18


WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm rebuild esbuild 
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]
