import React, { useState, useRef, useEffect } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import { Post } from '../../types';
import { CommunityIcon } from '../icons/Icons';

const DefaultProfileIcon: React.FC<{className?: string}> = ({className}) => (
    <svg className={className || "w-full h-full text-gray-300 dark:text-gray-600"} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
);


// --- USER PROFILE COMPONENT --- //
interface UserProfileProps {
    name: string;
    setName: (name: string) => void;
    profilePic: string | null;
    setProfilePic: (pic: string | null) => void;
}
const UserProfile: React.FC<UserProfileProps> = ({ name, setName, profilePic, setProfilePic }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState(name);
    
    const [showCamera, setShowCamera] = useState(false);
    const [showUploadOptions, setShowUploadOptions] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            if (showCamera) {
                try {
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                        throw new Error("Camera not supported on this device.");
                    }
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    console.error("Error accessing camera:", err);
                    setCameraError("Could not access camera. Please check permissions.");
                    setShowCamera(false);
                }
            }
        };
        startCamera();

        return () => { // Cleanup function
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [showCamera]);


    const handleSaveName = () => {
        setName(tempName);
        setIsEditing(false);
    };

    const handleTakePhoto = () => {
        setShowUploadOptions(false);
        setCameraError(null);
        setShowCamera(true);
    };

    const handleUploadClick = () => {
        setShowUploadOptions(false);
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if(context){
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setProfilePic(dataUrl);
            }
            setShowCamera(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
             {showCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 p-4">
                    <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-[70vh] rounded-lg shadow-xl" />
                    <div className="mt-4 flex space-x-4">
                        <button onClick={handleCapture} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600">Capture</button>
                        <button onClick={() => setShowCamera(false)} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-600">Cancel</button>
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                </div>
            )}
             {showUploadOptions && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={() => setShowUploadOptions(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-center mb-4 dark:text-white">Update Picture</h3>
                        <div className="space-y-3">
                            <button onClick={handleTakePhoto} className="w-full text-left flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                <svg className="w-6 h-6 mr-3 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <span className="dark:text-gray-200">Take Photo</span>
                            </button>
                            <button onClick={handleUploadClick} className="w-full text-left flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                               <svg className="w-6 h-6 mr-3 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <span className="dark:text-gray-200">Upload from Gallery</span>
                            </button>
                        </div>
                        <button onClick={() => setShowUploadOptions(false)} className="w-full mt-4 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            <h3 className="font-bold text-lg text-orange-600 dark:text-orange-400 mb-4">Your Traveler Profile</h3>
            {cameraError && <p className="text-red-500 text-sm mb-4">{cameraError}</p>}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                        {profilePic ? <img src={profilePic} alt="Profile" className="w-full h-full object-cover" /> : <DefaultProfileIcon />}
                    </div>
                    <button onClick={() => setShowUploadOptions(true)} className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1.5 rounded-full hover:bg-orange-600 shadow-md border-2 border-white dark:border-gray-800">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </button>
                </div>
                <div className="flex-1 text-center sm:text-left">
                    {isEditing ? (
                        <input 
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="text-2xl font-bold text-gray-800 dark:text-white bg-transparent border-b-2 border-orange-500 focus:outline-none"
                        />
                    ) : (
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{name}</h2>
                    )}
                    <div className="mt-2 flex items-center justify-center sm:justify-start space-x-4">
                        {isEditing ? (
                             <button onClick={handleSaveName} className="text-sm font-semibold text-green-500 hover:text-green-700 dark:hover:text-green-300">Save Name</button>
                        ) : (
                            <>
                                <button onClick={() => { setIsEditing(true); setTempName(name); }} className="text-sm font-semibold text-orange-500 hover:text-orange-700 dark:hover:text-orange-300">Edit Name</button>
                                <button onClick={handleTakePhoto} className="text-sm font-semibold text-blue-500 hover:text-blue-700 dark:hover:text-blue-300">Take Picture</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- CREATE POST COMPONENT --- //
interface CreatePostProps {
    authorName: string;
    authorPic: string | null;
    onPost: (post: Post) => void;
}
const CreatePost: React.FC<CreatePostProps> = ({ authorName, authorPic, onPost }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!content.trim()) return;

        const newPost: Post = {
            id: new Date().toISOString(),
            authorName,
            authorPic,
            content,
            image,
            timestamp: Date.now()
        };
        onPost(newPost);
        setContent('');
        setImage(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600"
                placeholder={`What's on your mind, ${authorName}?`}
                rows={3}
            />
            {image && (
                <div className="mt-2 relative">
                    <img src={image} alt="Preview" className="max-h-48 rounded-lg" />
                    <button onClick={() => setImage(null)} className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 text-xs">
                        &times;
                    </button>
                </div>
            )}
            <div className="flex justify-between items-center mt-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="text-orange-500 hover:text-orange-700 dark:hover:text-orange-300 p-2 rounded-full">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </button>
                <button onClick={handleSubmit} disabled={!content.trim()} className="bg-orange-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-orange-600 disabled:bg-orange-300">
                    Post
                </button>
            </div>
        </div>
    );
};

// --- POST FEED COMPONENT --- //
interface PostItemProps {
    post: Post;
    onDelete: (id: string) => void;
}
const PostItem: React.FC<PostItemProps> = ({ post, onDelete }) => {
    const timeAgo = (timestamp: number): string => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-start mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600 flex-shrink-0">
                    {post.authorPic ? <img src={post.authorPic} alt={post.authorName} className="w-full h-full object-cover" /> : <DefaultProfileIcon />}
                </div>
                <div className="ml-3 flex-1">
                    <p className="font-bold text-gray-800 dark:text-white">{post.authorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.timestamp)}</p>
                </div>
                 <button 
                    onClick={() => onDelete(post.id)} 
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full"
                    aria-label="Delete post"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>
            {post.image && (
                <img src={post.image} alt="Post content" className="mt-3 rounded-lg w-full max-h-96 object-cover" />
            )}
        </div>
    );
};


// --- MAIN COMMUNITY COMPONENT --- //
const Community: React.FC = () => {
    const [name, setName] = useLocalStorage('userProfileName', 'Wanderer');
    const [profilePic, setProfilePic] = useLocalStorage<string | null>('userProfilePic', null);
    const [posts, setPosts] = useLocalStorage<Post[]>('communityPosts', []);

    const handleNewPost = (newPost: Post) => {
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };

    const handleDeletePost = (postId: string) => {
        if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
            setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
        }
    };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-4 bg-orange-100 dark:bg-orange-900/50 rounded-full mb-4">
            <CommunityIcon />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Community Hub</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Connect with fellow travelers, share your experiences, and discover hidden gems.
        </p>
      </div>
      
      <div className="space-y-6">
        <UserProfile name={name} setName={setName} profilePic={profilePic} setProfilePic={setProfilePic} />
        <CreatePost authorName={name} authorPic={profilePic} onPost={handleNewPost} />
        <div className="space-y-4">
            {posts.map(post => <PostItem key={post.id} post={post} onDelete={handleDeletePost} />)}
        </div>
      </div>
    </div>
  );
};

export default Community;