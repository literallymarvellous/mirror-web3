import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  const Blog = await ethers.getContractFactory("Blog");
  const blog = await Blog.deploy("Ahiara's blog");

  await blog.deployed();
  const deployerAddress = await blog.signer.getAddress();

  console.log("Blog deployed to: ", blog.address);
  console.log("Deployer address: ", deployerAddress);

  /* this code writes the contract addresses to a local */
  /* file named config.js that we can use in the app */
  fs.writeFileSync(
    "./src/config.ts",
    `
  export const contractAddress = "${blog.address}"
  export const ownerAddress = "${deployerAddress}"
  `
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
