using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ChatbotApi.Data;
using ChatbotApi.Models;

namespace ChatbotApi.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class OnboardingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OnboardingController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Onboarding/forms
        [HttpGet("forms")]
        public async Task<IActionResult> GetOnboardingForms()
        {
            var forms = await _context.OnboardingForms
                .Where(f => f.IsActive)
                .OrderBy(f => f.DisplayOrder)
                .Select(f => new
                {
                    f.FormID,
                    f.SectionName,
                    f.Description,
                    f.DisplayOrder,
                    f.RouteURL
                })
                .ToListAsync();

            return Ok(forms);
        }

        // GET: api/Onboarding/progress/{userId}
        [HttpGet("progress/{userId}")]
        public async Task<IActionResult> GetUserProgress(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var progressList = await _context.UserFormProgress
                .Include(p => p.OnboardingForm)
                .Where(p => p.UserID == userId)
                .Select(p => new
                {
                    p.ProgressID,
                    p.FormID,
                    FormName = p.OnboardingForm.SectionName,
                    p.Status,
                    p.StartedAt,
                    p.CompletedAt,
                    p.LastUpdatedAt
                })
                .ToListAsync();

            // Calculate overall progress
            var totalForms = await _context.OnboardingForms.CountAsync(f => f.IsActive);
            var completedForms = progressList.Count(p => p.Status == "Completed");
            var percentage = totalForms > 0 ? (completedForms * 100) / totalForms : 0;

            return Ok(new
            {
                userId = userId,
                username = user.FullName,
                totalForms = totalForms,
                completedForms = completedForms,
                inProgress = progressList.Count(p => p.Status == "In Progress"),
                notStarted = totalForms - progressList.Count,
                percentage = percentage,
                progressDetails = progressList
            });
        }

        // GET: api/Onboarding/status/{userId}
        [HttpGet("status/{userId}")]
        public async Task<IActionResult> GetOnboardingStatus(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var allForms = await _context.OnboardingForms
                .Where(f => f.IsActive)
                .OrderBy(f => f.DisplayOrder)
                .ToListAsync();

            var userProgress = await _context.UserFormProgress
                .Where(p => p.UserID == userId)
                .ToDictionaryAsync(p => p.FormID, p => p);

            var statusList = allForms.Select(form => new
            {
                formId = form.FormID,
                sectionName = form.SectionName,
                description = form.Description,
                displayOrder = form.DisplayOrder,
                status = userProgress.ContainsKey(form.FormID) 
                    ? userProgress[form.FormID].Status 
                    : "Not Started",
                startedAt = userProgress.ContainsKey(form.FormID) 
                    ? userProgress[form.FormID].StartedAt 
                    : null,
                completedAt = userProgress.ContainsKey(form.FormID) 
                    ? userProgress[form.FormID].CompletedAt 
                    : null,
                lastUpdatedAt = userProgress.ContainsKey(form.FormID) 
                    ? userProgress[form.FormID].LastUpdatedAt 
                    : form.CreatedAt
            }).ToList();

            var completedCount = statusList.Count(s => s.status == "Completed");
            var percentage = allForms.Count > 0 ? (completedCount * 100) / allForms.Count : 0;

            return Ok(new
            {
                userId = userId,
                username = user.FullName,
                totalForms = allForms.Count,
                completedForms = completedCount,
                percentage = percentage,
                forms = statusList
            });
        }

        // POST: api/Onboarding/start
        [HttpPost("start")]
        public async Task<IActionResult> StartForm([FromBody] StartFormRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var form = await _context.OnboardingForms.FindAsync(request.FormId);
            if (form == null)
                return NotFound(new { message = "Form not found" });

            // Check if progress already exists
            var existingProgress = await _context.UserFormProgress
                .FirstOrDefaultAsync(p => p.UserID == request.UserId && p.FormID == request.FormId);

            if (existingProgress != null)
            {
                // Update existing progress
                if (existingProgress.Status == "Not Started")
                {
                    existingProgress.Status = "In Progress";
                    existingProgress.StartedAt = DateTime.UtcNow;
                    existingProgress.LastUpdatedAt = DateTime.UtcNow;
                }
            }
            else
            {
                // Create new progress
                var newProgress = new UserFormProgress
                {
                    UserID = request.UserId,
                    FormID = request.FormId,
                    Status = "In Progress",
                    StartedAt = DateTime.UtcNow,
                    LastUpdatedAt = DateTime.UtcNow
                };
                _context.UserFormProgress.Add(newProgress);
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Form started successfully" });
        }

        // POST: api/Onboarding/complete
        [HttpPost("complete")]
        public async Task<IActionResult> CompleteForm([FromBody] CompleteFormRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var form = await _context.OnboardingForms.FindAsync(request.FormId);
            if (form == null)
                return NotFound(new { message = "Form not found" });

            var progress = await _context.UserFormProgress
                .FirstOrDefaultAsync(p => p.UserID == request.UserId && p.FormID == request.FormId);

            if (progress == null)
            {
                // Create new completed progress
                progress = new UserFormProgress
                {
                    UserID = request.UserId,
                    FormID = request.FormId,
                    Status = "Completed",
                    StartedAt = DateTime.UtcNow,
                    CompletedAt = DateTime.UtcNow,
                    LastUpdatedAt = DateTime.UtcNow
                };
                _context.UserFormProgress.Add(progress);
            }
            else
            {
                // Update existing progress
                progress.Status = "Completed";
                progress.CompletedAt = DateTime.UtcNow;
                progress.LastUpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Check if all forms are completed
            var totalForms = await _context.OnboardingForms.CountAsync(f => f.IsActive);
            var completedForms = await _context.UserFormProgress
                .CountAsync(p => p.UserID == request.UserId && p.Status == "Completed");

            var isFullyCompleted = totalForms == completedForms;

            // Update user onboarding status if all complete
            if (isFullyCompleted)
            {
                user.OnboardingStatus = "Completed";
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = "Form completed successfully",
                completedForms = completedForms,
                totalForms = totalForms,
                percentage = (completedForms * 100) / totalForms,
                allCompleted = isFullyCompleted
            });
        }

        // GET: api/Onboarding/dashboard-stats
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var totalUsers = await _context.Users.CountAsync(u => u.IsActive);
            
            var onboardingStats = await _context.Users
                .Where(u => u.IsActive)
                .GroupBy(u => u.OnboardingStatus)
                .Select(g => new
                {
                    Status = g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            var totalForms = await _context.OnboardingForms.CountAsync(f => f.IsActive);
            
            var completedFormsCount = await _context.UserFormProgress
                .CountAsync(p => p.Status == "Completed");

            var inProgressCount = await _context.UserFormProgress
                .CountAsync(p => p.Status == "In Progress");

            return Ok(new
            {
                totalUsers = totalUsers,
                totalForms = totalForms,
                completedForms = completedFormsCount,
                inProgressForms = inProgressCount,
                onboardingByStatus = onboardingStats
            });
        }
    }

    public class StartFormRequest
    {
        public int UserId { get; set; }
        public int FormId { get; set; }
    }

    public class CompleteFormRequest
    {
        public int UserId { get; set; }
        public int FormId { get; set; }
    }
}