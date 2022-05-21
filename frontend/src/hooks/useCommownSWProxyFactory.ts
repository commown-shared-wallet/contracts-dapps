import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { CommownSWProxyFactory } from "@utils/getContract";
import { CommownSWProxyFactory as ICSWPF } from "@contract-types/CommownSWProxyFactory";

function useCommownSWProxyFactory() {
    const [contract, setContract] = useState<ICSWPF>();
    const context = useWeb3React();
    const { active, library: provider, chainId } = context;

    useEffect(() => {
        (async function () {
            const charge = async () => {
                if (active && CommownSWProxyFactory) {
                    let contractAddress: string | undefined;
                    if (chainId == 31337) {
                        contractAddress = CommownSWProxyFactory.hardhat;
                    } else if (chainId == 4) {
                        contractAddress = CommownSWProxyFactory.rinkeby;
                    } else {
                        toast.error("error with chaind id", {
                            position: toast.POSITION.BOTTOM_RIGHT,
                        });
                    }
                    if (contractAddress) {
                        const signer = provider.getSigner();
                        const instanceContract = new ethers.Contract(
                            contractAddress,
                            CommownSWProxyFactory.abi,
                            signer
                        );
                        setContract(instanceContract as ICSWPF);
                    } else {
                        toast.error("error with contract address", {
                            position: toast.POSITION.BOTTOM_RIGHT,
                        });
                    }
                }
            };
            charge();
        })();
    }, [chainId]);

    return [contract] as const; //const assertions
}

export default useCommownSWProxyFactory;
