namespace ChatApp.Server.Domain.Entities
{
    public class ChatMessage
    {
        public ChatMessage(string username, string message)
        {
            Username = username;
            Message = message;
        }

        public Guid Id { get; set; } = Guid.NewGuid();

        public string Username { get; set; } = null!;

        public string Message { get; set; } = null!;

        public DateTime DateTime { get; set; } = DateTime.Now;

        public string ShortDate { get; set; } = DateTime.Now.ToString("yyyy/MM/dd HH:mm");
    }
}
