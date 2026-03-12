import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "./AuthContext";
import { LogOut, User, Settings, LogIn } from "lucide-react";
import { toast } from "sonner";

export function UserNav({ onViewChange }: { onViewChange?: (view: any) => void }) {
  const { user, signOut } = useAuth();
  const isGuest = localStorage.getItem('guest_mode') === 'true';

  const handleSignOut = async () => {
    await signOut();
    localStorage.removeItem('guest_mode');
    toast.success("Logged out successfully");
    window.location.reload();
  };

  const handleExitGuest = () => {
    localStorage.removeItem('guest_mode');
    window.location.reload();
  };

  const name = user?.email?.split('@')[0] || "Guest";
  const initials = name.slice(0, 2).toUpperCase();
  const email = user?.email || "Guest User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={name} />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer" onClick={() => onViewChange?.('profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => onViewChange?.('settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {isGuest ? (
          <DropdownMenuItem onClick={handleExitGuest} className="text-primary cursor-pointer">
            <LogIn className="mr-2 h-4 w-4" />
            <span>Sign In / Register</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
