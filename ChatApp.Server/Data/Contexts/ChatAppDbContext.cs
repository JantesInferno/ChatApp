using ChatApp.Server.Domain.Entities;
using ChatApp.Server.Domain.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;

namespace ChatApp.Server.Data.Contexts
{
    public class ChatAppDbContext : IdentityDbContext<User>
    {
        public ChatAppDbContext(DbContextOptions<ChatAppDbContext> options) : base(options) { }

        public DbSet<ChatRoom> ChatRooms { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure many-to-many relationship between User and ChatRoom
            modelBuilder.Entity<ChatRoom>()
                .HasMany(c => c.Users)
                .WithMany(u => u.ChatRooms)
                .UsingEntity<Dictionary<string, object>>(
                    "ChatRoomUser",
                    r => r.HasOne<User>().WithMany().HasForeignKey("UsersId"),
                    l => l.HasOne<ChatRoom>().WithMany().HasForeignKey("ChatRoomsId")
                );
        }
    }
}