import dynamic from "next/dynamic";
import { Suspense, useCallback, useRef, useState } from "react";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  suspense: true,
});
import Image from "next/image";
import "easymde/dist/easymde.min.css";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { create } from "ipfs-http-client";
import { useAccount, useContractWrite, useNetwork, useSigner } from "wagmi";
import { contractAddress } from "../../config";
import blogABI from "../../../artifacts/contracts/Blog.sol/Blog.json";

const client = create({ url: "https://ipfs.infura.io:5001/api/v0" });

const CreatePost: NextPage = () => {
  const router = useRouter();
  const [post, setPost] = useState({
    title: "",
    content: "",
    hash: "",
  });
  const [image, setImage] = useState<File>();
  const [error, setError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null!);

  const { title, content, hash } = post;
  const { isConnected } = useAccount();

  const { data, write, writeAsync } = useContractWrite({
    addressOrName: contractAddress,
    contractInterface: blogABI.abi,
    functionName: "createPost",
    onSuccess() {
      router.push("/");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPost((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const editorChange = useCallback((value: string) => {
    setPost((p) => ({ ...p, content: value }));
  }, []);

  const createNewPost = async () => {
    if (!isConnected) {
      setError("Not connected");
      return;
    }
    if (!title || !content) return;

    const hash = await savePostToIpfs();
    if (hash) {
      setPost((p) => ({ ...p, hash }));
      write({
        args: [title, hash],
      });
    } else {
      throw new Error("No hash");
    }
  };

  const savePostToIpfs = async () => {
    try {
      const added = await client.add(JSON.stringify(post));
      return added.path;
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const added = await client.add(file);
    setPost((p) => ({ ...p, coverImage: added.path }));
    setImage(file);
  };

  const triggerOnChange = () => {
    fileRef.current.click();
  };

  return (
    <div>
      {error && (
        <div className="fixed bg-slate-600 z-10 top-5 left-5">{error}</div>
      )}

      {image && (
        <div className="w-full h-96 relative">
          <Image
            src={URL.createObjectURL(image)}
            layout="fill"
            objectFit="cover"
            alt={image.name}
          />
        </div>
      )}

      <input
        className=" w-1/2 border border-gray-600 p-5 mt-10"
        type="text"
        name="title"
        placeholder="Add Title..."
        value={post.title}
        onChange={handleChange}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <SimpleMDE
          className="w-full"
          placeholder="What's on your mind?"
          value={post.content}
          onChange={editorChange}
        />
      </Suspense>
      <button type="button" onClick={createNewPost}>
        Publish
      </button>
      <input
        className="hidden"
        ref={fileRef}
        id="image"
        type="file"
        onChange={handleFileChange}
        accept="image/*"
      />
      <button onClick={triggerOnChange}>Add cover image</button>
    </div>
  );
};

export default CreatePost;
