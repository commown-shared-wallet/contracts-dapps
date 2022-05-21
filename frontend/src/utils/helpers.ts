import { toast } from "react-toastify";

export async function getAbiFromEtherscan(chainId: number, nftAddress: string) {
    let apiUrl: string;
    if (chainId === 1) {
        apiUrl = `https://api.etherscan.io`;
    } else if (chainId === 4) {
        apiUrl = `https://api-rinkeby.etherscan.io`;
    }

    const fetchData = async () => {
        const url = `${apiUrl}/api?module=contract&action=getabi&address=${nftAddress}&apikey=7SU3V3DHUHV5M3BX8SJBD29TXDAK5TCWNV`;
        console.log("url", url);
        try {
            const fethEtherscan = await fetch(url);
            const dataAbi = await fethEtherscan.json();
            const nftAbi = dataAbi.result;
            return nftAbi;
        } catch (e) {
            const error: any = e as Error;
            const message = error.data ? error.data.message : e;
            return toast.error(`${message}`, {
                position: toast.POSITION.BOTTOM_RIGHT,
            });
        }
    };
    const abi = fetchData();
    return abi;
}
