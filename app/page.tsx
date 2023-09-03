
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AuthButtonServer from './auth-button-server';
import { redirect } from 'next/navigation';
import NewPost from './new-post';
import Posts from './posts';
export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }
  const { data } = await supabase.from('posts').
    select("*,author: profiles(*), likes(user_id)");

  const posts = data?.map((post) => ({
    ...post,
    author: Array.isArray(post.author) ? post.author[0] : post.author,
    user_has_liked_post: post.likes.find(like => like.user_id === session.user.id),
    likes: post.likes.length,
  })) ?? [];
  return (
    <>
      <AuthButtonServer />
      <NewPost />
      <Posts posts={posts} />
    </>
  );
}
