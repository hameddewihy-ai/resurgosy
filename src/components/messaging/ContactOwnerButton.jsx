import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { supabase, isConfigured } from "../../lib/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import ChatBox from "./ChatBox";

export default function ContactOwnerButton({ propertyId, ownerId, ownerName }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [convId, setConvId] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!user || user.id === ownerId) return null;

  const openChat = async () => {
    if (!isConfigured) return;
    setLoading(true);

    // Get or create conversation
    let { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("property_id", propertyId)
      .eq("buyer_id", user.id)
      .maybeSingle();

    if (existing) {
      setConvId(existing.id);
    } else {
      const { data: created } = await supabase
        .from("conversations")
        .insert({ property_id: propertyId, buyer_id: user.id, owner_id: ownerId })
        .select("id")
        .single();
      setConvId(created?.id);
    }

    setLoading(false);
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={openChat}
        disabled={loading}
        className="flex items-center gap-2 bg-[#5979bb] hover:bg-[#4a6aaa] disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
      >
        <MessageCircle size={16} />
        {loading ? "جاري الفتح..." : "راسل المالك"}
      </button>

      {/* Chat popup */}
      {open && convId && (
        <div className="fixed bottom-6 left-6 z-50 w-80 h-96 bg-[#1f2a38] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <ChatBox
            conversationId={convId}
            currentUserId={user.id}
            otherName={ownerName || "المالك"}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
