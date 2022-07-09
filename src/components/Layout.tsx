import Link from "next/link";
import { useAccount } from "wagmi";
import { ownerAddress } from "../config";

const Layout = ({ children }) => {
  const { isConnected, address } = useAccount();
  return (
    <div>
      <nav className="">
        <div className="px-4 py-3 flex items-center gap-8 ">
          <Link href="/">
            <a>
              <img src="/logo.svg" alt="React Logo" style={{ width: "50px" }} />
            </a>
          </Link>
          <Link href="/">
            <a>
              <div>
                <h2 className="font-bold text-3xl">Mirror</h2>
                <p className="font-bold text-xl">Web3</p>
              </div>
            </a>
          </Link>

          <div className="ml-auto">{children}</div>
        </div>
        <div className="bg-slate-200 px-4 py-5 flex gap-6">
          <Link href="/">
            <a className="font-bold text-xl">Home</a>
          </Link>
          {
            /* if the signed in user is the contract owner, we */
            /* show the nav link to create a new post */
            isConnected && address === ownerAddress && (
              <Link href="/posts/create">
                <a className="font-bold text-xl">Create Post</a>
              </Link>
            )
          }
        </div>
      </nav>
    </div>
  );
};

export default Layout;
