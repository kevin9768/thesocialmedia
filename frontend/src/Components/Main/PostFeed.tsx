import {
  Textarea,
  HStack,
  IconButton,
  Button,
  Image,
  Center,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { IoMdPhotos } from "react-icons/io";
import { API_URL } from "../../app/utils/api";
import Item from "../Item";

const PostFeed: React.FC<any> = ({ username, setPosts }) => {
  const uploadPhoto = useRef<HTMLInputElement>(null);
  const [newPost, setNewPost] = useState("");

  const [image, setImage] = useState<Blob>();
  const [preview, setPreview] = useState("");

  useEffect(() => {
    let url: string;
    if (image) {
      url = URL.createObjectURL(image);
      setPreview(url);
    }
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [image]);

  return (
    <Item mt={4}>
      <Textarea
        mt={2}
        w="100%"
        value={newPost}
        onChange={(e) => {
          setNewPost(e.target.value);
        }}
        placeholder={`${username}, spread some great experiences with your friends`}
      />
      {preview && (
        <Center my={4}>
          <Image src={preview} w="200px" h="200px" fit={"contain"} />
        </Center>
      )}
      <HStack mt={4} w="100%">
        <IconButton
          icon={<IoMdPhotos />}
          aria-label="photos"
          mr="auto"
          onClick={() => {
            uploadPhoto.current?.click();
          }}
        />
        <input
          accept="image/*"
          type="file"
          ref={uploadPhoto}
          onChange={(e) => {
            if (e.target.files) {
              setImage(e.target.files[0]);
            }
          }}
          style={{ display: "none" }}
        />

        <Button
          colorScheme="gray"
          ml="auto"
          onClick={() => {
            setNewPost("");
          }}
        >
          Clear
        </Button>
        <Button
          colorScheme="twitter"
          ml={2}
          disabled={newPost.length === 0}
          onClick={async () => {
            if (newPost.length > 0) {
              const fd = new FormData();
              if (image) {
                fd.append("image", image);
              }
              fd.append("text", newPost);
              await axios
                .post(API_URL + "/article", fd, { withCredentials: true })
                .then((res) => {
                  setPosts((prevState: any) => [
                    ...res.data.articles,
                    ...prevState,
                  ]);
                });
              setNewPost("");
              setPreview("");
              setImage(undefined);
            }
          }}
        >
          Post
        </Button>
      </HStack>
    </Item>
  );
};

export default PostFeed;
