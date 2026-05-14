"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Filter, Search, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import type { Issue, Department } from "@/types";
import { toast } from "sonner";

// Dynamic import for map to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  
  // Form states for updating issue
  const [newStatus, setNewStatus] = useState<string>("");
  const [assignedDepartment, setAssignedDepartment] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    } else if (!isPending && session?.user && session.user.role !== "admin") {
      toast.error("Access denied. Admin privileges required.");
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  // Fetch issues and departments
  useEffect(() => {
    if (!session?.user || session.user.role !== "admin") return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Build query params
        const params = new URLSearchParams();
        params.append("limit", "200");
        params.append("sort", "createdAt");
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

        // Fetch issues
        const issuesRes = await fetch(`/api/issues?${params.toString()}`);
        if (issuesRes.ok) {
          let issuesData = await issuesRes.json();
          
          // Apply department filter on client side
          if (departmentFilter !== "all") {
            issuesData = issuesData.filter((issue: Issue) => 
              issue.departmentId === parseInt(departmentFilter)
            );
          }
          
          setIssues(issuesData);
        }

        // Fetch departments
        const deptRes = await fetch("/api/departments");
        if (deptRes.ok) {
          const deptData = await deptRes.json();
          setDepartments(deptData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, statusFilter, categoryFilter, searchTerm, departmentFilter]);

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setAssignedDepartment(issue.departmentId?.toString() || "");
    setAdminNotes(issue.adminNotes || "");
    setIsDialogOpen(true);
  };

  const handleUpdateIssue = async () => {
    if (!selectedIssue) return;

    setUpdating(true);
    try {
      const updateData: any = {};
      
      if (newStatus !== selectedIssue.status) {
        updateData.status = newStatus;
      }
      
      if (assignedDepartment !== selectedIssue.departmentId?.toString()) {
        updateData.departmentId = assignedDepartment ? parseInt(assignedDepartment) : null;
        updateData.assignedBy = session?.user?.id;
      }
      
      if (adminNotes !== selectedIssue.adminNotes) {
        updateData.adminNotes = adminNotes || null;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save");
        setIsDialogOpen(false);
        return;
      }

      const res = await fetch(`/api/issues?id=${selectedIssue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const updatedIssue = await res.json();
        setIssues(prev => prev.map(issue => 
          issue.id === selectedIssue.id ? { ...issue, ...updatedIssue } : issue
        ));
        toast.success("Issue updated successfully");
        setIsDialogOpen(false);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to update issue");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update issue");
    } finally {
      setUpdating(false);
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

  const getMarkerColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "green";
      case "in_progress":
        return "blue";
      case "received":
        return "orange";
      case "rejected":
        return "red";
      default:
        return "gray";
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-[600px] bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage civic issues and assign to departments
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{issues.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Received</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {issues.filter(i => i.status === "received").length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {issues.filter(i => i.status === "in_progress").length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {issues.filter(i => i.status === "resolved").length}
              </p>
            </CardContent>
          </Card>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  <SelectValue placeholder="Status" />
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
                  <SelectValue placeholder="Category" />
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
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setDepartmentFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map View */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Issues Map
            </CardTitle>
            <CardDescription>
              Click on markers to view and manage issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] rounded-lg overflow-hidden border">
              {typeof window !== "undefined" && (
                <MapContainer
                  center={issues.length > 0 ? [issues[0].latitude, issues[0].longitude] : [20.5937, 78.9629]}
                  zoom={issues.length > 0 ? 12 : 5}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {issues.map((issue) => (
                    <Marker
                      key={issue.id}
                      position={[issue.latitude, issue.longitude]}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <Badge className={getStatusColor(issue.status) + " mb-2"}>
                            {issue.status.replace("_", " ")}
                          </Badge>
                          <h3 className="font-semibold mb-1">{issue.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {issue.category}
                          </p>
                          <Button 
                            size="sm" 
                            onClick={() => handleIssueClick(issue)}
                            className="w-full"
                          >
                            Manage Issue
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Issues List */}
        <Card>
          <CardHeader>
            <CardTitle>All Issues</CardTitle>
            <CardDescription>
              Click on an issue to update its status or assign to a department
            </CardDescription>
          </CardHeader>
          <CardContent>
            {issues.length > 0 ? (
              <div className="space-y-4">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleIssueClick(issue)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(issue.status)}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(issue.status)}
                              {issue.status.replace("_", " ")}
                            </span>
                          </Badge>
                          <span className="text-xs text-muted-foreground">{issue.category}</span>
                          {issue.departmentId && (
                            <Badge variant="outline">
                              {departments.find(d => d.id === issue.departmentId)?.name || "Unknown Dept"}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mb-1">{issue.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {issue.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {issue.address || `${issue.latitude.toFixed(4)}, ${issue.longitude.toFixed(4)}`}
                          </span>
                          <span>Reported by: {issue.userName || "Anonymous"}</span>
                          <span>Votes: {issue.voteCount}</span>
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {issue.imageUrl && (
                        <img 
                          src={issue.imageUrl} 
                          alt={issue.title}
                          className="w-24 h-24 object-cover rounded ml-4"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No issues found</p>
                <p className="text-muted-foreground">Try adjusting your filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Update Issue Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Issue</DialogTitle>
            <DialogDescription>
              Update the status, assign to a department, or add admin notes
            </DialogDescription>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{selectedIssue.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{selectedIssue.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Category: {selectedIssue.category}</span>
                  <span>•</span>
                  <span>Votes: {selectedIssue.voteCount}</span>
                  <span>•</span>
                  <span>Reported: {new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
                </div>
                {selectedIssue.imageUrl && (
                  <img 
                    src={selectedIssue.imageUrl} 
                    alt={selectedIssue.title}
                    className="w-full h-48 object-cover rounded mt-3"
                  />
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Assign to Department</label>
                  <Select value={assignedDepartment} onValueChange={setAssignedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                  <Textarea
                    placeholder="Add internal notes about this issue..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={handleUpdateIssue} disabled={updating}>
              {updating ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
