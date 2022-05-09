import { Web3Provider } from "@ethersproject/providers";

/*Web3ReactProvider props - get provider classes and utility functions of web3 library in this case (ethers.js)*/
export default function getLibrary(provider: any) {
    const library = new Web3Provider(provider);
    return library;
}
