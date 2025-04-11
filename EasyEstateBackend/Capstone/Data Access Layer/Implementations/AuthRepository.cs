using Data_Access_Layer.Data;
using Data_Access_Layer.Interfaces;
using Entitiy_Layer.AccountModel;
using ExceptionLayer.Exceptions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data_Access_Layer.Implementations
{
    /// <summary>
    /// The AuthRepository is responsible for managing authentication-related functionalities 
    /// within the application. It provides various methods for:
    /// 1. User Authentication: Checking user credentials, validating passwords, and handling user lockout status.
    /// 2. User Registration: Creating new users and assigning roles to them, ensuring proper email confirmation and password reset workflows.
    /// 3. Role Management: Creating and validating roles, and assigning users to roles.
    /// 4. Email Confirmation: Generating and verifying email confirmation tokens to ensure users validate their email addresses.
    /// 5. Password Management: Generating password reset tokens, validating new passwords, and handling password reset operations.
    /// 6. Session Management: Adding, checking, and removing active sessions for users, allowing for secure token management during logins and logouts.
    /// 7. User Retrieval: Searching for users by their username or email and checking if they exist in the system.
    /// 8. Lockout Management: Tracking and handling failed access attempts to manage lockout statuses and reset counters upon successful login.
    /// The repository interacts with the `UserManager`, `RoleManager`, and `DbContext` to interact with the underlying database 
    /// and Identity framework for handling user-related operations, ensuring secure user authentication and authorization throughout the application.
    /// </summary>
    public class AuthRepository : IAuthRepository
    {
        private readonly AuthDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;



        public AuthRepository(AuthDbContext dbContext, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _roleManager = roleManager;
        }



        //Login
        /// <summary>
        /// Retrieves a user by their email address from the database.
        /// This method checks if a user with the specified email exists and returns the user if found.
        /// </summary>
        /// <param name="email">The email address of the user to retrieve.</param>
        /// <returns>
        /// An `ApplicationUser` object if the user is found, or `null` if no user exists with the provided email.
        /// </returns>
        public async Task<ApplicationUser?> GetUserByEmailAsync(string email)
        {
            try
            {
                var user = await _userManager.Users.SingleOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    throw new AuthenticationException($"User with email '{email}' not found.");
                }
                return user;
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error occurred while retrieving user by email.", ex);
            }
        }

        /// <summary>
        /// Fetches the roles assigned to a specific user.
        /// This method returns a collection of roles associated with the given user.
        /// </summary>
        /// <param name="user">The user whose roles are to be fetched.</param>
        /// <returns>
        /// A collection of strings representing the user's roles.
        /// </returns>
        public async Task<IEnumerable<string>> GetUserRolesAsync(ApplicationUser user)
        {
            try
            {
                return await _userManager.GetRolesAsync(user);
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error occurred while retrieving user roles.", ex);
            }
        }
        /// <summary>
        /// Checks if the user's account is locked due to too many failed login attempts.
        /// This method returns `true` if the user is locked out, and `false` if they are not.
        /// </summary>
        /// <param name="user">The user whose lockout status is to be checked.</param>
        /// <returns>
        /// `true` if the user is locked out, otherwise `false`.
        /// </returns>
        public async Task<bool> IsUserLockedOutAsync(ApplicationUser user)
        {
            try
            {
                return await _userManager.IsLockedOutAsync(user);
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error occurred while checking if the user is locked out.", ex);
            }
        }


        /// <summary>
        /// Verifies if the provided password matches the user's stored password.
        /// This method checks the password validity for the given user.
        /// </summary>
        /// <param name="user">The user whose password is to be verified.</param>
        /// <param name="password">The password to verify against the stored password.</param>
        /// <returns>
        /// `true` if the password is correct, otherwise `false`.
        /// </returns>
        public async Task<bool> CheckUserPasswordAsync(ApplicationUser user, string password)
        {
            return await _userManager.CheckPasswordAsync(user, password);
        }


        /// <summary>
        /// Increments the user's failed access count after a failed login attempt.
        /// This method is called after an unsuccessful login to track the number of failed attempts.
        /// </summary>
        /// <param name="user">The user whose failed access count is to be incremented.</param>
        public async Task IncrementFailedAccessAsync(ApplicationUser user)
        {
            try
            {
                await _userManager.AccessFailedAsync(user);
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error occurred while incrementing failed access attempts.", ex);
            }
        }



        /// <summary>
        /// Resets the user's failed access count after a successful login.
        /// This method is called after a successful login to reset the count of failed attempts.
        /// </summary>
        /// <param name="user">The user whose failed access count is to be reset.</param>
        public async Task ResetFailedAccessAsync(ApplicationUser user)
        {
            try
            {
                await _userManager.ResetAccessFailedCountAsync(user);
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error occurred while resetting failed access attempts.", ex);
            }
        }

        //Active session
        /// <summary>
        /// Retrieves a single role assigned to the given user.
        /// This method fetches the roles for the user and returns the first role found.
        /// </summary>
        /// <param name="user">The user whose role is to be retrieved.</param>
        /// <returns>
        /// The first role assigned to the user, or `null` if no roles are assigned.
        /// </returns>
        public async Task<string> GetSingleRolesAsync(ApplicationUser user)
        {
            try
            {
                var roles = await _userManager.GetRolesAsync(user);
                if (!roles.Any())
                {
                    throw new AuthorizationException("User does not have any roles assigned.");
                }
                return roles.FirstOrDefault();
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error occurred while retrieving a single role for the user.", ex);
            }
        }
        /// <summary>
        /// Checks if there are any active sessions for a user with the specified user ID and role.
        /// This method returns a list of active sessions that match the user's ID and role.
        /// </summary>
        /// <param name="userid">The ID of the user to check for active sessions.</param>
        /// <param name="role">The role of the user to filter the active sessions.</param>
        /// <returns>
        /// A list of active sessions that match the specified user ID and role.
        /// </returns>
        public async Task<List<ActiveSession>> CheckActivetoken(string userid, string role)
        {
            try
            {
                var existingTokens = await _dbContext.ActiveSessions
                    .Where(t => t.UserId == userid && t.UserRole == role)
                    .ToListAsync();
                return existingTokens;
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error occurred while checking active tokens.", ex);
            }
        }


        /// <summary>
        /// Removes the specified active sessions from the database.
        /// This method deletes the active sessions associated with a user and role from the database.
        /// </summary>
        /// <param name="activesession">The list of active sessions to remove.</param>
        /// <returns>
        /// The number of rows affected by the operation, which indicates how many active sessions were deleted.
        /// </returns>
        public async Task<int> RemoveactiveToken(List<ActiveSession> activesession)
        {
            try
            {
                _dbContext.ActiveSessions.RemoveRange(activesession);
                return await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error occurred while removing active tokens.", ex);
            }
        }

        /// <summary>
        /// Adds a new active session to the database.
        /// This method stores the given active session information in the database.
        /// </summary>
        /// <param name="activeSession">The active session to add to the database.</param>
        /// <returns>
        /// The number of rows affected by the operation, which indicates how many active sessions were added.
        /// </returns>
        public async Task<int> AddSession(ActiveSession activeSession)
        {
            try
            {
                _dbContext.ActiveSessions.Add(activeSession);
                return await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error occurred while adding a new active session.", ex);
            }
        }

        //Logout
        /// <summary>
        /// Retrieves the active session associated with the provided user token.
        /// This method checks if a session exists in the database for the given user token.
        /// </summary>
        /// <param name="userToken">The token of the user whose active session is to be retrieved.</param>
        /// <returns>
        /// The active session associated with the provided user token, or `null` if no session is found.
        /// </returns>
        public async Task<ActiveSession?> GetUserSession(string userToken)
        {
            try
            {
                return await _dbContext.ActiveSessions.FirstOrDefaultAsync(t => t.Token == userToken);
            }
            catch (Exception ex)
            {
                throw new TokenException($"Error while retrieving user session: {ex.Message}");
            }
        }


        /// <summary>
        /// Deletes the specified user session from the database.
        /// This method removes the active session associated with the provided session object.
        /// </summary>
        /// <param name="userSession">The active session to delete from the database.</param>
        /// <returns>
        /// `true` if the session was successfully deleted, otherwise `false`.
        /// </returns>
        public async Task<bool> DeleteUserSession(ActiveSession userSession)
        {
            try
            {
                _dbContext.ActiveSessions.Remove(userSession);
                await _dbContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new TokenException($"Error while deleting user session: {ex.Message}");
            }
        }



        //registartion
        /// <summary>
        /// Finds a user by their username.
        /// This method searches for a user in the system based on their username.
        /// </summary>
        /// <param name="name">The username of the user to find.</param>
        /// <returns>
        /// The user associated with the provided username, or `null` if no user is found.
        /// </returns>
        public async Task<ApplicationUser> FindUserByNameAsync(string name)
        {
            return await _userManager.FindByNameAsync(name);
        }




        /// <summary>
        /// Finds a user by their email address.
        /// This method searches for a user in the system based on their email address.
        /// </summary>
        /// <param name="email">The email address of the user to find.</param>
        /// <returns>
        /// The user associated with the provided email, or `null` if no user is found.
        /// </returns>
        public async Task<ApplicationUser> FindUserByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }



        /// <summary>
        /// Checks if a role exists in the system.
        /// This method verifies whether the specified role is already present in the system.
        /// </summary>
        /// <param name="role">The role name to check for existence.</param>
        /// <returns>
        /// `true` if the role exists, otherwise `false`.
        /// </returns>
        public async Task<bool> RoleExistsAsync(string role)
        {
            return await _roleManager.RoleExistsAsync(role);
        }



        /// <summary>
        /// Creates a new role in the system.
        /// This method creates a new role in the system with the specified role information.
        /// </summary>
        /// <param name="role">The role to be created.</param>
        /// <returns>
        /// The result of the role creation operation, including any errors or success messages.
        /// </returns>
        public async Task<IdentityResult> CreateRoleAsync(IdentityRole role)
        {
            return await _roleManager.CreateAsync(role);
        }


        /// <summary>
        /// Creates a new user in the system.
        /// This method creates a new user with the specified details and password.
        /// </summary>
        /// <param name="user">The user to be created.</param>
        /// <param name="password">The password for the new user.</param>
        /// <returns>
        /// The result of the user creation operation, including any errors or success messages.
        /// </returns>
        public async Task<IdentityResult> CreateUserAsync(ApplicationUser user, string password)
        {
            return await _userManager.CreateAsync(user, password);
        }



        /// <summary>
        /// Adds a user to a specific role.
        /// This method assigns the specified role to the given user.
        /// </summary>
        /// <param name="user">The user to add to the role.</param>
        /// <param name="role">The role to assign to the user.</param>
        public async Task AddUserToRoleAsync(ApplicationUser user, string role)
        {
            await _userManager.AddToRoleAsync(user, role);
        }


        /// <summary>
        /// Generates an email confirmation token for the user.
        /// This method generates a token that can be used for confirming the user's email address.
        /// </summary>
        /// <param name="user">The user for whom the email confirmation token is generated.</param>
        /// <returns>
        /// The generated email confirmation token.
        /// </returns>
        public async Task<string> GenerateEmailConfirmationTokenAsync(ApplicationUser user)
        {
            return await _userManager.GenerateEmailConfirmationTokenAsync(user);
        }

        //confirm email
        /// <summary>
        /// Confirms the user's email using a token.
        /// This method verifies the user's email address by confirming it with the provided token.
        /// </summary>
        /// <param name="user">The user whose email is to be confirmed.</param>
        /// <param name="token">The token generated for email confirmation.</param>
        /// <returns>
        /// The result of the email confirmation operation, including any errors or success messages.
        /// </returns>
        public async Task<IdentityResult> ConfirmEmailAsync(ApplicationUser user, string token)
        {
            try
            {
                return await _userManager.ConfirmEmailAsync(user, token);
            }
            catch (Exception ex)
            {
                throw new TokenException($"Error while confirming email: {ex.Message}");
            }
        }


        /// <summary>
        /// Finds users by their email address.
        /// This method retrieves all users associated with the given email address.
        /// </summary>
        /// <param name="email">The email address used to find the users.</param>
        /// <returns>
        /// A list of users that match the provided email address.
        /// </returns>
        public async Task<List<ApplicationUser>> FindUsersByEmailAsync(string email)
        {
            try
            {
                return await _userManager.Users.Where(u => u.Email == email).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new RegistrationException($"Error while finding users by email: {ex.Message}");
            }
        }



        //forget password
        /// <summary>
        /// Generates a password reset token for the user.
        /// This method creates a token that can be used by the user to reset their password.
        /// </summary>
        /// <param name="user">The user for whom the password reset token is generated.</param>
        /// <returns>
        /// The generated password reset token.
        /// </returns>
        public async Task<string> GeneratePasswordResetTokenAsync(ApplicationUser user)
        {
            try
            {
                return await _userManager.GeneratePasswordResetTokenAsync(user);
            }
            catch (Exception ex)
            {
                throw new TokenException($"Error while generating password reset token: {ex.Message}");
            }
        }

        //Reset
        /// <summary>
        /// Retrieves a user by their unique ID.
        /// This method searches for a user in the system using the user's ID.
        /// </summary>
        /// <param name="userId">The ID of the user to retrieve.</param>
        /// <returns>
        /// The user associated with the provided ID, or `null` if no user is found.
        /// </returns>
        public async Task<ApplicationUser> GetUserByIdAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
            {
                throw new RegistrationException("User not found.");
            }

            return user;
        }

        /// <summary>
        /// Resets the user's password using a token and a new password.
        /// This method allows the user to reset their password using a previously generated reset token and a new password.
        /// </summary>
        /// <param name="user">The user whose password is to be reset.</param>
        /// <param name="token">The token used to authenticate the password reset request.</param>
        /// <param name="newPassword">The new password to set for the user.</param>
        /// <returns>
        /// The result of the password reset operation, including any errors or success messages.
        /// </returns>
        public async Task<IdentityResult> ResetUserPasswordAsync(ApplicationUser user, string token, string newPassword)
        {
            try
            {
                return await _userManager.ResetPasswordAsync(user, token, newPassword);
            }
            catch (Exception ex)
            {
                throw new TokenException($"Error while resetting password: {ex.Message}");
            }
        }

    }
}
