import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import {MyContext} from '../types';
import {User} from '../entites/User';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username!: string;

  @Field()
  password!: string;
}

@ObjectType()
class FieldError {
  @Field()
  field!: string;

  @Field()
  message!: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => User, {nullable: true})
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, {nullable: true})
  async me(@Ctx() {em, req}: MyContext) {
    //Not logged in user
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, {id: req.session.userId});
    return user;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em, req}: MyContext
  ): Promise<UserResponse> {
    //input validations
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'Length must be 3 character or more !!',
          },
        ],
      };
    }

    if (options.password.length < 3) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Password length must be 3 character or more !!',
          },
        ],
      };
    }
    //check if username is already exist or not
    const username = await em.findOne(User, {username: options.username});

    if (!username) {
      const hashedPassowrd = await argon2.hash(options.password);
      const user = await em.create(User, {
        username: options.username,
        password: hashedPassowrd,
      });
      await em.persistAndFlush(user);

      //store user id session
      //set the cookie on the user
      //keep user logged in
      req.session.userId = user.id;

      return {
        user,
      };
    } else {
      return {
        errors: [
          {
            field: 'username',
            message: 'username already exist !!',
          },
        ],
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() {em, req}: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, {username: options.username});
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: "username does't exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'wrong password',
          },
        ],
      };
    }

    req.session.userId = user.id;
    return {
      user,
    };
  }
}
