using ChatApp.Server.Extensions;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddSignalR();
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

builder.Services.ConfigureJwtAuthentication(builder.Configuration);

builder.Services.AddAuthorization();

//builder.Services.AddDbContext<ChatContext>(options =>
//    options.UseSqlite(builder.Configuration.GetConnectionString("SQLiteConnectionString")));

//builder.WebHost.ConfigureKestrel(options =>
//{
//    options.ListenAnyIP(5179);
//    options.ListenAnyIP(7063, listenOptions =>
//    {
//        listenOptions.UseHttps();
//    });
//});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

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

app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

//app.MapHub<ChatHub>("/chathub");
app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
