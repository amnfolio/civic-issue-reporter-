"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Users, CheckCircle, Clock, AlertCircle, FileText } from "lucide-react";
import type { Stats, Issue } from "@/types";

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, issuesRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/issues?limit=6&sort=createdAt&order=desc"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (issuesRes.ok) {
          const issuesData = await issuesRes.json();
          setRecentIssues(issuesData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Report. Track. Resolve.
              <span className="block text-primary mt-2">Your Civic Issues</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              CivicSense empowers citizens to report civic problems, track their progress, and work together
              with local authorities to create a better community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
            <p className="text-gray-600">Real-time insights into civic issue management</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-8 bg-gray-200 rounded animate-pulse" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Total Issues
                      </CardTitle>
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalIssues}</p>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Resolved
                      </CardTitle>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.issuesByStatus.resolved}
                    </p>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        In Progress
                      </CardTitle>
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {stats.issuesByStatus.in_progress}
                    </p>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Resolution Rate
                      </CardTitle>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.resolutionRate}%</p>
                  </CardHeader>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Issues by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(stats.issuesByCategory).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{
                                  width: `${(count / stats.totalIssues) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-900 w-8 text-right">
                              {count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Most Voted Issue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.mostVotedIssue ? (
                      <div className="space-y-2">
                        <p className="font-medium text-gray-900">{stats.mostVotedIssue.title}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{stats.mostVotedIssue.voteCount} votes</span>
                        </div>
                        <Link href={`/dashboard`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-600">No votes yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600">Failed to load statistics</p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-gray-600">Everything you need to manage civic issues effectively</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Map-Based Reporting</CardTitle>
                <CardDescription>
                  Drop a pin on the map to mark the exact location of civic issues with GPS precision
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Community Voting</CardTitle>
                <CardDescription>
                  Upvote issues in your locality to highlight urgency and community consensus
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Real-Time Tracking</CardTitle>
                <CardDescription>
                  Track the status of your reported issues from submission to resolution
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <AlertCircle className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Get notified when the status of your reported issues changes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Admin Dashboard</CardTitle>
                <CardDescription>
                  Municipal authorities can view, assign, and manage issues efficiently
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-10 w-10 text-primary mb-4" />
                <CardTitle>Photo Evidence</CardTitle>
                <CardDescription>
                  Upload images of issues to provide clear visual documentation
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Issues Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Issues</h2>
            <p className="text-gray-600">Latest civic issues reported by the community</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : recentIssues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentIssues.map((issue) => (
                <Card key={issue.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-gray-500">{issue.category}</span>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{issue.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {issue.description}
                    </CardDescription>
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{issue.voteCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{issue.address || "Location"}</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No recent issues</p>
          )}

          <div className="text-center mt-8">
            <Link href="/dashboard">
              <Button variant="outline">View All Issues</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of citizens working together to improve their communities
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <MapPin className="h-6 w-6" />
              <span className="text-xl font-bold">CivicSense</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering citizens to create better communities
            </p>
            <p className="text-gray-500 text-sm">
              © 2024 CivicSense. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}