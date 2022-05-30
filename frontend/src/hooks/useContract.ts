import { useNotifications } from "@mantine/notifications";
import { ContractTransaction } from "ethers";

function useContract() {
    /*Mantine */
    const notifications = useNotifications();

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
            const message = error.data ? error.data.message : error.message;
            notifications.showNotification({
                id: `Erorr${name}`,
                title: `Error ${name}`,
                color: "red",
                message: `${errorMsg} : ${message}`,
            });
            return error;
        }
    }

    async function read<T>(
        contract: Promise<T> | string,
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
            const message = error.data ? error.data.message : error.message;
            notifications.showNotification({
                id: `Erorr${name}`,
                title: `Error ${name}`,
                color: "red",
                message: `${errorMsg} : ${message} `,
            });
            return error;
        }
        return data;
    }

    return [write, read] as const; //const assertions
}

export default useContract;
