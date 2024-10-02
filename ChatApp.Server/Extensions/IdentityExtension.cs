using ChatApp.Server.Data.Contexts;
using ChatApp.Server.Domain.Identity;
using Microsoft.AspNetCore.Identity;
using System;

namespace ChatApp.Server.Extensions
{
    public static class IdentityExtension
    {
        public static void ConfigureIdentity(this IServiceCollection services)
        {
            services.AddIdentity<User, IdentityRole>(options =>
            {
                options.SignIn.RequireConfirmedAccount = false;
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 6;
                options.User.RequireUniqueEmail = false;
            })
                .AddEntityFrameworkStores<ChatAppDbContext>()
                .AddDefaultTokenProviders();
        }
    }
}
