import React from "react";
import { Avatar, Box, Text } from "@chakra-ui/react";
import { MdHomeFilled } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineExplore } from "react-icons/md";
import { TfiVideoClapper } from "react-icons/tfi";
import { IoIosNotificationsOutline } from "react-icons/io";
import { MdAddCircleOutline } from "react-icons/md";
import { CgDetailsMore } from "react-icons/cg";
import { PiMessengerLogo } from "react-icons/pi";

export default function LeftSideBar() {
  return (
    <Box
      bg={{ base: "white", _dark: "gray.800" }}
      p={4}
      display="flex"
      flexDirection="column"
      borderRightWidth="1px"
      borderColor="gray.200"
      height="100vh"
      position="sticky"
      width={"20%"}
      top={0}
    >
      <Text
        fontSize="2xl"
        fontWeight="bold"
        mb={6}
        color="gray.900"
        _dark={{ color: "white" }}
        fontFamily="'Dancing Script', 'Brush Script MT', cursive"
        letterSpacing="tight"
        textAlign="center"
        background="linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)"
        backgroundClip="text"
        textShadow="0 0 20px rgba(240, 148, 51, 0.3)"
        transition="all 0.3s ease"
        _hover={{
          transform: "scale(1.05)",
          textShadow: "0 0 30px rgba(240, 148, 51, 0.5)",
        }}
        cursor="pointer"
      >
        SocialMiniST
      </Text>
      <Box display="flex" flexDirection="column" gap={8}>
        <Box style={styles.containerItem}>
          <MdHomeFilled size={24} />
          <Text style={styles.textSelected}>Home</Text>
        </Box>

        <Box style={styles.containerItem}>
          <IoSearchOutline size={24} />
          <Text style={styles.text}>Search</Text>
        </Box>

        <Box style={styles.containerItem}>
          <MdOutlineExplore size={24} />
          <Text style={styles.text}>Explore</Text>
        </Box>

        <Box style={styles.containerItem}>
          <TfiVideoClapper size={24} />
          <Text style={styles.text}>Reels</Text>
        </Box>

        <Box style={styles.containerItem}>
          <PiMessengerLogo size={24} />
          <Text style={styles.text}>Messages</Text>
        </Box>

        <Box style={styles.containerItem}>
          <IoIosNotificationsOutline size={24} />
          <Text style={styles.text}>Notifications</Text>
        </Box>

        <Box style={styles.containerItem}>
          <MdAddCircleOutline size={24} />
          <Text style={styles.text}>Create</Text>
        </Box>

        <Box style={styles.containerItem}>
          <Avatar.Root size={"2xs"}>
            <Avatar.Fallback name="Segun Adebayo" />
            <Avatar.Image src="https://bit.ly/sage-adebayo" />
          </Avatar.Root>
          <Text style={styles.text}>Profile</Text>
        </Box>

        <Box style={styles.containerItem}>
          <CgDetailsMore size={24} />
          <Text style={styles.text}>More</Text>
        </Box>
      </Box>
    </Box>
  );
}

const styles = {
  text: {
    color: "gray.700",
    fontSize: "16px",
    _hover: {
      color: "gray.900",
    },
    marginLeft: "20px",
  },
  textSelected: {
    color: "gray.700",
    fontSize: "16px",
    fontWeight: "bold",
    _hover: {
      color: "gray.900",
    },
    marginLeft: "20px",
  },
  containerItem: {
    display: "flex",
    alignItems: "center",
    mb: 2,
  },
};
