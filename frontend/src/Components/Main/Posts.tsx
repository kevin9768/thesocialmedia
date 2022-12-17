import { Flex, IconButton } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { RootState } from "../../app/store";
import { API_URL } from "../../app/utils/api";
import { FriendsType, UserDataType } from "../../Types/UserDataType";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import Feed from "./Feed";
import PostFeed from "./PostFeed";

const mapStateToProps = (state: RootState) => {
  return {
    username: state.auth.username,
  };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

interface PostsProps extends PropsFromRedux {
  search: string;
  friends: FriendsType;
  user: UserDataType;
  friendsAvatar: { [key: string]: string };
}

type CommentType = {
  author: string;
  text: string;
};

export type PostType = {
  _id: string;
  pid: number;
  author: string;
  text: string;
  date: Date;
  img: string;
  comments: CommentType[];
  __v: number;
};

const initialPosts: PostType[] = [];

const Posts: React.FC<PostsProps> = ({
  user,
  username,
  search,
  friends,
  friendsAvatar,
}) => {
  const [posts, setPosts] = useState(initialPosts);
  const [pages, setPages] = useState(0);
  const [curPage, setCurPage] = useState(0);

  const fetchPosts = async () => {
    let fetchingPosts: PostType[] = [];
    await axios
      .get(API_URL + "/articles", { withCredentials: true })
      .then((res) => {
        fetchingPosts = res.data.articles;
      })
      .catch(()=>{});

    for (let i = 0; i < friends.length; i++) {
      await axios
        .get(API_URL + "/articles/" + friends[i].name, {
          withCredentials: true,
        })
        // eslint-disable-next-line
        .then((res) => {
          fetchingPosts = [...fetchingPosts, ...res.data.articles];
        })
        .catch(()=>{});
    }

    setPosts(
      fetchingPosts.sort(
        (a, b) => (new Date(b.date) as any) - (new Date(a.date) as any)
      )
    );
  };

  useEffect(() => {
    fetchPosts();
    setCurPage(0);
    // eslint-disable-next-line
  }, [friends, search]);

  useEffect(() => {
    setPages(
      Math.floor(
        (posts?.filter(
          (post) => post.text.includes(search) || post.author.includes(search)
        ).length -
          1) /
          10
      )
    );
  }, [posts, search, friends]);

  return (
    <>
      <PostFeed username={username} setPosts={setPosts} />
      <Flex mt={4}>
        <IconButton
          disabled={curPage === 0}
          icon={<AiOutlineLeft />}
          bgColor="black"
          color="white"
          aria-label="page-left"
          mr="auto"
          onClick={() => {
            setCurPage((prevState) => prevState - 1);
          }}
        />
        <IconButton
          disabled={pages < 0 || curPage === pages}
          icon={<AiOutlineRight />}
          bgColor="black"
          color="white"
          aria-label="page-left"
          ml="auto"
          onClick={() => {
            setCurPage((prevState) => prevState + 1);
          }}
        />
      </Flex>
      {posts
        ?.filter(
          (post) => post.text.includes(search) || post.author.includes(search)
        )
        .slice(curPage * 10, (curPage + 1) * 10)
        .map((post: PostType, index: number) => {
          const { author, pid, text, date, comments, img } = post;

          return (
            <Feed
              author={author}
              comments={comments}
              avatar={
                author === username
                  ? user.avatar
                  : friendsAvatar[author]
                  ? friendsAvatar[author]
                  : ""
              }
              body={text}
              img={img}
              id={pid}
              time={new Date(date!).toLocaleString()}
              key={pid}
              setPosts={setPosts}
            />
          );
        })}
      {pages >= 1 && (
        <Flex mt={4}>
          <IconButton
            disabled={curPage === 0}
            icon={<AiOutlineLeft />}
            bgColor="black"
            color="white"
            aria-label="page-left"
            mr="auto"
            onClick={() => {
              setCurPage((prevState) => prevState - 1);
            }}
          />
          <IconButton
            disabled={pages < 0 || curPage === pages}
            icon={<AiOutlineRight />}
            bgColor="black"
            color="white"
            aria-label="page-left"
            ml="auto"
            onClick={() => {
              setCurPage((prevState) => prevState + 1);
            }}
          />
        </Flex>
      )}
    </>
  );
};

export default connector(Posts);
