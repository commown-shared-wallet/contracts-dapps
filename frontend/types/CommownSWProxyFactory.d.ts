/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface CommownSWProxyFactoryInterface extends ethers.utils.Interface {
  functions: {
    "commownProxiesPerUser(address,uint256)": FunctionFragment;
    "createProxy(address[],uint8)": FunctionFragment;
    "logic()": FunctionFragment;
    "nbProxiesPerUser(address)": FunctionFragment;
    "proxiesList(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "commownProxiesPerUser",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "createProxy",
    values: [string[], BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "logic", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "nbProxiesPerUser",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "proxiesList",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "commownProxiesPerUser",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "createProxy",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "logic", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "nbProxiesPerUser",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "proxiesList",
    data: BytesLike
  ): Result;

  events: {
    "ProxyCreated(address,address[])": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ProxyCreated"): EventFragment;
}

export type ProxyCreatedEvent = TypedEvent<
  [string, string[]] & { adrs: string; owners: string[] }
>;

export class CommownSWProxyFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: CommownSWProxyFactoryInterface;

  functions: {
    commownProxiesPerUser(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;

    createProxy(
      _owners: string[],
      _confirmationNeeded: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    logic(overrides?: CallOverrides): Promise<[string]>;

    nbProxiesPerUser(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    proxiesList(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  commownProxiesPerUser(
    arg0: string,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  createProxy(
    _owners: string[],
    _confirmationNeeded: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  logic(overrides?: CallOverrides): Promise<string>;

  nbProxiesPerUser(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  proxiesList(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;

  callStatic: {
    commownProxiesPerUser(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    createProxy(
      _owners: string[],
      _confirmationNeeded: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    logic(overrides?: CallOverrides): Promise<string>;

    nbProxiesPerUser(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    proxiesList(arg0: BigNumberish, overrides?: CallOverrides): Promise<string>;
  };

  filters: {
    "ProxyCreated(address,address[])"(
      adrs?: string | null,
      owners?: null
    ): TypedEventFilter<[string, string[]], { adrs: string; owners: string[] }>;

    ProxyCreated(
      adrs?: string | null,
      owners?: null
    ): TypedEventFilter<[string, string[]], { adrs: string; owners: string[] }>;
  };

  estimateGas: {
    commownProxiesPerUser(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    createProxy(
      _owners: string[],
      _confirmationNeeded: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    logic(overrides?: CallOverrides): Promise<BigNumber>;

    nbProxiesPerUser(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    proxiesList(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    commownProxiesPerUser(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    createProxy(
      _owners: string[],
      _confirmationNeeded: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    logic(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    nbProxiesPerUser(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    proxiesList(
      arg0: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}