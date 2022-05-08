import {
    createStyles,
    Container,
    Group,
    ActionIcon,
    Text,
} from "@mantine/core";
import { BrandTwitter, BrandLinkedin, BrandGithub } from "tabler-icons-react";

const useStyles = createStyles((theme) => ({
    footer: {
        marginTop: 60,
        borderTop: `1px solid ${
            theme.colorScheme === "dark"
                ? theme.colors.dark[5]
                : theme.colors.gray[2]
        }`,
    },

    inner: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,

        [theme.fn.smallerThan("xs")]: {
            flexDirection: "column",
        },
    },

    links: {
        [theme.fn.smallerThan("xs")]: {
            marginTop: theme.spacing.md,
        },
    },
}));

export default function FooterSocial() {
    const { classes } = useStyles();

    return (
        <div className={classes.footer}>
            <Container className={classes.inner}>
                <Text
                    variant="gradient"
                    gradient={{ from: "indigo", to: "blue", deg: 40 }}
                    size="sm"
                    transform="uppercase"
                >
                    CommOwn - Shared Wallet
                </Text>
                <Group
                    spacing={0}
                    className={classes.links}
                    position="right"
                    noWrap
                >
                    <ActionIcon
                        component="a"
                        href="https://twitter.com/younesmjl"
                        size="lg"
                        target="_blank"
                    >
                        <BrandTwitter size={18} />
                    </ActionIcon>
                    <ActionIcon
                        component="a"
                        href="https://twitter.com/youneshttps://www.linkedin.com/in/younes-manjal/"
                        target="_blank"
                        size="lg"
                    >
                        <BrandLinkedin size={18} />
                    </ActionIcon>
                    <ActionIcon
                        component="a"
                        href="https://github.com/commown-shared-wallet/contracts-dapps"
                        size="lg"
                        target="_blank"
                    >
                        <BrandGithub size={18} />
                    </ActionIcon>
                </Group>
            </Container>
        </div>
    );
}
