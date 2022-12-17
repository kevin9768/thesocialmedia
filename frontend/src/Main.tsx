import { Box, Flex, Input, Wrap, WrapItem } from "@chakra-ui/react";
import React, { useEffect, useReducer, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { useNavigate } from "react-router-dom";
import Wrapper from "./Layouts/Wrapper";
import Item from "./Components/Item";
import NavButton from "./Components/NavButton";
import FriendsStatus from "./Components/Main/FriendsStatus";
import UserStatus from "./Components/Main/UserStatus";
import Posts from "./Components/Main/Posts";
import { RootState } from "./app/store";
import axios from "axios";
import { API_URL } from "./app/utils/api";
import { FriendsType, UserDataType } from "./Types/UserDataType";

const mapStateToProps = (state: RootState) => {
  return {
    isLoggedIn: state.auth.loggedIn,
  };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

const initialCurFriends: FriendsType = [];
const initialUserData: UserDataType = {};

const Main: React.FC<PropsFromRedux> = ({ isLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn === false) {
      navigate("/landing");
    }
  }, [isLoggedIn, navigate]);

  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const [search, setSearch] = useState("");
  const [user, setUser] = useState(initialUserData);
  const [curFriends, setCurFriends] = useState(initialCurFriends);
  const [friendAvatar, setFriendAvatar] = useState({});

  const fetchFriends = async () => {
    const following = await axios.get(API_URL + "/following", {
      withCredentials: true,
    });
    await following.data.following.forEach(fetchNewFriend).catch(()=>{});
  };

  const fetchUser = async () => {
    let headline: string, avatar: string;
    await axios
      .get(API_URL + "/headline", { withCredentials: true })
      .then((res) => {
        headline = res.data.headline;
        setUser((prevState) => ({ ...prevState, headline }));
      })
      .catch(() => {
        headline = "";
        console.clear();
      });
    await axios
      .get(API_URL + "/avatar", { withCredentials: true })
      .then((res) => {
        avatar = res.data.avatar;
        setUser((prevState) => ({ ...prevState, avatar }));
      })
      .catch(() => {
        avatar = "";
        console.clear();
      });
  };

  const fetchNewFriend = async (friendName: string) => {
    let headline: string = "", avatar: string;
    await axios
      .get(API_URL + "/headline/" + friendName, { withCredentials: true })
      .then((res) => {
        headline = res.data.headline;
      })
      .catch(() => {
        headline = "";
        console.clear();
      });
    await axios
      .get(API_URL + "/avatar/" + friendName, { withCredentials: true })
      .then((res) => {
        avatar = res.data.avatar;
        setFriendAvatar((prevState) => ({
          ...prevState,
          [friendName]: avatar,
        }));
      })
      .catch(() => {
        avatar = "";
        console.clear();
      });
    if(headline){
      setCurFriends((prevState) => [
        ...prevState,
        { name: friendName, headline, avatar },
      ]);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchUser();
    // eslint-disable-next-line
  }, []);

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
        <NavButton isLeft />
        <Flex>thesocialmedia</Flex>
        <NavButton />
      </Flex>
      <Wrapper>
        <Wrap spacing="50px" justify={"center"}>
          <WrapItem>
            <Box w={{ base: "650px", xl: "400px" }}>
              <UserStatus />
              <FriendsStatus
                curFriend={curFriends}
                setCurFriend={setCurFriends}
                fetchNewFriend={fetchNewFriend}
                forceUpdate={forceUpdate}
              />
            </Box>
          </WrapItem>
          <WrapItem zIndex={100}>
            <Box w={{ base: "650px", xl: "800px" }} pb="120px">
              <Item>
                <Flex>
                  <Input
                    w="100%"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    placeholder="Search..."
                  />
                </Flex>
              </Item>

              <Posts
                search={search}
                friends={curFriends}
                user={user}
                friendsAvatar={friendAvatar}
              />
            </Box>
          </WrapItem>
        </Wrap>
      </Wrapper>
    </>
  );
};

export default connector(Main);
