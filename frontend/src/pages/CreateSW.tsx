/*
 * * React Utils
 */
import { useState, MouseEvent, useRef, useEffect } from "react";

/*
 * * Mantine UI Library
 */
import { useNotifications } from "@mantine/notifications";
import { useForm, formList } from "@mantine/form";
import {
  Accordion,
  Button,
  Paper,
  TextInput,
  Switch,
  Group,
  ActionIcon,
  Box,
  Text,
  Code,
  Title,
  useAccordionState,
  useMantineTheme,
} from "@mantine/core";
import { CircleCheck, ListCheck, Plus, Trash, User } from "tabler-icons-react";

/*
 * *  Wallet && Blockchain interaction
 */

import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { CommownSWProxyFactory } from "@utils/getContract";
import useCommownSWProxyFactory from "@hooks/useCommownSWProxyFactory";
import InjectedWalletConnection from "@components/InjectedWalletConnection";

function CreateSharedWallet() {
  /* React */
  const [load, setLoad] = useState(false);
  const ref = useRef<HTMLButtonElement>();

  /* Web3 */
  const context = useWeb3React();
  const { active, library: provider, account } = context;
  const [contract, write] = useCommownSWProxyFactory();

  /*State*/
  const [netWorkName, setNetworkName] = useState("Hardhat");

  /* Mantine*/
  const notifications = useNotifications();
  const [state, handlers] = useAccordionState({ total: 3, initialItem: 0 });
  const theme = useMantineTheme();

  useEffect(() => {
    if (active) setNetworkName(provider._network.name);
  }, [netWorkName]);

  const form = useForm({
    initialValues: {
      users: formList([{ useraddress: "", isOwner: true }]),
    },
  });

  function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    async function deployProxyContract(signer: any): Promise<void> {
      const contract = new ethers.ContractFactory(
        CommownSWProxyFactory.abi,
        CommownSWProxyFactory.bytecode,
        signer
      );

      try {
        const commownSWProxyFactoryContract = await contract.deploy();

        await commownSWProxyFactoryContract.deployed();

        window.alert(
          `Proxies deployed to: ${commownSWProxyFactoryContract.address}`
        );
      } catch (error: any) {
        window.alert(
          "Error!" + (error && error.message ? `\n\n${error.message}` : "")
        );
      }
    }
    const signer = provider.getSigner();
    deployProxyContract(signer);
  }

  /** */
  const fields = form.values.users.map((_, index) => (
    <Group key={index} mt="xs">
      <TextInput
        placeholder="User address"
        required
        sx={{ flex: 1 }}
        {...form.getListInputProps("users", index, "useraddress")}
      />
      <Switch
        label="PowerOn"
        {...form.getListInputProps("users", index, "isOwner")}
      />
      <ActionIcon
        color="red"
        variant="hover"
        onClick={() => form.removeListItem("users", index)}
      >
        <Trash size={16} />
      </ActionIcon>
    </Group>
  ));

  return (
    <div>
      <Paper shadow="xs" p="xl" radius={0}>
        <Title
          order={2}
          style={{
            marginBottom: "20px",
          }}
        >
          Create your CSW (CommOwn Shared Wallet)
        </Title>
        <Accordion initialItem={2} children={undefined} />{" "}
        <Accordion
          state={state}
          onChange={handlers.setState}
          disableIconRotation
        >
          <Accordion.Item
            label="Connect wallet and switch network"
            icon={<User color={theme.colors.blue[6]} />}
          >
            <Text size="md" style={{ paddingBottom: "10px" }}>
              Before starting the creation of your wallet please connect to
              wallet and choose your network.
            </Text>
            {active && (
              <>
                <Text size="md" style={{ paddingBottom: "20px" }}>
                  Your CSW will be created on the active network and will only
                  be available on this one, remember to change network if you
                  want to create your wallet on another network.
                </Text>
              </>
            )}
            <InjectedWalletConnection activeSwitch={true} />
            <Group position="right" mt="xl">
              <Button size="lg" onClick={() => handlers.toggle(1)}>
                Continue
              </Button>
            </Group>
          </Accordion.Item>
          <Accordion.Item
            label="Owners and Confirmations"
            icon={<ListCheck color={theme.colors.red[6]} />}
          >
            <Box sx={{ maxWidth: 500 }} mx="auto">
              {fields.length > 0 ? (
                <Group mb="xs">
                  <Text weight={500} size="sm" sx={{ flex: 1 }}>
                    Adress
                  </Text>
                  <Text weight={500} size="sm" pr={90}>
                    Is Owner
                  </Text>
                </Group>
              ) : (
                <Text color="dimmed" align="center">
                  No one here...
                </Text>
              )}

              {fields}

              <Group position="center" mt="md">
                <Button
                  leftIcon={<Plus />}
                  variant="subtle"
                  onClick={() =>
                    form.addListItem("users", {
                      useraddress: "",
                      isOwner: false,
                    })
                  }
                >
                  Add another users
                </Button>
              </Group>

              <Text size="sm" weight={500} mt="md">
                Form values:
              </Text>
              <Code block>{JSON.stringify(form.values, null, 2)}</Code>
            </Box>
            <Group position="apart" mt="xl">
              <Button
                size="lg"
                variant="default"
                onClick={() => handlers.toggle(0)}
              >
                Previous step
              </Button>
              <Button size="lg" onClick={() => handlers.toggle(2)}>
                Next step
              </Button>
            </Group>
          </Accordion.Item>
          <Accordion.Item
            label="Confirmation"
            icon={<CircleCheck color={theme.colors.teal[6]} />}
          >
            <Text>All done!</Text>
            <Text color="dimmed" size="sm">
              We will start deploy your wallet
            </Text>
            <Group position="apart" mt="xl">
              <Button
                size="lg"
                variant="outline"
                onClick={() => handlers.toggle(1)}
              >
                Previous step
              </Button>
              <Button size="lg" onClick={handleDeployContract}>
                Deploy
              </Button>
            </Group>
          </Accordion.Item>
        </Accordion>
      </Paper>
    </div>
  );
}

export default CreateSharedWallet;
