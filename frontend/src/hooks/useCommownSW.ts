/*
 * * React Utils
 */
import { useCallback, useEffect, useState } from "react";
import { IDepositEvents, IProxyCreated } from "@interfaces/events";
import useCommownSWProxyFactory from "@hooks/useCommownSWProxyFactory";
import { CommownSW } from "@utils/getContract";

/*
 * * Mantine UI Library
 */
import { useNotifications } from "@mantine/notifications";

/*
 * *  Wallet && Blockchain interaction
 */
import { BigNumber, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { CommownSW as ICSW } from "@contract-types/CommownSW";

export function useCommownSW() {
    /**Mantine */
    const notifications = useNotifications();

    /*
     * Web 3
     */
    const context = useWeb3React();
    const { active, library: provider, account } = context;
    /**Contract */
    const [contract] = useCommownSWProxyFactory();
    console.log("useCommownSW || contract: ", contract);
    const [proxyAddressOfUser, setProxyAddressOfUser] = useState("");
    const [usersContractCommownSW, setUsersContractCommownSW] =
        useState<ICSW>();
    const [usersOfCSW, setUsersOfCSW] = useState<Array<IProxyCreated>>();

    /** Events */
    const [eventDeposit, setEventDeposit] = useState<IDepositEvents>([
        {
            sender: "0x0",
            amount: BigNumber.from(0),
            userBalance: BigNumber.from(0),
            balance: BigNumber.from(0),
        },
    ]);

    //get proxy address of users
    const fetchAddressUsersProxy = useCallback(async () => {
        if (contract && account) {
            const address = await contract.commownProxiesPerUser(account, 0);
            setProxyAddressOfUser(address);
        }
    }, [contract, provider, account]);

    // the useEffect is only there to call `fetchAddressUsersProxy` at the right time
    useEffect(() => {
        fetchAddressUsersProxy()
            // make sure to catch any error
            .catch(console.error);
    }, [fetchAddressUsersProxy]);

    //creation of logic/implementatiion contract for users proxies address
    const fetchContractProxy = useCallback(async () => {
        if (provider) {
            const signer = await provider.getSigner();
            const instanceCommownSW = await new ethers.ContractFactory(
                CommownSW.abi,
                CommownSW.bytecode,
                signer
            );
            const usersContractProxy = await instanceCommownSW.attach(
                proxyAddressOfUser
            );
            setUsersContractCommownSW(usersContractProxy as ICSW);
        }
    }, [proxyAddressOfUser]);

    useEffect(() => {
        try {
            fetchContractProxy();
        } catch (error) {
            console.error("useCommownCSW || fetchContractProxy", error);
        }
    }, [fetchContractProxy]);

    //Get owners of contract by CSWProxyFactoryEvents
    const handleProxyCreated = (adrs: string, owners: string[]) => {
        const arrayProxyCreated = [
            {
                adrs,
                owners,
            },
        ];
        setUsersOfCSW(arrayProxyCreated);
    };

    useEffect(() => {
        const test = async () => {
            if (contract && proxyAddressOfUser) {
                const filterTo = await contract.filters.ProxyCreated(
                    proxyAddressOfUser
                );
                console.log(
                    "useCommownSW || proxyCreated : ",
                    await contract.on("ProxyCreated", handleProxyCreated)
                );
                console.log("useCommownSW || contract : ", await contract);
            }
        };
        test();

        return () => {
            contract?.removeAllListeners("ProxyCreated");
        };
    }, [handleProxyCreated]);

    //Event Deposit
    const handleDeposit = (
        sender: string,
        amount: ethers.BigNumber,
        userBalance: ethers.BigNumber,
        balance: ethers.BigNumber
    ) => {
        const arrayDepositEvents = [
            {
                sender,
                amount,
                userBalance,
                balance,
            },
        ];
        setEventDeposit(arrayDepositEvents);
    };

    useEffect(() => {
        if (usersContractCommownSW) {
            usersContractCommownSW.on("Deposit", handleDeposit);
            console.log(
                "useCommownSW || Deposit",
                typeof eventDeposit,
                ethers.utils.formatEther(eventDeposit[0].amount.toString())
            );
        }
        return () => {
            usersContractCommownSW?.removeAllListeners("Deposit");
        };
    }, [handleDeposit]);

    return [
        usersContractCommownSW,
        proxyAddressOfUser,
        usersOfCSW,
        eventDeposit,
    ] as const; //const assertions
}
