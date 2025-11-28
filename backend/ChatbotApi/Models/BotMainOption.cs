namespace ChatbotApi.Models
{
    public class BotMainOption
    {
        public int BotMainOptionID { get; set; }

        // Display name shown to user
        public string Label { get; set; }

        // Backend-friendly value (ex: "welcome_day1")
        public string Value { get; set; }

        // Determines order in chatbot
        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; }


        public int AccessGroupID { get; set; } = 1; // Default to 1
        // Navigation Property → Sub Options
        public ICollection<BotSubOption>? SubOptions { get; set; }
    }
}
