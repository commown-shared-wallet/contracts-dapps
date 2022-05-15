import CommownSWProxyFactoryArtifacts from "@contract/CommownSWProxyFactory.sol/CommownSWProxyFactory.json";
import CommownSWPArtifacts from "@contract/CommownSW.sol/CommownSW.json";

interface IContract {
    hardhat?: string;
    rinkeby?: string;
    mainnet?: string;
    abi: any;
    bytecode: any;
}

export const CommownSWProxyFactory: IContract = {
    hardhat: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    abi: CommownSWProxyFactoryArtifacts.abi,
    bytecode: CommownSWProxyFactoryArtifacts.bytecode,
};
export const CommownSW: IContract = {
    abi: CommownSWPArtifacts.abi,
    bytecode: CommownSWPArtifacts.bytecode,
};