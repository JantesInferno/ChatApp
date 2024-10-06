﻿using AutoMapper;
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

        private string GetValidatedUsername()
        {
            var username = Context.User?.Identity?.Name;

            if (username == null)
            {
                _logger.LogWarning("User token is invalid. Aborting connection.");
                Context.Abort();
                throw new HubException("Unauthorized user.");
            }

            return username;
        }

        private async Task UpdateOnlineStatus(string username, bool online)
        {
            User user = await _context.Users.Include(u => u.ChatRooms)
                                            .SingleAsync(u => u.UserName == username);

            user.IsOnline = online;

            await _context.SaveChangesAsync();

            var userDto = _mapper.Map<UserDTO>(user);
            var userJson = JsonConvert.SerializeObject(userDto);

            if (user.ChatRooms != null)
            {
                var roomNames = user.ChatRooms.Select(x => x.Name).ToList();

                await Clients.Groups(roomNames).SendAsync("UserOnlineStatusUpdate", userJson);
            }
        }

        public override async Task OnConnectedAsync()
        {
            try
            {
                string username = GetValidatedUsername();

                _logger.LogInformation($"User {username} has connected.");

                await UpdateOnlineStatus(username, true);

                await FetchChatData();
            }
            catch (HubException hubEx)
            {
                _logger.LogWarning(hubEx, $"Hub exception: {hubEx.Message}");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred.");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            try
            {
                string username = GetValidatedUsername();

                await UpdateOnlineStatus(username, false);

                if (exception != null)
                {
                    _logger.LogWarning(exception, $"User {username} disconnected due to an error: {exception.Message}");
                }
                else
                {
                    _logger.LogInformation($"User {username} disconnected.");
                }
            }
            catch (HubException hubEx)
            {
                _logger.LogWarning(hubEx, $"Hub exception: {hubEx.Message}");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred.");
            }
            finally
            {
                await base.OnDisconnectedAsync(exception);
            }
        }

        public async Task JoinChatRoom(string chatRoomId)
        {
            try
            {
                string username = GetValidatedUsername();

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
            catch (HubException hubEx)
            {
                _logger.LogWarning(hubEx, $"Hub exception: {hubEx.Message}");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occured.");
            }
        }

        public async Task FetchChatData()
        {
            try
            {
                string username = GetValidatedUsername();

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

                    var chatRoomsJson = JsonConvert.SerializeObject(chatRooms);

                    _logger.LogInformation($"Fetching chat data for {username}.");

                    await Clients.Client(Context.ConnectionId).SendAsync("ReceiveData", chatRoomsJson);
                }
            }
            catch (HubException hubEx)
            {
                _logger.LogWarning(hubEx, $"Hub exception: {hubEx.Message}");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred.");
            }
        }

        public async Task SendMessage(string message, string chatRoom)
        {
            try
            {
                string username = GetValidatedUsername();

                ChatRoom room = _context.ChatRooms.FirstOrDefault(x => x.Name == chatRoom)!;
                ChatMessage chatMessage = new ChatMessage(username, message);

                room.ChatMessages.Add(chatMessage);
                _context.ChatMessages.Add(chatMessage);
                await _context.SaveChangesAsync();

                var json = JsonConvert.SerializeObject(chatMessage);

                _logger.LogInformation($"User {username} sent message: {message}");

                await Clients.Group(chatRoom).SendAsync("ReceiveChatMessage", json);
            }
            catch (HubException hubEx)
            {
                _logger.LogWarning(hubEx, $"Hub exception: {hubEx.Message}");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error in SendMessage.");
            }
        }

        public async Task ActivateTypingIndicator(string chatRoomName)
        {
            try
            {
                string username = GetValidatedUsername();

                await Clients.GroupExcept(chatRoomName, Context.ConnectionId).SendAsync($"ReceiveTypingIndicatorOn_{chatRoomName}", username);
            }
            catch (HubException hubEx)
            {
                _logger.LogWarning(hubEx, $"Hub exception: {hubEx.Message}");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred.");
            }
        }

        public async Task DeactivateTypingIndicator(string chatRoomName)
        {
            try
            {
                string username = GetValidatedUsername();

                await Clients.GroupExcept(chatRoomName, Context.ConnectionId).SendAsync($"ReceiveTypingIndicatorOff_{chatRoomName}", username);
            }
            catch (HubException hubEx)
            {
                _logger.LogWarning(hubEx, $"Hub exception: {hubEx.Message}");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred.");
            }
        }
    }
}
