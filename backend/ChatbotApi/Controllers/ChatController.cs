using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using ChatbotApi.Hubs;

namespace ChatbotApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(IHubContext<ChatHub> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] ChatMessage message)
        {
            // Echo message back to all clients (like a chatbot reply)
            var botReply = $"Bot: You said '{message.Message}'";

            await _hubContext.Clients.All.SendAsync("ReceiveMessage", message.User, message.Message);
            await _hubContext.Clients.All.SendAsync("ReceiveMessage", "Chatbot", botReply);

            return Ok(new { user = message.User, botReply });
        }
    }

    public class ChatMessage
    {
        public string User { get; set; }
        public string Message { get; set; }
    }
}
