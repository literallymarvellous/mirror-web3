import dynamic from "next/dynamic";
import { Suspense, useCallback, useState } from "react";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});
import "easymde/dist/easymde.min.css";
import { NextPage } from "next";

const CreatePost: NextPage = () => {
  const [post, setPost] = useState({
    title: "",
    content: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPost((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const editorChange = useCallback((value: string) => {
    setPost((p) => ({ ...p, content: value }));
  }, []);

  return (
    <div>
      <input
        type="text"
        name="title"
        value={post.title}
        onChange={handleChange}
      />
      <SimpleMDE
        className="w-full"
        placeholder="What's on your mind?"
        value={post.content}
        onChange={editorChange}
      />
    </div>
  );
};

export default CreatePost;
