using Bussiness_Layer.Interfaces;
using Bussiness_Layer.DTOs.AccountDto;
using Entitiy_Layer.AccountModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using ExceptionLayer.Exceptions;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Buffers.Text;
using System.Net;

namespace Bussiness_Layer.Controllers
{
    /// <summary>
    /// The AccountController handles user account-related operations such as deleting an account, 
    /// updating user details, and retrieving user profile information. 
    /// It interacts with the service layer to perform these operations asynchronously 
    /// and returns appropriate HTTP responses based on the success or failure of the operation.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AccountController : ControllerBase
    {
        private readonly IAccountService _accountService;

        public AccountController(IAccountService accountService)
        {
            _accountService = accountService;
        }


        /// <summary>
        /// Deletes a user account based on the provided user ID.
        /// The method calls the account service to delete the user asynchronously.
        /// If the user is successfully deleted, a success message is returned. 
        /// If the user does not exist, a "Not Found" response is returned.
        /// </summary>
        /// <param name="userId">The unique identifier of the user to be deleted.</param>
        /// <returns>
        /// An IActionResult indicating the success or failure of the operation.
        /// Returns 200 OK with a success message if the user is deleted successfully.
        /// Returns 404 Not Found with an error message if the user does not exist.
        /// </returns>
        [HttpDelete("DeleteAccount/{userId}")]
        public async Task<IActionResult> DeleteAccount(string userId)
        {
            var isDeleted = await _accountService.DeleteUserAsync(userId);
            if (isDeleted)
                return Ok(new { Message = "User account deleted successfully." });
            return NotFound(new { Message = "User not found." });
        }


        /// <summary>
        /// Updates the details of an existing user based on the provided user ID and update data.
        /// The method calls the account service to perform the update operation asynchronously.
        /// Appropriate error responses are returned for invalid input, user not found, or unexpected server errors.
        /// </summary>
        /// <param name="userId">The unique identifier of the user to be updated.</param>
        /// <param name="updateUserDto">An object containing the updated user details.</param>
        /// <returns>
        /// An IActionResult indicating the success or failure of the operation.
        /// Returns 200 OK with the result if the update is successful.
        /// Returns 404 Not Found if the user does not exist.
        /// Returns 400 Bad Request for invalid input.
        /// Returns 500 Internal Server Error for repository issues or unexpected errors.
        /// </returns>
        [HttpPut("update/{userId}")]
        public async Task<IActionResult> UpdateUser(string userId, [FromBody] UpdateUserDto updateUserDto)
        {
            try
            {
                var result = await _accountService.UpdateUserAsync(userId, updateUserDto);
                return result; // Return the result from the service (success or failure)
            }
            catch (UserNotFoundException ex)
            {
                return NotFound(new { Status = "Error", Message = ex.Message });
            }
            catch (InvalidInputException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (RepositoryException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                // Catch any unexpected errors
                return StatusCode(StatusCodes.Status500InternalServerError, new { Status = "Error", Message = ex.Message });
            }
        }

        /// <summary>
        /// Retrieves the profile information of a user based on the provided user ID.
        /// The method calls the service layer to fetch the user's profile data asynchronously.
        /// If the user is found, their profile is returned. If not, a "Not Found" response is returned.
        /// </summary>
        /// <param name="userId">The unique identifier of the user whose profile is to be retrieved.</param>
        /// <returns>
        /// An IActionResult indicating the success or failure of the operation.
        /// Returns 200 OK with the user profile data if the user exists.
        /// Returns 404 Not Found if the user does not exist.
        /// Returns 400 Bad Request with an error message if an unexpected exception occurs.
        /// </returns>

        [HttpGet("GetProfile/{userId}")]
        public async Task<IActionResult> GetProfile(string userId)
        {
            try
            {
                // Fetch the profile data using the service layer
                var profile = await _accountService.GetProfileAsync(userId);

                if (profile != null)
                {
                    return Ok(profile); // Return user profile if found
                }

                // Return a NotFound response if the user doesn't exist
                return NotFound(new { Message = "User not found." });
            }
            catch (Exception ex)
            {
                // Handle any unexpected errors and return an appropriate response
                return BadRequest(new
                {
                    Message = "An error occurred while retrieving the user profile.",
                    Error = ex.Message
                });
            }
        }



    }
}
