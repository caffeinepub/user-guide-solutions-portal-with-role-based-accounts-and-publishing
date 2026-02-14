import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import UserManagementPanel from './UserManagementPanel';
import ContentManagementPanel from './ContentManagementPanel';

export default function AdminConsolePage() {
  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
        <p className="text-muted-foreground mt-1">
          Manage users and content across the knowledge base
        </p>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Content Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <ContentManagementPanel />
        </TabsContent>

        <TabsContent value="users">
          <UserManagementPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
