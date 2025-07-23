import React from "react";
import {
  Avatar,
  Box,
  Button,
  CloseButton,
  Input,
  InputGroup,
  Kbd,
  Popover,
  Portal,
  Separator,
  Text,
} from "@chakra-ui/react";
import { MdHomeFilled } from "react-icons/md";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineExplore } from "react-icons/md";
import { TfiVideoClapper } from "react-icons/tfi";
import { IoIosNotificationsOutline } from "react-icons/io";
import { MdAddCircleOutline } from "react-icons/md";
import { CgDetailsMore } from "react-icons/cg";
import { PiMessengerLogo } from "react-icons/pi";
import { LuSearch } from "react-icons/lu";

const mockUserSearchResults = [
  {
    name: "Segun Adebayo",
    username: "segun.adebayo",
    avatarUrl: "https://bit.ly/sage-adebayo",
  },
  {
    name: "Jane Doe",
    username: "jane.doe",
    avatarUrl: "https://bit.ly/jane-doe",
  },
  {
    name: "John Smith",
    username: "john.smith",
    avatarUrl: "https://bit.ly/john-smith",
  },
];

export default function LeftSideBar() {
  const [isActive, setIsActive] = React.useState(0);
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
      <Popover.Root positioning={{ placement: "right" }}>
        <Portal>
          <Popover.Positioner>
            <Popover.Content>
              <Popover.Arrow />
              <Popover.Body>
                <Popover.Title fontWeight="bold" fontSize="lg">
                  Search
                </Popover.Title>
                <InputGroup flex="1" startElement={<LuSearch />} mt={8}>
                  <Input placeholder="Search..." borderRadius="xl" />
                </InputGroup>
                <Separator />
                <Box mt={4}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={4}
                  >
                    <Text fontWeight="bold">Recent</Text>
                    <Text color="blue.500">Clear all</Text>
                  </Box>
                  {mockUserSearchResults.map((user) => (
                    <UserSearchedItem key={user.username} {...user} />
                  ))}
                </Box>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>

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
          <Box
            style={styles.containerItem}
            onClick={() => {
              setIsActive(0);
              window.location.href = "/";
            }}
            cursor="pointer"
            bg={isActive === 0 ? "gray.100" : "transparent"}
            _hover={{ bg: "gray.200" }}
          >
            <MdHomeFilled size={24} />
            <Text style={styles.textSelected}>Home</Text>
          </Box>

          <Popover.Trigger asChild>
            <Box style={styles.containerItem} cursor={"pointer"}>
              <IoSearchOutline size={24} />
              <Text style={styles.text}>Search</Text>
            </Box>
          </Popover.Trigger>

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
      </Popover.Root>
    </Box>
  );
}

interface UserSearchedItemProps {
  name: string;
  username: string;
  avatarUrl: string;
}

function UserSearchedItem({
  name,
  username,
  avatarUrl,
}: UserSearchedItemProps) {
  return (
    <Box
      display="flex"
      justifyContent={"space-between"}
      alignItems="center"
      _hover={{
        backgroundColor: "gray.100",
        _dark: { bg: "gray.700" },
      }}
      cursor={"pointer"}
      padding={2}
      borderRadius="lg"
      onClick={() => {
        window.location.href = `/profile`;
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar.Root size={"xs"}>
          <Avatar.Fallback name={name} />
          <Avatar.Image src={avatarUrl} />
        </Avatar.Root>
        <Box fontSize="sm" fontWeight="bold">
          {name}
          <Box color="gray.500" fontWeight="normal">
            {" "}
            @{username}
          </Box>
        </Box>
      </Box>

      <CloseButton aria-label={`Close ${name}'s search result`} />
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
