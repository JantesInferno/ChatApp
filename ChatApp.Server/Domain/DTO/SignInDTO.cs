using System.ComponentModel.DataAnnotations;

namespace ChatApp.Server.Domain.DTO
{
    public class SignInDTO
    {
        [Required]
        [StringLength(20)]
        public string Username { get; set; }

        [Required]
        [StringLength(20)]
        public string Password { get; set; }
    }
}
