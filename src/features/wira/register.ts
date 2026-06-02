import wira from "wira-sdk";
import { VCData } from "./types";

const CRED_TYPE = "PersonCredential";
const CRED_EXP_DAYS = "365";
export const BUNDLER = "https://api.developer.coinbase.com/rpc/v1/base-sepolia/5U3OoHin1u7YPnTRA0D9YpjY60gBCBHR";
export const MOCKED_PIN = "1234";
export const GATEWAY_BASE = "https://gateway.wirawallet.com/api";
export const CIRCUITS_URL = "https://gateway.wirawallet.com/circuits/keys.zip";

export async function initRegister(data: VCData) {
	try {
		const registerer = new wira.Registerer(
			"",
			"",
			BUNDLER
		);

		await registerer.createVC(
			"base-sepolia",
			data,
			CRED_TYPE,
			CRED_EXP_DAYS
		);

		registerer.dni = data.nationalIdNumber;
		await registerer.storeOnDevice(MOCKED_PIN, false);
	} catch (err: any) {
		let errMessage = 'Error registering account: ' + (err?.message || 'unknown error');
		throw new Error(errMessage);
	}
};