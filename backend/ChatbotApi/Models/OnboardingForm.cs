using System;
using System.ComponentModel.DataAnnotations;

namespace ChatbotApi.Models
{
    public class OnboardingForm
    {
        [Key]
        public int FormID { get; set; }
        public string SectionName { get; set; }
        public string Description { get; set; }
        public int DisplayOrder { get; set; }
        public string RouteURL { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
