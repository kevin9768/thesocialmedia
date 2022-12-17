import {
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { Field, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../../app/authSlice";
import { AppDispatch, RootState } from "../../app/store";
import { API_URL } from "../../app/utils/api";

const mapStateToProps = (state: RootState) => {
  return {
    error: state.auth.error,
    loggedIn: state.auth.loggedIn,
  };
};
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    login: (username: string, result: string) => {
      dispatch(login({ username, result }));
    },
  };
};
const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface LoginFormFields {
  username: string;
  password: string;
}

const initRegisterFormValue: LoginFormFields = {
  username: "",
  password: "",
};

const Login: React.FC<PropsFromRedux> = ({ loggedIn, error, login }) => {
  const navigate = useNavigate();

  const [loginError, setLoginError] = useState(false);
  const [oauth, setOauth] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      navigate("/");
    }
  }, [loggedIn, navigate]);

  const loginOAuth = async () => {
    let username="", result="";
    await axios
      .post(API_URL + "/login-google", {}, { withCredentials: true})
      .then((res) => {
        result = res.data.result;
        username = res.data.username;
      })
      .catch((err) => {
        if (err.response.data === "Unauthorized") {
          setLoginError(true);
        }
      });

    login(username, result);
  }
  useEffect(()=>{
    loginOAuth();
  },[])

  return (
    <>
      <Heading size="lg" textAlign="center" mb={2}>
        Login
      </Heading>
      <Formik
        initialValues={initRegisterFormValue}
        validate={(values) => {
          const errors: Partial<LoginFormFields> = {};
          if (!values.username.match(/[A-Za-z][A-Za-z0-9]*/)) {
            errors.username =
              "Username should start with letters and may contain numbers";
          }
          if (values.password.length === 0) {
            errors.password = "Password should not be empty";
          }
          return errors;
        }}
        onSubmit={async (values) => {
          let result = "";
          let username = "";
          await axios
            .post(API_URL + "/login", values, { withCredentials: true })
            .then((res) => {
              result = res.data.result;
              username = res.data.username;
            })
            .catch((err) => {
              if (err.response.data === "Unauthorized") {
                setLoginError(true);
              }
            });

          login(username, result);
        }}
      >
        {({ handleSubmit, errors, touched }) => (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="flex-start">
              <FormControl isInvalid={!!errors.username && touched.username}>
                <FormLabel
                  htmlFor="username"
                  fontSize={{ base: "md", md: "lg" }}
                >
                  Username
                </FormLabel>
                <Field
                  as={Input}
                  name="username"
                  type="text"
                  variant="filled"
                />
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password && touched.password}>
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
              <Button
                type="submit"
                colorScheme="twitter"
                w="100%"
                onClick={() => {
                  setLoginError(false);
                }}
              >
                Login
              </Button>
              <Button 
                as={Link}
                href={(API_URL + "/auth/google")}
                onClick={()=>{setOauth(true)}}
                width="100%"
                colorScheme="facebook"
              >Login with Google</Button>
            </VStack>
          </form>
        )}
      </Formik>
      {loginError && (
        <Alert mt={4} rounded={4} status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Username and password couldn't match</AlertTitle>
        </Alert>
      )}
    </>
  );
};

export default connector(Login);
