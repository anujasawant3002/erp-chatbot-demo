using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using ChatbotApi.Hubs;
using System.Data.SqlClient;
using ChatbotApi.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Test SQL connection
try
{
    using (var connection = new SqlConnection(connectionString))
    {
        connection.Open();
        Console.WriteLine("✅ Connected to SQL Server successfully!");
    }
}
catch (Exception ex)
{
    Console.WriteLine("❌ SQL connection failed: " + ex.Message);
}

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add SignalR
builder.Services.AddSignalR();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Add JWT Authentication - ENABLED
var jwtKey = "YourSuperSecretKeyForJWTTokenGeneration123!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "ChatbotApi",
            ValidAudience = "ReactApp",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // For SignalR - Allow token from query string
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            { 
                // 🔥 FIX — Handle SignalR NEGO + WS token
                var accessToken = context.Request.Query["access_token"];
                var authorization = context.Request.Headers["Authorization"].FirstOrDefault();
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) && context.HttpContext.Request.Path.StartsWithSegments("/chatHub"))
                {
                    context.Token = accessToken;
                }

                // 🔥 Fix 2 — Handle negotiate auth (Authorization header)
                if (string.IsNullOrEmpty(context.Token) &&
                !string.IsNullOrEmpty(authorization) &&
                 authorization.StartsWith("Bearer "))
                 {
                     context.Token = authorization.Substring("Bearer ".Length).Trim();
                 }


                return Task.CompletedTask;
            }
        };
    });

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseRouting();
app.UseCors("AllowReactApp");
app.UseAuthentication(); // ENABLED
app.UseAuthorization();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllers();
    endpoints.MapHub<ChatHub>("/chatHub");
}); 
// Removed duplicate mappings
// app.MapControllers();
// app.MapHub<ChatHub>("/chatHub");

Console.WriteLine("🚀 HRMS API is running!");
Console.WriteLine("📍 ChatHub endpoint: /chatHub");
Console.WriteLine("🔐 JWT Authentication: ENABLED");

app.Run();