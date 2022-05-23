/*
 * * React Utils
 */
import { useCallback, useEffect, useState } from "react";
import { ellipsisAddress } from "@utils/pipes";

/*
 * * Mantine UI Library
 */
import { Paper, Title } from "@mantine/core";
import { Wallet } from "tabler-icons-react";
import { useNotifications } from "@mantine/notifications";

/*
 * *  Wallet && Blockchain interaction
 */
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { useCommownSW } from "@hooks/useCommownSW";
import { SnippetAccordion } from "@components/SnippetAccordion";

function BalancesCoins() {
    /* React */
    const [walletBalance, setWalletBalance] = useState<number>();
    const [valueETH, setValueETH] = useState<number>();

    /*Mantine */
    const notifications = useNotifications();

    /* Web3 */
    const context = useWeb3React();
    const { library: provider, account, chainId } = context;
    const [usersContractCommownSW, proxyAddressOfUser, , eventDeposit] =
        useCommownSW();

    const fetCSWBalance = useCallback(async () => {
        if (provider) {
            const balance = await provider.getBalance(proxyAddressOfUser);
            setWalletBalance(parseFloat(ethers.utils.formatEther(balance)));
        }
    }, [usersContractCommownSW, eventDeposit]);

    useEffect(() => {
        fetCSWBalance().catch(console.error);
    }, [fetCSWBalance, chainId]);

    useEffect(() => {
        const url =
            "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur";
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                const json = await response.json();
                if (walletBalance && walletBalance >= 0) {
                    setValueETH(
                        Math.round(walletBalance * json.ethereum.eur * 100) /
                            100
                    );
                }
            } catch (error) {
                const e = error as Error;
                notifications.showNotification({
                    id: "erorrFetchValueETH",
                    title: "Erorr Fetch Value ETH",
                    color: "red",
                    message: `Unable to fetch eth value : ${e.message}`,
                });
            }
        };
        fetchData();
    }, [walletBalance]);

    return (
        <div>
            <Paper shadow="xs" p="md" radius={0} style={{ marginTop: "16px" }}>
                <Title
                    order={2}
                    style={{
                        marginBottom: "20px",
                    }}
                >
                    CSW Coins
                </Title>
                <Paper withBorder>
                    {proxyAddressOfUser ? (
                        <SnippetAccordion
                            heads={[
                                {
                                    id: "assets" as const,
                                    label: "Assets",
                                },
                                {
                                    id: "walletBalance" as const,
                                    label: "Wallet  Balance",
                                },
                                {
                                    id: "valueETH" as const,
                                    label: "Value (EUR) ",
                                },
                            ]}
                            tableContent={[
                                {
                                    label: "CommOwn Shared Wallet",
                                    icon: <Wallet size={40} />,
                                    description: ellipsisAddress(
                                        proxyAddressOfUser,
                                        13,
                                        11
                                    ),
                                    table: {
                                        rows: [
                                            {
                                                walletBalance,
                                                valueETH,
                                                assets: "ETH",
                                            },
                                        ],
                                    },
                                },
                            ]}
                        />
                    ) : null}
                </Paper>
            </Paper>
        </div>
    );
}

export default BalancesCoins;
