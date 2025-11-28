using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using ChatbotApi.Hubs;
using ChatbotApi.Data;
using ChatbotApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace ChatbotApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly ApplicationDbContext _context;

        public ChatController(IHubContext<ChatHub> hubContext, ApplicationDbContext context)
        {
            _hubContext = hubContext;
            _context = context;
        }

        // Simple test endpoint (you can keep/remove)
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessageDto message)
        {
            var botReply = $"Bot: You said '{message.Message}'";
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", message.User, message.Message);
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Chatbot", botReply);
            return Ok(new { user = message.User, botReply });
        }

        // ============================================
        //  1) LATEST SESSION HISTORY FOR USER
        //     -> used when opening chatbot
        // ============================================
        [Authorize]
        [HttpGet("history/{username}")]
        public async Task<IActionResult> GetLatestSessionHistory(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.FullName == username);
            if (user == null)
                return NotFound(new { message = "User not found" });

            // Find latest session
            var lastSession = await _context.CandidateChatHistories
                .Where(s => s.CandidateUserID == user.UserID)
                .OrderByDescending(s => s.SessionStart)
                .FirstOrDefaultAsync();

            if (lastSession == null)
            {
                // No sessions yet
                return Ok(new List<object>());
            }

            var messages = await _context.ChatMessages
                .Where(cm => cm.CandidateChatHistoryID == lastSession.CandidateChatHistoryID)
                .OrderBy(cm => cm.CreatedAt)
                .Select(cm => new
                {
                    sender = cm.SenderName,
                    message = cm.MessageText,
                    timestamp = cm.CreatedAt,
                    messageType = cm.MessageType,
                    currentPage = cm.CurrentPage
                })
                .ToListAsync();

            return Ok(messages);
        }

        // ============================================
        //  2) LIST ALL SESSIONS FOR USER
        //     -> for "history" sidebar
        // ============================================
        [Authorize]
        [HttpGet("sessions/{username}")]
        public async Task<IActionResult> GetSessionsForUser(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.FullName == username);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var sessions = await _context.CandidateChatHistories
                .Where(s => s.CandidateUserID == user.UserID)
                .OrderByDescending(s => s.SessionStart)
                .Select(s => new
                {
                    sessionId = s.CandidateChatHistoryID,
                    startedAt = s.SessionStart,
                    endedAt = s.SessionEnd,
                    messageCount = s.Messages.Count,
                    lastMessageAt = s.Messages
                        .OrderByDescending(m => m.CreatedAt)
                        .Select(m => (DateTime?)m.CreatedAt)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(sessions);
        }

        // ============================================
        //  3) MESSAGES FOR SPECIFIC SESSION
        // ============================================
        [Authorize]
        [HttpGet("session-messages/{sessionId}")]
        public async Task<IActionResult> GetSessionMessages(int sessionId)
        {
            var session = await _context.CandidateChatHistories
                .Include(s => s.Candidate)
                .FirstOrDefaultAsync(s => s.CandidateChatHistoryID == sessionId);

            if (session == null)
                return NotFound(new { message = "Session not found" });

            var messages = await _context.ChatMessages
                .Where(cm => cm.CandidateChatHistoryID == sessionId)
                .OrderBy(cm => cm.CreatedAt)
                .Select(cm => new
                {
                    sender = cm.SenderName,
                    message = cm.MessageText,
                    timestamp = cm.CreatedAt,
                    messageType = cm.MessageType,
                    currentPage = cm.CurrentPage
                })
                .ToListAsync();

            return Ok(new
            {
                sessionId = session.CandidateChatHistoryID,
                userId = session.CandidateUserID,
                startedAt = session.SessionStart,
                endedAt = session.SessionEnd,
                messages
            });
        }
    }

    // DTO for test send endpoint
    public class ChatMessageDto
    {
        public string User { get; set; }
        public string Message { get; set; }
    }
}
