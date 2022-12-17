import {
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { Field, Formik } from "formik";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { register } from "../../app/authSlice";
import { API_URL } from "../../app/utils/api";

interface RegisterFormFields {
  username: string;
  "display-name": string;
  email: string;
  phone: string;
  "date-of-birth": string;
  "zip-code": string;
  password: string;
  "password-confirmation": string;
}

const initRegisterFormValue: RegisterFormFields = {
  username: "",
  "display-name": "",
  email: "",
  phone: "",
  "date-of-birth": "",
  "zip-code": "",
  password: "",
  "password-confirmation": "",
};

const Register: React.FC = () => {
  let maxDateForDateOfBirth: Date | string = new Date();
  maxDateForDateOfBirth.setFullYear(maxDateForDateOfBirth.getFullYear() - 18);
  const maxDateOfBirth = maxDateForDateOfBirth.toISOString().split("T")[0];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userExisted, setUserExisited] = useState(false);

  return (
    <>
      <Heading size="lg" textAlign="center" mb={2}>
        Register
      </Heading>
      <Formik
        initialValues={initRegisterFormValue}
        validate={(values) => {
          const errors: Partial<RegisterFormFields> = {};
          if (!values.username.match(/[A-Za-z][A-Za-z0-9]*/)) {
            errors.username =
              "Username should start with letters and may contain numbers";
          }
          if (!values.email.match(/\S+@\S+\.\S+/)) {
            errors.email = "Expect a valid email";
          }
          if (!values.phone.match(/\d{3}-\d{3}-\d{4}/)) {
            errors.phone = "Expect a proper format of ###-###-####";
          }
          if (values["date-of-birth"] > maxDateOfBirth) {
            errors["date-of-birth"] =
              "Should be older than 18 years old to register";
          }
          if (!String(values["zip-code"]).match(/\d{5}/)) {
            errors["zip-code"] = "Expect a proper format of #####";
          }
          if (values.password.length === 0) {
            errors.password = "Password should not be empty";
          }
          if (values["password-confirmation"].length === 0) {
            errors["password-confirmation"] = "Password should not be empty";
          }
          if (values.password !== values["password-confirmation"]) {
            errors["password-confirmation"] = "Password does not match";
          }
          return errors;
        }}
        onSubmit={async (values) => {
          let result = "";
          let username = "";

          await axios
            .post(
              API_URL + "/register",
              {
                username: values.username,
                password: values.password,
                dob: Date.parse(values["date-of-birth"]),
                email: values.email,
                zipcode: values["zip-code"],
              },
              { withCredentials: true }
            )
            .then((res) => {
              result = res.data.result;
              username = res.data.username;
            })
            .catch((err) => {
              if (err.response.data === "User already exists") {
                setUserExisited(true);
              }
            });

          dispatch(register({ username, result }));
          if (result === "success") navigate("/");
        }}
      >
        {({ handleSubmit, errors, touched, resetForm }) => (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="flex-start">
              <FormControl
                isInvalid={
                  (!!errors.username && touched.username) || userExisted
                }
              >
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
                <FormErrorMessage>{userExisted ? "User existed" : errors.username}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel
                  htmlFor="display-name"
                  fontSize={{ base: "md", md: "lg" }}
                >
                  Display Name(Optional)
                </FormLabel>
                <Field
                  as={Input}
                  name="display-name"
                  type="text"
                  variant="filled"
                />
              </FormControl>
              <FormControl isInvalid={!!errors.email && touched.email}>
                <FormLabel htmlFor="email" fontSize={{ base: "md", md: "lg" }}>
                  Email Address
                </FormLabel>
                <Field as={Input} name="email" type="email" variant="filled" />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={!!errors.phone && touched.phone}>
                <FormLabel htmlFor="phone" fontSize={{ base: "md", md: "lg" }}>
                  Phone
                </FormLabel>
                <Field as={Input} name="phone" type="phone" variant="filled" />
                <FormErrorMessage>{errors.phone}</FormErrorMessage>
              </FormControl>
              <FormControl
                isInvalid={
                  !!errors["date-of-birth"] && touched["date-of-birth"]
                }
              >
                <FormLabel
                  htmlFor="date-of-birth"
                  fontSize={{ base: "md", md: "lg" }}
                >
                  Date of Birth
                </FormLabel>
                <Field
                  as={Input}
                  name="date-of-birth"
                  type="date"
                  max={maxDateOfBirth}
                  variant="filled"
                />
                <FormErrorMessage>{errors["date-of-birth"]}</FormErrorMessage>
              </FormControl>
              <FormControl
                isInvalid={!!errors["zip-code"] && touched["zip-code"]}
              >
                <FormLabel
                  htmlFor="zip-code"
                  fontSize={{ base: "md", md: "lg" }}
                >
                  Zip Code
                </FormLabel>
                <Field
                  as={Input}
                  name="zip-code"
                  type="number"
                  variant="filled"
                />
                <FormErrorMessage>{errors["zip-code"]}</FormErrorMessage>
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
              <FormControl
                isInvalid={
                  !!errors["password-confirmation"] &&
                  touched["password-confirmation"]
                }
              >
                <FormLabel
                  htmlFor="password"
                  fontSize={{ base: "md", md: "lg" }}
                >
                  Password Confirmation
                </FormLabel>
                <Field
                  as={Input}
                  name="password-confirmation"
                  type="password"
                  variant="filled"
                />
                <FormErrorMessage>
                  {errors["password-confirmation"]}
                </FormErrorMessage>
              </FormControl>

              <HStack w="100%">
                <Button
                  type="reset"
                  mr="auto"
                  onClick={() => {
                    setUserExisited(false);
                    resetForm();
                  }}
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  colorScheme="twitter"
                  onClick={() => {
                    setUserExisited(false);
                  }}
                >
                  Register
                </Button>
              </HStack>
            </VStack>
          </form>
        )}
      </Formik>
      {userExisted && (
        <Alert mt={4} rounded={4} status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Username existed</AlertTitle>
        </Alert>
      )}
    </>
  );
};

export default Register;
