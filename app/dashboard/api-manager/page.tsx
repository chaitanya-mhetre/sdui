'use client';

import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ApiManagerPage() {
  const apis = [
    {
      id: '1',
      name: 'Get User Profile',
      method: 'GET',
      url: 'https://api.example.com/user/{id}',
      createdAt: '2 days ago',
    },
    {
      id: '2',
      name: 'Update User',
      method: 'PUT',
      url: 'https://api.example.com/user/{id}',
      createdAt: '1 day ago',
    },
    {
      id: '3',
      name: 'List Products',
      method: 'GET',
      url: 'https://api.example.com/products',
      createdAt: '5 days ago',
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Manager</h1>
          <p className="text-muted-foreground">Manage your API endpoints and connections</p>
        </div>
        <Button className="gap-2 rounded-lg">
          <Plus className="w-5 h-5" />
          New Endpoint
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Method</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">URL</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apis.map((api) => (
                <tr key={api.id} className="border-b border-border hover:bg-muted transition">
                  <td className="px-6 py-4 text-sm">{api.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {api.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{api.url}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{api.createdAt}</td>
                  <td className="px-6 py-4 text-sm flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded h-8 w-8 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
