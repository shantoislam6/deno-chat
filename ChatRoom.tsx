export default function ChatRoom() {
  return (
    <div className="border p-2 h-[400px] w-[200px] absolute flex flex-col bg-white right-[calc(101%)]">
      <div className="text-lg font-semibold">People</div>
      <div className="p-3 flex-1 overflow-x-hidden flex flex-col gap-2" id="chat-room">
      </div>
    </div>
  )
}
