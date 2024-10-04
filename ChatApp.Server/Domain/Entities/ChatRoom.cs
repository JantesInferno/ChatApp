using ChatApp.Server.Domain.Identity;
using Newtonsoft.Json;

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

        public virtual List<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage> { };

        // avoid infinite loop while serializing json
        [JsonIgnore]
        public virtual List<User> Users { get; set; } = new List<User> { };
    }
}
