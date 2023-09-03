"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";


export default function Likes({ post, addOptomisticPost }: { post: PostWithAutor; addOptomisticPost: (newPost: PostWithAutor) => void }) {
    const router = useRouter();
    const hadleLikes = async () => {
        const supabase = createClientComponentClient<Database>();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            if (post.user_has_liked_post) {
                addOptomisticPost({
                    ...post,
                    likes: post.likes - 1,
                    user_has_liked_post: !post.user_has_liked_post,
                });
                await supabase.from('likes').delete().match({ user_id: user.id, post_id: post.id })
            }
            else {
                addOptomisticPost({
                    ...post,
                    likes: post.likes + 1,
                    user_has_liked_post: !post.user_has_liked_post,
                });
                await supabase.from('likes').insert({ user_id: user.id, post_id: post.id });
            }
        }
    }
    return <button onClick={hadleLikes}>{post.likes} Likes</button>;

} 
