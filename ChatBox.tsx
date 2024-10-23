import ChatRoom from "./ChatRoom.tsx";

// ChatBox.jsx
const ChatBox = () => {
  return (
    <div className="flex flex-col h-[80vh] max-sm:h-[100vh] w-[500px] mx-auto bg-white border rounded-lg shadow-md relative">
      <ChatRoom />
      <div className="py-4 px-4 bg-blue-800 rounded-t-md">
        <h1 className="text-white text-lg font-semibold">Chat Room</h1>
      </div>

      <div
        id="loading"
        className="text-xl font-semibold absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2"
      >
        Loading...
      </div>
      {/* Chat Messages Section */}
      <div id="chat-box" className="hidden-item hidden flex-1 p-4 overflow-y-auto bg-gray-200">
      </div>

      {/* Input Section */}
      <form
        id="messageform"
        action=""
        className="hidden-item hidden m-0 p-0"
      >
        <div className="p-4 border-t bg-white">
          <div className="relative flex items-center">
            <input
              type="text"
              name="message"
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-800"
              placeholder="Type your message..."
            />
            <button className="ml-2 px-4 py-2 bg-blue-800 text-white rounded-lg active:bg-blue-900">
              Send
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;
