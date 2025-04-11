using Data_Access_Layer.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Bussiness_Layer.DTOs.AccountDto;
using Data_Access_Layer.Implementations;
using Entitiy_Layer.AccountModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Bussiness_Layer.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using System.Data;
using ExceptionLayer.Exceptions;

namespace Bussiness_Layer.Implementations
{
    /// <summary>
    /// The AuthService is responsible for managing the authentication and authorization processes within the system. 
    /// This service provides various methods to:
    /// 1. Authenticate users by verifying their credentials and generating JWT tokens for secure access.
    /// 2. Handle user registration, ensuring email uniqueness, role validation, and user creation with associated roles.
    /// 3. Manage email confirmation, ensuring that users confirm their email addresses before accessing certain features.
    /// 4. Handle password reset requests, generating and encoding password reset tokens, and validating new passwords.
    /// 5. Allow users to log out by invalidating their active session tokens.
    /// The service interacts with the `IAuthRepository` to perform database operations and ensures secure handling of user credentials 
    /// and session management throughout the application.
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;

        private readonly IConfiguration _configuration;

        public AuthService(IAuthRepository authRepository, IConfiguration configuration)
        {
            _authRepository = authRepository;
            _configuration = configuration;
        }



        //Login
        /// <summary>
        /// Handles the login process for a user by verifying their credentials and generating a JWT token if valid.
        /// The method checks if the user exists, if the account is locked due to failed attempts, and if the password is correct.
        /// It also checks if the user's email is confirmed and resets failed access attempts after successful login.
        /// A new token is generated for the user, and an active session is created in the database.
        /// </summary>
        /// <param name="loginUser">The user's login details, including email and password.</param>
        /// <returns>
        /// A tuple containing:
        /// - IsSuccess: A boolean indicating whether the login attempt was successful.
        /// - Message: A string message providing additional details about the login attempt (e.g., "Login successful", "Invalid password").
        /// - Token: The generated JWT token string if the login is successful, null if unsuccessful.
        /// - Expiration: The expiration date of the JWT token.
        /// </returns>
        public async Task<(bool IsSuccess, string Message, string Token, DateTime Expiration)> LoginAsync(LoginUserDto loginUser)
        {
            var users = await _authRepository.FindUsersByEmailAsync(loginUser.Email);

            if (!users.Any())
            {
                throw new AuthenticationException("No such user found.");
            }

            foreach (var user in users)
            {
                if (user == null)
                {
                    throw new AuthenticationException("User object is null.");
                }

                if (await _authRepository.IsUserLockedOutAsync(user))
                {
                    throw new AuthenticationException("Account is locked due to multiple failed attempts. Try again after 3 minutes.");
                }

                if (!await _authRepository.CheckUserPasswordAsync(user, loginUser.Password))
                {
                    continue;
                }

                if (!user.EmailConfirmed)
                {
                    throw new AuthorizationException("Please verify your email to continue.");
                }

                await _authRepository.ResetFailedAccessAsync(user);
                var userRoles = await _authRepository.GetSingleRolesAsync(user);

                var authClaims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Role, userRoles)
        };

                var existingTokens = await _authRepository.CheckActivetoken(user.Id, userRoles);

                if (existingTokens.Any())
                {
                    await _authRepository.RemoveactiveToken(existingTokens);
                }

                var token = GenerateToken(authClaims);
                var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
                var userToken = new ActiveSession
                {
                    UserId = user.Id,
                    UserRole = userRoles,
                    Token = tokenString,
                    ExpireDate = DateTime.Now.AddDays(1),
                };

                await _authRepository.AddSession(userToken);

