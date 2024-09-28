using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddSignalR();
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("d5df9b30d5891d6e19c3eda79aef6fa0181cb5f0da195f2bbb54022c7d217b1b")) // Replace with your secret key
        };

        // Handle the JWT in the SignalR connection
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Check for the access token in the query string
                var accessToken = context.Request.Query["access_token"];

                // If found, set it
                if (!string.IsNullOrEmpty(accessToken) && context.HttpContext.Request.Path.StartsWithSegments("/chathub"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

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
