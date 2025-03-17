import { Contract } from "ethers";
import { createContext, useContext, useEffect, useState } from "react";
import { getReadOnlyProvider } from "../utils";
import NFT_ABI from "../ABI/nft.json";

const appContext = createContext();

export const useAppContext = () => {
    const context = useContext(appContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};

export const AppProvider = ({ children }) => {
    const [nextTokenId, setNextTokenId] = useState(null);
    const [maxSupply, setMaxSupply] = useState(null);
    const [baseTokenURI, setBaseTokenURI] = useState("");
    const [tokenMetaData, setTokenMetaData] = useState(new Map());
    const [mintPrice, setMintPrice] = useState(null);

    useEffect(() => {
        const contract = new Contract(
            import.meta.env.VITE_NFT_CONTRACT_ADDRESS,
            NFT_ABI,
            getReadOnlyProvider()
        );
        contract
            .nextTokenId()
            .then((id) => setNextTokenId(id))
            .catch((error) => console.error("error: ", error));

        contract
            .baseTokenURI()
            .then((uri) => setBaseTokenURI(uri))
            .catch((error) => console.error("error: ", error));

        contract
            .maxSupply()
            .then((supply) => setMaxSupply(supply))
            .catch((error) => console.error("error: ", error));

        contract
            .mintPrice()
            .then((price) => setMintPrice(price))
            .catch((error) => console.error("error: ", error));
    }, []);

    useEffect(() => {
        if (!maxSupply || !baseTokenURI) return;

        const tokenIds = [];
        for (let i = 0; i < maxSupply; i++) {
            tokenIds.push(i);
        }

        const promises = tokenIds.map((id) => {
            return fetch(`${baseTokenURI}${id}.json`)
                .then((response) => response.json())
                .then((data) => data)
                .catch((error) => {
                    console.error(`Error fetching metadata for token ${id}:`, error);
                    return null; // Return null for failed fetches
                });
        });

        Promise.all(promises)
            .then((responses) => {
                const tokenMetaData = new Map();
                responses.forEach((response, index) => {
                    if (response) {
                        tokenMetaData.set(index, response);
                    }
                });
                setTokenMetaData(tokenMetaData);
            })
            .catch((error) => console.error("Error setting token metadata:", error));
    }, [baseTokenURI, maxSupply]);

    return (
        <appContext.Provider
            value={{
                nextTokenId,
                setNextTokenId,
                maxSupply,
                baseTokenURI,
                tokenMetaData,
                mintPrice,
            }}
        >
            {children}
        </appContext.Provider>
    );
};