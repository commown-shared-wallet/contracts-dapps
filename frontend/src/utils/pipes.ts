export function ellipsisAddress(address: string, firstSub = 6, lastSub = 4) {
    let ellipsis = `${address.substring(0, firstSub)}...${address.substring(
        address.length - lastSub
    )}`;
    return ellipsis;
}

export function parseUrlOfOpenSea(type: "721" | "1155", url: string) {
    if (type === "721") {
        const nftUrl = new URL(url);
        const arrayUrl = nftUrl.pathname.split("/");
        const address = arrayUrl[3];
        const id = arrayUrl[4];

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
