import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from './AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, User } from 'lucide-react';

export default function ProfilePanel() {
  const { user } = useAuth();
  
  const name = user?.email?.split('@')[0] || "Guest";
  const initials = name.slice(0, 2).toUpperCase();
  const email = user?.email || "Guest User";

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <h2 className="text-lg font-semibold">User Profile</h2>
      
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{name}</CardTitle>
          <CardDescription>{email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email Address
            </Label>
            <Input id="email" value={email} readOnly disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Username
            </Label>
            <Input id="username" value={name} readOnly disabled className="bg-muted" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <p className="text-sm text-primary/80">
            Account data is currently managed via the authentication service. Profile editing will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
