using ChatApp.Server.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace ChatApp.Server.Domain.DTO
{
    public class UserDTO
    {

        [Required]
        [StringLength(20)]
        public string Username { get; set; } = null!;

        public List<ChatRoom> ChatRooms { get; set; } = null!;

        public string Token { get; set; } = null!;
    }
}
