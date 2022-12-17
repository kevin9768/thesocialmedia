import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import axios from "axios";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { logout } from "./app/authSlice";
import store from "./app/store";
import { API_URL } from "./app/utils/api";
import Landing from "./Landing";
import Main from "./Main";
import Profile from "./Profile";

const theme = extendTheme({
  colors: {
    darkGray: {
      50: "#f3f2f2",
      100: "#d8d8d8",
      200: "#bebebe",
      300: "#a4a4a4",
      400: "#8b8b8b",
      500: "#717171",
      600: "#585858",
      700: "#3f3f3f",
      800: "#252525",
      900: "#0d0c0c",
    },
  },
  fonts: {
    body: "Inter Tight, sans-serif",
    heading: "Inter Tight, sans-serif",
    mono: "Menlo, monospace",
  },
});

const App = () => {
  useEffect(() => {
    setInterval(() => {
      axios.get(API_URL + "/me", {withCredentials: true})
      .then((res)=>{
        if(res.data.username === "")
          store.dispatch(logout());
      })
      .catch(() => {
        store.dispatch(logout());
      });
    }, 10000);
  });
  return (
    <ChakraProvider theme={theme}>
      <Provider store={store}>
        <BrowserRouter>
          <ColorModeScript />
          <Routes>
            <Route index element={<Main />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ChakraProvider>
  );
};

export default App;
