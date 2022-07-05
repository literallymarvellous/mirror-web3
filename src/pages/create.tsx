import dynamic from "next/dynamic";
import { Suspense, useCallback, useState } from "react";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
  suspense: true,
});
import "easymde/dist/easymde.min.css";

const initialState = { title: "", content: "" };

const CreatePost = () => {
  const [post, setPost] = useState(initialState);
  const [image, setImage] = useState<string | null>(null);

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
      <Suspense fallback={`loading...`}>
        <SimpleMDE
          className="w-full"
          placeholder="What's on your mind?"
          value={post.content}
          onChange={editorChange}
        />
      </Suspense>
    </div>
  );
};

export default CreatePost;
