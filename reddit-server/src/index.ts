import {MikroORM} from '@mikro-orm/core';
import microConfig from './mikro-orm.config';
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import {HelloResolver} from './resolvers/hello';
import {PostResolver} from './resolvers/post';
import {UserResolver} from './resolvers/user';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import {COOKIE_NAME, __prod__} from './constants';
import {MyContext} from './types';
import cors from 'cors';

const port = process.env.PORT || 4000;

const main = async () => {
  //db connection
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();
  const app = express();

  //redis stuff
  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  //cors
  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({client: redisClient, disableTouch: true}),
      saveUninitialized: false,
      cookie: {
        maxAge: 10 * 365 * 24 * 60 * 60 * 1000, //10 years in milliseconds
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__, //cookie only works in https
      },
      secret: 'KamadoTanjiru',
      resave: false,
    })
  );

  //apollo stuff
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),

    context: ({req, res}): MyContext => ({em: orm.em, req, res}),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: false,
    },
  });

  app.listen(port, () => {
    console.log(`Server is running on port:${port}`);
  });
};

main().catch((err) => {
  console.error(err);
});
