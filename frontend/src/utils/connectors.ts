import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

const RPC_URLS = {
  1: "https://mainnet.infura.io/v3/61778f8337ab4ddab531940abe721ab9",
  4: "https://rinkeby.infura.io/v3/61778f8337ab4ddab531940abe721ab9",
};

/* Browser Extension/dApp Browser */
export const SwitchProvider = {
  mainnet: {
    chainId: "0x1", //1 to decimal
    rpcUrls: ["https://mainnet.infura.io/v3"],
    chainName: "Ethereum Mainnet",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://etherscan.io"],
  },
  ropsten: {
    chainId: "0x3", //3 to decimal
    rpcUrls: ["https://ropsten.infura.io/v3/"],
    chainName: "Ropsten Test Network",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://ropsten.etherscan.io"],
  },
  rinkeby: {
    chainId: "0x4", //4 to decimal
    rpcUrls: ["https://rinkeby.infura.io/v3/"],
    chainName: "Rinkeby Test Network",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://rinkeby.etherscan.io"],
  },
  goerli: {
    chainId: "0x5", //4 to decimal
    rpcUrls: ["https://goerli.infura.io/v3/"],
    chainName: "Goerli Test Network",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://goerli.etherscan.io"],
  },
  kovan: {
    chainId: "0x2A", //42 to decimal
    rpcUrls: ["https://kovan.infura.io/v3/"],
    chainName: "Kovan Test Network",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://kovan.etherscan.io"],
  },
  mumbai: {
    chainId: "0x13881", //80001 to decimal
    rpcUrls: ["https://matic-mumbai.chainstacklabs.com"],
    chainName: "Mumbai",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    blockExplorerUrls: ["https://mumbai.polygonscan.com"],
  },
  polygon: {
    chainId: "0x89", //137  to decimal
    rpcUrls: ["https://rpc-mainnet.matic.network/"],
    chainName: "Polygon",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
  hardhat: {
    chainId: "0x7A69", // 31337 in decimal
    rpcUrls: ["http://localhost:8545/"],
    chainName: "Hardhat",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: [""],
  },
  ganache: {
    chainId: "0x539", //1337 in decimal
    rpcUrls: ["http://localhost:7545/"],
    chainName: "Ganache",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: [""],
  },
};

export const injected = new InjectedConnector({
  supportedChainIds: [4, 31337],
});

/**QR Code */
export const walletconnect = new WalletConnectConnector({
  rpc: { 1: RPC_URLS[1] },
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
});
