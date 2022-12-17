import { Box, Container, Wrap, WrapItem } from "@chakra-ui/react";
import { FC } from "react";
import Wrapper from "./Layouts/Wrapper";
import Register from "./Components/Landing/Register";
import Login from "./Components/Landing/Login";

const Landing: FC = () => {
  return (
    <>
      <Box
        zIndex="sticky"
        pos="fixed"
        w="100%"
        backgroundColor="gray.900"
        color="white"
        textAlign={"center"}
        fontSize={{ base: 35, md: 40 }}
        padding={2}
      >
        thesocialmedia
      </Box>
      <Wrapper>
        <Wrap spacing={100} justify="center">
          <WrapItem>
            <Container
              w={{ base: 400, md: 600 }}
              backgroundColor="gray.50"
              boxShadow="lg"
              rounded="lg"
              pt={5}
              pb={7}
              px={{ base: 4, md: 6 }}
            >
              <Register />
            </Container>
          </WrapItem>
          <WrapItem>
            <Container
              w={{ base: 400, md: 600 }}
              backgroundColor="gray.50"
              boxShadow="lg"
              rounded="lg"
              pt={5}
              pb={7}
              px={{ base: 4, md: 6 }}
            >
              <Login />
            </Container>
          </WrapItem>
        </Wrap>
      </Wrapper>
    </>
  );
};

export default Landing;
