using ChatApp.Server.Data.Contexts;
using ChatApp.Server.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace ChatApp.Server.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ChatAppDbContext _context;
        private readonly ILogger<ChatHub> _logger;

        public ChatHub(ChatAppDbContext context, ILogger<ChatHub> logger)
        {
            _context = context;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var username = Context.User!.Identity!.Name;

            _logger.LogInformation($"User {username} has connected.");

            List<ChatRoom> rooms = _context.Users.Include("ChatRooms").FirstOrDefault(x => x.UserName == username)!.ChatRooms.ToList();
            var messages = _context.ChatRooms.Include("ChatMessages").FirstOrDefault(x => x.Name == rooms[0].Name);

            if (rooms != null)
            {
                rooms.ForEach(x =>
                {
                    Groups.AddToGroupAsync(Context.ConnectionId, x.Name);
                });

                var json = JsonConvert.SerializeObject(rooms);
                await Clients.Client(Context.ConnectionId).SendAsync("ReceiveData", json);
            }

            await Clients.All.SendAsync("ReceiveMessage", $"{username} has joined the chat.");
        }

        public async Task SendMessage(string message, string chatRoom)
        {
            var username = Context.User!.Identity!.Name;

            ChatMessage chatMessage = new ChatMessage(username!, message);
            var json = JsonConvert.SerializeObject(chatMessage);

            _logger.LogInformation($"User {username} sent message: {message}");

            ChatRoom room = _context.ChatRooms.FirstOrDefault(x => x.Name == chatRoom)!;

            if (room != null)
            {
                if (room.ChatMessages == null)
                    room.ChatMessages = new List<ChatMessage>();

                room.ChatMessages.Add(chatMessage);
                _context.ChatMessages.Add(chatMessage);
                await _context.SaveChangesAsync();
            }

            await Clients.Group(chatRoom).SendAsync("ReceiveChatMessage", json);
        }

        public async Task ActivateTypingIndicator(string chatRoom)
        {
            var username = Context.User!.Identity!.Name;

            _logger.LogInformation($"User {username} started typing");

            await Clients.GroupExcept(chatRoom, Context.ConnectionId).SendAsync("ReceiveTypingIndicatorOn", username);
        }

        public async Task DeactivateTypingIndicator(string chatRoom)
        {
            var username = Context.User!.Identity!.Name;

            _logger.LogInformation($"User {username} stopped typing");

            await Clients.GroupExcept(chatRoom, Context.ConnectionId).SendAsync("ReceiveTypingIndicatorOff", username);
        }
    }
}
