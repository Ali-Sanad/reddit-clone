import {Query, Resolver} from 'type-graphql';

@Resolver()
export class HelloResolver {
  @Query(() => String)
  hello() {
    return 'hello world form graogql-apollo typescript server';
  }
}
