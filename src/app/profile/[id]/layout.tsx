import { Metadata } from "next";

interface ProfileLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

// Generate metadata for profile pages
export async function generateMetadata({
  params,
}: ProfileLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const profileId = resolvedParams.id;

  // In real app, you would fetch user data here
  // For now, we'll use basic metadata
  const isOwnProfile = profileId === "me";

  if (isOwnProfile) {
    return {
      title: "Your Profile | Social Media Mini",
      description: "Manage your profile and view your posts",
    };
  }

  // For other profiles, you could fetch the actual user data
  return {
    title: `${profileId} Profile | Social Media Mini`,
    description: `View ${profileId}'s profile, posts, and stories`,
    openGraph: {
      title: `${profileId} Profile`,
      description: `Check out ${profileId}'s posts and stories`,
      type: "profile",
    },
  };
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <>{children}</>;
}
