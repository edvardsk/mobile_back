# server
FROM node:12

EXPOSE 3000 9229

WORKDIR /home/app
COPY . /home/app

RUN npm i -g knex-migrate
RUN npm install -g nodemon
RUN yarn
RUN [ "chmod", "+x", "./scripts/wait_and_migrate.sh" ]

CMD ./scripts/wait_and_migrate.sh && yarn dev
