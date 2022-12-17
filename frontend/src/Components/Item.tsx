import { Box, BoxProps } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

const Item: React.FC<PropsWithChildren | BoxProps> = ({
  children,
  ...props
}) => {
  return (
    <Box
      boxShadow="2xl"
      rounded="lg"
      w="100%"
      p={6}
      textAlign={"center"}
      bgColor="gray.50"
      {...props}
    >
      {children}
    </Box>
  );
};

export default Item;
