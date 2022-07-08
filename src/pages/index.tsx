import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import blogABI from "../../artifacts/contracts/Blog.sol/Blog.json";
import { contractAddress, ownerAddress } from "../config";
import { ethers, BigNumber } from "ethers";

type Posts = [BigNumber, string, string, boolean][];

const Home: NextPage<{ posts: Posts }> = ({ posts }) => {
  const router = useRouter();

  const { isConnected, address } = useAccount();

  const handleClick = async () => {
    router.push("/posts/create");
  };

  return (
    <div className="">
      <Head>
        <title>Web3 Mirror</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="text-3xl font-bold">Mirror</div>

      <div>
        {posts?.map((post, i) => (
          <Link key={i} href={`/posts/${post[2]}`}>
            <a>
              <p>{post[1]}</p>
            </a>
          </Link>
        ))}
      </div>

      <div>
        {isConnected && address === ownerAddress ? (
          <button className="flex items-center" onClick={handleClick}>
            <span>Create post</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  let provider: ethers.providers.JsonRpcProvider;
  if (process.env.ENVIRONMENT === "local") {
    provider = new ethers.providers.JsonRpcProvider();
  } else if (process.env.ENVIRONMENT === "testnet") {
    provider = new ethers.providers.JsonRpcProvider(
      "https://polygon-mumbai.infura.io/v3/e5f57e3684bf43068b71f7a25887cd46"
    );
  } else {
    provider = new ethers.providers.JsonRpcProvider(
      "https://mainnet.infura.io/v3/e5f57e3684bf43068b71f7a25887cd46"
    );
  }

  const contract = new ethers.Contract(contractAddress, blogABI.abi, provider);
  const data = await contract.fetchPosts();
  const posts: Posts = JSON.parse(JSON.stringify(data));

  return {
    props: {
      posts,
    },
  };
};

export default Home;
