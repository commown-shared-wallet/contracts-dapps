import CommownSWProxyFactoryArtifacts from "@contract/CommownSWProxyFactory.sol/CommownSWProxyFactory.json";

interface IContract {
    hardhat: string;
    rinkeby: string;
    mainnet: string;
    abi: any;
    bytecode: any;
}

export const CommownSWProxyFactory: IContract = {
    hardhat: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    rinkeby: "",
    mainnet: "",
    abi: CommownSWProxyFactoryArtifacts.abi,
    bytecode: CommownSWProxyFactoryArtifacts.bytecode,
};
