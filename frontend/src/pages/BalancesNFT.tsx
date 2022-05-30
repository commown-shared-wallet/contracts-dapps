/*
 * * React Utils
 */
import { useCallback, useEffect, useState } from "react";
import useContract from "@hooks/useContract";
import { useCommownSW } from "@hooks/useCommownSW";
import { convertIpfsUrl, ellipsisAddress } from "@utils/pipes";
import { INftData, IUserWithShare } from "@interfaces/csw";
import { getDataOfOpenSeaNFT } from "@utils/helpers";
import { toast } from "react-toastify";

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
    Loader,
} from "@mantine/core";
import { useNotifications } from "@mantine/notifications";

/*
 * *  Wallet && Blockchain interaction
 */
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

interface IPocket extends INftData {
    pStatus: number;
    totalAmount: ethers.BigNumber;
    sharePerUser: Array<IUserWithShare>;
}

interface IPockets extends Array<IPocket> {}

function BalancesNFT() {
    /* React */
    const [, read] = useContract();

    /* Mantine*/
    const notifications = useNotifications();

    /*State*/
    const [pocketMaxID, setPocketMaxID] = useState<number>(0);
    const [pockets, setPockets] = useState<IPockets | undefined>();

    /* Web3 */
    const context = useWeb3React();
    const { account, chainId, library: provider } = context;
    const [contract, , usersWallet] = useCommownSW();

    //get pocketMaxID
    const fetchPocketMaxID = useCallback(async () => {
        if (contract) {
            const maxID = await contract.pocketMaxID();
            const result = maxID.toNumber() as number;
            if (result) setPocketMaxID(result);
        }
    }, [contract, chainId, account]);

    // the useEffect is only there to call `fetchAddressUsersProxy` at the right time
    useEffect(() => {
        try {
            fetchPocketMaxID();
        } catch (error) {
            toast.error("Error Fetch pocket max id");
        }
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
            let pocket;
            let pocketsData = [];

            const signer = await provider.getSigner();

            for (let i = 0; i <= pocketMaxID; i++) {
                let sharePerUser: Array<IUserWithShare> = [];
                usersWallet.map(async (users) => {
                    const { address, balance } = users;
                    const share = await contract.sharePerUser(i, users.address);
                    sharePerUser.push({
                        address,
                        share: share.toNumber(),
                        balance,
                    });
                });
                //  sharePerUser = await contract.sharePerUser(i);
                const dataPockets = await contract.getPocketLight(i);

                const data = await getDataOfOpenSeaNFT(
                    chainId,
                    dataPockets[0],
                    dataPockets[4].toString(),
                    signer
                );

                if (data) {
                    pocket = {
                        name: data.name,
                        image:
                            data.image.substring(0, 4) === "ipfs"
                                ? convertIpfsUrl(data.image)
                                : data.image,
                        description: data.description,
                        pStatus: dataPockets[1],
                        totalAmount: dataPockets[3],
                        sharePerUser,
                    };
                    pocketsData.push(pocket);
                }
            }
            setPockets(pocketsData);
        } else {
        }
    }, [pocketMaxID]);

    // the useEffect is only there to call `fetchAddressUsersProxy` at the right time
    useEffect(() => {
        fetchPocketsOfCSW()
            // make sure to catch any error
            .catch(console.error);
    }, [fetchPocketsOfCSW, chainId, contract]);

    function switchPocketStatut(pStatut: number) {
        switch (pStatut) {
            case 0:
                return "Voting";
                break;
            case 1:
                return "ToExecute";
                break;
            case 2:
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

                <Grid justify="center" align="center">
                    {pockets ? (
                        pockets?.map((pocket, index) => (
                            <Grid.Col key={index} sm={12} md={4} lg={4}>
                                <Card shadow="sm" p="lg">
                                    <Card.Section>
                                        <Image
                                            src={pocket.image}
                                            height={200}
                                            alt={pocket.name}
                                        />
                                    </Card.Section>

                                    <Group
                                        position="apart"
                                        style={{
                                            marginTop: 15,
                                            marginBottom: 15,
                                        }}
                                    >
                                        <Text weight={500}>{pocket.name}</Text>
                                        <Badge color="indigo" variant="light">
                                            {switchPocketStatut(pocket.pStatus)}
                                        </Badge>
                                        <Text lineClamp={2}>
                                            {pocket.description}
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
                                            {pocket.sharePerUser
                                                ? pocket.sharePerUser.map(
                                                      (
                                                          users: any,
                                                          index: any
                                                      ) => (
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
                                            {pocket.totalAmount.toString()}
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
                        ))
                    ) : (
                        <Grid.Col>
                            <Loader />
                        </Grid.Col>
                    )}
                </Grid>
            </Paper>
        </div>
    );
}

export default BalancesNFT;
