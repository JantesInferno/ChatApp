using System.ComponentModel.DataAnnotations;

namespace ChatApp.Server.Domain.DTO
{
    // Request to server
    public class SignInRequest
    {
        [Required]
        [StringLength(20)]
        public string Username { get; set; }

        [Required]
        [StringLength(20)]
        public string Password { get; set; }
    }
}
