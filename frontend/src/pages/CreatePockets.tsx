/*
 * * React Utils
 */
import { useState, useEffect, useCallback, useReducer } from "react";

import { IProposePocket, IProxyCreated } from "@interfaces/events";

/*
 * * Mantine UI Library
 */
import { hideNotification, useNotifications } from "@mantine/notifications";

import {
    Accordion,
    Button,
    Paper,
    Group,
    Box,
    Text,
    Title,
    useAccordionState,
    useMantineTheme,
    Slider,
} from "@mantine/core";
import { CircleCheck, ListCheck, User } from "tabler-icons-react";

/*
 * *  Wallet && Blockchain interaction
 */
import { useWeb3React } from "@web3-react/core";
import InjectedWalletConnection from "@components/BrowserWalletConnection";
import { useCommownSW } from "@hooks/useCommownSW";
import { ethers } from "ethers";
import useContract from "@hooks/useContract";

interface IUserWithShare {
    address: string;
    share: number;
}
interface IUsersWithShare extends Array<IUserWithShare> {}

type Action =
    | { type: "create"; payload: IProxyCreated }
    | { type: "update"; payload: IUserWithShare; share: number }
    | { type: "delete"; payload: IProxyCreated };

function reducer(state: IUsersWithShare, action: Action) {
    switch (action.type) {
        case "create":
            const initialState = action.payload.owners.map((user: string) => {
                return { address: user, share: 10 };
            });
            return (state = initialState);
        case "update":
            return state.map((user) => {
                if (user.address == action.payload.address) {
                    return {
                        ...user,
                        address: action.payload.address,
                        share: action.share,
                    };
                } else {
                    return user;
                }
            });
        case "delete":
        //return init(action.payload);
        default:
            throw new Error("Action" + action.type);
    }
}

