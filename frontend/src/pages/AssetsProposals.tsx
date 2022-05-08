/*
 * * React Utils
 */

/*
 * * Mantine UI Library
 */
import { Paper, Title } from "@mantine/core";

/*
 * *  Wallet && Blockchain interaction
 */
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { CommownSWProxyFactory } from "@utils/getContract";
import useCommownSWProxyFactory from "@hooks/useCommownSWProxyFactory";

function AssetsProposals() {
    /* React */

    /* Web3 */

    /*State*/

    /* Mantine*/

    return (
        <div>
            <Paper shadow="xs" p="md" radius={0} style={{ marginTop: "16px" }}>
                <Title
                    order={2}
                    style={{
                        marginBottom: "20px",
                    }}
                >
                    Create purchase proposals
                </Title>
            </Paper>
        </div>
    );
}

export default AssetsProposals;
