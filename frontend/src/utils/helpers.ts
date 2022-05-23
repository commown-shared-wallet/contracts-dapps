/*
 * * External  Packages
 */
import { toast } from "react-toastify";

/*
 * * Interfaces && pipes
 */
import { INftData } from "@interfaces/csw";
import { convertIpfsUrl } from "@utils/pipes";

/*
 * *  Wallet && Blockchain interaction
 */
import { ethers } from "ethers";

export function getContract(
    address: string,
    abi: any,
    signer: any
): ethers.Contract {
    return new ethers.Contract(address, abi, signer);
}

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
export async function getDataOfOpenSeaNFT(
    chainId: number,
    nftAddress: string,
    nftId: string,
    signer: any
) {
    //Contract
    const abi = await getAbiFromEtherscan(chainId, nftAddress);
    if (abi == "Contract source code not verified") {
        toast.error(abi, {
            position: toast.POSITION.BOTTOM_RIGHT,
        });
    } else {
        const instanceContract = getContract(nftAddress, abi, signer);
        const tokenURI: string = await instanceContract.tokenURI(
            parseInt(nftId)
        );
        let finalFetchAddress: string;
        if (tokenURI.substring(0, 4) === "ipfs") {
            finalFetchAddress = convertIpfsUrl(tokenURI);
        } else {
            finalFetchAddress = tokenURI;
        }
        const fetchData = async () => {
            try {
                const response = await fetch(finalFetchAddress);
                const json = await response.json();
                const nft = json;
                return nft;
            } catch (error) {
                const e = error as Error;
                toast.error(`${e.message}`, {
                    position: toast.POSITION.BOTTOM_RIGHT,
                });
            }
        };
        const nftData: INftData = await fetchData();
        return nftData;
    }
}
