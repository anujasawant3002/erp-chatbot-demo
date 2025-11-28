using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatbotApi.Models
{
    public class UserFormProgress
    {
        [Key]
        public int ProgressID { get; set; }

        [ForeignKey("User")]
        public int UserID { get; set; }

        [ForeignKey("OnboardingForm")]
        public int FormID { get; set; }
        public string Status { get; set; } = "Not Started";
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime LastUpdatedAt { get; set; } = DateTime.Now;

         public User User { get; set; }
        public OnboardingForm OnboardingForm { get; set; }
    }
}
