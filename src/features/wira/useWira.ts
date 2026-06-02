import { GATEWAY_BASE, MOCKED_PIN } from "@/src/shared/config/env";
import { useCallback, useEffect } from "react";
import wira from "wira-sdk";
import { executeOperation } from "./account";
import { initRegister } from "./register";
import { VCData } from "./types";

export function useWira() {
	useEffect(() => {
		wira.provision.ensureProvisioned({
			mock: true,
			gatewayBase: GATEWAY_BASE
		}).catch((error) => {
			console.error("Error provisioning Wira SDK:", error);
		});
	}, []);

	const getUserData = async () => {
		const hasData = await wira.Storage.checkUserData()
		if (!hasData) return;

		const value = await wira.signIn(MOCKED_PIN)
		return value;
	};

	const initWira = useCallback(async () => {
		try {
			await wira.initWiraSdk({ appId: 'identitypoc', guardiansUrl: "" });
		} catch (error: any) {
			if (!error.message.includes("Type FilterMapper is already registered")) {
				throw error;
			}
		}
	}, []);

	const register = useCallback(async (data: VCData) => {
		const hasData = await wira.Storage.checkUserData()
		if (hasData) return;

		await initRegister(data);
	}, []);

	const sendTransaction = useCallback(async (callData: any) => {
		const userData = await getUserData();
		if (!userData) {
			throw new Error("User data not found. Please register first.");
		}

		await executeOperation(
			userData.privKey,
			callData
		)
	}, []);

	return {
		initWira,
		register,
		sendTransaction,
		getUserData,
	}
}