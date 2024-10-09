using AutoMapper;
using ChatApp.Server.Data.Contexts;
using ChatApp.Server.Domain.Entities;
using ChatApp.Server.Domain.Identity;
using ChatApp.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;
using Xunit;


namespace ChatApp.UnitTests.ChatRoomTests
{
    public class JoinChatRoomTests
    {
        private ChatHub _chatHub;
        private ChatAppDbContext _dbContext;
        private Mock<ILogger<ChatHub>> _mockLogger;
        private Mock<IMapper> _mockMapper;

        public JoinChatRoomTests()
        {
            var options = new DbContextOptionsBuilder<ChatAppDbContext>()
                            .UseInMemoryDatabase(Guid.NewGuid().ToString())
                            .Options;

            _dbContext = new ChatAppDbContext(options);
            _mockLogger = new Mock<ILogger<ChatHub>>();
            _mockMapper = new Mock<IMapper>();

            _chatHub = new ChatHub(_dbContext, _mockLogger.Object, _mockMapper.Object);
        }

        [Fact]
        public async Task JoinChatRoom_UserJoinsChatRoom_Successfully()
        {
            // Arrange
            string username = "testuser";
            string chatRoomName = "TestChatRoom";

            var user = new User(username);
            var chatRoom = new ChatRoom(chatRoomName);

            await _dbContext.Users.AddAsync(user);
            await _dbContext.ChatRooms.AddAsync(chatRoom);
            await _dbContext.SaveChangesAsync();

            // Mock user identity
            var claimsIdentity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, username) });
            var mockContext = new Mock<HubCallerContext>();
            mockContext.Setup(c => c.User.Identity).Returns(claimsIdentity);
            _chatHub.Context = mockContext.Object;

            // Act
            await _chatHub.JoinChatRoom(chatRoom.Id.ToString());

            var updatedChatRoom = await _dbContext.ChatRooms.Include(cr => cr.Users)
                                                             .FirstOrDefaultAsync(cr => cr.Id == chatRoom.Id);

            // Assert
            Assert.Contains(updatedChatRoom.Users, u => u.UserName == username);
        }

        [Fact]
        public async Task JoinChatRoom_UserAlreadyInChatRoom_LogsInformation()
        {
            // Arrange
            string username = "testuser";
            string chatRoomName = "TestChatRoom";

            var user = new User(username);
            var chatRoom = new ChatRoom(chatRoomName);
            chatRoom.Users.Add(user);

            await _dbContext.Users.AddAsync(user);
            await _dbContext.ChatRooms.AddAsync(chatRoom);
            await _dbContext.SaveChangesAsync();

            // Mock user identity
            var claimsIdentity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, username) });
            var mockContext = new Mock<HubCallerContext>();
            mockContext.Setup(c => c.User.Identity).Returns(claimsIdentity);
            _chatHub.Context = mockContext.Object;

            // Act
            await _chatHub.JoinChatRoom(chatRoom.Id.ToString());

            // Assert
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"User {username} is already in chat room '{chatRoomName}'.")),
                    It.IsAny<Exception>(),
                    It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)),
                Times.Once
            );
        }
    }
}
