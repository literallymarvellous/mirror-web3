import { expect } from "chai";
import { ethers } from "hardhat";

describe("Blog", async function () {
  it("Should create a post", async function () {
    const Blog = await ethers.getContractFactory("Blog");
    const blog = await Blog.deploy("My blog");
    await blog.deployed();
    await blog.createPost("My first post", "12345");

    const post = await blog.fetchPost("12345");
    expect(post.title).to.equal("My first post");
  });

  it("Should edit a post", async function () {
    const Blog = await ethers.getContractFactory("Blog");
    const blog = await Blog.deploy("My blog");
    await blog.deployed();
    await blog.createPost("My Second post", "12345");

    await blog.updatePost(1, "My updated post", "23456", true);

    let post = await blog.fetchPost("23456");
    expect(post.title).to.equal("My updated post");
  });

  it("Should add update the name", async function () {
    const Blog = await ethers.getContractFactory("Blog");
    const blog = await Blog.deploy("My blog");
    await blog.deployed();

    expect(await blog.name()).to.equal("My blog");
    await blog.updateName("My new blog");
    expect(await blog.name()).to.equal("My new blog");
  });

  it("should fetch all posts", async function () {
    const Blog = await ethers.getContractFactory("Blog");
    const blog = await Blog.deploy("My blog");
    await blog.deployed();
    await blog.createPost("My first post", "12345");
    await blog.createPost("My second post", "23456");

    const posts = await blog.fetchPosts();
    console.log(posts);
    expect(posts.length).to.equal(2);
  });
});
