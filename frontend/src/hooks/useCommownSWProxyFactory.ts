import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { useNotifications } from "@mantine/notifications";
import { CommownSWProxyFactory } from "@utils/getContract";
import { CommownSWProxyFactory as ICSWPF } from "@contract-types/CommownSWProxyFactory";

function useCommownSWProxyFactory() {
    /**Mantine */
    const notifications = useNotifications();

    const [contract, setContract] = useState<ICSWPF>();
    const context = useWeb3React();
    const { active, library: provider } = context;

    useEffect(() => {
        (async function () {
            const charge = async () => {
                if (active && CommownSWProxyFactory.hardhat) {
                    const signer = provider.getSigner();
                    const instanceContract = new ethers.Contract(
                        CommownSWProxyFactory.hardhat,
                        CommownSWProxyFactory.abi,
                        signer
                    );
                    setContract(instanceContract as ICSWPF);
                }
            };
            charge();
        })();
    }, [provider]);

    return [contract] as const; //const assertions
}

export default useCommownSWProxyFactory;
