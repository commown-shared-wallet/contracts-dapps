/*
 * * React Utils
 */
import {
    HTMLInputTypeAttribute,
    useCallback,
    useEffect,
    useLayoutEffect,
    useReducer,
    useState,
} from "react";

/*
 * * Hooks, Helpers && pipes
 */
import { useCommownSW } from "@hooks/useCommownSW";
import useContract from "@hooks/useContract";
import { getDataOfOpenSeaNFT } from "@utils/helpers";
import {
    convertIpfsUrl,
    ellipsisAddress,
    parseUrlOfOpenSea,
} from "@utils/pipes";

/*
 * * Interfaces && types
 */
import { IUserWithShare, IUsersWithShare, INftData } from "@interfaces/csw";

/*
 * * External  Packages
 */
import { toast } from "react-toastify";
import Joi from "joi";

/*
 * * Components
 */
import InjectedWalletConnection from "@components/BrowserWalletConnection";

/*
 * * Mantine UI Library
 */
import {
    useMantineTheme,
    useAccordionState,
    Card,
    Paper,
    Title,
    Image,
    Text,
    Badge,
    Button,
    Group,
    Grid,
    Modal,
    TextInput,
    Slider,
    Accordion,
    Box,
} from "@mantine/core";
import { useForm, joiResolver } from "@mantine/form";
import { hideNotification, useNotifications } from "@mantine/notifications";
import {
    CircleCheck,
    ListCheck,
    PictureInPicture,
    User,
} from "tabler-icons-react";

/*
 * *  Wallet && Blockchain interaction
 */
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { IProposePocket, IProxyCreated } from "@interfaces/events";

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

