//SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/**
 * @title Blog
 * @author Ahiara Ikechukwu
 * @notice An example of a blog contract
 */
contract Blog {
    uint256 private counter;
    string public name;
    address public owner;

    struct Post {
        uint256 id;
        string title;
        string content;
        bool published;
    }

    /** 
      @notice creates lookups for posts by id and hash
      */
    mapping(uint256 => Post) public idToPost;
    mapping(string => Post) public hashToPost;

    /* EVENTS */
    event PostCreated(uint256 indexed postId, string title, string hash);
    event PostUpdated(
        uint256 indexed postId,
        string title,
        string hash,
        bool published
    );

    /**
     * @notice deploys blog contract and sets deployer as owner
     * @param _name The name of the blog
     */
    constructor(string memory _name) {
        name = _name;
        owner = msg.sender;
    }

    /**
     * @notice updates the name of the blog
     * @param _name name of the blog
     */
    function updateName(string memory _name) public onlyOwner {
        name = _name;
    }

    /**
     * @notice transfers ownership to a new acccount
     * @param _newOwner The new owner of the blog
     */
    function transferOwnership(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    /**
     * @notice creates a new post
     * @param title The title of the post
     * @param hash The hash of the post content
     */
    function createPost(string memory title, string memory hash)
        public
        onlyOwner
    {
        uint256 postId = ++counter;
        Post storage post = idToPost[postId];
        post.id = postId;
        post.title = title;
        post.published = true;
        post.content = hash;
        hashToPost[hash] = post;
        emit PostCreated(postId, title, hash);
    }

    /**
     *  @notice returns the post with the given hash
     *  @param hash The hash of the post content
     */
    function fetchPost(string memory hash) public view returns (Post memory) {
        return hashToPost[hash];
    }

    /**
     *  @notice returns the post with the given id
     *  @param postId The id of the post
     *  @param title The title of the post
     *  @param hash The hash of the post content
     */
    function updatePost(
        uint256 postId,
        string memory title,
        string memory hash,
        bool published
    ) public onlyOwner {
        Post storage post = idToPost[postId];
        post.title = title;
        post.published = published;
        post.content = hash;
        idToPost[postId] = post;
        hashToPost[hash] = post;
        emit PostUpdated(post.id, title, hash, published);
    }

    /**
     *  @notice returns all posts
     */
    function fetchPosts() public view returns (Post[] memory) {
        uint256 itemCount = counter;

        Post[] memory posts = new Post[](itemCount);
        for (uint256 i = 1; i < itemCount; ) {
            Post storage currentItem = idToPost[i];
            posts[i] = currentItem;

            unchecked {
                i++;
            }
        }
        return posts;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}
