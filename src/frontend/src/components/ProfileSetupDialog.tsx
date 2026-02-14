import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ProfileSetupDialog() {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      // UserProfile only has 'name' field, role is managed separately by the backend
      await saveProfile.mutateAsync({ name: name.trim() });
    } catch (err) {
      setError('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome!</DialogTitle>
          <DialogDescription>
            Please enter your name to complete your profile setup
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={saveProfile.isPending}
              autoFocus
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? 'Saving...' : 'Continue'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
