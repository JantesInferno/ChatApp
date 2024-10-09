using AutoMapper;
using ChatApp.Server.Data.Contexts;
using ChatApp.Server.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System.Security.Claims;
using System.Security.Principal;
using Xunit;

namespace ChatApp.UnitTests.ConnectionTests
{
    public class OnConnectedAsyncTests
    {
        private ChatHub _chatHub;
        private ChatAppDbContext _dbContext;
        private Mock<ILogger<ChatHub>> _mockLogger;
        private Mock<IMapper> _mockMapper;

        public OnConnectedAsyncTests()
        {
            var options = new DbContextOptionsBuilder<ChatAppDbContext>()
                            .UseInMemoryDatabase(databaseName: "ChatAppTestDb")
                            .Options;

            _dbContext = new ChatAppDbContext(options);
            _mockLogger = new Mock<ILogger<ChatHub>>();
            _mockMapper = new Mock<IMapper>();

            _chatHub = new ChatHub(_dbContext, _mockLogger.Object, _mockMapper.Object);
        }

        [Fact]
        public async Task OnConnectedAsync_ValidUser_LogsConnection()
        {
            // Arrange
            var username = "testuser";

            // Mock user identity
            var claimsIdentity = new ClaimsIdentity(new[] { new Claim(ClaimTypes.Name, username) });
            var mockContext = new Mock<HubCallerContext>();
            mockContext.Setup(c => c.User.Identity).Returns(claimsIdentity);
            _chatHub.Context = mockContext.Object;

            // Act
            await _chatHub.OnConnectedAsync();

            // Assert
            _mockLogger.Verify(
                x => x.Log(
                    LogLevel.Information,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains($"User {username} has connected.")),
                    It.IsAny<Exception>(),
                    It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)),
                Times.Once
            );
        }

        [Fact]
        public async Task OnConnectedAsync_InvalidUser_ThrowsHubException()
        {
            // Arrange
            var mockContext = new Mock<HubCallerContext>();
            mockContext.Setup(c => c.User.Identity).Returns((IIdentity)null);
            _chatHub.Context = mockContext.Object;

            // Act
            var exception = await Assert.ThrowsAsync<HubException>(async () => await _chatHub.OnConnectedAsync());

            // Assert
            Assert.Equal("Unauthorized user.", exception.Message);
        }
    }
}