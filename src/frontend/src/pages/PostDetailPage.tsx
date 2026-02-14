import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetPosts } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import MarkdownContent from '../components/MarkdownContent';
import PostActions from '../components/PostActions';
import { useAuth } from '../auth/useAuth';

export default function PostDetailPage() {
  const navigate = useNavigate();
  const { postIndex } = useParams({ from: '/post/$postIndex' });
  const { data: posts, isLoading } = useGetPosts();
  const { profile } = useAuth();

  const index = parseInt(postIndex, 10);
  const post = posts?.[index];

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container max-w-4xl py-16">
        <Card>
          <CardContent className="py-16 text-center">
            <h2 className="text-2xl font-bold mb-2">Post not found</h2>
            <p className="text-muted-foreground mb-6">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate({ to: '/' })}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container max-w-4xl py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate({ to: '/' })}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Posts
      </Button>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold tracking-tight flex-1">{post.title}</h1>
            <PostActions post={post} postIndex={index} />
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Published {formatDate(post.created)}</span>
            </div>
            {post.created !== post.lastUpdated && (
              <div className="flex items-center gap-2">
                <span>• Updated {formatDate(post.lastUpdated)}</span>
              </div>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />
        </CardHeader>

        <CardContent>
          <MarkdownContent content={post.content} />
        </CardContent>
      </Card>
    </div>
  );
}
