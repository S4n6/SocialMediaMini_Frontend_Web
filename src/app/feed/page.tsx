export default function FeedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Feed</h1>

        {/* Create Post Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <textarea
            placeholder="What's on your mind?"
            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
          <div className="flex justify-end mt-4">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              Post
            </button>
          </div>
        </div>

        {/* Sample Posts */}
        <div className="space-y-6">
          {[1, 2, 3].map((post) => (
            <div key={post} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <p className="text-gray-900 mb-4">
                This is a sample post content. It could be longer and contain
                more interesting information about what the user is sharing.
              </p>
              <div className="flex items-center space-x-6 text-gray-500">
                <button className="flex items-center space-x-2 hover:text-blue-600">
                  <span>👍</span>
                  <span>Like</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-blue-600">
                  <span>💬</span>
                  <span>Comment</span>
                </button>
                <button className="flex items-center space-x-2 hover:text-blue-600">
                  <span>🔄</span>
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
