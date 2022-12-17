import {
  Box,
  Flex,
  Avatar,
  IconButton,
  Input,
  Button,
  Text,
  Divider,
  HStack,
  Textarea,
  Image,
  Center,
} from "@chakra-ui/react";
import axios from "axios";
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";

import { IoMdCreate } from "react-icons/io";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../app/store";
import { API_URL } from "../../app/utils/api";
import Item from "../Item";
import { PostType } from "./Posts";

const Comment: FC<{
  author: string;
  comment: string;
  commentId: number;
  id: number;
  username: string;
}> = ({ author, comment, username, commentId, id }) => {
  const [avatar, setAvatar] = useState("");

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment);
  const [editText, setEditText] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const fetchAvatar = async () => {
    await axios
      .get(API_URL + "/avatar/" + author, { withCredentials: true })
      .then((res) => {
        setAvatar(res.data.avatar);
      })
      .catch(() => {});
  };
  useEffect(() => {
    fetchAvatar();
  });
  return (
    <Flex
      alignItems="center"
      bgColor="gray.100"
      py={2}
      px={4}
      borderBottom="2px solid white"
    >
      <Avatar size="sm" pos="relative" name={author} src={avatar} />
      <Text ml={2} fontWeight="bold">
        {author}
      </Text>
      {!editing && <Text ml={4}>{text}</Text>}
      {editing ? (
        <>
          <Input
            ml={4}
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value);
            }}
            bgColor="white"
          ></Input>
          <Button
            ml={2}
            isLoading={editLoading}
            disabled={editText.length === 0}
            colorScheme="linkedin"
            onClick={async () => {
              if (editText.length > 0) {
                setEditLoading(true);
                await axios
                  .put(
                    API_URL + "/articles/" + id,
                    {
                      text: editText,
                      commentId,
                    },
                    { withCredentials: true }
                  )
                  .catch(() => {});
                setText(editText);
                setEditLoading(false);
                setEditing(false);
              }
            }}
          >
            Update
          </Button>
        </>
      ) : (
        author === username && (
          <IconButton
            icon={<IoMdCreate />}
            ml="auto"
            aria-label="edit"
            display={editing ? "none" : "inherit"}
            onClick={() => {
              setEditing(true);
              setEditText(text);
            }}
          />
        )
      )}
    </Flex>
  );
};

const mapStateToProps = (state: RootState) => {
  return { username: state.auth.username };
};
const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface FeedProps extends PropsFromRedux {
  author: string;
  body: string;
  time: string;
  id: number;
  img: string;
  comments?: { author: string; text: string }[];
  avatar?: string;
  noImg?: boolean;
  setPosts: Dispatch<SetStateAction<PostType[]>>;
}

const Feed: FC<FeedProps> = ({
  author,
  body,
  time,
  id,
  img,
  comments,
  avatar,
  username,
}) => {
  const [showComments, setShowComments] = useState(false);

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(body);
  const [editText, setEditText] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  return (
    <Item mt={4}>
      <Flex alignItems="center">
        <Avatar size="md" pos="relative" name={author} src={avatar && avatar.replace('http://','https://')} />
        <Text ml={2} fontWeight="bold">
          {author}
        </Text>
        <Text ml={2} color="gray.500">
          {time}
        </Text>
        {author === username && (
          <IconButton
            icon={<IoMdCreate />}
            ml="auto"
            aria-label="edit"
            display={editing ? "none" : "inherit"}
            onClick={() => {
              setEditing(true);
              setEditText(text);
            }}
          />
        )}
      </Flex>
      <Box mt={2} textAlign="left">
        {editing ? (
          <Box>
            <Textarea
              bgColor="white"
              mt={2}
              w="100%"
              value={editText}
              onChange={(e) => {
                setEditText(e.target.value);
              }}
              placeholder={`Edit here...`}
            />
            <HStack mt={4} w="100%">
              <Button
                aria-label="photos"
                mr="auto"
                onClick={() => {
                  setEditing(false);
                }}
              >
                Cancel
              </Button>

              <Button
                colorScheme="gray"
                ml="auto"
                onClick={() => {
                  setEditText("");
                }}
              >
                Clear
              </Button>
              <Button
                isLoading={editLoading}
                colorScheme="twitter"
                ml={2}
                onClick={async () => {
                  if (editText.length > 0) {
                    setEditLoading(true);
                    await axios
                      .put(
                        API_URL + "/articles/" + id,
                        {
                          text: editText,
                        },
                        { withCredentials: true }
                      )
                      .catch(() => {});
                    setText(editText);
                    setEditLoading(false);
                    setEditing(false);
                  }
                }}
              >
                Save
              </Button>
            </HStack>
          </Box>
        ) : (
          <>
            <Text mt={2} fontFamily="monospace" fontSize="xl">
              {text}
            </Text>
          </>
        )}
        {img && (
          <Center my={4}>
            <Image src={img.replace('http://','https://')} w="752px" fit={"contain"} />
          </Center>
        )}
      </Box>
      <Flex mt={4} w="100%">
        <Box
          ml="auto"
          textDecor="underline"
          color="black"
          cursor={"pointer"}
          _hover={{
            color: "blue.500",
          }}
          onClick={() => {
            setShowComments((prevState) => !prevState);
          }}
        >
          {`${comments ? comments.length : 0} Comments`}
        </Box>
      </Flex>
      <Flex mt={4}>
        <Input
          ml={2}
          w="100%"
          value={commentText}
          onChange={(e) => {
            setCommentText(e.target.value);
          }}
          placeholder="Leave a comment..."
        />
        <Button
          w="fit-content"
          px={5}
          ml={2}
          colorScheme="twitter"
          disabled={commentText.length === 0}
          isLoading={commentLoading}
          onClick={async () => {
            if (commentText.length > 0) {
              setCommentLoading(true);
              await axios
                .put(
                  API_URL + "/articles/" + id,
                  {
                    text: commentText,
                    commentId: -1,
                  },
                  { withCredentials: true }
                )
                .catch(() => {});
              comments?.push({ author: username!, text: commentText });
              setCommentText("");
              setCommentLoading(false);
              setShowComments(true);
            }
          }}
        >
          Comment
        </Button>
      </Flex>
      <Divider mt={4} />{" "}
      {showComments &&
        comments &&
        comments.map(({ author, text }, index) => (
          <Comment
            author={author}
            comment={text}
            id={id}
            commentId={index}
            key={index}
            username={username!}
          />
        ))}
    </Item>
  );
};

export default connector(Feed);