function AssetsProposals() {
    /*React*/
    const [contract, , usersWallet] = useCommownSW();
    const [write] = useContract();

    /* Mantine*/
    const theme = useMantineTheme();
    const secondaryColor =
        theme.colorScheme === "dark"
            ? theme.colors.dark[1]
            : theme.colors.gray[7];

    const notifications = useNotifications();

    const [state, handlers] = useAccordionState({ total: 3, initialItem: 1 });

    const schema = Joi.object({
        totalAmount: Joi.number().min(0.00001).message("define an amount > 0"),
        nftUrl: Joi.string().uri().message("url not valid"),
    });
    const form = useForm({
        schema: joiResolver(schema),
        initialValues: {
            totalAmount: 0,
            nftUrl: "",
        },
    });

    /*State*/
    const [opened, setOpened] = useState(false);

    /* Rabbit Hole 🐰 SAILOR birth : Error : Contract source code not verified*/
    //https://testnets.opensea.io/assets/rinkeby/0x16baf0de678e52367adc69fd067e5edd1d33e3bf/2158
    /* Mad Rabits #1 : Sucess : IPFS Image */
    //https://testnets.opensea.io/assets/rinkeby/0x6a5d5697b82e5b3d1261333666cc8946a1b0d462/1 */
    /* Cattleya #255 : Sucess : Random API */
    /* https://opensea.io/assets/ethereum/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/308000255 */
    const [nftIpfsData, seNftIpfsData] = useState<INftData>();
    const [nftAddress, setNftAddress] = useState<string>("");
    const [nftId, setNftId] = useState<string>("");

    //State Propose Pocket
    const [netWorkName, setNetworkName] = useState("Hardhat");
    const [eventProposePocket, setEventProposePocket] =
        useState<IProposePocket>();

    const [usersWithShare, dispatch] = useReducer(reducer, [
        { address: "0x29D7d1dd5B6f9C864d9db560D72a247c178aE86B", share: 1 },
        { address: "0x7878D7d1dd5Bf9C864d9db56xcce0D72aaEAZJRI", share: 2 },
    ]);

    /* Web3 */
    const context = useWeb3React();
    const { active, library: provider, chainId } = context;

    //Use EFFECT propose Pocket
    useEffect(() => {
        if (active) setNetworkName(provider._network.name);
    }, [netWorkName]);

    useEffect(() => {
        if (usersWallet) dispatch({ type: "create", payload: usersWallet[0] });
    }, [usersWallet]);

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

    //creation of logic/implementatiion contract for users proxies address
    const fetchDataOfNft = useCallback(async () => {
        if (active && chainId) {
            const signer = provider.getSigner(); //error on the ethereum chain if I use provider instead a signer
            const nftData = await getDataOfOpenSeaNFT(
                chainId,
                nftAddress,
                nftId,
                signer
            );
            seNftIpfsData(nftData);
        } else {
            toast.error("not active network, valid chain id or nft url", {
                position: toast.POSITION.BOTTOM_RIGHT,
            });
        }
    }, [nftAddress, chainId]);

    useLayoutEffect(() => {
        if (form.values.nftUrl && form.values.nftUrl != "") {
            const parseUrl = parseUrlOfOpenSea("721", form.values.nftUrl);
            setNftAddress(parseUrl ? parseUrl.address : "");
            setNftId(parseUrl ? parseUrl.id : "");
            fetchDataOfNft();
        }
    }, [fetchDataOfNft, form.values.nftUrl]);

    /* components */
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

    //Function propose pockets
    async function proposePocket() {
        if (active && usersWallet) {
            try {
                //CSW : parameters
                const addressTransmitterTransaction: string =
                    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; //address to which you are going to execute the transaction of the assets (ex: open sea or decentraland contract)
                //False NFT for purchase
                let ABITest = ["function Test(uint x) "];
                let iface = new ethers.utils.Interface(ABITest);
                const _data = iface.encodeFunctionData("Test", [2]); // bytes calls, NFT ?
                const nftQtity = 1;

                //parameters of function
                const totalAmount: number = form.values.totalAmount
                    ? form.values.totalAmount
                    : 0; //amount to be reached to process the future transaction
                const sharePerUser: Array<number> = [];
                const usersAddress: Array<string> = [];

                usersWithShare.map((user) => {
                    const { address, share } = user;
                    usersAddress.push(address);
                    sharePerUser.push(share);
                });

                await write(
                    contract
                        ? contract.proposePocket(
                              addressTransmitterTransaction,
                              _data,
                              totalAmount,
                              usersAddress,
                              sharePerUser,
                              nftAddress,
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

    const handleTotalAmount = (event: any) =>
        form.setFieldValue("totalAmount", event.currentTarget.value);

    return (
        <div>
            <Paper shadow="xs" p="md" radius={0} style={{ marginTop: "16px" }}>
                <Modal
                    opened={opened}
                    onClose={() => setOpened(false)}
                    title="Propose a ERC-721 NFT of open sea!"
                    size="xl"
                >
                    <Accordion
                        state={state}
                        onChange={handlers.setState}
                        disableIconRotation
                    >
                        <Accordion.Item
                            label="Connect wallet and switch network"
                            icon={<User color={theme.colors.yellow[6]} />}
                        >
                            <Text size="md" style={{ paddingBottom: "10px" }}>
                                Before starting the creation of your pockets
                                please connect to wallet and choose your
                                network.
                            </Text>
                            {active && (
                                <>
                                    <Text
                                        size="md"
                                        style={{ paddingBottom: "20px" }}
                                    >
                                        Your pockets will be created on the
                                        active network and will only be
                                        available on this one, remember to
                                        change network if you want to create
                                        your pockets on another network.
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
                            label="Choose your NFT and your invest"
                            icon={
                                <PictureInPicture
                                    color={theme.colors.blue[6]}
                                />
                            }
                        >
                            <TextInput
                                required
                                label="Amount"
                                placeholder="Total amount for your investment"
                                value={form.values.totalAmount}
                                onChange={handleTotalAmount}
                            />
                            <TextInput
                                required
                                label="NFT"
                                placeholder="Url of open sea nft"
                                value={form.values.nftUrl}
                                onChange={(event) =>
                                    form.setFieldValue(
                                        "nftUrl",
                                        event.currentTarget.value
                                    )
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
                                    onClick={() => handlers.toggle(1)}
                                >
                                    Previous step
                                </Button>
                                <Button
                                    size="lg"
                                    onClick={() => handlers.toggle(3)}
                                >
                                    Next step
                                </Button>
                            </Group>
                        </Accordion.Item>
                        <Accordion.Item
                            label="Confirmation"
                            icon={<CircleCheck color={theme.colors.teal[6]} />}
                        >
                            <Text align="center">Preview of your pockets</Text>
                            <Text align="center" color="dimmed" size="sm">
                                click on "Create proposal"
                            </Text>
                            {nftIpfsData &&
                            nftIpfsData.image &&
                            form.values.nftUrl != "" ? (
                                <Box
                                    style={{
                                        width: 300,
                                        marginLeft: "auto",
                                        marginRight: "auto",
                                        marginTop: "20px",
                                    }}
                                >
                                    <Card
                                        shadow="sm"
                                        p="xl"
                                        component="a"
                                        href={form.values.nftUrl}
                                        target="_blank"
                                    >
                                        <Card.Section>
                                            <Image
                                                src={
                                                    nftIpfsData.image.substring(
                                                        0,
                                                        4
                                                    ) === "ipfs"
                                                        ? convertIpfsUrl(
                                                              nftIpfsData.image
                                                          )
                                                        : nftIpfsData.image
                                                }
                                                alt={nftIpfsData.name}
                                            />
                                        </Card.Section>

                                        <Text
                                            style={{
                                                paddingTop: "15px",
                                            }}
                                            weight={500}
                                            size="lg"
                                        >
                                            {nftIpfsData.name} <b>({nftId})</b>
                                        </Text>

                                        <Text lineClamp={3} size="sm">
                                            {nftIpfsData.description}
                                        </Text>

                                        <Text size="sm">
                                            <b>Address:</b>{" "}
                                            {ellipsisAddress(nftAddress)}
                                        </Text>
                                        <Text size="sm">
                                            <b>Total Amount:</b>{" "}
                                            {form.values.totalAmount}
                                        </Text>
                                    </Card>
                                </Box>
                            ) : null}
                            <Group position="apart" mt="xl">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => handlers.toggle(2)}
                                >
                                    Previous step
                                </Button>
                                <Button size="lg" onClick={proposePocket}>
                                    Propose an NFT
                                </Button>
                            </Group>
                        </Accordion.Item>
                    </Accordion>
                </Modal>

                <Title
                    order={2}
                    style={{
                        marginBottom: "20px",
                    }}
                >
                    Create purchase proposals
                </Title>
                <Grid>
                    <Grid.Col span={4}>
                        <Card shadow="sm" p="lg">
                            <Card.Section
                                component="a"
                                href="https://testnets.opensea.io/"
                                target="_blank"
                            >
                                <Image
                                    src="https://www.cointribune.com/app/uploads/2021/09/obem-torgov-opensea-78-mln.jpg"
                                    height={160}
                                    alt="Norway"
                                />
                            </Card.Section>

                            <Group
                                position="apart"
                                style={{
                                    marginBottom: 5,
                                    marginTop: theme.spacing.sm,
                                }}
                            >
                                <Text weight={500}>Open SEA</Text>
                                <Badge color="pink" variant="light">
                                    Classic
                                </Badge>
                            </Group>

                            <Text
                                size="sm"
                                style={{
                                    color: secondaryColor,
                                    lineHeight: 1.5,
                                }}
                            >
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Morbi a ipsum nisl. Maecenas
                                ligula libero, elementum eget leo vitae, gravida
                                eleifend odio. Suspendisse eget sagittis augue.
                            </Text>

                            <Button
                                variant="light"
                                color="blue"
                                fullWidth
                                style={{ marginTop: 14 }}
                                onClick={() => setOpened(true)}
                            >
                                Propose NFT
                            </Button>
                        </Card>
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <Card shadow="sm" p="lg">
                            <Card.Section
                                component="a"
                                href="https://market.decentraland.org/"
                                target="_blank"
                            >
                                <Image
                                    src="https://metavers-tribune.com/wp-content/uploads/2022/03/wersm-decentraland-will-host-inaugural-virtual-fashion-week.jpg"
                                    height={160}
                                    alt="Norway"
                                />
                            </Card.Section>

                            <Group
                                position="apart"
                                style={{
                                    marginBottom: 5,
                                    marginTop: theme.spacing.sm,
                                }}
                            >
                                <Text weight={500}>Decentraland</Text>
                                <Badge color="Blue" variant="light">
                                    Land
                                </Badge>
                            </Group>

                            <Text
                                size="sm"
                                style={{
                                    color: secondaryColor,
                                    lineHeight: 1.5,
                                }}
                            >
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Morbi a ipsum nisl. Maecenas
                                ligula libero, elementum eget leo vitae, gravida
                                eleifend odio. Suspendisse eget sagittis augue.
                            </Text>

                            <Button
                                variant="light"
                                color="blue"
                                fullWidth
                                style={{ marginTop: 14 }}
                                disabled
                            >
                                Propose NFT
                            </Button>
                        </Card>
                    </Grid.Col>
                </Grid>
            </Paper>
        </div>
    );
}

export default AssetsProposals;
