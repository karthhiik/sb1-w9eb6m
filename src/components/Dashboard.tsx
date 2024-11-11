import React, { useState } from 'react';
import { Send, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [tweet, setTweet] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTweetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tweet.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: tweet }),
      });

      if (!response.ok) throw new Error('Failed to create tweet');

      toast.success('Tweet posted successfully!');
      setTweet('');
    } catch (error) {
      toast.error('Failed to post tweet');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Tweet</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleTweetSubmit} className="space-y-4">
            <div>
              <label htmlFor="tweet" className="block text-sm font-medium text-gray-700 mb-2">
                What's on your mind?
              </label>
              <textarea
                id="tweet"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Type your tweet here..."
                value={tweet}
                onChange={(e) => setTweet(e.target.value)}
                maxLength={280}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {tweet.length}/280 characters
                </span>
                <button
                  type="submit"
                  disabled={loading || !tweet.trim()}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                >
                  {loading ? (
                    'Posting...'
                  ) : (
                    <>
                      Post Tweet
                      <Send className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}