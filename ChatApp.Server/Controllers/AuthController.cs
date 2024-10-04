using AutoMapper;
using ChatApp.Server.Data.Contexts;
using ChatApp.Server.Domain.DTO;
using ChatApp.Server.Domain.Entities;
using ChatApp.Server.Domain.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ChatApp.Server.Controllers
{
    public class AuthController : Controller
    {
        private readonly ChatAppDbContext _context;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _config;
        private readonly ILogger<AuthController> _logger;
        private readonly IMapper _mapper;

        public AuthController(ChatAppDbContext context, SignInManager<User> signInManager, UserManager<User> userManager, ILogger<AuthController> logger, IConfiguration config, IMapper mapper)
        {
            _context = context;
            _signInManager = signInManager;
            _userManager = userManager;
            _logger = logger;
            _config = config;
            _mapper = mapper;
        }

        [Route("/api/signin")]
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> SignIn([FromBody] SignInRequest userDto)
        {
            var result = await _signInManager.PasswordSignInAsync(userDto.Username, userDto.Password, false, false);

            if (result.Succeeded)
            {
                var user = await _userManager.FindByNameAsync(userDto.Username);

                if (user != null)
                {
                    //_context.ChatRooms.Add(new ChatRoom("Family chat"));
                    //_context.ChatRooms.Add(new ChatRoom("Dev chat"));
                    //await _context.SaveChangesAsync();

                    // Arrange response with token
                    var response = _mapper.Map<SignInResponse>(user);
                    var token = GenerateToken(user!);
                    response.Token = token;

                    _logger.LogInformation($"User {user.UserName} has logged in.");

                    return new OkObjectResult(response);
                }
            }

            return new UnauthorizedObjectResult("Invalid username/password");
        }

        [Route("/api/signup")]
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> SignUp([FromBody] SignInRequest userDto)
        {
            var result = await _userManager.CreateAsync(new User(userDto.Username), userDto.Password);

            if (result.Succeeded)
            {
                _logger.LogInformation($"Account created for user {userDto.Username}.");
                return Ok();
            }

            return BadRequest();
        }

        public string GenerateToken(User user)
        {
            try
            {
                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.GetSection("Jwt")["SecretKey"]!));
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

                var claims = new[]
                {
                    new Claim(JwtRegisteredClaimNames.Name, user.UserName!),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

                var token = new JwtSecurityToken(
                    claims: claims,
                    expires: DateTime.Now.AddMinutes(30),
                    signingCredentials: credentials
                );

                var jwtToken = new JwtSecurityTokenHandler().WriteToken(token);

                return jwtToken;
            }
            catch (Exception ex)
            {
                _logger.LogInformation($"Error generating token: {ex.Message}");
                return null!;
            }
        }
    }
}
