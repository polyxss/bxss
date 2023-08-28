FROM node:16

COPY ./generation/ /usr/src/generation/
COPY ./testbed /usr/src/testbed/

WORKDIR /usr/src/generation
RUN npm install --silent

WORKDIR /usr/src/testbed
RUN npm install --silent && npm install --silent -g typescript@latest ts-node@latest

CMD ["ts-node", "server.ts"]
