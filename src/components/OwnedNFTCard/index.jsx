import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { truncateString } from "../../utils";
import useTransferToken from "../../hooks/useTransferToken";

const OwnedNFTCard = ({ metadata, tokenId, onTransfer }) => {
    const [recipientAddress, setRecipientAddress] = useState("");
    const transferToken = useTransferToken();

    const handleTransfer = async () => {
        const success = await transferToken(tokenId, recipientAddress);
        if (success) {
            setRecipientAddress(""); // Clear input after successful transfer
            if (onTransfer) onTransfer(tokenId); // Notify parent to refresh owned tokens
        }
    };

    return (
        <div className="w-full space-y-4 rounded-xl bg-secondary shadow-sm border border-primary p-2">
            <img
                src={metadata.image}
                alt={`${metadata.name} image`}
                className="rounded-xl w-full h-64"
            />
            <h1 className="font-bold">{metadata.name}</h1>
            <p className="text-sm">{truncateString(metadata.description, 100)}</p>
            <div className="flex gap-2">
                <Icon icon="ri:file-list-3-line" className="w-6 h-6" />
                <span>{metadata.attributes.length} Attributes</span>
            </div>
            <div className="flex gap-2">
                <Icon icon="ri:token-swap-line" className="w-6 h-6" />
                <span>Token ID: {tokenId}</span>
            </div>
            <div className="space-y-2">
                <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Enter recipient address (0x...)"
                    className="w-full p-2 border border-primary rounded-md text-sm"
                />
                <button
                    onClick={handleTransfer}
                    className="w-full p-2 bg-primary/80 text-secondary font-bold rounded-md hover:bg-primary"
                >
                    Transfer NFT
                </button>
            </div>
        </div>
    );
};

export default OwnedNFTCard;