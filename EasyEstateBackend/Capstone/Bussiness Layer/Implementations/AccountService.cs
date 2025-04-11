using Bussiness_Layer.DTOs.AccountDto;
using Bussiness_Layer.Interfaces;
using Data_Access_Layer.Interfaces;
using Entitiy_Layer.AccountModel;
using ExceptionLayer.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness_Layer.Implementations
{
    /// <summary>
    /// The AccountService class implements the IAccountService interface and provides business logic 
    /// for managing user accounts. It interacts with the repository layer to perform operations 
    /// such as deleting a user, updating user details, and retrieving user profile information.
    /// </summary>
    public class AccountService : IAccountService
    {
        private readonly IAccountRepository _accountRepository;

        private readonly IConfiguration _configuration;
        public AccountService(IAccountRepository accountRepository, IConfiguration configuration)
        {
            _accountRepository = accountRepository;
            _configuration = configuration;
        }


        /// <summary>
        /// Deletes a user from the system based on the provided user ID.
        /// This method calls the repository layer to perform the delete operation asynchronously.
        /// </summary>
        /// <param name="userId">The unique identifier of the user to be deleted.</param>
        /// <returns>
        /// A boolean value indicating the success or failure of the operation.
        /// Returns true if the user is successfully deleted.
        /// Returns false if the user does not exist or the deletion fails.
        /// </returns>
        public async Task<bool> DeleteUserAsync(string userId)
        {
            return await _accountRepository.DeleteUserAsync(userId);
        }


        /// <summary>
        /// Updates the details of an existing user based on the provided user ID and update data.
        /// Fields are updated only if they are not null, empty, or contain a default placeholder value ("string").
        /// The method also handles avatar updates by converting Base64-encoded data to a byte array.
        /// </summary>
        /// <param name="userId">The unique identifier of the user to be updated.</param>
        /// <param name="updateUserDto">An object containing the updated user details, including fields like FirstName, LastName, Address, PhoneNumber, Gender, DateOfBirth, and Avatar.</param>
        /// <returns>
        /// An IActionResult indicating the success or failure of the update operation:
        /// - Returns 200 OK if the user details are updated successfully.
        /// - Returns 404 Not Found if the user does not exist.
        /// - Returns 400 Bad Request for invalid input, such as incorrect avatar format or if the update fails.
        /// </returns>
        public async Task<IActionResult> UpdateUserAsync(string userId, UpdateUserDto updateUserDto)
        {
            var user = await _accountRepository.FindUserByIdAsync(userId);
            if (user == null)
            {
                return new NotFoundObjectResult("User not found.");
            }

            // Update fields only if they are not "string" or null
            if (!string.IsNullOrEmpty(updateUserDto.PhoneNumber) && updateUserDto.PhoneNumber != "string")
                user.PhoneNumber = updateUserDto.PhoneNumber;

            if (!string.IsNullOrEmpty(updateUserDto.FirstName) && updateUserDto.FirstName != "string")
                user.FirstName = updateUserDto.FirstName;

            if (!string.IsNullOrEmpty(updateUserDto.LastName) && updateUserDto.LastName != "string")
                user.LastName = updateUserDto.LastName;

            if (!string.IsNullOrEmpty(updateUserDto.Address) && updateUserDto.Address != "string")
                user.Address = updateUserDto.Address;

            if (!string.IsNullOrEmpty(updateUserDto.Gender) && updateUserDto.Gender != "string")
                user.Gender = updateUserDto.Gender;

            if (!string.IsNullOrEmpty(updateUserDto.DateofBirth) && updateUserDto.DateofBirth != "string")
                user.DateofBirth = updateUserDto.DateofBirth;

            // Handle Avatar - Convert Base64 if it's not empty or "string"
            if (!string.IsNullOrEmpty(updateUserDto.Avatar) && updateUserDto.Avatar != "string")
            {
                try
                {
                    var base64Data = updateUserDto.Avatar.Split(',')[1]; // Split to get just the base64 part
                    user.Avatar = Convert.FromBase64String(base64Data); // Convert base64 to byte array
                }
                catch
                {
                    return new BadRequestObjectResult("Invalid Avatar format. Expected 'data:image/png;base64,...'");
                }
            }

            // Save changes
            var result = await _accountRepository.UpdateUserAsync(user);
            if (!result.Succeeded)
            {
                return new BadRequestObjectResult("Failed to update user details.");
            }

            return new OkObjectResult("User details updated successfully.");
        }


        /// <summary>
        /// Retrieves the profile details of a user based on the provided user ID.
        /// The method fetches the user data from the repository and maps it to a Data Transfer Object (DTO).
        /// If the user is not found, the method returns null.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose profile is to be retrieved.</param>
        /// <returns>
        /// A <see cref="GetUserDto"/> object containing the user's profile details, such as Email, PhoneNumber, 
        /// FirstName, LastName, DateOfBirth, Address, Gender, and Avatar.
        /// Returns null if the user does not exist.
        /// </returns>
        /// <exception cref="ServiceException">
        /// Thrown when an unexpected error occurs while retrieving the profile.
        /// </exception>
        public async Task<GetUserDto> GetProfileAsync(string userId)
        {
            try
            {
                // Fetch user from the repository
                var user = await _accountRepository.FindUserByIdAsync(userId);

                if (user == null) return null;

                // Map the user to a DTO (Data Transfer Object)
                return new GetUserDto
                {
                    Email = user.Email,
                    PhoneNumber = user.PhoneNumber,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    DateofBirth = user.DateofBirth,
                    Address = user.Address,
                    Gender = user.Gender,
                    Avatar = user.Avatar != null ? Convert.ToBase64String(user.Avatar) : null
                };
            }
            catch (Exception ex)
            {
                // Handle service layer exceptions and optionally log
                throw new ServiceException("An error occurred while getting the profile.", ex);
            }
        }


    }
}
