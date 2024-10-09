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
    public class CreateChatRoomTests
    {
        private ChatHub _chatHub;
        private ChatAppDbContext _dbContext;
        private Mock<ILogger<ChatHub>> _mockLogger;
        private Mock<IMapper> _mockMapper;

        public CreateChatRoomTests()
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
        public async Task CreateChatRoom_UserCreatesNewChatRoom_Successfully()
        {
            // Arrange
            string username = "testuser";

            var user = new User(username);

            await _dbContext.Users.AddAsync(user);
            await _dbContext.SaveChangesAsync();

            string chatRoomName = "NewChatRoom";

            // Mock user identity
            var claimsIdentity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, username) });
            var mockContext = new Mock<HubCallerContext>();
            mockContext.Setup(c => c.User.Identity).Returns(claimsIdentity);
            _chatHub.Context = mockContext.Object;

            // Act
            await _chatHub.CreateChatRoom(chatRoomName);

            // Assert
            var createdRoom = await _dbContext.ChatRooms.FirstOrDefaultAsync(cr => cr.Name == chatRoomName);

            Assert.NotNull(createdRoom);
            Assert.Contains(user, createdRoom.Users);
        }

        [Fact]
        public async Task CreateChatRoom_ChatRoomAlreadyExists_ThrowsHubException()
        {
            // Arrange
            string username = "testuser";
            string existingChatRoomName = "ExistingChatRoom";

            var user = new User(username);
            var existingChatRoom = new ChatRoom(existingChatRoomName);

            await _dbContext.Users.AddAsync(user);
            await _dbContext.ChatRooms.AddAsync(existingChatRoom);
            await _dbContext.SaveChangesAsync();

            var mockLogger = new Mock<ILogger<ChatHub>>();
            var mapper = new Mock<IMapper>();

            // Mock user identity
            var claimsIdentity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, username) });
            var mockContext = new Mock<HubCallerContext>();
            mockContext.Setup(c => c.User.Identity).Returns(claimsIdentity);
            _chatHub.Context = mockContext.Object;

            // Act & Assert
            var exception = await Assert.ThrowsAsync<HubException>(async () => await _chatHub.CreateChatRoom(existingChatRoomName));

            Assert.Equal("Chat room already exists.", exception.Message);

            var chatRooms = await _dbContext.ChatRooms.ToListAsync();
            Assert.Single(chatRooms); 
        }
    }
}
