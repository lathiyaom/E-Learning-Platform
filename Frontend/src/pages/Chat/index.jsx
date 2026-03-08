import React from "react";
import { useSelector } from "react-redux";
import Chat from "../../components/Chat";
import AdminLayout from "../../utils/Adminlayoute";
import { selectCurrentUser } from "../../redux/slice/authSlice";

function ChatInterface() {
  const user = useSelector(selectCurrentUser);

  if (!user) {
    return null;
  }

  return (
    <AdminLayout showSearch={false} className="p-0">
      <Chat user={user} />
    </AdminLayout>
  );
}

export default ChatInterface;
