"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Likes from "./likes";
import { useEffect, experimental_useOptimistic as useOptimistic } from "react";
import { useRouter } from "next/navigation";

export default function Posts({ posts }: { posts: PostWithAutor[] }) {
    const [optimisticPosts, addOptomisticPost] = useOptimistic<PostWithAutor[], PostWithAutor>(
        posts,
        (currentOptimisticPosts, newPost) => {
            const newOptimisticPosts = [...currentOptimisticPosts]
            const index = newOptimisticPosts.findIndex(post => post.id === newPost.id)
            newOptimisticPosts[index] = newPost
            return newOptimisticPosts;
        }
    );
    const supabase = createClientComponentClient();
    const router = useRouter();
    useEffect(() => {
        const channel = supabase.channel('realtime posts').on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'poasts'
        }, (payload) => {
            router.refresh();
        }).subscribe();
        return () => {
            supabase.removeChannel(channel);
        }
    }, [supabase, router])
    return optimisticPosts.map((post) => (
        <div key={post.id}>
            <p>
                {post.author.name} {post.author.username}
            </p>
            <p>{post.content}</p>
            <Likes post={post} addOptomisticPost={addOptomisticPost} />
        </div>
    ))
}