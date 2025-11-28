using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ChatbotApi.Data;
using BCrypt.Net;
using System.Linq;
using ChatbotApi.Models;
using Microsoft.AspNetCore.Authorization;


namespace ChatbotApi.Controllers
{
    [ApiController]
    [AllowAnonymous]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly string jwtKey = "YourSuperSecretKeyForJWTTokenGeneration123!";

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == request.Email);

            if (user == null)
            {
                Console.WriteLine($"❌ User not found: {request.Email}");
                return Unauthorized(new { message = "User not found" });
            }

                Console.WriteLine($"✅ User found: {user.Email}");
                Console.WriteLine($"📝 Hash in DB: {user.PasswordHash.Substring(0, 20)}..."); 

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!isPasswordValid)
                return Unauthorized(new { message = "Invalid password" });

                // Update last login time
            user.LastLogin = DateTime.UtcNow;
            _context.SaveChanges();

            var token = GenerateJwtToken(user);

            return Ok(new { 
                token,userId = user.UserID, username = user.FullName, role = user.Role });
        }

        // Helper endpoint to generate BCrypt password hashes
        // WARNING: Remove this endpoint in production!
        [HttpGet("hash-password/{password}")]
        public IActionResult HashPassword(string password)
        {
            var hash = BCrypt.Net.BCrypt.HashPassword(password);
            return Ok(new { password, hash });
        }

        private string GenerateJwtToken(User user)
{
    var tokenHandler = new JwtSecurityTokenHandler();
    var key = Encoding.UTF8.GetBytes(jwtKey);

    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
        new Claim(ClaimTypes.Name, user.FullName),
        new Claim("username", user.FullName),
        new Claim(ClaimTypes.Email, user.Email),
        new Claim("userId", user.UserID.ToString())
    };

    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.UtcNow.AddHours(1),
        Issuer = "ChatbotApi",
        Audience = "ReactApp",
        SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(key),
            SecurityAlgorithms.HmacSha256Signature)
    };

    var token = tokenHandler.CreateToken(tokenDescriptor);
    return tokenHandler.WriteToken(token);
}

    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
