/*
 * * React Utils
 */

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
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { CommownSWProxyFactory } from "@utils/getContract";
import useCommownSWProxyFactory from "@hooks/useCommownSWProxyFactory";

function AssetsProposals() {
    /* React */

    /* Mantine*/
    const theme = useMantineTheme();
    const secondaryColor =
        theme.colorScheme === "dark"
            ? theme.colors.dark[1]
            : theme.colors.gray[7];

    /* Web3 */

    /*State*/

    return (
        <div>
            <Paper shadow="xs" p="md" radius={0} style={{ marginTop: "16px" }}>
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
                                    src="data:image/jpeg;base64,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"
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
