import { BUNDLER, MOCKED_PIN } from "@/src/shared/config/env";
import wira from "wira-sdk";
import { VCData } from "./types";

const CRED_TYPE = "PersonCredential";
const CRED_EXP_DAYS = "365";

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
