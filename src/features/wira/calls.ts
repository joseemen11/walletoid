import { encodeFunctionData } from "viem";
import traceContractAbi from "./traceAbi.json";

const traceContractAddress = "0x1c54EB3Bb229fa9aFa7891De91a955d22E2AC48E";

export function addTrace(contentHash: string, signature: string) {
  return {
    to: traceContractAddress,
    value: BigInt(0),
    data: encodeFunctionData({
      abi: traceContractAbi,
      functionName: 'addTraceEntry',
      args: [contentHash, signature]
    })
  }
}