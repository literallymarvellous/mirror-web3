import { ethers } from "ethers";
import { contractAddress, ownerAddress } from "../../config";
import blogABI from "../../../artifacts/contracts/Blog.sol/Blog.json";
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Image from "next/image";
import { ParsedUrlQuery } from "querystring";
import { useAccount } from "wagmi";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export const ipfsURI = "https://ipfs.io/ipfs/";

export interface IParams extends ParsedUrlQuery {
  slug: string;
}

type Post = {
  title: string;
  content: string;
  coverImage?: string;
};

const Post: NextPage<{ post: Post }> = ({ post }) => {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const { slug } = router.query as IParams;

  return (
    <div className="max-w-5xl mx-auto mt-4">
      {
        /* if the owner is the user, render an edit button */
        isConnected && address === ownerAddress && (
          <Link href={`/edit/${slug}`}>
            <a className="mb-4">
              {" "}
              <button className="border rounded-lg border-gray-200 mr-6 px-6 py-2 shadow-lg">
                Edit post
              </button>
            </a>
          </Link>
        )
      }
      {post && (
        <div className="">
          {
            /* if the post has a cover image, render it */
            post?.coverImage && (
              <div className="relative w-full h-96">
                <Image
                  src={post.coverImage}
                  layout="fill"
                  objectFit="cover"
                  alt="post's cover image"
                  priority
                />
              </div>
            )
          }
          <h1 className="font-bold text-4xl">{post.title}</h1>
          <div className="mt-4">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
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

  const paths = data.map((post) => ({
    params: { slug: post[2] },
  }));
  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as IParams;

  const ipfsUrl = `${ipfsURI}/${slug}`;
  const post = await fetch(ipfsUrl).then((res) => res.json());

  if (post.coverImage) {
    post.coverImage = `${ipfsURI}${post.coverImage}`;
  }

  return {
    props: {
      post,
    },
  };
};

export default Post;
