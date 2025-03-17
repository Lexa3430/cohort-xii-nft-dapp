import { useCallback } from "react";
import { useAccount, useChainId, useConfig } from "wagmi";
import { Contract } from "ethers";
import NFT_ABI from "../ABI/nft.json";
import { getEthersSigner } from "../config/wallet-connection/adapter";
import { isSupportedNetwork } from "../utils";

const useTransferToken = () => {
    const { address } = useAccount();
    const chainId = useChainId();
    const wagmiConfig = useConfig();

    return useCallback(
        async (tokenId, toAddress) => {
            if (!address) return alert("Please connect your wallet");
            if (!isSupportedNetwork(chainId)) return alert("Unsupported network");
            if (!toAddress || !/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
                return alert("Please enter a valid Ethereum address");
            }

            const signer = await getEthersSigner(wagmiConfig);
            const contract = new Contract(
                import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
                NFT_ABI,
                signer
            );

            try {
                // Use safeTransferFrom for safety (checks if recipient can receive NFTs)
                const tx = await contract.safeTransferFrom(address, toAddress, tokenId);
                const receipt = await tx.wait();

                if (receipt.status === 0) {
                    throw new Error("Transfer failed");
                }

                alert(`Token ${tokenId} transferred successfully to ${toAddress}`);
                return true; // Indicate success
            } catch (error) {
                console.error("Transfer error:", error);
                alert("Failed to transfer token: " + error.message);
                return false;
            }
        },
        [address, chainId, wagmiConfig]
    );
};

export default useTransferToken;