using ChatApp.Server.Data.Contexts;
using ChatApp.Server.Extensions;
using ChatApp.Server.Hubs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddSwaggerGen();

builder.Services.ConfigureCors(builder.Configuration);
builder.Services.ConfigureIdentity();
builder.Services.ConfigureJwtAuthentication(builder.Configuration);

builder.Services.AddAuthorization();

builder.Services.AddDbContext<ChatAppDbContext>(options =>
   options.UseSqlite(builder.Configuration.GetConnectionString("SQLiteConnectionString")));

builder.Services.AddAutoMapper(typeof(Program).Assembly);

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5179);
    options.ListenAnyIP(7063, listenOptions =>
    {
        listenOptions.UseHttps();
    });
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseSwagger();
app.UseSwaggerUI();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseCors("AllowReactClient");
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapHub<ChatHub>("/chathub");
app.MapControllers();

app.Run();
