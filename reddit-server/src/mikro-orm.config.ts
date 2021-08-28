import {MikroORM} from '@mikro-orm/core';
import path from 'path';
import {__prod__} from './constants';
import {Post} from './entites/Post';
import {User} from './entites/User';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: 'reddit',
  type: 'postgresql',
  password: 'postgres',
  user: 'postgres',
  debug: !__prod__,
} as Parameters<typeof MikroORM.init>[0];
