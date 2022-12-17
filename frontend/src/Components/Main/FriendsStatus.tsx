import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Text,
  Input,
  AvatarBadge,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoIosRemove } from "react-icons/io";
import { API_URL } from "../../app/utils/api";
import { FriendsType, UserDataType } from "../../Types/UserDataType";
import Item from "../Item";

const FriendStatus: React.FC<any> = ({ friend, removeFriend }) => {
  return (
    <Box mb={3}>
      <Flex>
        <Avatar
          size="lg"
          mb={4}
          pos="relative"
          name={friend.name}
          src={friend.avatar ? friend.avatar.replace('http://','https://') : ``}
        >
          <AvatarBadge
            boxSize="1.25em"
            bg={"green.500"}
          />
        </Avatar>
        <Box textAlign="left" ml={4} mr={2}>
          <Heading fontSize="xl">{friend.name}</Heading>
          <Text>{friend.headline}</Text>
        </Box>

        <IconButton
          ml="auto"
          icon={<IoIosRemove />}
          aria-label="remove-user"
          onClick={() => removeFriend(friend.name)}
        />
      </Flex>
    </Box>
  );
};

const FriendsStatus: React.FC<any> = ({
  curFriend,
  setCurFriend,
  fetchNewFriend,
  forceUpdate,
}) => {
  const removeCurFriend = async (name: string) => {
    await axios.delete(API_URL + "/following/" + name, {
      withCredentials: true,
    });
    setCurFriend((prevState: FriendsType) =>
      prevState.filter((friend) => friend.name !== name)
    );
    forceUpdate();
  };

  const [newFriend, setNewFriend] = useState("");
  const [noSuchUser, setNoSuchUser] = useState(false);
  const [loading, setLoading] = useState(false);

  // Loading becomes false after the friend list is updated
  useEffect(() => {
    setLoading(false);
  }, [curFriend]);

  return (
    <Item mt={4}>
      {curFriend.map((friend: UserDataType, index: number) => (
        <FriendStatus
          friend={friend}
          key={index}
          removeFriend={removeCurFriend}
        />
      ))}

      <Flex>
        <Input
          w="100%"
          value={newFriend}
          onChange={(e) => setNewFriend(e.target.value)}
          placeholder="Follow someone new"
        />
        <Button
          isLoading={loading}
          ml={2}
          colorScheme="gray"
          onClick={async () => {
            if (newFriend.length > 0) {
              setLoading(true);
              await axios
                .put(
                  API_URL + "/following/" + newFriend,
                  {},
                  { withCredentials: true }
                )
                .then(() => {
                  setNewFriend("");
                  fetchNewFriend(newFriend);
                  setNoSuchUser(false);
                })
                .catch(() => {
                  setNoSuchUser(true);
                });
            }
          }}
        >
          Add
        </Button>
      </Flex>
      {noSuchUser && (
        <Alert mt={2} status="error">
          <AlertIcon />
          No such user!
        </Alert>
      )}
    </Item>
  );
};

export default FriendsStatus;
