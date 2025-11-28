
using System.ComponentModel.DataAnnotations;

namespace ChatbotApi.Models
{
    public class User
    {
        public int UserID { get; set; }
        public string? FullName { get; set; }
        
        [EmailAddress] 
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Role { get; set; }
        public string? RecruitmentStatus { get; set; }
        public string? OnboardingStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool IsActive { get; set; }
    }
}
