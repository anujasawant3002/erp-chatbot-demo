using Microsoft.AspNetCore.SignalR;
using ChatbotApi.Data;
using ChatbotApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;

namespace ChatbotApi.Hubs
{
   [Authorize]
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;
        //private readonly TimeSpan SessionTimeout = TimeSpan.FromMinutes(30);

        public ChatHub(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SendMessageWithContext(string message, string username, string currentPage)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.FullName == username);
            if (user == null) return;

            var utcNow = DateTime.UtcNow;

            // ================================================
            //   1️⃣ DETERMINE ACTIVE SESSION (or create new)
            // ================================================
            var activeSession = await _context.CandidateChatHistories
                .Where(s => s.CandidateUserID == user.UserID)
                .OrderByDescending(s => s.SessionStart)
                .FirstOrDefaultAsync();

            bool startNewSession = false;

            if (activeSession == null)
            {
                startNewSession = true;
            }
            else
            {
                // Find last message in session
                var lastMessage = await _context.ChatMessages
                    .Where(m => m.CandidateChatHistoryID == activeSession.CandidateChatHistoryID)
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefaultAsync();

                if (lastMessage == null)
                {
                    startNewSession = true;
                }
                else
                {
                    // RULE: New session when calendar date changes (IST)
                    var sessionDate = activeSession.SessionStart.ToLocalTime().Date;
                    var todayDate = DateTime.UtcNow.ToLocalTime().Date;

                    if (sessionDate != todayDate)
                    {
                        activeSession.SessionEnd = activeSession.Messages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => m.CreatedAt)
                        .FirstOrDefault();

                       await _context.SaveChangesAsync();

                        startNewSession = true;
                    }
                    // If NOW - last message > 30 minutes → NEW Session
                 
                }
            }

            // Create new session if needed
            if (startNewSession)
            {
                activeSession = new CandidateChatHistory
                {
                    CandidateUserID = user.UserID,
                    SessionStart = DateTime.UtcNow,
                    SessionEnd = null
                };

                _context.CandidateChatHistories.Add(activeSession);
                await _context.SaveChangesAsync();
            }

            bool isFirstMessage = false;//!activeSession.Messages.Any();

            var existingMessages = await _context.ChatMessages
            .Where(m => m.CandidateChatHistoryID == activeSession.CandidateChatHistoryID)
            .CountAsync();

            if (existingMessages == 0)
        {
            isFirstMessage = true;
    }
 
            // ================================================
            //   2️⃣ SAVE USER MESSAGE(only if not empty)
            // ================================================
            // If message is empty and it's first message, skip saving user message
            if (!string.IsNullOrWhiteSpace(message) || !isFirstMessage)
            {

            
            var userMessage = new ChatMessage
            {
                UserID = user.UserID,
                CandidateChatHistoryID = activeSession.CandidateChatHistoryID,
                SenderName = user.FullName,
                MessageText = message,
                MessageType = "user",
                CreatedAt = utcNow,
                CurrentPage = currentPage
            };

            _context.ChatMessages.Add(userMessage);
            await _context.SaveChangesAsync();

            await Clients.Caller.SendAsync("ReceiveMessage", user.FullName, message);
            }
            // ================================================
            //   3️⃣ GENERATE & SAVE BOT RESPONSE
            // ================================================
            //var botResponse = await GenerateBotResponse(message);

            string botResponse;

            if (isFirstMessage)
            {
                botResponse =
                    $"👋 Hi {user.FullName}! Welcome to your HR Assistant.\n" +
                    $"How can I help you today?\n" +
                    $"Type *anything* to begin 😊\n\n" +
                    "[HELP_MAIN_OPTIONS]";
            }
            else
            {
                botResponse = await GenerateBotResponse(message);
            }


            var botMessage = new ChatMessage
            {
                UserID = user.UserID,
                CandidateChatHistoryID = activeSession.CandidateChatHistoryID,
                SenderName = "Bot",
                MessageText = botResponse,
                MessageType = "bot",
                CreatedAt = utcNow,
                CurrentPage = currentPage
            };

            _context.ChatMessages.Add(botMessage);
            await _context.SaveChangesAsync();

            // Send response
            await Task.Delay(700);
            await Clients.Caller.SendAsync("ReceiveMessage", "Bot", botResponse);
        }

        // KEEP YOUR EXISTING MENU / SUBOPTION / ANSWER LOGIC
        private async Task<string> GenerateBotResponse(string rawMessage)
        {
            var message = rawMessage?.Trim().ToLower() ?? "";

            if (message == "start_chat" || message == ""){
                
                return await GetMainMenu();
            }

            if (Regex.IsMatch(message, @"^(hi|hello|hey|menu|start)$"))
                return await GetMainMenu();

            var mainOption = await _context.BotMainOptions
                .FirstOrDefaultAsync(m => m.Value.ToLower() == message && m.IsActive);

            if (mainOption != null)
                return await GetSubOptions(mainOption);

            var subOption = await _context.BotSubOptions
                .FirstOrDefaultAsync(s => s.Value.ToLower() == message && s.IsActive);

            if (subOption != null)
                return await GetSubOptionAnswer(subOption);

            return $"I didn't understand that.\n\n[HELP_MAIN_OPTIONS]";
        }

        private async Task<string> GetMainMenu()
        {
            var options = await _context.BotMainOptions
                .Where(o => o.IsActive)
                .OrderBy(o => o.DisplayOrder)
                .ToListAsync();

            if (!options.Any())
                return "No menu options available.";

            var optionString = string.Join("|", options.Select(o => $"{o.Label}:{o.Value}"));
            return $"👋 Hello! Please choose a category:\n\n[HELP_MAIN_OPTIONS:{optionString}]";
        }

        private async Task<string> GetSubOptions(BotMainOption parent)
        {
            var subOptions = await _context.BotSubOptions
                .Where(s => s.BotMainOptionID == parent.BotMainOptionID && s.IsActive)
                .OrderBy(s => s.DisplayOrder)
                .ToListAsync();

            if (!subOptions.Any())
                return $"No topics available under **{parent.Label}**.\n\n[HELP_MAIN_OPTIONS]";

            var buttons = subOptions
                .Select(s => $"{s.Label}:{s.Value}")
                .ToList();

            buttons.Add("⬅️ Back:bot_main_options");

            var btnString = string.Join("|", buttons);
            return $"📂 **{parent.Label}**\n\nSelect a topic:\n[HELP_MAIN_OPTIONS:{btnString}]";
        }

        private async Task<string> GetSubOptionAnswer(BotSubOption sub)
        {
            var ans = await _context.BotSubOptionAnswers
                .FirstOrDefaultAsync(a => a.BotSubOptionID == sub.BotSubOptionID && a.IsActive);

            if (ans == null)
                return $"No information found for **{sub.Label}**.\n\n[HELP_MAIN_OPTIONS]";

            return $"{ans.AnswerText}\n\n[HELP_MAIN_OPTIONS]";
        }
    }
}
