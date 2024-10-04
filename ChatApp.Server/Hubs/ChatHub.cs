using AutoMapper;
using ChatApp.Server.Data.Contexts;
using ChatApp.Server.Domain.DTO;
using ChatApp.Server.Domain.Entities;
using ChatApp.Server.Domain.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;

namespace ChatApp.Server.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ChatAppDbContext _context;
        private readonly ILogger<ChatHub> _logger;
        private readonly IMapper _mapper;

        public ChatHub(ChatAppDbContext context, ILogger<ChatHub> logger, IMapper mapper)
        {
            _context = context;
            _logger = logger;
            _mapper = mapper;
        }

        public override async Task OnConnectedAsync()
        {
            var username = Context.User!.Identity!.Name;

            _logger.LogInformation($"User {username} has connected.");

            User user = await _context.Users.Include(u => u.ChatRooms)
                                            .SingleAsync(u => u.UserName == username);

            user.IsOnline = true;

            await _context.SaveChangesAsync();

            if (user.ChatRooms != null)
            {
                var roomNames = user.ChatRooms.Select(x => x.Name).ToList();

                await Clients.Groups(roomNames).SendAsync("UserSignedIn", username);
            }

            await FetchChatData();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var username = Context.User?.Identity?.Name;

            User user = await _context.Users.SingleAsync(u => u.UserName == username);

            user.IsOnline = false;
            await _context.SaveChangesAsync();

            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinChatRoom(string chatRoomId)
        {
            var username = Context.User!.Identity!.Name;

            User user = await _context.Users.Include(u => u.ChatRooms)
                                            .SingleAsync(u => u.UserName == username);


            ChatRoom room = await _context.ChatRooms.Include(cr => cr.Users)
                                                    .SingleAsync(cr => cr.Id.ToString() == chatRoomId);

            if (room.Users.Any(u => u.Id == user.Id))
            {
                _logger.LogInformation($"User {username} is already in chat room '{room.Name}'.");
                return;
            }

            room.Users.Add(user);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"User {username} joined chat room '{room.Name}'.");

            await Clients.Group(room.Name).SendAsync("ReceiveMessage", $"{user.UserName} has joined the chat room.");
        }

        public async Task FetchChatData()
        {
            var username = Context.User!.Identity!.Name;

            User user = await _context.Users.Include(u => u.ChatRooms)
                                            .ThenInclude(cr => cr.ChatMessages)
                                            .Include(u => u.ChatRooms)
                                            .ThenInclude(cr => cr.Users)
                                            .SingleAsync(u => u.UserName == username);

            if (user.ChatRooms != null)
            {
                List<ChatRoomDTO> chatRooms = _mapper.Map<List<ChatRoom>, List<ChatRoomDTO>>(user.ChatRooms);

                user.ChatRooms.ForEach(x =>
                {
                    Groups.AddToGroupAsync(Context.ConnectionId, x.Name);
                });

                chatRooms.ForEach(x =>
                {
                    x.ChatMessages = x.ChatMessages.OrderBy(cm => cm.DateTime).ToList();
                });


                var jsonChatRooms = JsonConvert.SerializeObject(chatRooms);

                _logger.LogInformation($"Fetching chat data for {username}.");

                await Clients.Client(Context.ConnectionId).SendAsync("ReceiveData", jsonChatRooms);
            }
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

        public async Task ActivateTypingIndicator(string chatRoomName)
        {
            var username = Context.User!.Identity!.Name;

            _logger.LogInformation($"User {username} started typing");

            await Clients.GroupExcept(chatRoomName, Context.ConnectionId).SendAsync($"ReceiveTypingIndicatorOn_{chatRoomName}", username);
        }

        public async Task DeactivateTypingIndicator(string chatRoomName)
        {
            var username = Context.User!.Identity!.Name;

            _logger.LogInformation($"User {username} stopped typing");

            await Clients.GroupExcept(chatRoomName, Context.ConnectionId).SendAsync($"ReceiveTypingIndicatorOff_{chatRoomName}", username);
        }
    }
}
