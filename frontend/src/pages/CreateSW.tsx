/*
 * * React Utils
 */
import { useState, useRef, useEffect } from "react";

/*
 * * Mantine UI Library
 */
import { hideNotification, useNotifications } from "@mantine/notifications";
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
    Title,
    useAccordionState,
    useMantineTheme,
} from "@mantine/core";
import { CircleCheck, ListCheck, Plus, Trash, User } from "tabler-icons-react";

/*
 * *  Wallet && Blockchain interaction
 */
import { useWeb3React } from "@web3-react/core";
import InjectedWalletConnection from "@components/BrowserWalletConnection";
import useCommownSWProxyFactory from "@hooks/useCommownSWProxyFactory";
import useContract from "@hooks/useContract";

function CreateSharedWallet() {
    /* React */
    const [load, setLoad] = useState(false);
    const ref = useRef<HTMLButtonElement>();

    /* Web3 */
    const context = useWeb3React();
    const { active, library: provider, account } = context;
    const [contract] = useCommownSWProxyFactory();
    const [write] = useContract();

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

    async function createProxy() {
        if (active) {
            try {
                const usersAddress = Object.values(
                    form.values.users.map((user) => user.useraddress)
                );
                console.log(usersAddress);
                await write(
                    contract ? contract.createProxy(usersAddress, 1) : "",
                    "Shared Wallet Deployment",
                    "Deploy a proxy for the users of this shared wallet",
                    "Unable to deploy CommOwn - Shared Wallet"
                );
                hideNotification("erorrCreateProxy");
            } catch (e) {
                //const message =
                notifications.showNotification({
                    id: "erorrCreateProxy",
                    title: "Erorr create users proxy Owner ",
                    color: "red",
                    message: `Unable to call promise : ${e}`,
                });
            }
        }
    }

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
                            Before starting the creation of your wallet please
                            connect to wallet and choose your network.
                        </Text>
                        {active && (
                            <>
                                <Text
                                    size="md"
                                    style={{ paddingBottom: "20px" }}
                                >
                                    Your CSW will be created on the active
                                    network and will only be available on this
                                    one, remember to change network if you want
                                    to create your wallet on another network.
                                </Text>
                            </>
                        )}
                        <InjectedWalletConnection activeSwitch={true} />
                        <Group position="right" mt="xl">
                            <Button
                                size="lg"
                                onClick={() => handlers.toggle(1)}
                            >
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
                                    <Text
                                        weight={500}
                                        size="sm"
                                        sx={{ flex: 1 }}
                                    >
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
                        </Box>
                        <Group position="apart" mt="xl">
                            <Button
                                size="lg"
                                variant="default"
                                onClick={() => handlers.toggle(0)}
                            >
                                Previous step
                            </Button>
                            <Button
                                size="lg"
                                onClick={() => handlers.toggle(2)}
                            >
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
                            <Button size="lg" onClick={createProxy}>
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
