"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

export default function EditProfilePage() {
  const [activeTab, setActiveTab] = useState("edit-profile");
  const [formData, setFormData] = useState({
    name: "Uprox",
    username: "uprox_",
    website: "",
    bio: "",
    email: "",
    phone: "+91 971",
    gender: "prefer-not-to-say",
    showSimilarAccounts: true,
  });

  const sidebarItems = [
    { id: "edit-profile", label: "Edit profile", active: true },
    { id: "professional", label: "Professional account", active: false },
    { id: "change-password", label: "Change password", active: false },
    { id: "apps-websites", label: "Apps and websites", active: false },
    { id: "email-notifications", label: "Email notifications", active: false },
    { id: "push-notifications", label: "Push notifications", active: false },
    { id: "manage-contacts", label: "Manage contacts", active: false },
    { id: "privacy-security", label: "Privacy and security", active: false },
    { id: "ads", label: "Ads", active: false },
    { id: "supervision", label: "Supervision", active: false },
    { id: "login-activity", label: "Login activity", active: false },
    { id: "emails-instagram", label: "Emails from Instagram", active: false },
    { id: "help", label: "Help", active: false },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
  };

  const handleDeactivate = () => {
    console.log("Temporarily deactivate account");
  };

  return (
    <div className="min-h-screen w-full flex justify-center my-4">
      <div className="w-[80%]">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">f</span>
              </div>
              <span className="font-semibold text-gray-900">Meta</span>
            </div>
          </div>
          <div className="mt-2">
            <h1 className="text-xl font-semibold text-gray-900">
              Some account settings are moving
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Soon, Accounts Center will be the primary place to manage your
              account info and settings.
            </p>
            <button className="text-blue-500 text-sm hover:underline mt-1">
              Learn more
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-white">
            <div className="p-6">
              <nav className="space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeTab === item.id
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Switch to personal account */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button className="text-blue-500 text-sm hover:underline">
                  Switch to personal account
                </button>
              </div>

              {/* Meta Accounts Center */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-sm"></div>
                  <span className="font-semibold text-gray-900 text-sm">
                    Meta
                  </span>
                </div>
                <button className="text-blue-500 text-sm hover:underline">
                  Accounts Center
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Control settings for connected experiences across Instagram,
                  the Facebook app and Messenger, including story and post
                  sharing and logging in.
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {activeTab === "edit-profile" ? (
              <div className="max-w-2xl">
                {/* Profile Photo */}
                <div className="w-full flex justify-center mb-8">
                  <div className="flex items-center gap-6">
                    <Avatar className="w-14 h-14">
                      <AvatarImage
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg/500px-20180610_FIFA_Friendly_Match_Austria_vs._Brazil_Neymar_850_1705.jpg"
                        alt="uprox_"
                        className="object-cover w-full h-full rounded-full"
                      />
                      <AvatarFallback>UP</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">uprox_</div>
                      <button className="text-blue-500 text-sm hover:underline">
                        Change profile photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                  {/* Name */}
                  <div className="grid grid-cols-3 gap-4 items-start">
                    <Label
                      htmlFor="name"
                      className="text-right pt-2 font-medium"
                    >
                      Name
                    </Label>
                    <div className="col-span-2">
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Help people discover your account by using the name
                        you&#39;re known by: either your full name, nickname, or
                        business name.
                      </p>
                      <p className="text-xs text-gray-500">
                        You can only change your name twice within 14 days.
                      </p>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="grid grid-cols-3 gap-4 items-start">
                    <Label
                      htmlFor="username"
                      className="text-right pt-2 font-medium"
                    >
                      Username
                    </Label>
                    <div className="col-span-2">
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        In most cases, you&#39;ll be able to change your username
                        back to uprox_ for another 14 days.
                        <button className="text-blue-500 hover:underline ml-1">
                          Learn more
                        </button>
                      </p>
                    </div>
                  </div>

                  {/* Website */}
                  <div className="grid grid-cols-3 gap-4 items-start">
                    <Label
                      htmlFor="website"
                      className="text-right pt-2 font-medium"
                    >
                      Website
                    </Label>
                    <div className="col-span-2">
                      <Input
                        id="website"
                        placeholder="Website"
                        value={formData.website}
                        onChange={(e) =>
                          handleInputChange("website", e.target.value)
                        }
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Editing your links is only available on mobile. Visit
                        the Instagram app and edit your profile to change the
                        websites in your bio.
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="grid grid-cols-3 gap-4 items-start">
                    <Label
                      htmlFor="bio"
                      className="text-right pt-2 font-medium"
                    >
                      Bio
                    </Label>
                    <div className="col-span-2">
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        className="w-full min-h-[80px]"
                        maxLength={150}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {formData.bio.length} / 150
                      </div>
                    </div>
                  </div>

                  {/* Personal Information Header */}
                  <div className="pt-8">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                      Personal information
                    </h3>
                    <p className="text-xs text-gray-500">
                      Provide your personal information, even if the account is
                      used for a business, a pet or something else. This won&#39;t
                      be a part of your public profile.
                    </p>
                  </div>

                  {/* Email */}
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <Label htmlFor="email" className="text-right font-medium">
                      Email
                    </Label>
                    <div className="col-span-2">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Phone number */}
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <Label htmlFor="phone" className="text-right font-medium">
                      Phone number
                    </Label>
                    <div className="col-span-2">
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <Label htmlFor="gender" className="text-right font-medium">
                      Gender
                    </Label>
                    <div className="col-span-2">
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          handleInputChange("gender", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">
                            Prefer not to say
                          </SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Show account suggestions */}
                  <div className="grid grid-cols-3 gap-4 items-start">
                    <Label className="pt-2 font-medium">
                      Show account suggestions on profiles
                    </Label>
                    <div className="col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="suggestions"
                          checked={formData.showSimilarAccounts}
                          onCheckedChange={(checked) =>
                            setFormData((prev) => ({
                              ...prev,
                              showSimilarAccounts: checked as boolean,
                            }))
                          }
                        />
                        <Label htmlFor="suggestions" className="text-sm">
                          Choose whether people can see similar account
                          suggestions on your profile, and whether your account
                          can be suggested on other profiles.
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="grid grid-cols-3 gap-4 pt-6">
                    <div></div>
                    <div className="col-span-2">
                      <Button
                        onClick={handleSubmit}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2"
                      >
                        Submit
                      </Button>
                    </div>
                  </div>

                  {/* Temporarily deactivate */}
                  <div className="grid grid-cols-3 gap-4">
                    <div></div>
                    <div className="col-span-2">
                      <button
                        onClick={handleDeactivate}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Temporarily deactivate my account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Placeholder for other tabs
              <div className="max-w-2xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  {sidebarItems.find((item) => item.id === activeTab)?.label}
                </h2>
                <p className="text-gray-600">
                  This section is under development. Currently showing the Edit
                  Profile tab.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
