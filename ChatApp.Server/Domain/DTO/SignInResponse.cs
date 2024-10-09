using ChatApp.Server.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace ChatApp.Server.Domain.DTO
{
    // Response to client
    public class SignInResponse
    {

        [Required]
        [StringLength(20)]
        public string Username { get; set; } = null!;

        public string Token { get; set; } = null!;
    }
}
