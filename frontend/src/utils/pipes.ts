import { toast } from "react-toastify";

export function ellipsisAddress(address: string, firstSub = 6, lastSub = 4) {
    let ellipsis = `${address.substring(0, firstSub)}...${address.substring(
        address.length - lastSub
    )}`;
    return ellipsis;
}

export function parseUrlOfOpenSea(type: "721" | "1155", url: string) {
    let address: string = "";
    let id: string = "";
    if (type === "721") {
        try {
            const nftUrl = new URL(url);
            const arrayUrl = nftUrl.pathname.split("/");
            address = arrayUrl[3];
            id = arrayUrl[4];
        } catch (error) {
            toast.error("unable to parse the url", {
                position: toast.POSITION.BOTTOM_RIGHT,
            });
        }

        return {
            address,
            id,
        };
    }
}

export function convertIpfsUrl(url: string) {
    const ipfsURL = new URL(url);
    return "https://ipfs.io/ipfs/" + ipfsURL.pathname.replace(/\/\//, "");
}
