using ChatApp.Server.Domain.Entities;
using ChatApp.Server.Domain.Identity;

namespace ChatApp.Server.Domain.DTO
{
    public class ChatRoomDTO
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public List<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage> { };

        public List<UserDTO> Users { get; set; } = new List<UserDTO> { };
    }
}
