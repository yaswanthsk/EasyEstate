using Data_Access_Layer.Data;
using Data_Access_Layer.Interfaces;
using Entitiy_Layer.AccountModel;
using ExceptionLayer.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Data_Access_Layer.Implementations
{
    /// <summary>
    /// The AccountRepository class is responsible for managing user-related data operations, including user creation, updating, 
    /// deletion, and role management, through interaction with the Identity framework and the application's database. It provides 
    /// the following functionalities:
    /// 1. Checking if a username or email already exists in the system.
    /// 2. Verifying user credentials (email, role, and password).
    /// 3. Creating new roles in the system if they don't already exist.
    /// 4. Retrieving user details based on the user ID.
    /// 5. Deleting a user and cleaning up related data (e.g., properties, statuses, customer carts).
    /// 6. Updating an existing user's details.
    /// The repository interacts with the `UserManager` and `RoleManager` to perform user and role operations, as well as 
    /// the application's `DbContext` to handle related data operations for users.
    /// </summary>
    public class AccountRepository : IAccountRepository
    {
        private readonly AuthDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;


        public AccountRepository(AuthDbContext dbContext, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _dbContext = dbContext;
            _userManager = userManager;
            _roleManager = roleManager;
        }


        /// <summary>
        /// Checks if a username already exists in the system.
        /// This method queries the user manager to find a user by their username.
        /// </summary>
        /// <param name="username">The username to check for existence.</param>
        /// <returns>
        /// A boolean indicating whether the username exists in the system.
        /// - Returns true if a user with the provided username exists.
        /// - Returns false if no user with the given username is found.
        /// </returns>
        public async Task<bool> IsUserNameExistsAsync(string username)
        {
            return await _userManager.FindByNameAsync(username) != null;
        }


        /// <summary>
        /// Checks if a user with the specified email exists in the system and either has the specified role or the provided password matches.
        /// This method queries the user manager to find a user by their email, checks their roles, 
        /// and compares the provided password to the stored password for the user.
        /// </summary>
        /// <param name="email">The email address to check for existence.</param>
        /// <param name="role">The role to verify against the user's assigned roles.</param>
        /// <param name="password">The password to check against the user's stored password.</param>
        /// <returns>
        /// A boolean indicating whether the user exists and meets the role or password criteria.
        /// - Returns true if the user exists and has the specified role or the provided password is correct.
        /// - Returns false if the user does not exist, or the user does not have the specified role and the password is incorrect.
        /// </returns>
        public async Task<bool> IsUserEmailExistsAsync(string email, string role, string password)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return false;

            var roles = await _userManager.GetRolesAsync(user);
            return roles.Contains(role) || await _userManager.CheckPasswordAsync(user, password);
        }


        /// <summary>
        /// Checks if a role exists in the system and creates it if it doesn't.
        /// This method queries the role manager to check if the specified role already exists.
        /// If the role does not exist, it creates the role using the role manager.
        /// </summary>
        /// <param name="role">The role name to check and possibly create.</param>
        /// <returns>
        /// A boolean indicating whether the role was successfully created or already exists.
        /// - Returns true if the role exists or was successfully created.
        /// - Returns false if the role creation failed.
        /// </returns>
        public async Task<bool> CreateRoleIfNotExistsAsync(string role)
        {
            if (await _roleManager.RoleExistsAsync(role)) return true;

            var result = await _roleManager.CreateAsync(new IdentityRole(role));
            return result.Succeeded;
        }


        /// <summary>
        /// Retrieves a user from the system based on the provided user ID.
        /// This method uses the UserManager to find the user asynchronously by their ID.
        /// If an error occurs during the retrieval process, an exception is thrown.
        /// </summary>
        /// <param name="userId">The unique identifier of the user to be retrieved.</param>
        /// <returns>
        /// The <see cref="ApplicationUser"/> object representing the user, or null if the user does not exist.
        /// </returns>
        /// <exception cref="RepositoryException">
        /// Thrown when an error occurs while fetching the user by ID.
        /// </exception>
        public async Task<ApplicationUser> FindUserByIdAsync(string userId)
        {
            try
            {
                // Use UserManager to find the user by ID
                return await _userManager.FindByIdAsync(userId);
            }
            catch (Exception ex)
            {
                // Handle exception and optionally log it
                throw new RepositoryException("An error occurred while fetching the user by ID.", ex);
            }
        }


        /// <summary>
        /// Deletes a user from the system, including all associated data.
        /// This method first retrieves the user by their ID, then removes related records 
        /// from various tables (Property, Status, CustomerCart) before deleting the user.
        /// If the user does not exist, it returns false. If the user is successfully deleted, it returns true.
        /// </summary>
        /// <param name="userId">The unique identifier of the user to be deleted.</param>
        /// <returns>
        /// A boolean indicating the success or failure of the operation.
        /// - Returns true if the user and associated data were successfully deleted.
        /// - Returns false if the user does not exist.
        /// </returns>
        public async Task<bool> DeleteUserAsync(string userId)
        {
            var user = await FindUserByIdAsync(userId);
            if (user == null) return false;

            var properties = _dbContext.Property.Where(p => p.OwnerID == userId);
            _dbContext.Property.RemoveRange(properties);

            var statuses = _dbContext.Status.Where(s => s.UserId == userId || s.OwnerID == userId);
            _dbContext.Status.RemoveRange(statuses);

            var carts = _dbContext.CustomerCart.Where(c => c.UserID == userId);
            _dbContext.CustomerCart.RemoveRange(carts);

            var chat = _dbContext.ChatSystem.Where(c => c.SenderId == userId || c.ReceiverId == userId);
            _dbContext.ChatSystem.RemoveRange(chat);

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }

        //update
        /// <summary>
        /// Updates the details of an existing user in the system.
        /// This method uses the UserManager to update the user and returns the result of the update operation.
        /// If the update is successful, the result is returned. If there is an error during the update process,
        /// a custom RepositoryException is thrown.
        /// </summary>
        /// <param name="user">The user object containing the updated user details.</param>
        /// <returns>
        /// An IdentityResult indicating the success or failure of the operation.
        /// - Returns a successful result if the user details are updated successfully.
        /// - Throws a RepositoryException if an error occurs during the update process.
        /// </returns>
        public async Task<IdentityResult> UpdateUserAsync(ApplicationUser user)
        {
            try
            {
                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    return result;
                }
                else
                {
                    throw new RepositoryException("Error occurred while updating user details in the database.");
                }
            }
            catch (Exception ex)
            {
                throw new RepositoryException("Error occurred while updating user in the database.", ex);
            }
        }

    }

}
