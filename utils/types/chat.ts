export type Conversation = {
  id: string;
  user_a: string;
  user_b: string;
  updated_at: string;
  
  // Optional fields: We use these purely on the frontend 
  // to make rendering the Inbox easier (they aren't stored in this table in the DB)
  other_user_email?: string; 
  last_message?: string; 
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type PartnerProfile = {
  full_name: string | null
  username: string | null
  avatar_url: string | null
}

export type InboxItem = {
  conversationId: string
  updatedAt: string
  partnerId: string
  partnerProfile: {
    full_name: string | null
    username: string | null
    avatar_url: string | null
  } | null
}