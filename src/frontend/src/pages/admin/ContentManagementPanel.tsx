import { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllPosts, usePublishPost, useUnpublishPost, useDeletePost } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Post } from '../../backend';
import { toast } from 'sonner';

export default function ContentManagementPanel() {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useGetAllPosts();
  const publishPost = usePublishPost();
  const unpublishPost = useUnpublishPost();
  const deletePost = useDeletePost();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<{ index: number; title: string } | null>(null);

  const filteredPosts = useMemo(() => {
    let filtered = posts || [];

    if (statusFilter === 'published') {
      filtered = filtered.filter(p => p.isPublished);
    } else if (statusFilter === 'draft') {
      filtered = filtered.filter(p => !p.isPublished);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => Number(b.created - a.created));
  }, [posts, statusFilter, searchQuery]);

  const handlePublish = async (postIndex: number) => {
    try {
      await publishPost.mutateAsync(BigInt(postIndex));
      toast.success('Post published successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish post');
    }
  };

  const handleUnpublish = async (postIndex: number) => {
    try {
      await unpublishPost.mutateAsync(BigInt(postIndex));
      toast.success('Post unpublished successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to unpublish post');
    }
  };

  const handleDeleteClick = (postIndex: number, title: string) => {
    setPostToDelete({ index: postIndex, title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      await deletePost.mutateAsync(BigInt(postToDelete.index));
      toast.success('Post deleted successfully');
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading posts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
          <CardDescription>
            Manage all posts, publish/unpublish content, and moderate submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
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
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'published' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('published')}
              >
                Published
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('draft')}
              >
                Drafts
              </Button>
            </div>
          </div>

          {/* Posts Table */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No posts found
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {post.title}
                      </TableCell>
                      <TableCell>
                        {post.isPublished ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Draft
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{post.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(post.created)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate({ to: '/post/$postIndex', params: { postIndex: String(index) } })}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate({ to: '/editor/$postIndex', params: { postIndex: String(index) } })}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {post.isPublished ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUnpublish(index)}
                              disabled={unpublishPost.isPending}
                              title="Unpublish"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePublish(index)}
                              disabled={publishPost.isPending}
                              title="Publish"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(index, post.title)}
                            disabled={deletePost.isPending}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
