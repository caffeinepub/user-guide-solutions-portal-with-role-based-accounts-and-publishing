import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetPostsByMe } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText } from 'lucide-react';
import PostActions from '../components/PostActions';
import { Post } from '../backend';

export default function MyPostsPage() {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useGetPostsByMe();
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts'>('all');

  const publishedPosts = posts?.filter(p => p.isPublished) || [];
  const draftPosts = posts?.filter(p => !p.isPublished) || [];

  const displayPosts = activeTab === 'published' 
    ? publishedPosts 
    : activeTab === 'drafts' 
    ? draftPosts 
    : posts || [];

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Posts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your solutions and guides
          </p>
        </div>
        <Button onClick={() => navigate({ to: '/editor' })} className="gap-2">
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            All ({posts?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="published">
            Published ({publishedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts ({draftPosts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {displayPosts.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first post to share solutions and guides
                </p>
                <Button onClick={() => navigate({ to: '/editor' })} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayPosts.map((post, index) => (
                <MyPostCard key={index} post={post} postIndex={index} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MyPostCard({ post, postIndex }: { post: Post; postIndex: number }) {
  const navigate = useNavigate();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <CardTitle 
                className="text-xl cursor-pointer hover:underline"
                onClick={() => navigate({ to: '/post/$postIndex', params: { postIndex: String(postIndex) } })}
              >
                {post.title}
              </CardTitle>
              {!post.isPublished && (
                <Badge variant="outline">Draft</Badge>
              )}
            </div>
            <CardDescription>
              Created {formatDate(post.created)}
              {post.created !== post.lastUpdated && ` • Updated ${formatDate(post.lastUpdated)}`}
            </CardDescription>
          </div>
          <PostActions post={post} postIndex={postIndex} />
        </div>
      </CardHeader>
      {post.tags.length > 0 && (
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
