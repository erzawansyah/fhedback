import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyContractModule = buildModule("MyContractModule", (m) => {
  const initialMessage = m.getParameter("message", "Hello, Sepolia!");

  const myContract = m.contract("MyContract", [initialMessage]);

  return { myContract };
});

export default MyContractModule;
