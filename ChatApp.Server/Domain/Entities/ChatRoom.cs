using ChatApp.Server.Domain.Identity;

namespace ChatApp.Server.Domain.Entities
{
    public class ChatRoom
    {
        public ChatRoom(string name)
        {
            Name = name;
        }

        public Guid Id { get; set; } = Guid.NewGuid();

        public string Name { get; set; } = string.Empty;

        public virtual List<ChatMessage> ChatMessages { get; set; } = null!;
    }
}
