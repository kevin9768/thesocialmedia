import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
} from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { FaChevronDown } from "react-icons/fa";
import { connect, ConnectedProps } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../app/authSlice";
import { AppDispatch } from "../app/store";
import { API_URL } from "../app/utils/api";

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    logout: async () => {
      await axios.put(API_URL + "/logout", {}, { withCredentials: true });
      dispatch(logout());
    },
  };
};
const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface NavProps extends PropsFromRedux {
  isLeft?: boolean;
  profilePage?: boolean;
}
const NavButton: React.FC<NavProps> = ({
  isLeft = false,
  profilePage = false,
  logout,
}) => {
  const navigate = useNavigate();
  return (
    <Box
      ml={isLeft ? "" : "auto"}
      mr={isLeft ? "auto" : ""}
      visibility={isLeft ? "hidden" : "visible"}
    >
      <Show above="md">
        {!profilePage && (
          <Button colorScheme="whiteAlpha" onClick={() => navigate("/profile")}>
            Profile
          </Button>
        )}
        {profilePage && (
          <Button colorScheme="whiteAlpha" onClick={() => navigate("/")}>
            Main
          </Button>
        )}
        <Button colorScheme="twitter" ml={3} onClick={() => logout()}>
          Logout
        </Button>
      </Show>
      <Show below="md">
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FaChevronDown />}
            colorScheme="whiteAlpha"
          />
          <MenuList bgColor="gray.400" fontSize="md" w="fit-content">
            {!profilePage && (
              <MenuItem
                _hover={{ bgColor: "gray.600" }}
                _focus={{ bgColor: "gray.600" }}
                onClick={() => navigate("/profile")}
              >
                Profile
              </MenuItem>
            )}
            {profilePage && (
              <MenuItem
                _hover={{ bgColor: "gray.600" }}
                _focus={{ bgColor: "gray.600" }}
                onClick={() => navigate("/")}
              >
                Main
              </MenuItem>
            )}
            <MenuItem
              _hover={{ bgColor: "gray.600" }}
              _focus={{ bgColor: "gray.600" }}
              onClick={() => logout()}
            >
              Logout
            </MenuItem>
          </MenuList>
        </Menu>
      </Show>
    </Box>
  );
};

export default connector(NavButton);
