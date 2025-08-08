import { vars } from "hardhat/config";

async function main() {
  console.log("=== Checking Environment Variables ===");

  try {
    const mnemonic = vars.get("MNEMONIC", "");
    const infuraKey = vars.get("INFURA_API_KEY", "");
    const etherscanKey = vars.get("ETHERSCAN_API_KEY", "");

    console.log(
      "✅ MNEMONIC:",
      mnemonic
        ? "✓ Set (length: " + mnemonic.split(" ").length + " words)"
        : "❌ Not set",
    );
    console.log("✅ INFURA_API_KEY:", infuraKey ? "✓ Set" : "❌ Not set");
    console.log("✅ ETHERSCAN_API_KEY:", etherscanKey ? "✓ Set" : "❌ Not set");

    if (!mnemonic || !infuraKey || !etherscanKey) {
      console.log("\n❌ Some environment variables are missing!");
      console.log("Please run: npm run setup:env");
      console.log(
        "Or setup manually with: npx hardhat vars set <VARIABLE_NAME> <value>",
      );
    } else {
      console.log("\n✅ All environment variables are set!");
      console.log("Ready for deployment to Sepolia.");
    }
  } catch (error) {
    console.error("Error checking environment variables:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
