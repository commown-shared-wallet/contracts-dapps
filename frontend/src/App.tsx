/**
 * * React Utils
 */
import { Routes, Route } from "react-router-dom";

/*
 * * Wallet && Blockchain interaction
 */

/*
 * * Mantine UI Library
 */
import {
    ColorScheme,
    ColorSchemeProvider,
    MantineProvider,
} from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

/**
 * *Layout */
import Layout from "@layout/default";

/**
 * *Pages */
import Home from "@pages/Home";
import BalancesCoins from "@pages/BalancesCoins";
import BalancesNFT from "@pages/BalancesNFT";
import AssetsProposals from "@pages/AssetsProposals";
import Dashboard from "@pages/Dashboard";
import CreateSharedWallet from "@pages/CreateSW";

function App() {
    /*Theme Mode Management*/
    const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
        key: "mantine-color-scheme",
        defaultValue: "dark",
        getInitialValueInEffect: true,
    });

    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

    useHotkeys([["mod+J", () => toggleColorScheme()]]);

    return (
        <div className="App">
            <ColorSchemeProvider
                colorScheme={colorScheme}
                toggleColorScheme={toggleColorScheme}
            >
                <MantineProvider theme={{ colorScheme }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route element={<Layout />}>
                            <Route path="/wallet/*" element={<Dashboard />} />
                            <Route
                                path="/wallet/create-shared-wallet"
                                element={<CreateSharedWallet />}
                            />
                            <Route
                                path="/wallet/assets-proposals"
                                element={<AssetsProposals />}
                            />
                            <Route
                                path="/wallet/assets/balances/*"
                                element={<BalancesCoins />}
                            />
                            <Route
                                path="/wallet/assets/balances/nfts"
                                element={<BalancesNFT />}
                            />
                        </Route>
                    </Routes>
                </MantineProvider>
            </ColorSchemeProvider>
        </div>
    );
}

export default App;
