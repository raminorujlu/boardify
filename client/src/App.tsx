import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Canvas from "./components/Canvas";

const App = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState("");
  const [isInRoom, setIsInRoom] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const joinRoom = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (roomId.trim() && socket) {
      socket.emit("joinRoom", roomId);
      setIsInRoom(true);
    }
  };

  return (
    <main className="w-full h-screen grid place-items-center entrance">
      <div className="container mx-auto p-4">
        {!isInRoom ? (
          <form
            onSubmit={joinRoom}
            className="max-w-sm mx-auto border border-zinc-200 items-center gap-3 bg-zinc-100 p-16 rounded-3xl shadow-xl shadow-zinc-900/20 flex flex-col"
          >
            <h1 className="text-5xl w-min text-center font-bold tracking-tight bg-gradient-to-l from-[#00d9ff] via-[#011efc] to-[#dd00ff] text-transparent bg-clip-text p-2">
              Boardify
            </h1>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg bg-transparent tracking-tight outline-none caret-inherit text-black"
              required
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg tracking-tight"
            >
              Join Room
            </button>
          </form>
        ) : (
          <div>
            <div className="flex justify-between items-center">
              <div className="tracking-tight border border-zinc-200 text-zinc-100 uppercase font-bold rounded-lg flex pl-2">
                <p>Room</p>
                <p className="font-normal ml-2 text-black bg-white flex-1 px-2 rounded-e-md">
                  {roomId}
                </p>
              </div>
              <button
                onClick={() => {
                  socket?.emit("leaveRoom", roomId);
                  setIsInRoom(false);
                  setRoomId("");
                }}
                className="px-3 py-2 bg-black text-white rounded-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                  />
                </svg>
              </button>
            </div>
            <Canvas roomId={roomId} socket={socket as Socket} />
          </div>
        )}
      </div>
    </main>
  );
};

export default App;
