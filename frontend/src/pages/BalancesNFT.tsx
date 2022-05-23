/*
 * * React Utils
 */
import { useCallback, useEffect, useState } from "react";
import useContract from "@hooks/useContract";
import { useCommownSW } from "@hooks/useCommownSW";
import { convertIpfsUrl, ellipsisAddress } from "@utils/pipes";
import { INftData, IUserWithShare } from "@interfaces/csw";
import { getDataOfOpenSeaNFT } from "@utils/helpers";

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
import { useNotifications } from "@mantine/notifications";

/*
 * *  Wallet && Blockchain interaction
 */
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

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
    const [sharePerUser, setSharePerUser] = useState<Array<IUserWithShare>>();
    const [nftData, setNftData] = useState<INftData>();

    /* Web3 */
    const context = useWeb3React();
    const { account, chainId, library: provider } = context;
    const [contract, , usersWallet] = useCommownSW();

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
        if (
            contract &&
            pocketMaxID &&
            pocketMaxID != 0 &&
            usersWallet &&
            chainId
        ) {
            const users: Array<string> = usersWallet[0].owners;

            let pocket;
            let pockets = [];

            const signer = await provider.getSigner();
            const nftData = await getDataOfOpenSeaNFT(
                chainId,
                "0x6a5d5697b82e5b3d1261333666cc8946a1b0d462",
                "1",
                signer
            );
            setNftData(nftData);

            for (let i = 0; i <= pocketMaxID; i++) {
                let sharePerUser: Array<IUserWithShare> = [];
                pocket = await contract.pockets(i);

                users.map(async (user) => {
                    const userShare = await contract.sharePerUser(
                        pocketMaxID,
                        user
                    );
                    const userShareObject: IUserWithShare = {
                        address: user,
                        share: parseInt(userShare.toString()),
                    };
                    sharePerUser.push(userShareObject);
                });

                pockets.push(pocket);
            }
            setSharePerUser(sharePerUser);
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
                return "Voting";
                break;
            case 2:
                return "Signing";
                break;
            case 3:
                return "Executed";
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
                        nftData &&
                        pockets?.map((pocket, index) => (
                            <Grid.Col key={index} sm={12} md={4} lg={4}>
                                <Card shadow="sm" p="lg">
                                    <Card.Section>
                                        <Image
                                            src={
                                                nftData.image.substring(
                                                    0,
                                                    4
                                                ) === "ipfs"
                                                    ? convertIpfsUrl(
                                                          nftData.image
                                                      )
                                                    : nftData.image
                                            }
                                            height={160}
                                            alt={nftData?.name}
                                        />
                                    </Card.Section>

                                    <Group
                                        position="apart"
                                        style={{
                                            marginTop: 15,
                                            marginBottom: 15,
                                        }}
                                    >
                                        <Text weight={500}>{nftData.name}</Text>
                                        <Badge color="indigo" variant="light">
                                            {switchPocketStatut(pocket.pStatus)}
                                        </Badge>
                                        <Text lineClamp={2}>
                                            {nftData.description}
                                        </Text>
                                    </Group>

                                    <Group
                                        position="apart"
                                        style={{
                                            marginBottom: 10,
                                            marginTop: 5,
                                        }}
                                    >
                                        <Text size="sm">
                                            <b>Share by Users : </b>
                                        </Text>
                                        <Text size="sm">
                                            {sharePerUser
                                                ? sharePerUser.map(
                                                      (users, index) => (
                                                          <div key={index}>
                                                              <b>
                                                                  {ellipsisAddress(
                                                                      users.address
                                                                  )}{" "}
                                                                  :{" "}
                                                              </b>
                                                              {users.share}
                                                          </div>
                                                      )
                                                  )
                                                : null}
                                        </Text>

                                        <Text size="sm">
                                            <b>Total Amount: </b>
                                            {pocket.totalAmount.toNumber()}
                                        </Text>
                                    </Group>

                                    <Button
                                        variant="light"
                                        color="indigo"
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
