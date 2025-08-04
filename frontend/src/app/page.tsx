import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Roomie
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Real-time
            </span>
            <br />
            <span className="text-gray-900">Collaboration</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create, edit, and collaborate on documents in real-time with your team.
            Experience the power of live editing with presence indicators and seamless synchronization.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/create-room"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Create Room
            </Link>
            <Link
              href="/join-room"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-all duration-200"
            >
              Join Room
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need for seamless real-time collaboration
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Real-time Editing",
              description: "Edit documents simultaneously with your team. See changes as they happen with live synchronization.",
              icon: "✏️"
            },
            {
              title: "User Presence",
              description: "See who's online and where they're editing. Track cursors and typing indicators in real-time.",
              icon: "👥"
            },
            {
              title: "Room Management",
              description: "Create private or public rooms. Control access and manage permissions with ease.",
              icon: "🏠"
            },
            {
              title: "Whiteboard",
              description: "Draw and sketch together on a shared canvas. Perfect for brainstorming and visual collaboration.",
              icon: "🎨"
            },
            {
              title: "Document History",
              description: "Never lose your work. All changes are automatically saved and versioned.",
              icon: "📚"
            },
            {
              title: "Cross-platform",
              description: "Works seamlessly across all devices. Access your documents from anywhere.",
              icon: "📱"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Collaborate?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams already using Roomie for real-time collaboration
          </p>
          <Link
            href="/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transition-all duration-200 inline-block"
          >
            Start Collaborating Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 Roomie. Built with Next.js, TypeScript, and Socket.IO</p>
        </div>
      </footer>
    </div>
  );
}
