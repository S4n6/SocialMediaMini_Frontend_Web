"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function ThemeDemo() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <h1 className="heading-1 gradient-text">Social Media Mini</h1>
          <p className="body-large">A comprehensive theme system showcase</p>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>

      {/* Color Palette */}
      <Card className="post-card">
        <CardHeader>
          <CardTitle className="heading-2">Color System</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="w-16 h-16 bg-primary rounded-lg"></div>
            <p className="body-small">Primary</p>
          </div>
          <div className="space-y-2">
            <div className="w-16 h-16 bg-secondary rounded-lg"></div>
            <p className="body-small">Secondary</p>
          </div>
          <div className="space-y-2">
            <div className="w-16 h-16 bg-accent rounded-lg"></div>
            <p className="body-small">Accent</p>
          </div>
          <div className="space-y-2">
            <div className="w-16 h-16 bg-muted rounded-lg"></div>
            <p className="body-small">Muted</p>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className="post-card">
        <CardHeader>
          <CardTitle className="heading-2">Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h1 className="heading-1">Heading 1 - Display Font</h1>
          <h2 className="heading-2">Heading 2 - Display Font</h2>
          <h3 className="heading-3">Heading 3 - Regular Font</h3>
          <p className="body-large">Body Large - For important content</p>
          <p className="text-responsive-base">
            Responsive Text - Adapts to screen size
          </p>
          <p className="body-small">Body Small - For secondary information</p>
        </CardContent>
      </Card>

      {/* Social Media Components */}
      <Card className="post-card">
        <CardHeader>
          <CardTitle className="heading-2">Social Media Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Story Ring */}
          <div className="flex items-center space-x-4">
            <div className="story-ring">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">JD</span>
              </div>
            </div>
            <div className="story-ring-viewed">
              <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">AS</span>
              </div>
            </div>
            <p className="body-small">Story Rings - Active vs Viewed</p>
          </div>

          {/* Post Card Example */}
          <div className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center avatar-online">
                <span className="text-primary-foreground font-bold">TK</span>
              </div>
              <div>
                <h4 className="font-semibold">John Doe</h4>
                <p className="body-small">2 hours ago</p>
              </div>
            </div>

            <p className="text-responsive-base">
              Just launched our new social media app! 🚀 The theme system is
              incredible.
            </p>

            <div className="flex items-center space-x-6 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-red-500"
              >
                <Heart className="w-4 h-4 mr-1" />
                24
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <MessageCircle className="w-4 h-4 mr-1" />8
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <Share className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Elements */}
      <Card className="post-card">
        <CardHeader>
          <CardTitle className="heading-2">Interactive Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="default">Default Badge</Badge>
            <Badge variant="secondary">Secondary Badge</Badge>
            <Badge variant="outline">Outline Badge</Badge>
            <Badge variant="destructive">Destructive Badge</Badge>
          </div>

          <div className="space-y-2">
            <div className="sidebar-item">
              <Heart className="w-5 h-5" />
              <span>Regular Sidebar Item</span>
            </div>
            <div className="sidebar-item active">
              <MessageCircle className="w-5 h-5" />
              <span>Active Sidebar Item</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animations */}
      <Card className="post-card">
        <CardHeader>
          <CardTitle className="heading-2">Custom Animations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button
              variant="outline"
              className="animate-bounce-like"
              onClick={(e) => {
                e.currentTarget.classList.remove("animate-bounce-like");
                setTimeout(
                  () => e.currentTarget.classList.add("animate-bounce-like"),
                  10
                );
              }}
            >
              <Heart className="w-4 h-4 mr-2" />
              Like Animation
            </Button>

            <div className="relative">
              <Button variant="outline">
                <div className="animate-pulse-ring absolute inset-0 rounded-md border-2 border-primary"></div>
                Pulse Ring
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gradient Text Examples */}
      <Card className="post-card">
        <CardHeader>
          <CardTitle className="heading-2">Gradient Effects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-gradient text-2xl font-bold">
            Instagram-style Gradient Text
          </h3>
          <p className="gradient-text text-lg">
            Beautiful gradient effects for social media
          </p>
          <div
            className="w-full h-4 rounded-full"
            style={{ background: "var(--instagram-gradient)" }}
          ></div>
          <div
            className="w-full h-4 rounded-full"
            style={{ background: "var(--story-gradient)" }}
          ></div>
        </CardContent>
      </Card>
    </div>
  );
}
