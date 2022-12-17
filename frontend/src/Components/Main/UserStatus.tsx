import {
  Avatar,
  Button,
  Flex,
  Heading,
  Text,
  Input,
  AvatarBadge,
  Link,
  Center,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../app/store";
import { API_URL } from "../../app/utils/api";
import Item from "../Item";
import { UserDataType } from "../../Types/UserDataType";
import { link } from "fs";

const mapStateToProps = (state: RootState) => {
  return {
    username: state.auth.username,
  };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface UserStatusProps extends PropsFromRedux {
  notMain?: boolean;
}

const initialUserData: UserDataType = {
  headline: "",
};

const UserStatus: React.FC<UserStatusProps> = ({
  username,
  notMain = false,
}) => {
  const [, forceUpdate]= useReducer(x=>(x+1), 0);
  const [headline, setHeadline] = useState("");
  const [userData, setUserData] = useState(initialUserData);
  const uploadPhoto = useRef<HTMLInputElement>(null);

  const fetchUserData = async () => {
    await axios
      .get(API_URL + "/headline", { withCredentials: true })
      .then((res) => {
        setUserData((prevState) => ({
          ...prevState,
          headline: res.data.headline,
        }));
      });
    await axios
      .get(API_URL + "/avatar", { withCredentials: true })
      .then((res) => {
        setUserData((prevState) => ({ ...prevState, avatar: res.data.avatar }));
      })
      .catch(() => {
        setUserData((prevState) => ({ ...prevState, avatar: "" }));
      });
  };

  useEffect(() => {
    fetchUserData().catch(() => {});
  }, []);

  const [oauth, setOauth] = useState(true);
  const [authEmail, setAuthEmail] = useState("");

  const fetchMe = async () =>{
    await axios.get(API_URL+'/me', { withCredentials: true })
      .then(res=>{
        setOauth(res.data.oauth);
        setAuthEmail(res.data.authEmail);
      }).catch(()=>{})
  };
  const handleUnlink = async () => {
    await axios.put(API_URL+"/unlink-google", {}, {withCredentials: true}).catch(()=>{});
    forceUpdate();
  }

  useEffect(()=>{
    fetchMe();
  }, [handleUnlink])


  const [linkError, setLinkError] = useState("");

  const linkGoogle = async ()=>{
    await axios.put(API_URL+"/link-google", {}, { withCredentials: true})
      .then(res =>{
        if(res.data.error){
          setLinkError(res.data.error);
        }
      }).catch(()=>{});

  }

  useEffect(()=>{
      linkGoogle();

  }, [])


  return (
    <Item w={notMain ? "400px" : "100%"} h="100%">
      <Avatar
        size="xl"
        mb={4}
        pos="relative"
        name={username!}
        src={userData.avatar && userData.avatar.replace('http://','https://')}
      >
        <AvatarBadge boxSize="1.25em" bg="green.500" />
      </Avatar>
      <Heading fontSize="2xl" mb={2}>
        {username}
      </Heading>
      <Text>{userData.headline}</Text>
      {!notMain && (
        <Flex mt={2}>
          <Input
            w="100%"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="What's on your mind?"
          />
          <Button
            ml={2}
            colorScheme="gray"
            onClick={async () => {
              if (headline.length > 0) {
                const res = await axios.put(
                  API_URL + "/headline",
                  { headline },
                  { withCredentials: true }
                );
                setUserData((prevState) => ({
                  ...prevState,
                  headline: res.data.headline,
                }));
                setHeadline("");
              }
            }}
          >
            Update
          </Button>
        </Flex>
      )}
      {notMain && (
        <>
          <Button
            w="100%"
            mt={2}
            onClick={() => {
              uploadPhoto.current?.click();
            }}
          >
            Upload new picture
          </Button>
          <Input
            display={"none"}
            name="avatar"
            readOnly
            defaultValue={"avatar-" + username!}
          />
          <Input
            accept="image/*"
            type="file"
            name="image"
            onChange={async (e) => {
              if (e.target.files) {
                const fd = new FormData();
                fd.append("image", e.target.files[0]);
                fd.append("avatar", "avatar-" + username!);
                await axios
                  .put(API_URL + "/avatar", fd, { withCredentials: true })
                  .then((res) => {
                    setUserData((prevState) => ({
                      ...prevState,
                      avatar: res.data.avatar,
                    }));
                  });
              }
            }}
            ref={uploadPhoto}
            style={{ display: "none" }}
          />
          {!oauth && (!authEmail ? 
          <Box>
            
          <Button 
                mt={2}
                as={Link}
                href={(API_URL + "/auth/google/profile")}
                // onClick={()=>{setOauth(true)}}
                width="100%"
                colorScheme="facebook"
                >Link with Google</Button> 
                <Text mt={2} color="red">

                {linkError}
                </Text>
                </Box>
              
              :
              <Flex>

              <Center mr="auto">
                Linked: 
                {' '+authEmail}
              </Center>
              <Button mt={2} onClick={handleUnlink}>Unlink Google</Button>
              </Flex>)
              }
        </>
      )}
    </Item>
  );
};
export default connector(UserStatus);
