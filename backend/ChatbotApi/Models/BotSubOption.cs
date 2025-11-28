namespace ChatbotApi.Models
{
    public class BotSubOption
    {
        public int BotSubOptionID { get; set; }

        public int BotMainOptionID { get; set; }  // FK → Parent Main Option

        public string Label { get; set; }

        public string Value { get; set; }

        // Info / Document / Training / Navigation etc
        public string? Type { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; }

        public int AccessGroupID { get; set; } = 1; // Default to 1


        // Navigation Property
        public BotMainOption? MainOption { get; set; }
    }
}
