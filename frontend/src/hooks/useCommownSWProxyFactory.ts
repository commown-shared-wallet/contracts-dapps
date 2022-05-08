import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useNotifications } from "@mantine/notifications";
import { CommownSWProxyFactory } from "@utils/getContract";

function useCommownSWProxyFactory() {
    /**Mantine */
    const notifications = useNotifications();

    const [contract, setContract] = useState<ethers.Contract>();
    const context = useWeb3React();
    const { active, library: provider } = context;

    useEffect(() => {
        (async function () {
            const charge = async () => {
                if (active) {
                    const signer = provider.getSigner();
                    const instanceContract = new ethers.Contract(
                        CommownSWProxyFactory.hardhat,
                        CommownSWProxyFactory.abi,
                        signer
                    );
                    setContract(instanceContract);
                }
            };
            charge();
        })();
    }, [provider]);

    async function write(
        contract: Promise<any>,
        name: String,
        message: string,
        errorMsg: string = ""
    ): Promise<any> {
        const id = name.split(" ").join("");
        const title = name;
        try {
            const transaction = await contract;
            await transaction.wait();
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
        contract: Promise<any>,
        name: String,
        message: string,
        errorMsg: string = ""
    ): Promise<any> {
        const id = name.split(" ").join("");
        const title = name;
        let data: Promise<ethers.Contract>;
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
