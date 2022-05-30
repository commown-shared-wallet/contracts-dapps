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
    NativeSelect,
} from "@mantine/core";
import { CircleCheck, ListCheck, Plus, Trash, User } from "tabler-icons-react";

/*
 * *  Wallet && Blockchain interaction
 */
import { useWeb3React } from "@web3-react/core";
import InjectedWalletConnection from "@components/BrowserWalletConnection";
import useCommownSWProxyFactory from "@hooks/useCommownSWProxyFactory";
import useContract from "@hooks/useContract";
import { ethers } from "ethers";
import { CommownSW } from "@utils/getContract";

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
    const [maxConfirmation, setMaxConfirmation] = useState<string>("1");
    const [dynamicMaxConfirmation, setDynamicMaxConfirmation] =
        useState<Array<string>>();

    const form = useForm({
        initialValues: {
            users: formList([{ useraddress: "", isOwner: true }]),
        },
    });

    /* Mantine*/
    const notifications = useNotifications();
    const [state, handlers] = useAccordionState({ total: 3, initialItem: 0 });
    const theme = useMantineTheme();

    useEffect(() => {
        if (active) setNetworkName(provider._network.name);
    }, [netWorkName]);

    useEffect(() => {
        const arrayConfirmation = [];
        if (maxConfirmation) {
            for (let i = 1; i <= form.values.users.length; i++) {
                arrayConfirmation.push(i.toString());
            }
            setDynamicMaxConfirmation(arrayConfirmation);
        }
    }, [form.values.users.length]);

    async function createProxy() {
        try {
            const usersAddress = Object.values(
                form.values.users.map((user) =>
                    ethers.utils.getAddress(user.useraddress)
                )
            );

            let iface = new ethers.utils.Interface(CommownSW.abi);
            const maxSigner: number = parseInt(maxConfirmation);
            const bytesData = iface.encodeFunctionData("initialize", [
                usersAddress,
                maxSigner,
                "0x06C56896BF629C3cf6F1594062E49081fb996c87",
            ]);
            await write(
                contract ? contract.createProxy(bytesData) : "",
                "Shared Wallet Deployment",
                "Deploy a proxy for the users of this shared wallet",
                "Unable to deploy CommOwn - Shared Wallet"
            );
            hideNotification("erorrCreateProxy");
        } catch (error) {
            const e = error as Error;
            notifications.showNotification({
                id: "erorrCreateProxy",
                title: "Erorr Creation CSW",
                color: "red",
                message: `${e.message}`,
            });
        }
    }

    /*Components */
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
            <Paper style={{ maxWidth: "700px" }} shadow="xs" p="xl" radius={0}>
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
                        <Box mx="auto">
                            {fields.length > 0 ? (
                                <Group mb="xs">
                                    <Text
                                        weight={500}
                                        size="sm"
                                        sx={{ flex: 1 }}
                                    >
                                        Address
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
                                    Add another user
                                </Button>
                            </Group>
                        </Box>
                        <NativeSelect
                            style={{ maxWidth: "250px" }}
                            label="Number of validations required:"
                            placeholder="Number of validation"
                            description={`out of ${form.values.users.length} owner(s)`}
                            value={maxConfirmation}
                            onChange={(event) =>
                                setMaxConfirmation(event.currentTarget.value)
                            }
                            data={
                                dynamicMaxConfirmation
                                    ? dynamicMaxConfirmation
                                    : []
                            }
                        />

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
