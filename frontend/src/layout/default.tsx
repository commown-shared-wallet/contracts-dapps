import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import {
    AppShell,
    Navbar,
    Footer,
    Text,
    useMantineTheme,
    Paper,
    Group,
    Code,
    ScrollArea,
    createStyles,
} from "@mantine/core";
import {
    Notes,
    Gauge,
    PresentationAnalytics,
    FileAnalytics,
} from "tabler-icons-react";
import { hideNotification, useNotifications } from "@mantine/notifications";

import { LinksGroup } from "@components/NavbarLinksGroup";

import HeaderLayout from "@layout/header";

/*
 * * Wallet && Blockchain interaction
 */
import { useWeb3React } from "@web3-react/core";
import useCommownSWProxyFactory from "@hooks/useCommownSWProxyFactory";

const mockdata = [
    { label: "Dashboard", icon: Gauge, link: "/wallet" },
    {
        label: "Create CSW",
        icon: FileAnalytics,
        link: "/wallet/create-shared-wallet",
    },
    {
        label: "NFT proposals",
        icon: PresentationAnalytics,
        link: "/wallet/assets-proposals",
    },
    {
        label: "Assets",
        icon: Notes,
        initiallyOpened: true,
        links: [
            { label: "Coins", link: "/wallet/assets/balances" },
            { label: "Nfts", link: "/wallet/assets/balances/nfts" },
        ],
    },
];

const useStyles = createStyles((theme) => ({
    navbar: {
        backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
        paddingBottom: 0,
    },

    header: {
        padding: theme.spacing.md,
        paddingTop: 0,
        marginLeft: -theme.spacing.md,
        marginRight: -theme.spacing.md,
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
        borderBottom: `1px solid ${
            theme.colorScheme === "dark"
                ? theme.colors.dark[4]
                : theme.colors.gray[3]
        }`,
    },

    links: {
        marginLeft: -theme.spacing.md,
        marginRight: -theme.spacing.md,
    },

    linksInner: {
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
    },

    footer: {
        marginLeft: -theme.spacing.md,
        marginRight: -theme.spacing.md,
        borderTop: `1px solid ${
            theme.colorScheme === "dark"
                ? theme.colors.dark[4]
                : theme.colors.gray[3]
        }`,
    },
}));

export default function Layout() {
    /* Mantine Vlaue */
    const theme = useMantineTheme();

    const { classes } = useStyles();
    const links = mockdata.map((item) => (
        <LinksGroup {...item} key={item.label} />
    ));

    const notifications = useNotifications();

    // Connect to wallet
    const context = useWeb3React();
    const { library: provider, account, active } = context;

    /* Contract Value */
    const [owner, setOwner] = useState(null);
    const [contract, , read] = useCommownSWProxyFactory();

    useEffect(() => {
        getOwners();
        return () => setOwner(null);
    }, [contract]);

    //Get Owners of contract
    async function getOwners() {
        if (active) {
            try {
                const owner = await read(
                    contract?.owner(),
                    "Retrieving Owner",
                    "Retrieving the smart contract Owners",
                    "Unable to call the owner of the contract"
                );
                setOwner(owner);
                hideNotification("erorrFetchOwner");
            } catch (e) {
                //const message =
                notifications.showNotification({
                    id: "erorrFetchOwner",
                    title: "Erorr fetching Owner ",
                    color: "red",
                    message: `Unable to call promise : ${e}`,
                });
            }
        }
    }

    return (
        <Paper>
            <AppShell
                styles={{
                    main: {
                        background:
                            theme.colorScheme === "dark"
                                ? theme.colors.dark[8]
                                : theme.colors.gray[0],
                    },
                }}
                navbarOffsetBreakpoint="sm"
                asideOffsetBreakpoint="sm"
                fixed
                header={<HeaderLayout />}
                navbar={
                    <Navbar
                        height={800}
                        width={{ sm: 300 }}
                        p="md"
                        className={classes.navbar}
                    >
                        <Navbar.Section className={classes.header}>
                            <Group position="apart">
                                <Text size="md" transform="capitalize">
                                    CSW
                                </Text>{" "}
                                <Code sx={{ fontWeight: 700 }}>v1.2.0</Code>
                            </Group>
                        </Navbar.Section>

                        <Navbar.Section
                            grow
                            className={classes.links}
                            component={ScrollArea}
                        >
                            <div className={classes.linksInner}>{links}</div>
                        </Navbar.Section>
                    </Navbar>
                }
                footer={
                    <Footer
                        style={{
                            display: "flex",
                            justifyContent: "space-evenly",
                        }}
                        height={60}
                        p="md"
                    >
                        <Text size="md" transform="capitalize">
                            <b>Current Accounts: </b>
                            {account}
                        </Text>

                        <Text size="md" transform="capitalize">
                            <b>Owner: </b>
                            {owner}
                        </Text>
                    </Footer>
                }
            >
                <Outlet />
            </AppShell>
        </Paper>
    );
}
