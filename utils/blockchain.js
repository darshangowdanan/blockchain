import { ethers } from 'ethers';
// Ensure this path matches where your artifacts folder is located
import AdvancedTransitABI from '../artifacts/contracts/AdvancedTransit.sol/AdvancedTransit.json';

// ----------------------------------------------------------------
// 1. CONFIGURATION
// ----------------------------------------------------------------

// REPLACE THIS with the address you got from your deploy script terminal
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

// ----------------------------------------------------------------
// 2. HELPER FUNCTIONS
// ----------------------------------------------------------------

const getContract = async (signer) => {
    return new ethers.Contract(contractAddress, AdvancedTransitABI.abi, signer);
};

export const connectWallet = async () => {
    if (!window.ethereum) throw new Error("Please install MetaMask extension");
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
};

// ----------------------------------------------------------------
// 3. CORE FUNCTIONS
// ----------------------------------------------------------------

export const buyTicket = async (pathArray, price) => {
    try {
        const { signer } = await connectWallet();
        const contract = await getContract(signer);

        const tx = await contract.buyTicket(pathArray, {
            value: ethers.parseEther(price)
        });
        
        console.log("Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        return receipt;
    } catch (error) {
        console.error("Booking Error:", error);
        throw error;
    }
};

export const scanTicket = async (ticketId, currentStop) => {
    try {
        const { signer } = await connectWallet();
        const contract = await getContract(signer);

        const tx = await contract.scanTicket(ticketId, currentStop);
        return await tx.wait();
    } catch (error) {
        console.error("Scanning Error:", error);
        throw error;
    }
};

export const getMyValidTickets = async () => {
    try {
        const { signer } = await connectWallet();
        const userAddress = await signer.getAddress();
        const contract = await getContract(signer);

        const tickets = await contract.getMyValidTickets(userAddress);
        
        return tickets.map(t => ({
            id: t.ticketId.toString(),
            owner: t.owner,
            isActive: t.isActive,
            activationTime: t.isActive 
                ? new Date(Number(t.activationTime) * 1000).toLocaleTimeString() 
                : "Not Scanned Yet",
            allowedPath: t.allowedPath,
            scannedStops: t.scannedStops
        }));
    } catch (error) {
        console.error("Fetch Error:", error);
        return [];
    }
};