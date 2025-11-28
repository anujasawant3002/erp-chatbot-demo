using Microsoft.EntityFrameworkCore;
using ChatbotApi.Models;

namespace ChatbotApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<OnboardingForm> OnboardingForms { get; set; }
        public DbSet<UserFormProgress> UserFormProgress { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        public DbSet<BotMainOption> BotMainOptions { get; set; }
        public DbSet<BotSubOption> BotSubOptions { get; set; }
        public DbSet<CandidateChatHistory> CandidateChatHistories { get; set; }

        public DbSet<BotSubOptionAnswer> BotSubOptionAnswers { get; set; }

        // Add other DbSets as needed

        protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
    base.OnModelCreating(modelBuilder);

    // User email unique
    modelBuilder.Entity<User>()
        .HasIndex(u => u.Email)
        .IsUnique();

    // USER → MESSAGES
    modelBuilder.Entity<ChatMessage>()
        .HasOne(cm => cm.User)
        .WithMany()
        .HasForeignKey(cm => cm.UserID)
        .OnDelete(DeleteBehavior.Cascade);

    // SESSION → USER
    modelBuilder.Entity<CandidateChatHistory>()
        .HasOne(s => s.Candidate)
        .WithMany()
        .HasForeignKey(s => s.CandidateUserID)
        .OnDelete(DeleteBehavior.Restrict);

    // SESSION → MESSAGES (1:M)
    modelBuilder.Entity<ChatMessage>()
        .HasOne(cm => cm.ChatSession)
        .WithMany(s => s.Messages)
        .HasForeignKey(cm => cm.CandidateChatHistoryID)
        .OnDelete(DeleteBehavior.Cascade);

    // BotMainOption → SubOptions
    modelBuilder.Entity<BotSubOption>()
        .HasOne(s => s.MainOption)
        .WithMany(m => m.SubOptions)
        .HasForeignKey(s => s.BotMainOptionID);

    // Answers
    modelBuilder.Entity<BotSubOptionAnswer>()
        .HasOne(a => a.BotSubOption)
        .WithMany()
        .HasForeignKey(a => a.BotSubOptionID)
        .OnDelete(DeleteBehavior.Cascade);
     }

    }
}
