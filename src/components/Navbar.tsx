"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession, authClient } from "@/lib/auth-client";
import { Menu, MapPin, LogOut, User, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Navbar() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminPasswordDialog, setAdminPasswordDialog] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token");
    await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    localStorage.removeItem("bearer_token");
    refetch();
    router.push("/");
  };

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setAdminPasswordDialog(true);
  };

  const handleAdminPasswordSubmit = () => {
    setIsVerifying(true);
    
    // Check if password matches "jss project"
    if (adminPassword.trim() === "jss project") {
      toast.success("Access granted! Redirecting to admin panel...");
      setAdminPasswordDialog(false);
      setAdminPassword("");
      setMobileMenuOpen(false);
      router.push("/admin");
    } else {
      toast.error("Incorrect password. Please try again.");
      setAdminPassword("");
    }
    
    setIsVerifying(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAdminPasswordSubmit();
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <MapPin className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-gray-900">CivicSense</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/#features">
                <Button variant="ghost">Features</Button>
              </Link>
              <Link href="/#stats">
                <Button variant="ghost">Statistics</Button>
              </Link>

              {isPending ? (
                <div className="h-9 w-20 bg-gray-200 animate-pulse rounded" />
              ) : session?.user ? (
                <>
                  <Link href="/report">
                    <Button>Report Issue</Button>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <User className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {session.user.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          My Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleAdminClick} className="cursor-pointer">
                        <Bell className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="cursor-pointer text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link href="/#features" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Features
                      </Button>
                    </Link>
                    <Link href="/#stats" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start">
                        Statistics
                      </Button>
                    </Link>

                    {session?.user ? (
                      <>
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium px-3 mb-2">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground px-3 mb-4">
                            {session.user.email}
                          </p>
                        </div>
                        <Link href="/report" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full">Report Issue</Button>
                        </Link>
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start">
                            <User className="mr-2 h-4 w-4" />
                            My Dashboard
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={handleAdminClick}
                        >
                          <Bell className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-red-600"
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full">Get Started</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Password Dialog */}
      <Dialog open={adminPasswordDialog} onOpenChange={setAdminPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Access Required</DialogTitle>
            <DialogDescription>
              Please enter the admin password to access the admin panel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="admin-password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                autoComplete="off"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAdminPasswordDialog(false);
                setAdminPassword("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAdminPasswordSubmit} disabled={isVerifying || !adminPassword}>
              {isVerifying ? "Verifying..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}