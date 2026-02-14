import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth/useAuth';
import { usePublishPost, useUnpublishPost, useDeletePost } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MoreVertical, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Post } from '../backend';
import { useState } from 'react';
import { toast } from 'sonner';

interface PostActionsProps {
  post: Post;
  postIndex: number;
}

export default function PostActions({ post, postIndex }: PostActionsProps) {
  const navigate = useNavigate();
  const { identity, isAdmin } = useAuth();
  const publishPost = usePublishPost();
  const unpublishPost = useUnpublishPost();
  const deletePost = useDeletePost();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isAuthor = identity && post.author.toString() === identity.getPrincipal().toString();
  const canEdit = isAuthor || isAdmin;
  const canDelete = isAuthor || isAdmin;
  const canPublish = (isAuthor || isAdmin) && !post.isPublished;
  const canUnpublish = isAdmin && post.isPublished;

  if (!canEdit && !canDelete && !canPublish && !canUnpublish) {
    return null;
  }

  const handlePublish = async () => {
    try {
      await publishPost.mutateAsync(BigInt(postIndex));
      toast.success('Post published successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish post');
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishPost.mutateAsync(BigInt(postIndex));
      toast.success('Post unpublished successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to unpublish post');
    }
  };

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(BigInt(postIndex));
      toast.success('Post deleted successfully');
      navigate({ to: '/my-posts' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEdit && (
            <DropdownMenuItem
              onClick={() => navigate({ to: '/editor/$postIndex', params: { postIndex: String(postIndex) } })}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          {canPublish && (
            <DropdownMenuItem onClick={handlePublish} disabled={publishPost.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Publish
            </DropdownMenuItem>
          )}
          {canUnpublish && (
            <DropdownMenuItem onClick={handleUnpublish} disabled={unpublishPost.isPending}>
              <XCircle className="h-4 w-4 mr-2" />
              Unpublish
            </DropdownMenuItem>
          )}
          {(canEdit || canPublish || canUnpublish) && canDelete && <DropdownMenuSeparator />}
          {canDelete && (
            <DropdownMenuItem
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{post.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
