namespace ChatbotApi.Models
{
    public class ChatMessage
    {
        public int ChatMessageID { get; set; }

        public int UserID { get; set; }

        // This links message → session
        public int CandidateChatHistoryID { get; set; }  // FK → Chat Session

        public string? SenderName { get; set; }
        public string? MessageText { get; set; }
        public string? MessageType { get; set; } // "user" or "bot"
        public DateTime CreatedAt { get; set; }
        public string? CurrentPage { get; set; }

        // Navigation
        public User? User { get; set; }
         public CandidateChatHistory? ChatSession { get; set; }
    }
}
