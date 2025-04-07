import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Share2, Image } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import {
  QuerySnapshot,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { UserContext } from "@/context/UserContext";
import { db } from "@/service/firebaseConfig";
import { toast } from "sonner";

// const posts = [
//   {
//     id: 1,
//     user: "John Doe",
//     avatar: "/profilePlaceholder1.png",
//     text: "Had a great time in Bali! 🌴",
//     image: "/japan1.jpg",
//     likes: 12,
//     comments: 4,
//   },
//   {
//     id: 2,
//     user: "Alice Smith",
//     avatar: "/profilePlaceholder1.png",
//     text: "Sunsets at Santorini are magical! ☀️",
//     image: "/japan2.jpg",
//     likes: 34,
//     comments: 8,
//   },
// ];

function Community() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [userData, setUserData] = useState(null);
  //for the current post created by the user
  const [postData, setPostData] = useState({ postText: "", postImage: null });
  //for the posts fetched from the db
  const [posts, setPosts] = useState([]);
  const { localUser } = useContext(UserContext);
  const [likedPosts, setLikedPosts] = useState(new Set());
  //states for comment feature
  const [openComments, setOpenComments] = useState({});
  const [newComments, setNewComments] = useState({});

  //keep user state insync with the localUser
  useEffect(() => {
    if (localUser) {
      setUser(localUser);
      setOpenComments(openComments);
    } else {
      setUser(null);
      setPostData({ postText: "", postImage: null });
      setOpenComments({});
    }
  }, [localUser]);

  //fetch all the posts from the db
  useEffect(() => {
    const postsCollection = collection(db, "posts");
    const postsQuery = query(postsCollection, orderBy("createdAt", "desc")); //order by newest
    const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
    });

    return () => unsubscribe(); //cleanup listener when the component unmounts
  }, []);

  const renameFile = (file) => {
    const extension = file.name.split(".").pop();
    return `${Date.now()}-${Math.random() //Date.now() give the current timestamp in milliseconds since 1970, math.random() generates a random decimal number between 0 to 1, .toString(36) converts this decimal no. to base 36 string(i.e. chars a-z and digits 0-9) and .substring(7) returns the substring of this string starting from the index 7 upto the end of the string
      .toString(36)
      .substring(7)}.${extension}`;
  };

  //uploading the images to cloudinary
  const uploadToCloudinary = async (file) => {
    const renamedFile = new File([file], renameFile(file), { type: file.type });

    const formData = new FormData();
    formData.append("file", renamedFile);
    formData.append("upload_preset", "my_preset"); // Keep using current preset
    formData.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      // console.log(data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      return null;
    }
  };
  // console.log(localUser);

  const updateFirestorePost = async (postData, userId) => {
    try {
      //first we get the logged in user
      const currUserRef = doc(db, "users", userId);
      const userSnap = await getDoc(currUserRef);

      const currUser = userSnap.exists() ? userSnap.data() : null;

      const postRef = await addDoc(collection(db, "posts"), {
        userId,
        name: currUser?.name,
        profileImage: currUser?.profileImage || "/profilePlaceholder1.png",
        postText: postData.postText || "",
        postImage: postData.postImage || "",
        likes: [], //Empty array for likes
        comments: [], //Emtpy array for comments
        createdAt: serverTimestamp(), //Firestore timestamp
      });

      //Add post ID to user's document
      await updateDoc(currUserRef, {
        posts: arrayUnion(postRef.id),
      });
      toast.success("Post Created Successfully!", {
        position: "top-center",
      });
      setPostData({ postText: "", postImage: null });
      // console.log("Post added successfully and linked to user");
    } catch (error) {
      console.log("Error adding post: ", error);
    }
  };

  const handleInputChange = async (e, type) => {
    if (type === "postText") {
      setPostData((prev) => ({ ...prev, postText: e }));
    } else if (type === "postImage") {
      const file = e.target.files[0];
      if (file) {
        setPostData((prev) => ({ ...prev, postImage: file }));
        toast.success("Image selected!", {
          position: "top-center",
        });
      }
    }
  };

  const handleSubmit = async (postData) => {
    if (!postData.postText.trim() && !postData.postImage) {
      toast.error("Post text or image required!", {
        position: "top-center",
      });
      // console.log("Post text or post image required!");
      return;
    }

    let imageUrl = "";
    if (postData.postImage) {
      imageUrl = await uploadToCloudinary(postData.postImage);
      if (!imageUrl) {
        toast.error("Image upload failed!", {
          position: "top-center",
        });
        return;
      }
    }

    const newPostData = {
      postText: postData.postText,
      postImage: imageUrl,
    };
    await updateFirestorePost(newPostData, localUser?.uid || localUser?.id);
  };

  const getJoinedAtDate = (object) => {
    const createdAtDate = object?.toDate();
    // console.log(createdAtDate);
    const formattedDate = createdAtDate?.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return formattedDate;
  };
  //the code for like feature is below
  const handleLike = async (postId, postLikes) => {
    let userId = localUser?.uid || localUser?.id;
    const postRef = doc(db, "posts", postId);
    const isLiked = postLikes.includes(userId);
    const newLikedPosts = new Set(likedPosts);

    if (isLiked) {
      newLikedPosts.delete(postId);
      await updateDoc(postRef, {
        likes: arrayRemove(userId),
      });
    } else {
      newLikedPosts.add(postId);
      await updateDoc(postRef, {
        likes: arrayUnion(userId),
      });
    }

    setLikedPosts(newLikedPosts);
  };

  //The code for comment feature starts from here
  //to toggle the comment visibility per post
  const handleCommentToggle = (postId) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  //to track the comment input for each post
  const handleCommentChange = (postId, value) => {
    setNewComments((prev) => ({
      ...prev,
      [postId]: value,
    }));
  };
  // console.log(localUser);
  //Update the firestore when the comment is added
  const handleAddComment = async (postId) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;

    const userRef = doc(db, "users", localUser?.uid || localUser?.id);
    const userSnap = await getDoc(userRef);

    const userData = userSnap.exists() ? userSnap.data() : null;

    const postRef = doc(db, "posts", postId);
    const newComment = {
      userId: userData?.id,
      name: userData?.name,
      profileImage: userData?.profileImage || "/profilePlaceholder1.png",
      text: commentText,
      createdAt: new Date(),
    };

    await updateDoc(postRef, {
      comments: arrayUnion(newComment),
    });

    setNewComments((prev) => ({
      ...prev,
      [postId]: "",
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-2 md:p-4 space-y-4">
      {/* Create Post Section */}
      <Card className="p-1 md:p-4">
        <CardContent className="px-2 md:px-0">
          <div className="flex items-center space-x-2 md:space-x-3">
            <img
              src="/profilePlaceholder1.png"
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <Textarea
              placeholder="What's on your mind?"
              value={postData.postText}
              onChange={(e) => handleInputChange(e.target.value, "postText")}
              className="flex-grow h-10 resize-none"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("imageUpload").click()}
            >
              <Image className="w-5 h-5" />
            </Button>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={(e) => handleInputChange(e, "postImage")}
              className="hidden"
            />
            <Button
              onClick={() => {
                handleSubmit(postData);
              }}
            >
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts.map((post) => {
        const isLiked = post.likes.includes(localUser?.uid || localUser?.id);
        const hasUserCommented = post.comments?.some(
          (comment) => comment.userId === localUser?.uid
        );
        return (
          <Card key={post.id}>
            <CardContent className="space-y-3  md:p-4">
              <div className="flex items-center space-x-3">
                <img
                  src={post?.profileImage || "/profilePlaceholder1.png"}
                  alt={post.user}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex flex-row items-center">
                  <span className="font-semibold">{post?.name}</span>
                  <span className=" text-gray-500 mx-2">•</span>
                  <span className="font-medium text-xs text-gray-500">
                    {getJoinedAtDate(post?.createdAt)}
                  </span>
                </div>
              </div>
              <p>{post?.postText}</p>
              {post?.postImage && (
                <img
                  src={post?.postImage}
                  alt="Post"
                  className="w-full rounded-md"
                />
              )}
              <div className="flex justify-between items-center text-gray-500">
                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => handleLike(post.id, post.likes)}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isLiked ? "text-pink-500" : "text-gray-500"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => handleCommentToggle(post.id)}
                  >
                    <MessageCircle
                      className={`w-5 h-5 ${
                        hasUserCommented ? "text-blue-500" : "text-gray-500"
                      }`}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
                <span>
                  {post.likes.length} Likes • {post.comments.length} Comments
                </span>
              </div>

              {/* Comment Section */}
              {openComments[post.id] && (
                <div className="mt-3 border-t pt-3">
                  {/* Existing Comments */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {post.comments?.length > 0 ? (
                      post.comments.map((comment, index) => (
                        <div key={index} className="flex flex-col space-y-2">
                          <div className="flex space-x-2 items-center">
                            <img
                              src={
                                comment?.profileImage ||
                                "/profilePlaceholder1.png"
                              }
                              alt={post.user}
                              className="w-8 h-8 rounded-full"
                            />
                            <span className="font-semibold text-sm">
                              {comment.name}
                            </span>
                            <span className="font-medium text-xs text-gray-500">
                              {getJoinedAtDate(comment?.createdAt)}
                            </span>
                          </div>
                          <span className="text-gray-600">{comment.text}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No comments yet.</p>
                    )}
                  </div>

                  {/* Add Comment */}
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={newComments[post.id] || ""}
                      onChange={(e) =>
                        handleCommentChange(post.id, e.target.value)
                      }
                      className="border rounded-lg p-2 flex-1 text-sm"
                    />
                    <Button
                      onClick={() => handleAddComment(post.id)}
                      className="bg-blue-500 text-white p-2 rounded-lg text-sm"
                    >
                      Post
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default Community;
