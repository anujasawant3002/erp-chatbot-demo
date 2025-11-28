using System.ComponentModel.DataAnnotations.Schema;

namespace ChatbotApi.Models
{
    public class CandidateChatHistory   // This is now a CHAT SESSION
    {
        public int CandidateChatHistoryID { get; set; }   // SessionID

        public int CandidateUserID { get; set; }          // FK → User table

        public DateTime SessionStart { get; set; }        // When chat started
        public DateTime? SessionEnd { get; set; }         // When chat ended (optional)

        // Navigation
        public User? Candidate { get; set; }

        // One session → many messages
        public ICollection<ChatMessage>? Messages { get; set; }
    }
}

