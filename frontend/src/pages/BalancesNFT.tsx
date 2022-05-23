/*
 * * React Utils
 */
import { useCallback, useEffect, useState } from "react";
import useContract from "@hooks/useContract";
import { useCommownSW } from "@hooks/useCommownSW";
/*
 * * Mantine UI Library
 */
import {
    Button,
    Card,
    Group,
    Paper,
    Badge,
    Title,
    Image,
    Text,
    Grid,
} from "@mantine/core";
import { hideNotification, useNotifications } from "@mantine/notifications";

/*
 * *  Wallet && Blockchain interaction
 */
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { ellipsisAddress } from "@utils/pipes";

interface IPocket {
    to: string;
    data: string;
    pStatus: number;
    totalAmount: ethers.BigNumber;
}

interface IPockets extends Array<IPocket> {}

function BalancesNFT() {
    /* React */
    const [, read] = useContract();

    /* Mantine*/
    const notifications = useNotifications();

    /*State*/
    const [pocketMaxID, setPocketMaxID] = useState<number>();
    const [pockets, setPockets] = useState<IPockets>();

    /* Web3 */
    const context = useWeb3React();
    const { active, account, chainId } = context;
    const [contract] = useCommownSW();

    //get pocketMaxID
    const fetchPocketMaxID = useCallback(async () => {
        if (contract && account) {
            const maxID = await contract.pocketMaxID();
            const result = maxID.toNumber() as number;
            if (result) setPocketMaxID(result);
        }
    }, [contract, chainId, account]);

    // the useEffect is only there to call `fetchAddressUsersProxy` at the right time
    useEffect(() => {
        fetchPocketMaxID()
            // make sure to catch any error
            .catch(console.error);
    }, [fetchPocketMaxID]);

    //get proxy address of users
    const fetchPocketsOfCSW = useCallback(async () => {
        if (contract && pocketMaxID && pocketMaxID != 0) {
            const usersWallet: Array<string> = [
                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
            ];

            let pocket;
            let pockets = [];

            interface IUserShare {
                address: string;
                share: string;
            }

            for (let i = 0; i < pocketMaxID; i++) {
                let sharePerUser: Array<IUserShare> = [];
                pocket = await contract.pockets(i);
                usersWallet.map(async (user) => {
                    const userShare = await contract.sharePerUser(
                        pocketMaxID,
                        user
                    );
                    const userShareObject: IUserShare = {
                        address: user,
                        share: userShare.toString(),
                    };
                    sharePerUser.push(userShareObject);
                });
                pockets.push(pocket);
            }
            setPockets(pockets);
        }
    }, [pocketMaxID]);

    // the useEffect is only there to call `fetchAddressUsersProxy` at the right time
    useEffect(() => {
        fetchPocketsOfCSW()
            // make sure to catch any error
            .catch(console.error);
    }, [fetchPocketsOfCSW, chainId]);

    function switchPocketStatut(pStatut: number) {
        switch (pStatut) {
            case 0:
                return "Proposed";
                break;
            case 1:
                return "Signing";
                break;
            case 2:
                return "Executed";
                break;
            case 3:
                return "Test";
                break;
            default:
                notifications.showNotification({
                    id: "pocketsStatusError",
                    title: "Pockets Status Error ",
                    color: "red",
                    message: `Problem with your pockets status`,
                    autoClose: true,
                });
        }
    }

    return (
        <div>
            <Paper shadow="xs" p="md" radius={0} style={{ marginTop: "16px" }}>
                <Title
                    order={2}
                    style={{
                        marginBottom: "20px",
                    }}
                >
                    Your NFT
                </Title>
                <Grid>
                    {pockets &&
                        pockets?.map((pocket, index) => (
                            <Grid.Col key={index} sm={12} md={4} lg={4}>
                                <Card shadow="sm" p="lg">
                                    <Card.Section>
                                        <Image
                                            src="https://fakeimg.pl/400x400/"
                                            height={160}
                                            alt="Norway"
                                        />
                                    </Card.Section>

                                    <Group
                                        position="apart"
                                        style={{
                                            marginTop: 15,
                                            marginBottom: 15,
                                        }}
                                    >
                                        <Text weight={500}>NFT Name</Text>
                                        <Badge color="orange" variant="light">
                                            {switchPocketStatut(pocket.pStatus)}
                                        </Badge>
                                    </Group>

                                    <Group
                                        position="apart"
                                        style={{
                                            marginBottom: 10,
                                            marginTop: 5,
                                        }}
                                    >
                                        <Text size="sm">
                                            <b>Transaction Address: </b>
                                            {ellipsisAddress(pocket.to)}
                                        </Text>
                                        <Text size="sm">
                                            <b>Total Amount: </b>
                                            {pocket.totalAmount.toNumber()}
                                        </Text>

                                        <Text size="sm">
                                            <b>Data: </b>
                                            {ellipsisAddress(pocket.data)}
                                        </Text>
                                    </Group>

                                    <Button
                                        variant="light"
                                        color="orange"
                                        fullWidth
                                        style={{ marginTop: 14 }}
                                    >
                                        Purchase
                                    </Button>
                                </Card>
                            </Grid.Col>
                        ))}
                </Grid>
            </Paper>
        </div>
    );
}

export default BalancesNFT;
