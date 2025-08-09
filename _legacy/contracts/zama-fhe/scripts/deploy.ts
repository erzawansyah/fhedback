import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Memulai proses deployment...\n");

  // Mendapatkan deployer account
  const [deployer] = await ethers.getSigners();
  console.log("👤 Deployer account:", deployer.address);

  // Mengecek balance
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEther = ethers.formatEther(balance);
  console.log("💰 Saldo account:", balanceInEther, "ETH");

  // Validasi balance minimum
  if (parseFloat(balanceInEther) < 0.01) {
    console.log(
      "⚠️  Peringatan: Saldo ETH rendah, pastikan cukup untuk gas fees"
    );
  }

  console.log("\n📦 Mempersiapkan deployment MyContract...");

  try {
    // Deploy contract
    const MyContract = await ethers.getContractFactory("MyContract");
    console.log("🔧 Factory contract berhasil dibuat");

    console.log("⏳ Melakukan deployment dengan parameter: 'Hello, Sepolia!'");
    const myContract = await MyContract.deploy("Hello, Sepolia!");

    console.log("🔄 Menunggu konfirmasi deployment...");
    await myContract.waitForDeployment();

    const address = await myContract.getAddress();
    const deploymentTx = myContract.deploymentTransaction();

    console.log("\n✅ DEPLOYMENT BERHASIL!");
    console.log("📍 Contract Address:", address);
    console.log("🧾 Transaction Hash:", deploymentTx?.hash);

    // Informasi tambahan tentang gas
    if (deploymentTx) {
      console.log("⛽ Gas Used:", deploymentTx.gasLimit?.toString());
      console.log(
        "💸 Gas Price:",
        ethers.formatUnits(deploymentTx.gasPrice || 0, "gwei"),
        "gwei"
      );
    }

    // Verifikasi deployment
    console.log("\n🔍 Melakukan verifikasi deployment...");
    const deployedCode = await ethers.provider.getCode(address);

    if (deployedCode === "0x") {
      console.log("❌ Error: Contract tidak ter-deploy dengan benar");
    } else {
      console.log("✅ Contract berhasil di-deploy dan terverifikasi");
      console.log("📏 Ukuran bytecode:", deployedCode.length / 2 - 1, "bytes");
    }

    // Menampilkan network info
    const network = await ethers.provider.getNetwork();
    console.log("\n🌐 Network Info:");
    console.log("   - Chain ID:", network.chainId.toString());
    console.log("   - Network Name:", network.name);

    // Estimasi biaya deployment
    const gasUsed = deploymentTx?.gasLimit || 0n;
    const gasPrice = deploymentTx?.gasPrice || 0n;
    const deploymentCost = gasUsed * gasPrice;

    console.log("\n💰 Biaya Deployment:");
    console.log("   - Gas Used:", gasUsed.toString());
    console.log("   - Total Cost:", ethers.formatEther(deploymentCost), "ETH");

    // Saldo setelah deployment
    const newBalance = await ethers.provider.getBalance(deployer.address);
    console.log("   - Saldo tersisa:", ethers.formatEther(newBalance), "ETH");

    console.log("\n🎉 Deployment selesai! Contract siap digunakan.");
    console.log(
      "🔗 Anda dapat melihat contract di block explorer dengan address:",
      address
    );
  } catch (error) {
    console.error("\n❌ DEPLOYMENT GAGAL!");
    if (error instanceof Error) {
      console.error("💥 Error details:", error.message);
    } else {
      console.error("💥 Error details:", error);
    }

    if (typeof error === "object" && error !== null && "code" in error) {
      // @ts-ignore
      if (error.code === "INSUFFICIENT_FUNDS") {
        console.error("💸 Saldo tidak mencukupi untuk gas fees");
        // @ts-ignore
      } else if (error.code === "NETWORK_ERROR") {
        console.error("🌐 Masalah koneksi network");
        // @ts-ignore
      } else if (error.code === "CONTRACT_ERROR") {
        console.error("📝 Error dalam contract code");
      }
    }

    throw error;
  }
}

// Fungsi untuk menangani shutdown yang bersih
function handleExit(code: number) {
  if (code === 0) {
    console.log("\n🏁 Script berhasil dijalankan!");
  } else {
    console.log("\n💥 Script dihentikan dengan error code:", code);
  }
}

main()
  .then(() => {
    handleExit(0);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n🚨 Fatal Error:", error);
    handleExit(1);
    process.exit(1);
  });
