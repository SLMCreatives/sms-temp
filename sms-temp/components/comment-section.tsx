"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Comments } from "@/app/student/studentColumns";
import { Separator } from "./ui/separator";
//import { get } from "http";

interface CommentSectionProps {
  engagementId: string;
}
const supabase = createClient();
const {
  data: { user }
} = await supabase.auth.getUser();

export default function CommentSection({ engagementId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comments[]>([]);
  const getComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("engagement_id", engagementId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.log("Error fetching comments:", error);
    }
  };
  getComments();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const auth_id = user?.id;
  const onCommentAdded = () => {
    getComments();
  };
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("comments").insert({
        engagement_id: engagementId,
        comment: newComment.trim(),
        likes: 0,
        user_id: auth_id // You can replace this with actual user data
      });

      if (!error) {
        setNewComment("");
        onCommentAdded();
      }
    } catch (error) {
      console.log("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string, currentLikes: number) => {
    if (likedComments.has(commentId)) return; // Prevent multiple likes

    try {
      const { error } = await supabase
        .from("comments")
        .update({ likes: currentLikes + 1 })
        .eq("id", commentId);

      if (!error) {
        setLikedComments((prev) => new Set(prev).add(commentId));
        onCommentAdded(); // Refresh comments
      }
    } catch (error) {
      console.log("Error liking comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString("en-MY") + " " + date.toLocaleTimeString("en-MY")
    );
  };

  const user_name = user?.user_metadata.email.split("@")[0];

  return (
    <div className="border-t pt-4 mt-4">
      {/* Existing Comments */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {comments !== null &&
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-muted-foreground">
                    {user_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <p className="mt-1 italic">{`> ${comment.comment}`}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeComment(comment.id, comment.likes)}
                >
                  <Heart
                    className={
                      likedComments.has(comment.id) ? "fill-red-500" : ""
                    }
                  />
                  <span className="ml-1">{comment.likes}</span>
                </Button>
              </div>
            </div>
          ))}
      </div>

      <div className="flex items-center gap-2 py-4">
        <MessageCircle className="h-4 w-4" />
        <span className="font-medium">Add Comment</span>
      </div>
      {/* Add New Comment */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] resize-none"
        />
        <Separator />
        <div className="flex justify-end">
          <Button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            size="sm"
            className="flex items-center gap-2"
          >
            <Send className="h-3 w-3" />
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </div>
  );
}
