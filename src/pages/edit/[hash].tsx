import dynamic from "next/dynamic";
import { Suspense, useCallback, useState } from "react";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import "easymde/dist/easymde.min.css";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { create } from "ipfs-http-client";
import { useAccount, useContractWrite } from "wagmi";
import { contractAddress } from "../../config";
import blogABI from "../../../artifacts/contracts/Blog.sol/Blog.json";
import { ethers } from "ethers";
import { IParams, ipfsURI } from "../posts/[hash]";

const client = create({ url: "https://ipfs.infura.io:5001/api/v0" });

type EditPost = {
  title: string;
  content: string;
  coverImage?: string;
  coverImagePath?;
  id: number;
};

const EditPost: NextPage<{ post: EditPost }> = ({ post }) => {
  const router = useRouter();
  const [postData, setPostData] = useState({
    title: "",
    content: "",
  });
  const [error, setError] = useState<string>();
  const [isEditing, setIsEditing] = useState(false);

  const { isConnected } = useAccount();

  const { write } = useContractWrite({
    addressOrName: contractAddress,
    contractInterface: blogABI.abi,
    functionName: "updatePost",
    onSuccess() {
      router.push("/");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const editorChange = useCallback((value: string) => {
    setPostData((p) => ({ ...p, content: value }));
  }, []);

  const onClick = () => {
    setIsEditing(true);
  };

  const savePostToIpfs = async () => {
    try {
      const added = await client.add(
        JSON.stringify({ ...postData, coverImage: post?.coverImage })
      );
      return added.path;
    } catch (error) {
      console.log(error);
    }
  };

  const updatePost = async () => {
    if (!isConnected) {
      setError("Not connected");
      return;
    }

    const hash = await savePostToIpfs();
    if (hash) {
      write({
        args: [post.id, postData.title, hash, true],
      });
    } else {
      throw new Error("No hash");
    }
  };

  return (
    <div>
      {error && (
        <div className="fixed bg-slate-600 z-10 top-5 left-5">{error}</div>
      )}

      {isEditing && (
        <div>
          <input
            className=" w-1/2 border border-gray-600 p-5 mt-10"
            type="text"
            name="title"
            placeholder="Add Title..."
            value={postData.title}
            onChange={handleChange}
          />
          <SimpleMDE
            className="w-full"
            placeholder="What's on your mind?"
            value={postData.content}
            onChange={editorChange}
          />
          <button type="button" onClick={updatePost}>
            UpdatePost
          </button>
        </div>
      )}

      {!isEditing && (
        <div>
          {
            /* if the post has a cover image, render it */
            post?.coverImage && (
              <div className="relative w-3/4 h-96">
                <Image
                  src={post.coverImagePath}
                  layout="fill"
                  objectFit="cover"
                  alt="post's cover image"
                  priority
                />
              </div>
            )
          }
          <h1>{post.title}</h1>
          <div>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>
      )}

      <button onClick={onClick}>{isEditing ? "View post" : "Edit post"}</button>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { hash } = params as IParams;
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
  const post = await contract.fetchPost(hash);
  const postId = post[0].toNumber();

  const ipfsUrl = `${ipfsURI}${hash}`;
  const data = await fetch(ipfsUrl).then((res) => res.json());

  if (data.coverImage) {
    data.coverImagePath = `${ipfsURI}/${data.coverImage}`;
  }

  data.id = postId;

  return {
    props: {
      post: data,
    },
  };
};

export default EditPost;
