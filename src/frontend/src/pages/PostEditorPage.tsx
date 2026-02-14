import { useState, useEffect } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useGetPostsByMe, useSubmitPost, useUpdatePost } from '../hooks/useQueries';
import { useAuth } from '../auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PostEditorPage() {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const postIndex = params.postIndex ? parseInt(params.postIndex, 10) : undefined;
  const { data: posts } = useGetPostsByMe();
  const { identity } = useAuth();
  const submitPost = useSubmitPost();
  const updatePost = useUpdatePost();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isEditing = postIndex !== undefined;
  const post = isEditing && posts ? posts[postIndex] : null;

  useEffect(() => {
    if (post) {
      // Check if user can edit this post
      if (identity && post.author.toString() !== identity.getPrincipal().toString()) {
        setError('You can only edit your own posts');
        return;
      }
      setTitle(post.title);
      setContent(post.content);
      setTags(post.tags);
    }
  }, [post, identity]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 3) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      if (isEditing && post) {
        await updatePost.mutateAsync({
          postId: BigInt(postIndex),
          title: title.trim(),
          content: content.trim(),
          tags,
        });
      } else {
        await submitPost.mutateAsync({
          title: title.trim(),
          content: content.trim(),
          tags,
        });
      }
      navigate({ to: '/my-posts' });
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate({ to: '/my-posts' })}
        className="mb-6 gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Posts
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Post' : 'Create New Post'}</CardTitle>
          <CardDescription>
            {isEditing ? 'Update your solution or guide' : 'Share a solution or guide with the team'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter post title (max 100 characters)"
                maxLength={100}
                disabled={submitPost.isPending || updatePost.isPending}
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your solution or guide here... (supports markdown-like formatting)"
                rows={15}
                disabled={submitPost.isPending || updatePost.isPending}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (max 3)</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Add a tag (max 20 characters)"
                  maxLength={20}
                  disabled={tags.length >= 3 || submitPost.isPending || updatePost.isPending}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 3 || submitPost.isPending || updatePost.isPending}
                >
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                        disabled={submitPost.isPending || updatePost.isPending}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {tags.length}/3 tags • Press Enter or click Add to add a tag
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitPost.isPending || updatePost.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {submitPost.isPending || updatePost.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Post'
                  : 'Save as Draft'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/my-posts' })}
                disabled={submitPost.isPending || updatePost.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
