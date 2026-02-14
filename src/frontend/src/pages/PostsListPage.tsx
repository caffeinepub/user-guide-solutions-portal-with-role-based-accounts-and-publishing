import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetPosts } from '../hooks/useQueries';
import { useAuth } from '../auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Plus, FileText } from 'lucide-react';
import { Post } from '../backend';

export default function PostsListPage() {
  const navigate = useNavigate();
  const { isEngineer, isAdmin } = useAuth();
  const { data: allPosts, isLoading } = useGetPosts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const publishedPosts = useMemo(() => {
    return (allPosts || []).filter(post => post.isPublished);
  }, [allPosts]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    publishedPosts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [publishedPosts]);

  const filteredPosts = useMemo(() => {
    let filtered = publishedPosts;

    if (selectedTag) {
      filtered = filtered.filter(post => post.tags.includes(selectedTag));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => Number(b.created - a.created));
  }, [publishedPosts, selectedTag, searchQuery]);

  const canCreatePost = isEngineer || isAdmin;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-muted/50 to-muted/30 border-b">
        <div 
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: 'url(/assets/generated/kb-hero.dim_1600x400.png)' }}
        />
        <div className="container relative py-12">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Solutions & Guides</h1>
          <p className="text-lg text-muted-foreground">
            Browse technical solutions and best practices from our engineering team
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {canCreatePost && (
              <Button onClick={() => navigate({ to: '/editor' })} className="gap-2">
                <Plus className="h-4 w-4" />
                New Post
              </Button>
            )}
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === null ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                All
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {publishedPosts.length === 0 ? 'No posts yet' : 'No posts found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {publishedPosts.length === 0
                  ? 'Be the first to share a solution or guide'
                  : 'Try adjusting your search or filters'}
              </p>
              {canCreatePost && publishedPosts.length === 0 && (
                <Button onClick={() => navigate({ to: '/editor' })} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create First Post
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, index) => (
              <PostCard key={index} post={post} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post, index }: { post: Post; index: number }) {
  const navigate = useNavigate();

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const excerpt = post.content.slice(0, 150) + (post.content.length > 150 ? '...' : '');

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate({ to: '/post/$postIndex', params: { postIndex: String(index) } })}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
        </div>
        <CardDescription className="text-xs">
          {formatDate(post.created)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {excerpt}
        </p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
