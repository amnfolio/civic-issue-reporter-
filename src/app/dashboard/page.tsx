"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, ThumbsUp, Clock, CheckCircle, AlertCircle, XCircle, Search, Filter } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import type { Issue } from "@/types";
import { toast } from "sonner";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedIssues, setVotedIssues] = useState<Set<number>>(new Set());
  const [votingInProgress, setVotingInProgress] = useState<Set<number>>(new Set());
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Fetch issues and user's voted issues
  useEffect(() => {
    if (!session?.user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Build query params for all issues
        const params = new URLSearchParams();
        params.append("limit", "100");
        params.append("sort", sortBy);
        params.append("order", "desc");
        
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }
        if (categoryFilter !== "all") {
          params.append("category", categoryFilter);
        }
        if (searchTerm) {
          params.append("search", searchTerm);
        }

        // Fetch all issues
        const issuesRes = await fetch(`/api/issues?${params.toString()}`);
        if (issuesRes.ok) {
          const issuesData = await issuesRes.json();
          setIssues(issuesData);
        }

        // Fetch user's own issues
        const myIssuesRes = await fetch(`/api/issues?user_id=${session.user.id}`);
        if (myIssuesRes.ok) {
          const myIssuesData = await myIssuesRes.json();
          setMyIssues(myIssuesData);
        }

        // Check which issues the user has voted for
        const votedSet = new Set<number>();
        for (const issue of issuesData || []) {
          const voteRes = await fetch(`/api/votes?issueId=${issue.id}&userId=${session.user.id}`);
          if (voteRes.ok) {
            const voteData = await voteRes.json();
            if (voteData.hasVoted) {
              votedSet.add(issue.id);
            }
          }
        }
        setVotedIssues(votedSet);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load issues");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, statusFilter, categoryFilter, sortBy, searchTerm]);

  const handleVote = async (issueId: number) => {
    if (!session?.user) return;
    if (votingInProgress.has(issueId)) return;

    setVotingInProgress(prev => new Set(prev).add(issueId));

    try {
      const hasVoted = votedIssues.has(issueId);
      
      if (hasVoted) {
        // Remove vote
        const res = await fetch(`/api/votes?issueId=${issueId}&userId=${session.user.id}`, {
          method: "DELETE",
        });

        if (res.ok) {
          const data = await res.json();
          setVotedIssues(prev => {
            const newSet = new Set(prev);
            newSet.delete(issueId);
            return newSet;
          });
          
          // Update vote count in UI
          setIssues(prev => prev.map(issue => 
            issue.id === issueId ? { ...issue, voteCount: data.voteCount } : issue
          ));
          setMyIssues(prev => prev.map(issue => 
            issue.id === issueId ? { ...issue, voteCount: data.voteCount } : issue
          ));
          
          toast.success("Vote removed");
        } else {
          const error = await res.json();
          toast.error(error.error || "Failed to remove vote");
        }
      } else {
        // Add vote
        const res = await fetch("/api/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            issueId,
            userId: session.user.id,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setVotedIssues(prev => new Set(prev).add(issueId));
          
          // Update vote count in UI
          setIssues(prev => prev.map(issue => 
            issue.id === issueId ? { ...issue, voteCount: data.voteCount } : issue
          ));
          setMyIssues(prev => prev.map(issue => 
            issue.id === issueId ? { ...issue, voteCount: data.voteCount } : issue
          ));
          
          toast.success("Vote recorded");
        } else {
          const error = await res.json();
          toast.error(error.error || "Failed to vote");
        }
      }
    } catch (error) {
      console.error("Vote error:", error);
      toast.error("Failed to process vote");
    } finally {
      setVotingInProgress(prev => {
        const newSet = new Set(prev);
        newSet.delete(issueId);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "received":
        return <AlertCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "received":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const IssueCard = ({ issue, showVoteButton = true }: { issue: Issue; showVoteButton?: boolean }) => {
    const hasVoted = votedIssues.has(issue.id);
    const isVoting = votingInProgress.has(issue.id);

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge className={getStatusColor(issue.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(issue.status)}
                {issue.status.replace("_", " ")}
              </span>
            </Badge>
            <span className="text-xs text-muted-foreground">{issue.category}</span>
          </div>
          
          <CardTitle className="text-lg line-clamp-2">{issue.title}</CardTitle>
          <CardDescription className="line-clamp-3">{issue.description}</CardDescription>
          
          {issue.imageUrl && (
            <div className="mt-3">
              <img 
                src={issue.imageUrl} 
                alt={issue.title}
                className="w-full h-48 object-cover rounded-md"
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-[200px]">
                {issue.address || `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}`}
              </span>
            </div>
            
            {showVoteButton && (
              <Button
                size="sm"
                variant={hasVoted ? "default" : "outline"}
                onClick={() => handleVote(issue.id)}
                disabled={isVoting}
                className="flex items-center gap-1"
              >
                <ThumbsUp className={`h-4 w-4 ${hasVoted ? "fill-current" : ""}`} />
                <span>{issue.voteCount}</span>
              </Button>
            )}
            
            {!showVoteButton && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ThumbsUp className="h-4 w-4" />
                <span>{issue.voteCount} votes</span>
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            Reported {new Date(issue.createdAt).toLocaleDateString()} by {issue.userName || "Anonymous"}
          </div>
        </CardHeader>
      </Card>
    );
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              View and track civic issues in your community
            </p>
          </div>
          <Link href="/report">
            <Button size="lg" className="mt-4 sm:mt-0">
              Report New Issue
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Roads">Roads</SelectItem>
                  <SelectItem value="Sanitation">Sanitation</SelectItem>
                  <SelectItem value="Electrical">Electrical</SelectItem>
                  <SelectItem value="Water Supply">Water Supply</SelectItem>
                  <SelectItem value="Street Lights">Street Lights</SelectItem>
                  <SelectItem value="Drainage">Drainage</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Most Recent</SelectItem>
                  <SelectItem value="voteCount">Most Voted</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all">All Issues ({issues.length})</TabsTrigger>
            <TabsTrigger value="my">My Issues ({myIssues.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {issues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} showVoteButton={true} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">No issues found</p>
                  <p className="text-muted-foreground">Try adjusting your filters or be the first to report an issue</p>
                  <Link href="/report">
                    <Button className="mt-4">Report New Issue</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my" className="mt-6">
            {myIssues.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} showVoteButton={false} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">You haven't reported any issues yet</p>
                  <p className="text-muted-foreground">Report your first civic issue to help improve your community</p>
                  <Link href="/report">
                    <Button className="mt-4">Report New Issue</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
