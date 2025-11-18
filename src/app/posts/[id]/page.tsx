import PostEditor from "@/components/PostEditor";

export default function PostPage({ params }: { params: { id: string } }) {
    return <PostEditor postId={parseInt(params.id)} />;
}
