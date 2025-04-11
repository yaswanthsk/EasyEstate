
using Bussiness_Layer.Implementations;
using Bussiness_Layer.Interfaces;
using Data_Access_Layer.Data;
using Data_Access_Layer.Implementations;
using Data_Access_Layer.Interfaces;
using Entitiy_Layer.AccountModel;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using ExceptionLayer.Exceptions;
using Razorpay.Api;


namespace EasyEstate
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigin",
                    builder => builder
                        //.WithOrigins("https://easyestate.azurewebsites.net")
                        .WithOrigins("http://localhost:3000")

                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials()); // If your frontend needs to support cookies or auth tokens
            });

            //for ef 
            builder.Services.AddDbContext<AuthDbContext>(options =>
            options.UseSqlServer(builder.Configuration.GetConnectionString("conn")));

            //for identity
            builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<AuthDbContext>()
                .AddDefaultTokenProviders();

            builder.Services.Configure<IdentityOptions>(options =>
            {
                options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(3); // Lockout duration 
                options.Lockout.MaxFailedAccessAttempts = 5; // Maximum failed attempts
                options.Lockout.AllowedForNewUsers = true; // Enable lockout for new users
            });


            builder.Services.Configure<RazorpayConfig>(
                     builder.Configuration.GetSection("Razorpay")
               );

            // Register RazorpayService
            builder.Services.AddScoped<RazorPay>();

            builder.Services.AddControllers();

            builder.Services.AddScoped<ChatService>();

            builder.Services.AddScoped<IAccountService, AccountService>();
            builder.Services.AddScoped<IAccountRepository, AccountRepository>();

            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IAuthRepository, AuthRepository>();
            builder.Services.AddHttpContextAccessor();



            builder.Services.AddScoped<IReviewRepository,ReviewRepository>();
            builder.Services.AddScoped<ICustomerRepository,CustomerRepository>();
            builder.Services.AddScoped<IOwnerRepository,OwnerRepository>();

            builder.Services.AddScoped<IOwnerService, OwnerService>();
            builder.Services.AddScoped<IReviewService,ReviewService>();
            builder.Services.AddScoped<ICustomerService,CustomerService>();


            builder.Services.AddEndpointsApiExplorer();


            


            // Adding Authentication
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters()
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidAudience = builder.Configuration["JWT:ValidAudience"],
                    ValidIssuer = builder.Configuration["JWT:ValidIssuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Secret"]))
                };


                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var dbContext = context.HttpContext.RequestServices.GetRequiredService<AuthDbContext>();

                        var type = context.SecurityToken.GetType();

                        var authorizationHeader = context.HttpContext.Request.Headers["Authorization"];
                        var tokenString = authorizationHeader.ToString().Replace("Bearer ", "").Trim();

                        if (string.IsNullOrEmpty(tokenString))
                        {
                            context.Fail("Unauthorized: Token is null or empty");
                            return;
                        }

                        var storedToken = await dbContext.ActiveSessions.FirstOrDefaultAsync(t => t.Token == tokenString);
                        if (storedToken == null || storedToken.ExpireDate < DateTime.Now)
                        {
                            context.Fail("Unauthorized");
                        }
                    }
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        Console.WriteLine($"my Token: {accessToken}");
                        // Console.WriteLine($"Authorization Header: {authorizationHeader}");

                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chat"))
                        {
                            context.Token = accessToken;
                        }

                        Console.WriteLine($"context token: {context.Token}");
                        return Task.CompletedTask;
                    }
                };

            });


            builder.Services.AddSignalR();


            builder.Services.AddSwaggerGen(option =>
            {
                option.SwaggerDoc("v1", new OpenApiInfo { Title = "Auth API", Version = "v1" });
                option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter a valid token",
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "Bearer"
                });
                option.AddSecurityRequirement(new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type=ReferenceType.SecurityScheme,
                                    Id="Bearer"
                                }
                            },
                            new string[]{}
                        }
                    });
            });

            builder.Services.AddAuthorization();


            





           

            //builder.Services.AddIdentityApiEndpoints<IdentityUser>().AddEntityFrameworkStores<AuthDbContext>();



            var app = builder.Build();
            //app.MapIdentityApi<IdentityUser>();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment() || app.Environment.IsProduction())
            {
                app.UseSwagger();
                app.UseSwaggerUI();

            }

            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();


            // Enable CORS
            app.UseCors("AllowSpecificOrigin");


            //registering the middleware
            app.UseMiddleware<ExceptionMiddleWare>();

            app.MapControllers();

            app.MapHub<ChatHub>("/chat");


            app.Run();
        }
    }
}
