export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">John Doe</h1>
              <p className="text-gray-600">@johndoe</p>
              <p className="text-gray-700 mt-2">
                Software developer passionate about creating amazing user
                experiences. Love coding, coffee, and connecting with people.
              </p>
              <div className="flex space-x-6 mt-4 text-sm text-gray-500">
                <span>
                  <strong>123</strong> Posts
                </span>
                <span>
                  <strong>456</strong> Followers
                </span>
                <span>
                  <strong>789</strong> Following
                </span>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((post) => (
              <div key={post} className="border border-gray-200 rounded-lg p-4">
                <p className="text-gray-900 text-sm">
                  Sample post content {post}. This is what the user has shared.
                </p>
                <p className="text-xs text-gray-500 mt-2">2 days ago</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
