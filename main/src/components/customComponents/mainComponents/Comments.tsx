'use client';
import { useState, useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import { toast } from "sonner";
import { IComment } from "@/interfaces/modelInterface";
import Image from "next/image";

type CommentsProps = {
    product_id: number;
    order_id?: number | null;
    isCommentAllowed: boolean;
};

const commentSchema = z.object({
    order_id: z.number().positive(),
    comment: z.string().min(3, "Comment must be at least 3 characters"),
});

const Comments: React.FC<CommentsProps> = ({ product_id, order_id, isCommentAllowed }) => {
    const [comments, setComments] = useState<IComment[] |null>(null);
    const [newComment, setNewComment] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isLocked,setIsLocked] = useState<boolean>(isCommentAllowed)

    useEffect(() =>   {
        setIsLocked(isCommentAllowed);
    },[isCommentAllowed])

    useEffect(() => {
        if(comments == null && product_id)
        {
            ;(async () => {
                try {
                    const response = await axios.post("/api/comments/get_product_all_comments", { product_id:product_id });
                    setComments(response.data.data.requiredData);
                } catch (err) {
                    setComments([])
                    console.warn("Error fetching comments", err);
                }
            })()
        }
    }, [product_id,comments]);

    const handleAddComment = async () => {
        try {
            setLoading(true);
            commentSchema.parse({ order_id, comment: newComment });
            await axios.post("/api/orders/add_comment", { order_id, comment: newComment });
            setNewComment("");
            toast.success("Successfully  added  new comment");
            setTimeout(() => {
                window.location.reload()
            }, 1000);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
            toast.error(error.response.data?.message || "Request failed");
            } else {
            toast.error("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full mt-7 p-4 border   border-gray-300 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Comments</h2>
            <div className="h-60 overflow-y-auto border p-2 rounded-md border-gray-300">
                {Array.isArray(comments) && comments.length  > 0 && comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex border gap-3  p-2  rounded-md   border-gray-300 cursor-pointer items-start mb-4">
                            
                            <Image
                                src={comment.user_id.image ? `/assets/users/${comment.user_id.image}` : "/assets/mainAssets/logos/logo.png"}
                                width={60}
                                height={60}
                                alt="user"
                                className="object-cover"
                            />
                            <div>
                                <p className="font-semibold">{comment.user_id.name}</p>
                                <p className="text-gray-700">{comment.comment}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No comments yet.</p>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-md font-semibold mb-2">Leave a Comment</h3>
                <textarea
                    className="w-full p-2 border rounded-md resize-none"
                    placeholder={isLocked ? "Write your comment..." : "Comments are locked"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!isLocked}
                />
                <button
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
                    onClick={handleAddComment}
                    disabled={!isLocked || loading}
                >
                    {loading ? "Posting..." : "Post Comment"}
                </button>
            </div>
        </div>
    );
};

export default Comments;