import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Mail, User, Calendar, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading, logout, isLoggingOut } = useAuth();

  if (isLoading) {
    return (
      <div className="container py-8 max-w-2xl">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container max-w-2xl">
        <h1 className="font-serif text-3xl font-bold mb-8" data-testid="text-page-title">
          Profile
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold" data-testid="text-user-name">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-muted-foreground" data-testid="text-user-email">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="grid gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-mono text-sm">{user?.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{user?.email || "Not provided"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => (window.location.href = "/api/logout")}
                data-testid="button-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
