import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function UserManagementPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts, roles, and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            User management features are currently limited to Internet Identity authentication. 
            Users can set their own profiles upon first login. Role assignment is managed through 
            the backend access control system.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
