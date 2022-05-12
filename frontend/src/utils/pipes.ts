export function ellipsisAddress(address: string, firstSub = 6, lastSub = 4) {
    let ellipsis = `${address.substring(0, firstSub)}...${address.substring(
        address.length - lastSub
    )}`;
    return ellipsis;
}
