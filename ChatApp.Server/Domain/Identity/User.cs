using ChatApp.Server.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace ChatApp.Server.Domain.Identity
{
    public class User : IdentityUser
    {
        public User(string username)
        {
            UserName = username;
        }

        public User() { }

        public virtual List<ChatRoom> ChatRooms { get; set; } = null!;
    }
}
