/*
 * * React Utils
 */
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@hooks/useRedux";
import { useCommownSW } from "@hooks/useCommownSW";
import { useCopy } from "@hooks/useCopy";
import { ellipsisAddress } from "@utils/pipes";
import { SnippetAccordion } from "@components/SnippetAccordion";
import { IUsersCSW } from "@interfaces/events";
import { updateUsersBalance } from "store/users";

/*
 * * Mantine UI Library
 */
import { hideNotification, useNotifications } from "@mantine/notifications";
import {
    Avatar,
    Button,
    Paper,
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
import { useWeb3React } from "@web3-react/core";
import useContract from "@hooks/useContract";
import { ethers } from "ethers";
import { toast } from "react-toastify";

function Dashboard() {
    /* React */
    const usersOfCSW = useAppSelector((state) => state.users);
    const dispatch = useAppDispatch();

    const [copyElement] = useCopy();
    const [write, read] = useContract();

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
    const [usersOfWallet, setUsersOfWallet] = useState(elements);
    const [lastDepositEvents, setLastDepositEvents] = useState<any>();
    const [depositAmount, setDepositAmount] = useState<any>(0.1);

    /* Web3 */
    const context = useWeb3React();
    const { active, library: provider, account, chainId } = context;

    const [usersContractCommownSW, proxyAddressOfUser, , eventDeposit] =
        useCommownSW();

    const fetCSWBalance = useCallback(async () => {
        if (provider) {
            const balance = await provider.getBalance(proxyAddressOfUser);
            setWalletBalance(ethers.utils.formatEther(balance));
        }
    }, [usersContractCommownSW, eventDeposit, usersOfCSW, chainId]);

    useEffect(() => {
        fetCSWBalance().catch(console.error);
    }, [fetCSWBalance]);

    // Users Balance
    const fetchUsersBalance = useCallback(async () => {
        if (usersContractCommownSW && account) {
            const usersBalanceCurrent =
                await usersContractCommownSW.balancePerUser(account);
            const currentBalance =
                ethers.utils.formatEther(usersBalanceCurrent);

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

            setUserBalance(currentBalance);
            setLastDepositEvents(lastTransactions);
        }
    }, [eventDeposit, account, chainId, usersContractCommownSW]);

    useEffect(() => {
        fetchUsersBalance().catch(console.error);
    }, [fetchUsersBalance]);

    // Users Balance
    const fetchSummaryOfBalance = useCallback(async () => {
        if (usersContractCommownSW) {
            const resultOwnersWallet: Array<any> = [];

            usersOfCSW.map(async (owners) => {
                const { address, balance } = owners;

                const balanceOfUser =
                    await usersContractCommownSW.balancePerUser(address);
                dispatch(
                    updateUsersBalance({
                        sender: address,
                        balance: ethers.utils.formatEther(balanceOfUser),
                    })
                );
                resultOwnersWallet.push({
                    assets: "ETH",
                    address: ellipsisAddress(address, 10, 8),
                    userBalance: ethers.utils.formatEther(balanceOfUser),
                });
            });
            setUsersOfWallet(resultOwnersWallet);
        }
    }, [eventDeposit, usersContractCommownSW]);

    useEffect(() => {
        try {
            fetchSummaryOfBalance();
        } catch (error) {
            toast.error("Error fetch Summary Of Balance");
        }
    }, [fetchSummaryOfBalance, usersContractCommownSW]);

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

    const withdrawFunds = useCallback(async () => {
        const amount = ethers.utils.parseUnits(
            depositAmount.toString(),
            "ether"
        );
        if (usersContractCommownSW) {
            await write(
                usersContractCommownSW.withdraw(amount),
                "withdraw funds",
                "Withdraw Funds of CSW",
                "Unable to withdraw funds of CSW : "
            );
        }
    }, [usersContractCommownSW, eventDeposit, usersOfWallet]);

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
                                {usersOfWallet.length > 0 ? (
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
                                                    rows: usersOfWallet,
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
                                                ? "define an amount >= 0.1"
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
                                            onClick={withdrawFunds}
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
