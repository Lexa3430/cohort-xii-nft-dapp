import React, { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { Contract } from "ethers";
import NFT_ABI from "../../ABI/nft.json";
import { getEthersProvider } from "../../config/wallet-connection/adapter";
import OwnedNFTCard from "../OwnedNFTCard";
import { useAppContext } from "../../contexts/appContext";
import { JsonRpcProvider } from "ethers";

const OwnedNFTs = () => {
    const { address } = useAccount();
    const { tokenMetaData, baseTokenURI, nextTokenId } = useAppContext();
    const [ownedTokens, setOwnedTokens] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOwnedTokens = useCallback(async () => {
        if (!address) {
            setOwnedTokens([]);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        let provider = getEthersProvider();
        if (!provider) {
            console.warn("getEthersProvider returned no provider, using fallback.");
            provider = new JsonRpcProvider("https://rpc.sepolia-api.lisk.com");
        }

        try {
            const network = await provider.getNetwork();
            console.log("Connected to network:", network);
            if (network.chainId !== 4202) {
                throw new Error("Connected to wrong network. Expected Lisk Sepolia (chain ID 4202).");
            }
        } catch (err) {
            console.error("Provider connection failed:", err);
            setError("Cannot connect to Lisk Sepolia network. Please check your RPC configuration.");
            setLoading(false);
            return;
        }

        const contract = new Contract(
            import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
            NFT_ABI,
            provider
        );

        try {
            const balance = await contract.balanceOf(address);
            const balanceNum = Number(balance);

            if (balanceNum === 0) {
                setOwnedTokens([]);
                return;
            }

            const tokenIds = [];
            for (let i = 0; i < balanceNum; i++) {
                const tokenId = await contract.tokenOfOwnerByIndex(address, i);
                tokenIds.push(Number(tokenId));
            }

            const ownedNFTs = tokenIds.map((tokenId) => {
                const metadata = tokenMetaData.get(tokenId);
                if (!metadata) {
                    console.warn(`No metadata for tokenId ${tokenId}. Using fallback.`);
                }
                return {
                    tokenId,
                    metadata: metadata || {
                        name: `Token #${tokenId}`,
                        description: "Metadata not available",
                        image: "",
                        attributes: [],
                    },
                };
            });

            setOwnedTokens(ownedNFTs);
        } catch (error) {
            console.error("Error fetching owned tokens:", error);
            setError("Failed to fetch owned NFTs. Check contract address or network status.");
        } finally {
            setLoading(false);
        }
    }, [address, tokenMetaData]);

    useEffect(() => {
        fetchOwnedTokens();
    }, [fetchOwnedTokens, refreshKey, nextTokenId]);

    const handleTransfer = (transferredTokenId) => {
        console.log("Transferring token:", transferredTokenId);
        setRefreshKey((prev) => prev + 1);
    };

    useEffect(() => {
        console.log("Context values:", { tokenMetaData, baseTokenURI, nextTokenId });
    }, [tokenMetaData, baseTokenURI, nextTokenId]);

    return (
        <section className="space-y-8 animate-slide-up">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-indigo-600">
                My Owned NFTs
            </h1>
            {loading && (
                <div className="flex justify-center items-center">
                    <svg
                        className="animate-spin h-8 w-8 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                        />
                    </svg>
                </div>
            )}
            {error && (
                <p className="text-center text-red-500 bg-red-100 p-4 rounded-lg shadow-md">
                    {error}
                </p>
            )}
            {!loading && !error && address ? (
                ownedTokens.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {ownedTokens.map((nft) => (
                            <OwnedNFTCard
                                key={nft.tokenId}
                                metadata={nft.metadata}
                                tokenId={nft.tokenId}
                                onTransfer={handleTransfer}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                        <p className="text-gray-600 text-lg">
                            You don’t own any NFTs yet. Start minting now!
                        </p>
                        <button
                            onClick={() => document.querySelector('button[onClick*=mint]').click()}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                        >
                            Go to Mint
                        </button>
                    </div>
                )
            ) : !loading && !error ? (
                <div className="bg-white p-6 rounded-xl shadow-md text-center">
                    <p className="text-gray-600 text-lg">
                        Please connect your wallet to view your owned NFTs.
                    </p>
                </div>
            ) : null}
        </section>
    );
};

export default OwnedNFTs;