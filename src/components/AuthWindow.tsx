import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export const AuthWindow: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Signup failed');
      
      localStorage.setItem('auth_token', data.session.access_token);
      toast.success('Account created successfully!');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('auth_token', data.session.access_token);
      toast.success('Logged in successfully!');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md relative">
        <button 
          onClick={() => {
            localStorage.setItem('guest_mode', 'true');
            window.location.reload();
          }} 
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-accent transition-colors"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Study Spark</CardTitle>
          <CardDescription className="text-center">Sign in to track your study progress across devices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground mb-4">Just want to try it out?</p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                // In a real app, we'd set a guest flag in local storage and use it in App.tsx
                // For now, let's just use a trick or mock login if possible
                toast.info("Guest mode isn't fully implemented, but I've updated App.tsx to allow it.");
                localStorage.setItem('guest_mode', 'true');
                window.location.reload();
              }}
            >
              Continue as Guest
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
