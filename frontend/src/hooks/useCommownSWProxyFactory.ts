import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useNotifications } from "@mantine/notifications";
import { CommownSWProxyFactory } from "@utils/getContract";
import { CommownSWProxyFactory as ICSWPF } from "@contract-types/CommownSWProxyFactory";
import { ContractTransaction } from "ethers";

function useCommownSWProxyFactory() {
    /**Mantine */
    const notifications = useNotifications();

    const [contract, setContract] = useState<ICSWPF>();
    const context = useWeb3React();
    const { active, library: provider } = context;

    useEffect(() => {
        (async function () {
            const charge = async () => {
                if (active && CommownSWProxyFactory.hardhat) {
                    const signer = provider.getSigner();
                    const instanceContract = new ethers.Contract(
                        CommownSWProxyFactory.hardhat,
                        CommownSWProxyFactory.abi,
                        signer
                    );
                    setContract(instanceContract as ICSWPF);
                }
            };
            charge();
        })();
    }, [provider]);

    async function write(
        contract: Promise<ContractTransaction> | string,
        name: String,
        message: string,
        errorMsg: string = ""
    ): Promise<any> {
        const id = name.split(" ").join("");
        const title = name;
        try {
            await contract;
            notifications.showNotification({
                id,
                title,
                color: "green",
                message,
                autoClose: false,
            });
        } catch (e) {
            const error: any = e as Error;
            const message = error.data ? error.data.message : e;
            notifications.showNotification({
                id: `Erorr${name}`,
                title: `Error ${name}`,
                color: "red",
                message: `${errorMsg} ${message}`,
            });
            return error;
        }
    }

    async function read(
        contract: Promise<ContractTransaction> | string,
        name: String,
        message: string,
        errorMsg: string = ""
    ): Promise<any> {
        const id = name.split(" ").join("");
        const title = name;
        let data;
        try {
            data = await contract;
            notifications.showNotification({
                id,
                title,
                color: "green",
                message: `${message}: ${data}`,
            });
        } catch (e) {
            const error: any = e as Error;
            const message = error.data ? error.data.message : e;
            notifications.showNotification({
                id: `Erorr${name}`,
                title: `Error ${name}`,
                color: "red",
                message: `${errorMsg} ${message} `,
            });
            return error;
        }
        return data;
    }

    return [contract, write, read] as const; //const assertions
}

export default useCommownSWProxyFactory;
