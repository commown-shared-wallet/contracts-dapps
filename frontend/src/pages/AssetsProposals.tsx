/*
 * * React Utils
 */
import { useState } from "react";
import { convertIpfsUrl, parseUrlOfOpenSea } from "@utils/pipes";
import { getAbiFromEtherscan } from "@utils/helpers";

/*
 * * External  Packages
 */
import { toast } from "react-toastify";

/*
 * * Mantine UI Library
 */
import {
    Card,
    Paper,
    Title,
    Image,
    Text,
    Badge,
    Button,
    Group,
    useMantineTheme,
    Grid,
} from "@mantine/core";

/*
 * *  Wallet && Blockchain interaction
 */
import { BigNumber, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";

function AssetsProposals() {
    /* React */

    /*State*/
    /* Rabbit Hole 🐰 SAILOR birth : Error : Contract source code not verified*/
    //https://testnets.opensea.io/assets/rinkeby/0x16baf0de678e52367adc69fd067e5edd1d33e3bf/2158
    /* Mad Rabits #1 : Sucess : IPFS Image */
    //https://testnets.opensea.io/assets/rinkeby/0x6a5d5697b82e5b3d1261333666cc8946a1b0d462/1 */
    /* Cattleya #255 : Sucess : Random API */
    /* https://opensea.io/assets/ethereum/0xa7d8d9ef8d8ce8992df33d8b8cf4aebabd5bd270/308000255 */

    const [nftUrl, seNftUrl] = useState<string>(
        "https://testnets.opensea.io/assets/rinkeby/0x6a5d5697b82e5b3d1261333666cc8946a1b0d462/1"
    );
    const [nftIpfsData, seNftIpfsData] = useState<{
        image: string;
        description: string;
        name: string;
    }>();

    /* Mantine*/
    const theme = useMantineTheme();
    const secondaryColor =
        theme.colorScheme === "dark"
            ? theme.colors.dark[1]
            : theme.colors.gray[7];

    /* Web3 */
    const context = useWeb3React();
    const { active, library: provider, chainId } = context;

    async function getUrl() {
        const nftData = parseUrlOfOpenSea("721", nftUrl);
        const nftAddress = nftData ? nftData.address : "";
        const nftId = nftData ? nftData.id : "";

        if (active && chainId) {
            //Contract
            const abi = await getAbiFromEtherscan(
                chainId,
                nftData ? nftData.address : ""
            );
            if (abi == "Contract source code not verified") {
                toast.error(abi, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
            } else {
                const signer = provider.getSigner();
                const instanceContract = new ethers.Contract(
                    nftAddress,
                    abi,
                    signer
                );
                const tokenURI: string = await instanceContract.tokenURI(
                    parseInt(nftId)
                );

                let finalFetchAddress: string;
                if (tokenURI.substring(0, 4) === "ipfs") {
                    finalFetchAddress = convertIpfsUrl(tokenURI);
                } else {
                    finalFetchAddress = tokenURI;
                }
                const fetchData = async () => {
                    try {
                        const response = await fetch(finalFetchAddress);
                        const json = await response.json();
                        const nft = json;

                        seNftIpfsData(nft);
                        return nft;
                    } catch (error) {
                        const e = error as Error;
                        toast.error(`${e.message}`, {
                            position: toast.POSITION.BOTTOM_RIGHT,
                        });
                    }
                };
                await fetchData();
            }
        } else {
            toast.error("not active network or valid chain id", {
                position: toast.POSITION.BOTTOM_RIGHT,
            });
        }
    }

    return (
        <div>
            <Paper shadow="xs" p="md" radius={0} style={{ marginTop: "16px" }}>
                {nftUrl}
                <br></br>
                <Button
                    variant="gradient"
                    gradient={{
                        from: "yellow",
                        to: "orange",
                    }}
                    onClick={getUrl}
                    uppercase
                >
                    fetch NFT Data
                </Button>

                <div
                    style={{
                        width: 300,
                        marginLeft: "auto",
                        marginRight: "auto",
                    }}
                >
                    {nftIpfsData && nftIpfsData.image ? (
                        <Card
                            shadow="sm"
                            p="xl"
                            component="a"
                            href={nftUrl}
                            target="_blank"
                        >
                            <Card.Section>
                                <Image
                                    src={
                                        nftIpfsData.image.substring(0, 4) ===
                                        "ipfs"
                                            ? convertIpfsUrl(nftIpfsData.image)
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
                                {nftIpfsData.name}
                            </Text>

                            <Text lineClamp={3} size="sm">
                                {nftIpfsData.description}
                            </Text>
                        </Card>
                    ) : null}
                </div>

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
                                href="https://mantine.dev"
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
                            >
                                Propose NFT
                            </Button>
                        </Card>
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <Card shadow="sm" p="lg">
                            <Card.Section
                                component="a"
                                href="https://mantine.dev"
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
