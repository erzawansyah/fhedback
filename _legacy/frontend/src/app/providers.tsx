import Web3Provider from "@/lib/wagmi/providers";

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <Web3Provider>
            {children}
        </Web3Provider>
    );
};

export default Providers;
