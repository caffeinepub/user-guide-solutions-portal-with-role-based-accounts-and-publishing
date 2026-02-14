import { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, loginStatus } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoggingIn = loginStatus === 'logging-in';
  const isError = loginStatus === 'loginError';

  useEffect(() => {
    if (isError) {
      setError('Login failed. Please try again.');
    }
  }, [isError]);

  const handleInternetIdentityLogin = () => {
    setError(null);
    login();
  };

  const handleUsernamePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Note: Backend does not currently support username/password authentication
      // This would need a backend method like: authenticateWithPassword(username, password)
      // For now, show an error message
      setError('Username/password authentication is not yet implemented in the backend. Please use Internet Identity or contact your administrator.');
      
      // When backend support is added, the implementation would look like:
      // const result = await actor.authenticateWithPassword(username, password);
      // if (result.success) {
      //   // Store session token and update auth state
      //   sessionStorage.setItem('authToken', result.sessionToken);
      //   // Trigger auth state update
      // } else {
      //   setError('Invalid username or password');
      // }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/assets/generated/kb-logo.dim_512x512.png" 
            alt="Knowledge Base Logo" 
            className="h-24 w-24 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base Portal</h1>
          <p className="text-muted-foreground mt-2">Solutions and guides for engineers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Access your account to view solutions and contribute guides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="internet-identity" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="internet-identity">Internet Identity</TabsTrigger>
                <TabsTrigger value="admin">Admin Login</TabsTrigger>
              </TabsList>

              <TabsContent value="internet-identity" className="space-y-4 mt-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleInternetIdentityLogin} 
                  disabled={isLoggingIn}
                  className="w-full"
                  size="lg"
                >
                  {isLoggingIn ? 'Signing in...' : 'Sign in with Internet Identity'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure authentication without passwords
                </p>
              </TabsContent>

              <TabsContent value="admin" className="space-y-4 mt-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleUsernamePasswordLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button 
                    type="submit"
                    disabled={isSubmitting || !username || !password}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign in as Admin'}
                  </Button>
                </form>

                <p className="text-xs text-center text-muted-foreground">
                  For administrators only
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
