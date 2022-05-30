/*
 * * React Utils
 */
import { useCallback, useEffect, useState } from "react";
import { IDepositEvents } from "@interfaces/events";

import { useAppSelector, useAppDispatch } from "@hooks/useRedux";
import { setUsers, updateUsersBalance } from "../store/users";

import useCommownSWProxyFactory from "@hooks/useCommownSWProxyFactory";
import { CommownSW } from "@utils/getContract";

import { toast } from "react-toastify";

/*
 * *  Wallet && Blockchain interaction
 */
import { BigNumber, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { CommownSW as ICSW } from "@contract-types/CommownSW";

export function useCommownSW() {
    /* React */
    const usersOfCSW = useAppSelector((state) => state.users);
    const dispatch = useAppDispatch();

    /* Web 3 */
    const context = useWeb3React();
    const { active, library: provider, account } = context;

    /* Contract */
    const [contract] = useCommownSWProxyFactory();
    const [proxyAddressOfUser, setProxyAddressOfUser] = useState("");
    const [usersContractCommownSW, setUsersContractCommownSW] =
        useState<ICSW>();

    /* Events */
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
        const eventProxyCreated = {
            adrs,
            owners,
        };
        localStorage.removeItem("usersOfWallet");
        localStorage.setItem(
            "usersOfWallet",
            JSON.stringify(eventProxyCreated)
        );
    };

    const fetchEventsProxyCreated = useCallback(async () => {
        if (contract) contract.on("ProxyCreated", handleProxyCreated);
    }, []);

    const fetchUsers = useCallback(async () => {
        const usersJSON = localStorage.getItem("usersOfWallet");
        const users = usersJSON != null ? JSON.parse(usersJSON) : "{}";
        await dispatch(setUsers(users.owners));
        /*
                dispatch({
                    type: "users/setUsers",
                    payload: users.owners,
                });
            */
    }, []);

    useEffect(() => {
        try {
            fetchEventsProxyCreated();
            fetchUsers();
        } catch (error) {
            console.error("useCommownCSW || fetchEventsProxyCreated", error);
            toast.error("error fetching users", {
                position: toast.POSITION.BOTTOM_RIGHT,
            });
        }
        return () => {
            contract?.removeAllListeners("ProxyCreated");
        };
    }, [fetchEventsProxyCreated, fetchUsers]);

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
        dispatch(
            updateUsersBalance({
                sender,
                balance: ethers.utils.formatEther(userBalance),
            })
        );
    };

    useEffect(() => {
        if (usersContractCommownSW) {
            usersContractCommownSW.on("Deposit", handleDeposit);
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
