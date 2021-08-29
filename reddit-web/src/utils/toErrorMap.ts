import {FieldError} from '../generated/graphql';

//takes in an array and return an object
export const toErrorMap = (errors: FieldError[]) => {
  const errorMap: Record<string, string> = {};
  errors.forEach(({field, message}) => {
    errorMap[field] = message;
  });

  return errorMap;
};