                return (true, "Login successful", tokenString, token.ValidTo);
            }

            var firstUser = users.FirstOrDefault();
            if (firstUser != null)
            {
                await _authRepository.IncrementFailedAccessAsync(firstUser);
            }

            throw new AuthenticationException("Invalid password.");
        }


        private JwtSecurityToken GenerateToken(List<Claim> authClaims)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));

            return new JwtSecurityToken(
                issuer: _configuration["JWT:ValidIssuer"],
                audience: _configuration["JWT:ValidAudience"],
                expires: DateTime.Now.AddDays(1),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );


        }

        //Logut
        /// <summary>
        /// Logs out a user by removing their active session based on the provided user token.
        /// The method checks if the token is valid and corresponds to an active session, and if so, deletes the session.
        /// </summary>
        /// <param name="userToken">The token representing the user's active session.</param>
        /// <returns>
        /// A boolean value indicating the success of the logout process:
        /// - Returns `true` if the session was successfully deleted.
        /// - Returns `false` if no active session is found for the provided token.
        /// </returns>
        /// <exception cref="ArgumentException">
        /// Thrown if the user token is null or empty.
        /// </exception>
        public async Task<bool> Logout(string userToken)
        {
            if (string.IsNullOrEmpty(userToken))
            {
                throw new ArgumentException("User token cannot be null or empty.");
            }

            var userSession = await _authRepository.GetUserSession(userToken);
            if (userSession == null)
            {
                throw new TokenException("No active session found for the provided user token.");
            }

            var result = await _authRepository.DeleteUserSession(userSession);
            if (!result)
            {
                throw new TokenException("Failed to remove the active session.");
            }

            return true;
        }



        //register
        /// <summary>
        /// Registers a new user in the system by validating the provided registration details and ensuring the user doesn't 
        /// already exist with the same username, email, or role. It also handles role creation if it doesn't exist and sends 
        /// an email confirmation token upon successful registration.
        /// </summary>
        /// <param name="registration">The registration details including the username, email, phone number, and password.</param>
        /// <param name="role">The role to be assigned to the user.</param>
        /// <returns>
        /// A tuple indicating the success or failure of the registration process:
        /// - `IsSuccess`: `true` if registration is successful, `false` otherwise.
        /// - `Message`: A message explaining the outcome (success or failure).
        /// - `Token`: The email confirmation token if registration is successful, `null` otherwise.
        /// </returns>
        public async Task<(bool IsSuccess, string Message, string Token)> RegisterUserAsync(RegistrationDto registration, string role)
        {
            // Check if the username exists
            var nameExist = await _authRepository.FindUserByNameAsync(registration.Name);
            if (nameExist != null)
            {
                throw new RegistrationException("User with this name already exists.");
            }

            // Check if the email exists
            var users = await _authRepository.FindUsersByEmailAsync(registration.Email);
            if (users.Any())
            {
                foreach (var Existuser in users)
                {
                    var existingRoles = await _authRepository.GetUserRolesAsync(Existuser);

                    if (existingRoles.Contains(role))
                    {
                        throw new RegistrationException("User already exists with this role.");
                    }

                    if (await _authRepository.CheckUserPasswordAsync(Existuser, registration.Password))
                    {
                        throw new RegistrationException("Same password is given for the same email.");
                    }
                }
            }

            // Create the user
            var user = new ApplicationUser
            {
                Email = registration.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                PhoneNumber = registration.Phoneno,
                UserName = registration.Name
            };

            // Check if the role exists and create if necessary
            if (!await _authRepository.RoleExistsAsync(role))
            {
                var roleResult = await _authRepository.CreateRoleAsync(new IdentityRole(role));
                if (!roleResult.Succeeded)
                {
                    throw new RegistrationException("Role creation failed.");
                }
            }

            // Register the user
            var result = await _authRepository.CreateUserAsync(user, registration.Password);
            if (!result.Succeeded)
            {
                throw new RegistrationException("User registration failed.");
            }

            await _authRepository.AddUserToRoleAsync(user, role);

            // Generate email confirmation token
            var token = await _authRepository.GenerateEmailConfirmationTokenAsync(user);

            return (true, $"User created & Email Sent to {user.Email} Successfully", token);
        }




        //confirm email
        /// <summary>
        /// Confirms the user's email based on the provided confirmation token and email.
        /// It checks if the user exists with the given email and role, then confirms their email using the token.
        /// Upon successful confirmation, it returns a URL for the login page.
        /// </summary>
        /// <param name="token">The email confirmation token that the user received.</param>
        /// <param name="email">The email of the user whose email is to be confirmed.</param>
        /// <param name="role">The role assigned to the user to validate against.</param>
        /// <returns>
        /// A URL to the login page (`"http://localhost:3000"`) if the email is confirmed successfully.
        /// Returns `null` if the user with the given email or role is not found, or the confirmation fails.
        /// </returns>
        public async Task<string> ConfirmEmailAsync(string token, string email, string role)
        {
            var users = await _authRepository.FindUsersByEmailAsync(email);
            if (users.Any())
            {
                foreach (var user in users)
                {
                    var existingRoles = await _authRepository.GetUserRolesAsync(user);
                    if (existingRoles.Contains(role))
                    {
                        var result = await _authRepository.ConfirmEmailAsync(user, token);
                        if (result.Succeeded)
                        {
                            //return "https://easyestate.azurewebsites.net"; // Return the login URL after successful confirmation
                            return "http://localhost:3000";
                        }
                        else
                        {
                            throw new TokenException("Invalid email confirmation token.");
                        }
                    }
                }

                throw new AuthorizationException("User does not have the specified role.");
            }

            throw new RegistrationException("User with this email does not exist.");
        }



        //forget password
        /// <summary>
        /// Initiates a password reset process for a user with the provided email and role.
        /// If the user exists with the provided role, a password reset token is generated and returned.
        /// The token is encoded before being sent to the client.
        /// </summary>
        /// <param name="email">The email of the user who requested the password reset.</param>
        /// <param name="role">The role that the user must have to be eligible for a password reset.</param>
        /// <returns>
        /// A tuple containing:
        /// - `IsSuccess`: A boolean indicating whether the process was successful.
        /// - `Message`: A message describing the outcome (e.g., success or failure).
        /// - `EncodedToken`: The encoded password reset token (or `null` if the process failed).
        /// - `Email`: The email of the user requesting the reset (or `null` if not found).
        /// - `Role`: The role of the user requesting the reset (or `null` if the role was not found).
        /// </returns>
       public async Task<(bool IsSuccess, string Message, string EncodedToken, string Email, string Role)> ForgotPasswordAsync(string email, string role)
{
    // Find users by the provided email
    var users = await _authRepository.FindUsersByEmailAsync(email);

    // If no users found, return a failure message
    if (!users.Any())
    {
        throw new RegistrationException("No users found with the provided email.");
    }

    // Loop through each user found with the provided email
    foreach (var user in users)
    {
        var existingRoles = await _authRepository.GetUserRolesAsync(user);

        // Check if the user has the specified role
        if (existingRoles.Contains(role))
        {
            // Generate a password reset token for the user
            var token = await _authRepository.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            // Return success with the encoded token
            return (true, $"Password change request sent to {user.Email} successfully.", encodedToken, user.Email, role);
        }
    }

    // If the role was not found for any user, throw an exception
    throw new AuthorizationException("User with the specified role not found.");
}


        /// <summary>
        /// Generates a password reset URL with the provided token, email, and role.
        /// This URL can be used by the user to reset their password via a frontend interface.
        /// </summary>
        /// <param name="token">The encoded password reset token.</param>
        /// <param name="Email">The email of the user requesting the password reset.</param>
        /// <param name="Role">The role of the user requesting the password reset.</param>
        /// <returns>
        /// A string representing the password reset URL, containing the token, email, and role as query parameters.
        /// </returns>
        public string GeneratePasswordResetUrl(string token, string Email, string Role)
        {
            // You can modify this URL to be dynamic if needed, or configure it in app settings
            return $"https://easyestate.azurewebsites.net/reset?token={token}&email={Email}&role={Role}";
            //return $"http://localhost:3000/reset?token={token}&email={Email}&role={Role}";
        }


        //Reset Password
        /// <summary>
        /// Resets the user's password based on the provided reset token, email, and role.
        /// Validates the reset request, checks if the user exists, ensures the new password isn't the same as the old one,
        /// and attempts to reset the password if the token and role are valid.
        /// </summary>
        /// <param name="resetPasswordDto">An object containing the reset token, email, role, and new password.</param>
        /// <returns>
        /// An IActionResult that indicates the result of the password reset process:
        /// - 200 OK if the password is reset successfully.
        /// - 400 Bad Request if there is an error (e.g., invalid token format, password already exists, or user not found).
        /// </returns>
        public async Task<IActionResult> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            var users = await _authRepository.FindUsersByEmailAsync(resetPasswordDto.Email);
            if (users.Any())
            {

                foreach (var user in users)
                {
                    var check = await _authRepository.CheckUserPasswordAsync(user, resetPasswordDto.Password);
                    if (check)
                    {
                        return new BadRequestObjectResult(new { status = "Error", message = "Password already Exist " });
                    }

                    var existingRoles = await _authRepository.GetUserRolesAsync(user);

                    if (existingRoles.Contains(resetPasswordDto.Role))
                    {

                        try
                        {
                            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(resetPasswordDto.Token));
                            var resetPassResult = await _authRepository.ResetUserPasswordAsync(user, decodedToken, resetPasswordDto.Password);

                            if (resetPassResult.Succeeded)
                            {
                                return new OkObjectResult(new { message = "Password reset successfully." });
                            }
                            else
                            {
                                // Handle errors if needed
                                return new BadRequestObjectResult(new { status = "Error", errors = resetPassResult.Errors });
                            }
                        }
                        catch (FormatException)
                        {
                            return new BadRequestObjectResult(new { message = "Invalid token format." });
                        }
                    }
                }
            }

            return new BadRequestObjectResult(new { message = "User not found." });
        }

    }
}
