import Header from "./components/Header";
import Footer from "./components/Footer";
import { useAppContext } from "./contexts/appContext";
import NFTCard from "./components/NFTCard";
import OwnedNFTs from "./components/OwnedNFTs";
import useMintToken from "./hooks/useMintToken";
import React, { useState } from "react";

function App() {
    const { nextTokenId, tokenMetaData, mintPrice } = useAppContext();
    const tokenMetaDataArray = Array.from(tokenMetaData.values());
    const mintToken = useMintToken();
    const [activeTab, setActiveTab] = useState("mint");

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <section className="text-center mb-12 animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-600 tracking-tight">
                        NFT Marketplace
                    </h1>
                    <p className="mt-2 text-lg sm:text-xl text-gray-600">
                        Mint, manage, and explore exclusive digital assets
                    </p>
                </section>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex rounded-lg shadow-md bg-white p-1 border border-gray-200">
                        <button
                            onClick={() => setActiveTab("mint")}
                            className={`px-6 py-3 text-sm sm:text-base font-medium rounded-md transition-all duration-200 ${
                                activeTab === "mint"
                                    ? "bg-indigo-600 text-white shadow-inner"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            Mint NFTs
                        </button>
                        <button
                            onClick={() => setActiveTab("owned")}
                            className={`px-6 py-3 text-sm sm:text-base font-medium rounded-md transition-all duration-200 ${
                                activeTab === "owned"
                                    ? "bg-indigo-600 text-white shadow-inner"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            My NFTs
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "mint" ? (
                    <div className="space-y-12 animate-slide-up">
                        {/* Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    title: "Mint NFT",
                                    desc: "Create your unique NFT and share it with the world.",
                                },
                                {
                                    title: "Manage NFTs",
                                    desc: "View and organize your NFT collection effortlessly.",
                                },
                                {
                                    title: "Marketplace",
                                    desc: "Buy and sell NFTs in our vibrant marketplace.",
                                },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-indigo-500"
                                >
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {item.title}
                                    </h2>
                                    <p className="mt-2 text-gray-600">{item.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* NFT Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {tokenMetaDataArray.map((token, i) => (
                                <NFTCard
                                    key={token.name.split(" ").join("")}
                                    metadata={token}
                                    mintPrice={mintPrice}
                                    tokenId={i}
                                    nextTokenId={nextTokenId}
                                    mintNFT={mintToken}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <OwnedNFTs />
                )}
            </main>
            <Footer />
        </div>
    );
}

export default App;