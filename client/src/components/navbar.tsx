import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Compass, LayoutDashboard, LogOut, Shield, User } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  const isAdmin = user?.email?.includes("admin") || user?.id === "admin";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <Compass className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight" data-testid="text-brand-name">
              Blueprint Nexus
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/marketplace">
              <Button
                variant={location === "/marketplace" ? "secondary" : "ghost"}
                size="sm"
                data-testid="link-marketplace"
              >
                Marketplace
              </Button>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user?.firstName?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium" data-testid="text-user-name">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground" data-testid="text-user-email">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer" data-testid="link-dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    My Purchases
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer" data-testid="link-profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer" data-testid="link-admin">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/api/logout" className="cursor-pointer text-destructive" data-testid="link-logout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => window.location.href = "/api/login"} 
              data-testid="button-login"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
