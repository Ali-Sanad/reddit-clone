import {Box, Button, Flex, Link} from '@chakra-ui/react';
import React from 'react';
import NextLink from 'next/link';
import {useMeQuery} from '../generated/graphql';
interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{data, fetching}] = useMeQuery();

  let body = null;
  //data is loading
  if (fetching) {
    //user is not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href='/login'>
          <Link color='white' mr={2}>
            Login
          </Link>
        </NextLink>
        <NextLink href='/register'>
          <Link color='white'>Register</Link>
        </NextLink>
      </>
    );
    //user logged in
  } else {
    body = (
      <Flex alignItems='center'>
        <Box mr={4} fontWeight='bold'>
          {data.me.username}
        </Box>
        <Button>Logout</Button>
      </Flex>
    );
  }
  return (
    <Flex bg='orange.500' padding={4}>
      <Box ml='auto'>{body}</Box>
    </Flex>
  );
};
export default NavBar;
