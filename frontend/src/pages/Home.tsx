import {
    createStyles,
    Image,
    Title,
    Text,
    Paper,
    Container,
} from "@mantine/core";
import image from "../assets/image.svg";

import HeaderLayout from "@layout/header";
import FooterLayout from "@layout/footer";

const useStyles = createStyles((theme) => ({
    container: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },

    inner: {
        display: "flex",
        justifyContent: "center",
        marginTop: "60px",
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
    },

    content: {
        maxWidth: "800px",
        marginRight: theme.spacing.xl * 3,
        [theme.fn.smallerThan("md")]: {
            maxWidth: "100%",
            marginRight: 0,
        },
    },

    title: {
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
        fontSize: 44,
        lineHeight: 1.2,
        fontWeight: 900,

        [theme.fn.smallerThan("xs")]: {
            fontSize: 28,
        },
    },

    control: {
        [theme.fn.smallerThan("xs")]: {
            flex: 1,
        },
    },

    image: {
        flex: 1,
        maxWidth: "350px",
        [theme.fn.smallerThan("md")]: {
            display: "none",
        },
    },

    highlight: {
        position: "relative",
        backgroundColor:
            theme.colorScheme === "dark"
                ? theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.55)
                : theme.colors[theme.primaryColor][0],
        borderRadius: theme.radius.sm,
        padding: "4px 12px",
    },
}));

export default function Home() {
    const { classes } = useStyles();

    return (
        <Paper className={classes.container} radius={0}>
            <HeaderLayout />
            <Container size="lg">
                <div className={classes.inner}>
                    <div className={classes.content}>
                        <Title className={classes.title}>
                            A <span className={classes.highlight}>modern</span>{" "}
                            Shared Wallet
                        </Title>
                        <Title mt="lg">Introduction</Title>
                        <Text color="dimmed" mt="md">
                            The CommOwn project consists in creating a smart
                            contract wallet allowing several people to buy,
                            manage, view and sell ERC-20 or ERC-721 tokens,
                            sharing the costs of acquisition, gas, but also the
                            benefits.{" "}
                        </Text>
                        <Title mt="lg">Why CommOwn? </Title>
                        <Text color="dimmed" mt="md">
                            The growing interest in cryptos but also NFTs leads
                            to a speculative effect on the purchase of these
                            assets, especially NFTs, leading some of them to
                            reach high prices, such as the Bored Ape Yacht Club
                            collection or land on some metaverses like The
                            Sandbox, making their acquisition unthinkable for
                            most people. We want to offer a solution that allows
                            anyone to acquire NFTs with friends, family or even
                            strangers, and have unique & unalterable ownership.
                        </Text>
                        <Text color="dimmed" mt="md">
                            <b>
                                What is the difference between CommOwn & other
                                solutions for buying NFTs with others?
                            </b>
                        </Text>
                        <Text color="dimmed" mt="md">
                            Isn't there already a solution to this problem? The
                            power of blockchain technology allows anyone to
                            acquire a digital asset and guarantee its ownership
                            and uniqueness.** However, as soon as you want to
                            acquire an asset with several people, there is no
                            solution that guarantees the ownership of the asset
                            to each buyer. Indeed, existing solutions resort
                            either to the purchase by a single buyer (OpenSea,
                            Gnosis Safe...), or to the purchase of fractions of
                            an NFT (PartyBid, fractional.art), which do not give
                            any ownership right on the NFT from which the
                            fractions originate. In the case of fractional
                            ownership, the owners of fractions can sell them,
                            but all the advantages of owning the NFT alone
                            (airdrops, income generated by a rental...) remain
                            with the owner. We would like to propose a solution
                            allowing several people to buy NFTs, and to share
                            the benefits in proportion to their investments.
                            *Example: Let's say Alice & Bob buy an NFT for 10
                            ETH, Alice provides 6 ETH (60%) and Bob 4 ETH (40%).
                            An airdrop of 100 XYZ chips is made, Alice receives
                            60% and Bob receives the remaining 40%.
                        </Text>
                    </div>
                    <Image src={image} className={classes.image} />
                </div>
            </Container>
            <FooterLayout />
        </Paper>
    );
}
