/*
 * * React Utils
 */
import { useEffect, useRef, useState } from "react";

/*
 * * Mantine UI Library
 */
import { Button, Menu, Divider, Select } from "@mantine/core";
import { useNotifications } from "@mantine/notifications";
import {
  SwitchVertical,
  Alien,
  Network,
  Copy,
  CurrencyEthereum,
  ArrowBarToRight,
} from "tabler-icons-react";

/*
 * * Wallet && Blockchain interaction
 */
import { injected, SwitchProvider } from "@utils/connectors";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from "@web3-react/injected-connector";
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from "@web3-react/walletconnect-connector";

interface INetwork {
  chainId: string; //in hexadecimals
  rpcUrls: Array<string>;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: Array<string>;
}

interface IWCProps {
  activeSwitch?: boolean;
}

function getErrorMessage(error: Error | undefined) {
  if (error instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.";
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  } else if (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect
  ) {
    return "Please authorize this website to access your Ethereum account.";
  } else {
    return "An unknown error occurred. Check the console for more details.";
  }
}

function InjectedWalletConnection({ activeSwitch }: IWCProps) {
  /* Web3 React Value */
  const context = useWeb3React();
  const {
    active,
    activate,
    library: provider,
    chainId,
    account,
    error,
    deactivate,
  } = context;

  /* React Value */
  const [selectChainId, setSelectChainId] = useState<string | null>();
  const [networkName, setNetworkName] = useState<string | null>("unknown");
  const [providerName, setProviderName] = useState(null);

  /* Mantine Value */
  const notifications = useNotifications();

  /* UI Value */
  const style = {
    display: "flex",
    gap: "10px",
  };

  /* Injected wallet connection on load */
  useEffect(() => {
    connectWalletOnPageLoad();
  }, [chainId]);

  /* Select default network */
  useEffect(() => {
    setSelectChainId(chainId?.toString());
  }, [chainId]);

  /* UnSupported Provider */
  useEffect(() => {
    try {
      if (active) {
        setProviderName(provider.connection.url);
      }
    } catch (e) {
      notifications.showNotification({
        id: "Provider not supported",
        title: "Erorr fetching Provider ",
        color: "red",
        message: `This provider is not supported" : ${e}`,
        autoClose: false,
      });
    }
    return () => setProviderName(null);
  }, [chainId]);

  /* Error Management */
  const errorManagement = (error: Error | undefined) => {
    notifications.showNotification({
      id: "Network Error",
      color: "red",
      message: `Error with network : ${getErrorMessage(error)}`,
      autoClose: true,
    });
  };
  useEffect(() => {
    if (error) {
      errorManagement(error);
    }
  }, [error]);

  /*
   * Connection Inject Wallet
   */
  const connectWalletOnPageLoad = async () => {
    if (localStorage?.getItem("isWalletConnected") === "true") {
      try {
        await activate(injected);
        if (active) setNetworkName(provider._network.name);
      } catch (e) {
        notifications.showNotification({
          id: "Error to connect wallet ",
          color: "red",
          message: `UseEffect (Error with injected wallet) : ${e}`,
          autoClose: false,
        });
      }
    }
  };

  async function connect() {
    try {
      if (
        getErrorMessage(error) != "You're connected to an unsupported network."
      ) {
        await activate(injected);
        localStorage.setItem("isWalletConnected", "true");
      } else {
        errorManagement(error);
      }
    } catch (e) {
      notifications.showNotification({
        id: "Error to connect wallet ",
        color: "red",
        message: `activate (Error with injected wallet) : ${e}`,
        autoClose: false,
      });
    }
  }

  /*
   * Manage active account
   */
  async function disconnect() {
    try {
      deactivate();
      localStorage.setItem("isWalletConnected", "false");
    } catch (e) {
      notifications.showNotification({
        id: "Error to disconnect wallet ",
        color: "red",
        message: `Error with injected wallet : ${e}`,
        autoClose: false,
      });
    }
  }

  function copyAccount(adress: string | null | undefined) {
    notifications.showNotification({
      id: "Copy",
      color: "green",
      message: `The account address has been copied : ${adress}`,
    });
    return navigator.clipboard.writeText(adress || "");
  }

  /*
   * Switch Network
   */
  const WalletSwitchOrAdd = async (network: INetwork) => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.chainId }],
      });
    } catch (error) {
      const e = error as Error;
      if (e.message.includes("wallet_addEthereumChain")) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [network],
        });
      } else {
        notifications.showNotification({
          id: "Switch Error",
          color: "red",
          message: `Error with switch network : ${e.message}`,
          autoClose: true,
        });
      }
    }
  };

  /* Components Value */
  const select = useRef() as React.MutableRefObject<HTMLInputElement>;
  function switchNetwork() {
    const {
      mainnet,
      ropsten,
      rinkeby,
      kovan,
      goerli,
      mumbai,
      polygon,
      hardhat,
      ganache,
    } = SwitchProvider;
    const chain = select.current?.value;
    switch (chain) {
      case "Ethereum":
        WalletSwitchOrAdd(mainnet);
        break;
      case "Ropsten":
        WalletSwitchOrAdd(ropsten);
        break;
      case "Rinkeby":
        WalletSwitchOrAdd(rinkeby);
        break;
      case "Goerli":
        WalletSwitchOrAdd(goerli);
        break;
      case "Kovan":
        WalletSwitchOrAdd(kovan);
        break;
      case "Mumbai":
        WalletSwitchOrAdd(mumbai);
        break;
      case "Polygon":
        WalletSwitchOrAdd(polygon);
        break;
      case "Hardhat":
        WalletSwitchOrAdd(hardhat);
        break;
      case "Ganache":
        WalletSwitchOrAdd(ganache);
        break;
      default:
        notifications.showNotification({
          id: "Switch Error",
          title: "Switch Network",
          color: "red",
          message: `Your ${
            provider ? "connect to " + provider._network.name : " not connected"
          }.`,
          autoClose: true,
        });
    }
  }

  return (
    <div style={style}>
      {!active && (
        <Button
          leftIcon={<CurrencyEthereum />}
          variant="gradient"
          uppercase
          gradient={{ from: "indigo", to: "cyan" }}
          onClick={connect}
        >
          Connect wallet
        </Button>
      )}
      {active && providerName && (
        <>
          <Menu
            control={
              <Button
                leftIcon={<Alien />}
                variant="outline"
                uppercase
                type="button"
              >
                {account === null
                  ? "-"
                  : account
                  ? `${account.substring(0, 6)}...${account.substring(
                      account.length - 4
                    )}`
                  : ""}
              </Button>
            }
          >
            <Menu.Label>
              Wallet :{" "}
              <span style={{ textTransform: "capitalize" }}>
                {providerName}
              </span>
            </Menu.Label>
            <Menu.Item
              onClick={() => {
                copyAccount(account);
              }}
              icon={<Network size={14} />}
            >
              Network :{" "}
              <b>
                {" "}
                {networkName} ({chainId})
              </b>
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                copyAccount(account);
              }}
              icon={<Copy size={14} />}
            >
              Copy Adress
            </Menu.Item>
            <Divider />
            <Menu.Item
              onClick={() => {
                disconnect();
              }}
              color="red"
              icon={<ArrowBarToRight size={14} />}
            >
              Disconnect Wallet
            </Menu.Item>
          </Menu>
        </>
      )}
      {(error?.name?.includes("UnsupportedChainIdError") || activeSwitch) && (
        <>
          <Button
            leftIcon={<SwitchVertical />}
            uppercase
            variant="outline"
            color="yellow"
            onClick={switchNetwork}
          >
            Switch Network
          </Button>
        </>
      )}
      <Select
        style={{ maxWidth: "140px" }}
        placeholder="Select Network"
        ref={select}
        value={selectChainId}
        searchable
        nothingFound="No network"
        onChange={setSelectChainId}
        //disabled={!error?.name.includes("UnsupportedChainIdError")}
        data={[
          { value: "1", label: "Ethereum", group: "Mainnet" },
          { value: "137", label: "Polygon", group: "Mainnet" },
          { value: "4", label: "Rinkeby", group: "Testnet" },
          { value: "80001", label: "Mumbai", group: "Testnet" },
          { value: "31337", label: "Hardhat", group: "Local" },
        ]}
      />
    </div>
  );
}

export default InjectedWalletConnection;
