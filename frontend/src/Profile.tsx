import {
  Container,
  Flex,
  Heading,
  Wrap,
  Text,
  WrapItem,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  VStack,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import axios from "axios";
import { Field, Formik } from "formik";

import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "./app/store";
import { API_URL } from "./app/utils/api";
import UserStatus from "./Components/Main/UserStatus";
import NavButton from "./Components/NavButton";
import Wrapper from "./Layouts/Wrapper";

const mapStateToProps = (state: RootState) => {
  return {
    username: state.auth.username,
    isLoggedIn: state.auth.loggedIn,
  };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface ProfileInfoFields {
  email?: string;
  zipcode?: string;
  password?: string;
}

const initialPersonalInfo: ProfileInfoFields = {
  email: "",
  zipcode: "",
  password: "",
};

const initialUpdatedForm: ProfileInfoFields = {};

type ProfileFormFields = {
  confirmPassword: string;
} & ProfileInfoFields;

const Profile: React.FC<PropsFromRedux> = ({ username, isLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/landing");
    }
  }, [isLoggedIn, navigate]);

  const [info, setInfo] = useState<ProfileInfoFields>(initialPersonalInfo);
  const [me, setMe] = useState({username: "", oauth: false});

  const fetchUserInfo = async () => {
    await axios
      .get(API_URL + "/email", { withCredentials: true })
      .then((res) => {
        setInfo((prevState) => ({ ...prevState, email: res.data.email }));
      })
      .catch(()=>{});
    await axios
      .get(API_URL + "/zipcode", { withCredentials: true })
      .then((res) => {
        setInfo((prevState) => ({ ...prevState, zipcode: res.data.zipcode }));
      })
    .catch(()=>{});
    setInfo((prevState) => ({
      ...prevState,
      password: "*".repeat(6 + Math.ceil(Math.random() * 8)),
    }));
    await axios.get(API_URL+ "/me", {withCredentials: true})
      .then((res)=>{
        setMe(res.data);
      }).catch(()=>{});
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const [updatedFields, setUpdatedFields] =
    useState<ProfileInfoFields>(initialUpdatedForm);

  const [updateInfo, setUpdateInfo] = useState("");

  useEffect(() => {
    if (Object.keys(updatedFields).length > 0) {
      setUpdateInfo(() => {
        let msg = "";
        if (updatedFields.email)
          msg +=
            "Email: "+ info.email + " -> " + updatedFields.email + ", ";
        if (updatedFields.zipcode)
          msg +=
            "Zipcode: " +
            info.zipcode +
            " -> " +
            updatedFields.zipcode +
            ", ";
        if (updatedFields.password)
          msg +=
            "Password: " +
            info.password +
            " -> " +
            updatedFields.password +
            ", ";
        return msg !== "" ? msg.slice(0, -2) + "." : "";
      });
    } else {
      setUpdateInfo("");
    }
    setInfo(() => ({
      email: updatedFields.email ? updatedFields.email : info.email,
      zipcode: updatedFields.zipcode ? updatedFields.zipcode : info.zipcode,
      password: updatedFields.password ? updatedFields.password : info.password,
    }));
  }, [updatedFields, info.email, info.password, info.zipcode]);

  return (
    <>
      <Flex
        zIndex="sticky"
        pos="fixed"
        w="100%"
        backgroundColor="gray.900"
        color="white"
        padding={2}
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        fontSize={{ base: 35, md: 40 }}
      >
        <NavButton isLeft profilePage />
        <Flex>thesocialmedia</Flex>
        <NavButton profilePage />
      </Flex>
      <Wrapper>
        <Wrap spacing={4} justify="center">
          <UserStatus notMain />

          <Wrap mt={10} spacing={4} justify="center">
            <WrapItem>
              <VStack spacing={4} w="100%">
                <Container
                  w={400}
                  backgroundColor="gray.50"
                  boxShadow="lg"
                  rounded="lg"
                  pt={5}
                  pb={7}
                  px={{ base: 4, md: 6 }}
                >
                  <Heading size="lg" textAlign="center" mb={2}>
                    Current Info
                  </Heading>
                  <Text fontSize="xl">Username: {username}</Text>
                  <Text fontSize="xl">Email: {info.email}</Text>
                  <Text fontSize="xl">Zipcode: {info.zipcode}</Text>
                  <Text fontSize="xl">Password: {info.password}</Text>
                </Container>

                {updateInfo.length > 0 && (
                  <Alert
                    status="success"
                    w={400}
                    variant="subtle"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                  >
                    <AlertIcon />
                    <AlertTitle mt={4} mb={1} fontSize="lg">
                      Updated
                    </AlertTitle>
                    <AlertDescription>{updateInfo}</AlertDescription>
                  </Alert>
                )}
              </VStack>
            </WrapItem>
            <WrapItem>
              <Container
                w={400}
                backgroundColor="gray.50"
                boxShadow="lg"
                rounded="lg"
                pt={5}
                pb={7}
                px={{ base: 4, md: 6 }}
              >
                <Heading size="lg" textAlign="center" mb={2}>
                  Update Info
                </Heading>
                <Formik
                  initialValues={info as ProfileFormFields}
                  validate={(values) => {
                    const errors: Partial<any> = {};
                    if (
                      values.email &&
                      values.email.length > 0 &&
                      !values.email?.match(/^\S+@\S+\.\S+$/)
                    ) {
                      errors.email = "Expect a valid email";
                    }

                    if (
                      values.zipcode &&
                      values.zipcode.length > 0 &&
                      !String(values.zipcode).match(/^\d{5}$/)
                    ) {
                      errors.zipcode = "Expect a proper format of #####";
                    }
                    if (
                      (values.password || values.confirmPassword) &&
                      values.password !== values.confirmPassword
                    ) {
                      errors.confirmPassword = "Password does not match";
                    }
                    return errors;
                  }}
                  onSubmit={async (values) => {
                    setUpdatedFields(() => {
                      let updatedValues: ProfileInfoFields = {};

                      let key: keyof typeof info;
                      for (key in info)
                        if (
                          info[key] !== values[key] &&
                          values[key] &&
                          values[key]!.length > 0
                        ) {
                          if (key.includes("password")) {
                            updatedValues[key] = "*".repeat(
                              values[key]!.length
                            );
                          } else {
                            updatedValues[key] = values[key];
                          }
                        }

                      return updatedValues;
                    });

                    if (values.email && values.email.length > 0)
                      await axios.put(
                        API_URL + "/email",
                        { email: values.email },
                        { withCredentials: true }
                      );
                    if (values.zipcode && values.zipcode.length > 0)
                      await axios.put(
                        API_URL + "/zipcode",
                        { zipcode: values.zipcode },
                        { withCredentials: true }
                      );
                    if (values.password && values.password.length > 0)
                      await axios.put(
                        API_URL + "/password",
                        { password: values.password },
                        { withCredentials: true }
                      );
                  }}
                >
                  {({ handleSubmit, errors, touched }) => (
                    <form onSubmit={handleSubmit}>
                      <VStack spacing={4} align="flex-start">
                        <FormControl
                          isInvalid={!!errors.email && touched.email}
                        >
                          <FormLabel
                            htmlFor="email"
                            fontSize={{ base: "md", md: "lg" }}
                          >
                            Email
                          </FormLabel>
                          <Field
                            as={Input}
                            name="email"
                            type="email"
                            variant="filled"
                          />
                          <FormErrorMessage>{errors.email}</FormErrorMessage>
                        </FormControl>
                        <FormControl
                          isInvalid={!!errors["zipcode"] && touched["zipcode"]}
                        >
                          <FormLabel
                            htmlFor="zipcode"
                            fontSize={{ base: "md", md: "lg" }}
                          >
                            Zipcode
                          </FormLabel>
                          <Field
                            as={Input}
                            name="zipcode"
                            type="text"
                            variant="filled"
                          />
                          <FormErrorMessage>
                            {errors["zipcode"]}
                          </FormErrorMessage>
                        </FormControl>
                        { me && !me!.oauth &&
                          
                          <>
                          <FormControl isInvalid={!!errors.password}>
                          <FormLabel
                            htmlFor="password"
                            fontSize={{ base: "md", md: "lg" }}
                            >
                            Password
                          </FormLabel>
                          <Field
                            as={Input}
                            name="password"
                            type="password"
                            variant="filled"
                            />
                          <FormErrorMessage>{errors.password}</FormErrorMessage>
                        </FormControl>
                        <FormControl isInvalid={!!errors.confirmPassword}>
                          <FormLabel
                            htmlFor="confirmPassword"
                            fontSize={{ base: "md", md: "lg" }}
                            >
                            Confirm Password
                          </FormLabel>
                          <Field
                            as={Input}
                            name="confirmPassword"
                            type="password"
                            variant="filled"
                            />
                          <FormErrorMessage>
                            {errors.confirmPassword}
                          </FormErrorMessage>
                        </FormControl>
                            </>
                          }
                        <Button type="submit" colorScheme="twitter" w="100%">
                          Update
                        </Button>
                      </VStack>
                    </form>
                  )}
                </Formik>
              </Container>
            </WrapItem>
          </Wrap>
        </Wrap>
      </Wrapper>
    </>
  );
};

export default connector(Profile);
