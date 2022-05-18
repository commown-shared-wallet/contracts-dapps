import {
    Header,
    Text,
    MediaQuery,
    Burger,
    useMantineTheme,
    ActionIcon,
    Indicator,
} from "@mantine/core";

import { useState } from "react";

import LightDarkButton from "@components/LightDarkButton";
import { Link } from "react-router-dom";
import { BrandGithub } from "tabler-icons-react";

/*
 * Wallet && Blockchain interaction
 */
import InjectedWalletConnection from "@components/BrowserWalletConnection";

function headerLayout() {
    /* Mantine Value */
    const theme = useMantineTheme();
    const [opened, setOpened] = useState(false);

    return (
        <Header
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
            }}
            height={70}
            p="md"
        >
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                    opened={opened}
                    onClick={() => setOpened((o) => !o)}
                    size="sm"
                    color={theme.colors.gray[6]}
                    mr="xl"
                />
            </MediaQuery>
            <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
                <Indicator inline label="Alpha" size={16}>
                    <Text
                        component={Link}
                        to="/"
                        variant="gradient"
                        gradient={{ from: "indigo", to: "cyan", deg: 45 }}
                        size="lg"
                        transform="uppercase"
                    >
                        CommOwn - Shared Wallet
                    </Text>
                </Indicator>
            </MediaQuery>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                <Text
                    transform="uppercase"
                    color="gray"
                    weight={500}
                    component={Link}
                    variant="link"
                    to="/"
                >
                    Home
                </Text>
                <Text
                    transform="uppercase"
                    color="gray"
                    weight={500}
                    component={Link}
                    variant="link"
                    to="/wallet"
                >
                    Wallet
                </Text>

                <InjectedWalletConnection activeSwitch={true} />
                <ActionIcon
                    component="a"
                    href="https://github.com/commown-shared-wallet/contracts-dapps"
                    variant="outline"
                    target="_blank"
                >
                    <BrandGithub size={18} />
                </ActionIcon>
                <LightDarkButton />
            </div>
        </Header>
    );
}

export default headerLayout;