function CreatePockets() {
    /* React */
    const [contract, , usersWallet] = useCommownSW();
    const [write] = useContract();

    /* Mantine*/
    const notifications = useNotifications();
    const [state, handlers] = useAccordionState({ total: 3, initialItem: 0 });
    const theme = useMantineTheme();

    /* Web3 */
    const context = useWeb3React();
    const { active, library: provider } = context;

    /*State*/
    const [netWorkName, setNetworkName] = useState("Hardhat");
    const [eventProposePocket, setEventProposePocket] =
        useState<IProposePocket>();

    const [usersWithShare, dispatch] = useReducer(reducer, [
        { address: "0x29D7d1dd5B6f9C864d9db560D72a247c178aE86B", share: 1 },
        { address: "0x7878D7d1dd5Bf9C864d9db56xcce0D72aaEAZJRI", share: 2 },
    ]);

    useEffect(() => {
        if (active) setNetworkName(provider._network.name);
    }, [netWorkName]);

    useEffect(() => {
        if (usersWallet) dispatch({ type: "create", payload: usersWallet[0] });
    }, [usersWallet]);

    const fields = usersWithShare
        ? usersWithShare.map((users: IUserWithShare) => (
              <>
                  <div
                      style={{
                          display: "flex",
                          alignItems: "center",
                          margin: "5px 0 10px 0",
                      }}
                      key={users.address}
                  >
                      <Text sx={{ flex: 1 }}>{users.address}</Text>
                      <Slider
                          style={{ flex: 1 }}
                          value={users.share}
                          onChangeEnd={(share) =>
                              dispatch({
                                  type: "update",
                                  share,
                                  payload: users,
                              })
                          }
                          marks={[
                              { value: 20, label: "20%" },
                              { value: 50, label: "50%" },
                              { value: 80, label: "80%" },
                          ]}
                      />
                  </div>
              </>
          ))
        : null;

    async function proposePocket() {
        if (active && usersWallet) {
            try {
                //False NFT
                let ABITest = ["function Test(uint x) "];
                let iface = new ethers.utils.Interface(ABITest);

                const sharePerUser: Array<number> = [];
                const usersAddress: Array<string> = [];

                usersWithShare.map((user) => {
                    const { share, address } = user;
                    sharePerUser.push(share);
                    usersAddress.push(address);
                });

                //parameters of function
                const addressTransmitterTransaction: string =
                    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; //address to which you are going to execute the transaction of the assets (ex: open sea or decentraland contract)
                const _data = iface.encodeFunctionData("Test", [2]); // bytes calls, NFT
                const _totalAmount: number = 100; //amount to be reached to process the future transaction
                const nftAddr: string =
                    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
                const nftId = 1;
                const nftQtity = 1;

                await write(
                    contract
                        ? contract.proposePocket(
                              addressTransmitterTransaction,
                              _data,
                              _totalAmount,
                              usersAddress,
                              sharePerUser,
                              nftAddr,
                              nftId,
                              nftQtity
                          )
                        : "",
                    "Creation of pockets",
                    "Launch of the creation of a pocket",
                    "Unable to laucnh pockets"
                );
                hideNotification("erorrCreateProxy");
            } catch (e) {
                //const message =
                notifications.showNotification({
                    id: "erorrProposePocket",
                    title: "Erorr Propose Pocket",
                    color: "red",
                    message: `Unable to call promise : ${e}`,
                });
            }
        }
    }

    //Event ProposePocket
    const handleProposePocket = (
        sender: string,
        pocketID: ethers.BigNumber,
        to: string,
        data: ethers.BigNumber,
        PocketStatus: any,
        totalAmount: ethers.BigNumber,
        sharePerUser: Array<number>
    ) => {
        const objectProposePocket = {
            sender,
            pocketID,
            to,
            data,
            PocketStatus,
            totalAmount,
            sharePerUser,
        };
        setEventProposePocket(objectProposePocket);
    };

    const fetchEventsProposePockets = useCallback(async () => {
        if (contract) {
            contract.on("ProposePocket", handleProposePocket);
        }
    }, []);

    useEffect(() => {
        try {
            fetchEventsProposePockets();
        } catch (e) {
            notifications.showNotification({
                id: "errorFetchEventsProposePockets",
                title: "Error Fetch Events ProposePockets",
                color: "red",
                message: `${e}`,
            });
        }
        return () => {
            contract?.removeAllListeners("ProposePocket");
        };
    }, [fetchEventsProposePockets]);

    return (
        <div>
            <Paper shadow="xs" p="xl" radius={0}>
                <Title
                    order={2}
                    style={{
                        marginBottom: "20px",
                    }}
                >
                    Purchase NFT and create pockets
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
                            Before starting the creation of your pockets please
                            connect to wallet and choose your network.
                        </Text>
                        {active && (
                            <>
                                <Text
                                    size="md"
                                    style={{ paddingBottom: "20px" }}
                                >
                                    Your pockets will be created on the active
                                    network and will only be available on this
                                    one, remember to change network if you want
                                    to create your pockets on another network.
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
                        label="Share per user"
                        icon={<ListCheck color={theme.colors.red[6]} />}
                    >
                        <Box mx="auto">
                            {fields && fields.length > 0 ? (
                                <Group mb="xs">
                                    <Text
                                        weight={500}
                                        size="sm"
                                        sx={{ flex: 1 }}
                                    >
                                        Owners Address :
                                    </Text>
                                    <Text
                                        sx={{ flex: 1 }}
                                        weight={500}
                                        size="sm"
                                    >
                                        Share :
                                    </Text>
                                </Group>
                            ) : null}

                            {fields}
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
                            We will start to create your pockets
                        </Text>
                        <Group position="apart" mt="xl">
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => handlers.toggle(1)}
                            >
                                Previous step
                            </Button>
                            <Button size="lg" onClick={proposePocket}>
                                Create pockets
                            </Button>
                        </Group>
                    </Accordion.Item>
                </Accordion>
            </Paper>
        </div>
    );
}

export default CreatePockets;
