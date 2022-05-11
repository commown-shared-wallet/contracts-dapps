export function ellipsisAddress(address: string) {
    let ellipsis = `${address.substring(0, 6)}...${address.substring(
        address.length - 4
    )}`;
    return ellipsis;
}
