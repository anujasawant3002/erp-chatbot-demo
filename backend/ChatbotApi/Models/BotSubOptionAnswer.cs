// Models/BotSubOptionAnswer.cs
namespace ChatbotApi.Models
{
    public class BotSubOptionAnswer
    {
        public int BotSubOptionAnswerID { get; set; }

        // FK → BotSubOption
        public int BotSubOptionID { get; set; }

        // Main answer text shown to user
        public string AnswerText { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        // Navigation
        public BotSubOption? BotSubOption { get; set; }
    }
}
