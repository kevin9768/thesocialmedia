import { Box } from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";

const Wrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box display="flex" width="100%" minH="100vh" backgroundColor="gray.100">
      <Box mt="120px" w="100%" h="100%">
        {children}
      </Box>
    </Box>
  );
};

export default Wrapper;
