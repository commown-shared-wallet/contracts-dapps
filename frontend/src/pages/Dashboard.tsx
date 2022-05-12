/*
 * * React Utils
 */
import { useCallback, useEffect, useState } from "react";
import { useCommownSW } from "@hooks/useCommownSW";
import { useCopy } from "@hooks/useCopy";
import { ellipsisAddress } from "@utils/pipes";
import { SnippetAccordion } from "@components/SnippetAccordion";
import { IUsersCSW } from "@interfaces/events";

/*
 * * Mantine UI Library
 */
import { hideNotification, useNotifications } from "@mantine/notifications";
import {
    Avatar,
    Button,
    Paper,
    Table,
    Title,
    Badge,
    Grid,
    UnstyledButton,
    Group,
    Accordion,
    TextInput,
    SimpleGrid,
} from "@mantine/core";
import {
    CurrencyEthereum,
    Star,
    ReportMoney,
    Wallet,
    AddressBook,
} from "tabler-icons-react";

/*
 * *  Wallet && Blockchain interaction
 */
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import useCommownSWProxyFactory from "@hooks/useCommownSWProxyFactory";

function Dashboard() {
    /* React */
    const [copyElement] = useCopy();

    /* Mantine*/
    const notifications = useNotifications();

    const elements: IUsersCSW = [
        {
            assets: "ETH",
            address: "0x0",
            userBalance: 0,
        },
    ];
    /*State*/
    const [walletBalance, setWalletBalance] = useState("");
    const [userBalance, setUserBalance] = useState("");
    const [usersWallet, setUsersWallet] = useState(elements);
    const [lastDepositEvents, setLastDepositEvents] = useState<any>();
    const [depositAmount, setDepositAmount] = useState<any>(0.1);

    /* Web3 */
    const context = useWeb3React();
    const { active, library: provider, account, chainId } = context;
    const [contract] = useCommownSWProxyFactory();
    const [
        usersContractCommownSW,
        proxyAddressOfUser,
        usersOfCSW,
        eventDeposit,
    ] = useCommownSW();

    const handleProxyCreated = (address: string, owners: string[]) => {
        console.log("handleProxyCreated", { address, owners });
    };

    useEffect(() => {
        if (contract) {
            contract.on("ProxyCreated", handleProxyCreated);
        }

        return () => {
            contract?.removeAllListeners("ProxyCreated");
        };
    }, [account]);

    const fetCSWBalance = useCallback(async () => {
        if (provider) {
            const balance = await provider.getBalance(proxyAddressOfUser);
            setWalletBalance(await ethers.utils.formatEther(balance));
        }
    }, [usersContractCommownSW, eventDeposit, usersWallet]);

    useEffect(() => {
        fetCSWBalance().catch(console.error);
    }, [fetCSWBalance]);

    // Users Balance
    const fetchUsersBalance = useCallback(async () => {
        if (usersContractCommownSW && account) {
            const usersBalanceCurrent =
                await usersContractCommownSW?.balancePerUser(account);
            const currentBalance = await ethers.utils.formatEther(
                usersBalanceCurrent
            );

            const lastTransactions: Array<any> = [];
            eventDeposit.map((element) => {
                const { sender, amount, userBalance, balance } = element;
                lastTransactions.push({
                    assets: "ETH",
                    sender: ellipsisAddress(sender, 8, 8),
                    amount: ethers.utils.formatEther(amount.toString()),
                    userBalance: ethers.utils.formatEther(
                        userBalance.toString()
                    ),
                    balance: ethers.utils.formatEther(balance.toString()),
                });
            });
            console.log(
                "Dashboard | eventDeposit | lastTransactions",
                typeof lastTransactions,
                lastTransactions
            );
            setUserBalance(currentBalance);
            setLastDepositEvents(lastTransactions);
        }
    }, [usersOfCSW, eventDeposit, account]);

    useEffect(() => {
        fetchUsersBalance().catch(console.error);
    }, [fetchUsersBalance]);

    // Users Balance
    const fetchUsersOfWallet = useCallback(async () => {
        if (usersOfCSW && usersContractCommownSW) {
            const resultOwnersWallet: Array<any> = [];
            usersOfCSW[0].owners.map(async (ownersAddress, index) => {
                const usersBalance =
                    await usersContractCommownSW?.balancePerUser(ownersAddress);
                resultOwnersWallet.push({
                    assets: "ETH",
                    address: ellipsisAddress(ownersAddress, 10, 8),
                    userBalance: await ethers.utils.formatEther(usersBalance),
                });
            });
            console.log(
                "Dashboard | fetchUsersOfWallet | resultOwnersWallet",
                typeof resultOwnersWallet,
                resultOwnersWallet
            );

            setUsersWallet(resultOwnersWallet);
        }
    }, [usersOfCSW, account, chainId, eventDeposit]);

    useEffect(() => {
        fetchUsersOfWallet().catch(console.error);
    }, [fetchUsersOfWallet]);

    async function receiveFunds() {
        if (active) {
            try {
                const gasPrice = await provider.getGasPrice();
                const gasLimit = ethers.utils.hexlify(100000); // 100 gwei
                const signer = provider.getSigner();
                const tx = {
                    from: account,
                    to: proxyAddressOfUser,
                    value: ethers.utils.parseUnits(depositAmount, "ether"),
                    gasPrice,
                    gasLimit,
                    nonce: await provider.getTransactionCount(
                        account,
                        "latest"
                    ), // 100 gwei,
                };
                const transaction = await signer.sendTransaction(tx);
                hideNotification("erorrReceiveFunds");
            } catch (e) {
                //const message =
                notifications.showNotification({
                    id: "erorrReceiveFunds",
                    title: "Erorr receive funds",
                    color: "red",
                    message: `Unable to call promise : ${e}`,
                });
            }
        }
    }

    return (
        <div>
            <Paper
                shadow="xs"
                p="md"
                radius={0}
                style={{ margin: "20px", padding: "20px" }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "20px",
                    }}
                >
                    <Avatar color="blue" radius="sm">
                        <Star size={24} />
                    </Avatar>
                    <Title
                        order={2}
                        style={{
                            margin: "0 10px",
                            flex: 1,
                        }}
                    >
                        Dashboard
                    </Title>
                    <Badge
                        variant="gradient"
                        gradient={{ from: "indigo", to: "cyan" }}
                    >
                        {active ? provider._network?.name : ""}
                    </Badge>
                </div>
                <Grid columns={12}>
                    <Grid.Col span={6}>
                        <SimpleGrid cols={1} spacing="lg">
                            <Paper withBorder>
                                {proxyAddressOfUser ? (
                                    <SnippetAccordion
                                        heads={[
                                            {
                                                id: "assets" as const,
                                                label: "Assets",
                                            },
                                            {
                                                id: "account" as const,
                                                label: "Current Account",
                                            },

                                            {
                                                id: "walletBalance" as const,
                                                label: "Wallet  Balance",
                                            },
                                            {
                                                id: "userBalance" as const,
                                                label: "Current Balance",
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
                                                            account: (
                                                                <UnstyledButton
                                                                    onClick={() => {
                                                                        copyElement(
                                                                            account
                                                                        );
                                                                    }}
                                                                >
                                                                    {ellipsisAddress(
                                                                        account
                                                                            ? account
                                                                            : ""
                                                                    )}
                                                                </UnstyledButton>
                                                            ),
                                                            walletBalance,
                                                            userBalance,
                                                            assets: "ETH",
                                                        },
                                                    ],
                                                },
                                            },
                                        ]}
                                    />
                                ) : null}
                            </Paper>

                            <Paper withBorder>
                                {usersWallet && usersContractCommownSW ? (
                                    <SnippetAccordion
                                        heads={[
                                            {
                                                id: "assets" as const,
                                                label: "Assets",
                                            },
                                            {
                                                id: "address" as const,
                                                label: "Users Address",
                                            },

                                            {
                                                id: "userBalance" as const,
                                                label: "Balance",
                                            },
                                        ]}
                                        tableContent={[
                                            {
                                                label: "Summary of the balance by users",
                                                icon: <AddressBook size={40} />,
                                                table: {
                                                    rows: usersWallet
                                                        ? usersWallet
                                                        : [],
                                                },
                                            },
                                        ]}
                                    />
                                ) : null}
                            </Paper>
                        </SimpleGrid>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Paper style={{ marginBottom: "20px" }} withBorder>
                            {lastDepositEvents ? (
                                <SnippetAccordion
                                    heads={[
                                        {
                                            id: "assets" as const,
                                            label: "Assets",
                                        },
                                        {
                                            id: "sender" as const,
                                            label: "Sender",
                                        },
                                        {
                                            id: "amount" as const,
                                            label: "Amount",
                                        },
                                        {
                                            id: "userBalance" as const,
                                            label: "User Balance",
                                        },
                                    ]}
                                    tableContent={[
                                        {
                                            label: "Last Transactions",
                                            icon: (
                                                <CurrencyEthereum size={40} />
                                            ),
                                            description:
                                                lastDepositEvents[0].sender,
                                            table: {
                                                rows: lastDepositEvents
                                                    ? lastDepositEvents
                                                    : [],
                                            },
                                        },
                                    ]}
                                />
                            ) : null}
                        </Paper>
                        <Paper withBorder>
                            <Accordion disableIconRotation initialItem={0}>
                                <Accordion.Item
                                    label="Send and Withdraw Ethers"
                                    icon={<ReportMoney />}
                                >
                                    <TextInput
                                        label="Amount"
                                        placeholder="0.15 ETH"
                                        type="number"
                                        error={
                                            depositAmount <= 0.1
                                                ? "define an amount => 0.1"
                                                : ""
                                        }
                                        value={
                                            depositAmount ? depositAmount : 0
                                        }
                                        icon={<CurrencyEthereum size={14} />}
                                        onChange={(event) =>
                                            setDepositAmount(event.target.value)
                                        }
                                        required
                                    />
                                    <Group position="center" mt="xl">
                                        <Button
                                            variant="gradient"
                                            gradient={{
                                                from: "teal",
                                                to: "lime",
                                                deg: 105,
                                            }}
                                            onClick={receiveFunds}
                                            uppercase
                                            disabled={
                                                depositAmount <= 0.1
                                                    ? true
                                                    : false
                                            }
                                        >
                                            Supply
                                        </Button>
                                        <Button
                                            variant="gradient"
                                            gradient={{
                                                from: "yellow",
                                                to: "orange",
                                            }}
                                            uppercase
                                            disabled={
                                                depositAmount <= 0.1
                                                    ? true
                                                    : false
                                            }
                                        >
                                            Withdraw
                                        </Button>
                                    </Group>
                                </Accordion.Item>
                            </Accordion>
                        </Paper>
                    </Grid.Col>
                </Grid>
            </Paper>
        </div>
    );
}

export default Dashboard;
