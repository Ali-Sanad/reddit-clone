import React from 'react';
import {Form, Formik} from 'formik';
import {Box, Button} from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import {useRegisterMutation} from '../generated/graphql';
import {toErrorMap} from '../utils/toErrorMap';
import {useRouter} from 'next/dist/client/router';
interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const [{}, register] = useRegisterMutation();
  const router = useRouter();
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{username: '', password: ''}}
        onSubmit={async (values, {setErrors}) => {
          const res = await register(values);
          if (res.data?.register.errors) {
            setErrors(toErrorMap(res.data.register.errors));
          } else {
            //registered successfully
            router.push('/');
          }
        }}
      >
        {({isSubmitting}) => (
          <Form>
            <InputField
              name='username'
              label='Username'
              placeholder='username'
            />
            <Box mt={4}>
              <InputField
                name='password'
                label='Password'
                placeholder='password'
                type='password'
              />
            </Box>

            <Button
              type='submit'
              mt={4}
              colorScheme='teal'
              isLoading={isSubmitting}
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};
export default Register;
