using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Bussiness_Layer.Interfaces;
using Bussiness_Layer.DTOs.AccountDto;
using Bussiness_Layer.Implementations;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using ExceptionLayer.Exceptions;

namespace EasyEstate.Controllers
{

    /// <summary>
    /// Provides authentication-related actions, including login, registration, email confirmation,
    /// password reset, and logout functionalities. This controller interacts with the authentication service
    /// to manage user sessions and perform related tasks such as login, registration, email verification, 
    /// and password management.
    /// </summary>

    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }



        /// <summary>
        /// Handles user login by validating the provided credentials and returning an authentication token upon successful login.
        /// </summary>
        /// <param name="loginUser">The user credentials required for login.</param>
        /// <returns>A Task representing the asynchronous operation, containing a success or failure message, token, and expiration time.</returns>
        /// <exception cref="AuthenticationException">Thrown if the login credentials are invalid.</exception>
        /// <exception cref="AuthorizationException">Thrown if the user does not have permission to log in.</exception>
        /// <exception cref="RegistrationException">Thrown if there is an error during user registration.</exception>
        /// <exception cref="TokenException">Thrown if there is an error generating the authentication token.</exception>
        /// <exception cref="InvalidOperationException">Thrown if an unexpected error occurs.</exception>

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto loginUser)
        {
            try
            {
                var (isSuccess, message, token, expiration) = await _authService.LoginAsync(loginUser);

                if (!isSuccess)
                {
                    return BadRequest(new { Status = "Error", Message = message });
                }

                return Ok(new { Status = "Success", Message = message, Token = token, Expiration = expiration });
            }
            catch (AuthenticationException ex)
            {
                return Unauthorized(new { Status = "Error", Message = ex.Message });
            }
            catch (AuthorizationException ex)
            {
                return Unauthorized(new { Status = "Warn", Message = ex.Message });
            }
            catch (RegistrationException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (TokenException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Error", Message = "An unexpected error occurred." });
            }
        }

        /// <summary>
        /// Logs the user out by invalidating the provided token.
        /// </summary>
        /// <param name="userToken">The token associated with the user session to be invalidated.</param>
        /// <returns>A Task representing the asynchronous operation, containing a success or failure message.</returns>
        /// <exception cref="ArgumentException">Thrown if the provided token is invalid or null.</exception>
        /// <exception cref="AuthenticationException">Thrown if there is an authentication issue while logging out.</exception>
        /// <exception cref="TokenException">Thrown if there is a problem with the token.</exception>
        /// <exception cref="AuthorizationException">Thrown if the user does not have permission to log out.</exception>

        [HttpPost("Logout")]
        public async Task<IActionResult> Logout(string userToken)
        {
            try
            {
                var result = await _authService.Logout(userToken);

                if (result)
                {
                    return Ok(new { message = "Logged out successfully." });
                }
                return BadRequest(new { message = "Invalid or non-existent user token." });
            }
            catch (ArgumentException ex)
            {
                // Handle argument exceptions (e.g., null or empty token)
                return BadRequest(new { message = "Invalid input", error = ex.Message });
            }
            catch (AuthenticationException ex)
            {
                // Handle authentication exceptions (e.g., issues with session or token)
                return Unauthorized(new { message = "Authentication error", error = ex.Message });
            }
            catch (TokenException ex)
            {
                // Handle token-specific issues
                return Unauthorized(new { message = "Token error", error = ex.Message });
            }
            catch (AuthorizationException ex)
            {
                // Handle authorization errors (e.g., insufficient permissions)
                return Unauthorized(new { message = "Forbidden", error = ex.Message });
            }
            catch (Exception ex)
            {
                // Generic fallback for unexpected errors
                return BadRequest(new { message = "An error occurred while logging out users.", error = ex.Message });
            }
        }


        /// <summary>
        /// Registers a new user by validating the provided registration details and returning a confirmation link.
        /// </summary>
        /// <param name="registration">The registration details of the user.</param>
        /// <param name="role">The role assigned to the user during registration.</param>
        /// <returns>A Task representing the asynchronous operation, containing a success or failure message, along with a confirmation link.</returns>
        /// <exception cref="RegistrationException">Thrown if there is an error during user registration.</exception>
        /// <exception cref="TokenException">Thrown if there is an issue with generating the registration token.</exception>

        [HttpPost("registration")]
        public async Task<IActionResult> Register(RegistrationDto registration, string role)
        {
            try
            {
                var (IsSuccess, Message, Token) = await _authService.RegisterUserAsync(registration, role);

                if (IsSuccess)
                {
                    var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(Token));

                    string confirmationLink = Url.Action(nameof(ConfirmEmail), "Auth", new { token = encodedToken, email = registration.Email, role }, Request.Scheme);

                    // Return success response with message and token (confirmation link)
                    return Ok(new { Status = "Success", Message, confirmationLink });
                }

                // Return error response with message
                return BadRequest(new { Status = "RegistrationError", Message = Message });
            }
            catch (RegistrationException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (TokenException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An error occurred while processing the registration.", Error = ex.Message });
            }
        }


        /// <summary>
        /// Confirms the user's email address by validating the provided confirmation token.
        /// </summary>
        /// <param name="token">The confirmation token sent to the user's email.</param>
        /// <param name="email">The email address of the user.</param>
        /// <param name="role">The role of the user being confirmed.</param>
        /// <returns>A Task representing the asynchronous operation, redirecting to the frontend upon successful email confirmation.</returns>
        /// <exception cref="RegistrationException">Thrown if the email confirmation process fails.</exception>
        /// <exception cref="TokenException">Thrown if there is an issue with the confirmation token.</exception>

        [HttpGet("ConfirmEmail")]
        public async Task<IActionResult> ConfirmEmail(string token, string email, string role)
        {
            try
            {
                var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));
                var frontendUrl = await _authService.ConfirmEmailAsync(decodedToken, email, role);
                if (!string.IsNullOrEmpty(frontendUrl))
                {
                    return Redirect(frontendUrl); // Redirect to frontend after successful email confirmation
                }
                return BadRequest(new { Status = "Error", Message = "This user does not exist or invalid role!" });
            }
            catch (RegistrationException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (TokenException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An error occurred while processing the registration.", Error = ex.Message });
            }
        }




        /// <summary>
        /// Sends a password reset link to the user's email address.
        /// </summary>
        /// <param name="email">The email address of the user requesting a password reset.</param>
        /// <param name="role">The role assigned to the user.</param>
        /// <returns>A Task representing the asynchronous operation, containing a password reset link or error message.</returns>
        /// <exception cref="RegistrationException">Thrown if there is an error during the password reset process.</exception>
        /// <exception cref="AuthorizationException">Thrown if the user is not authorized to reset the password.</exception>
        /// <exception cref="TokenException">Thrown if there is an issue with generating the password reset token.</exception>

        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword(string email, string role)
        {
            try
            {
                // Call ForgotPasswordAsync to get the response
                var (IsSuccess, Message, EncodedToken, UserEmail, UserRole) = await _authService.ForgotPasswordAsync(email, role);

                // Check if the response is successful and contains the necessary fields
                if (IsSuccess)
                {
                    // Generate the password reset link using the encoded token and userId
                    var forgetPasswordLink = Url.Action("ResetPassword", "Auth", new { token = EncodedToken, Email = UserEmail, Role = UserRole }, Request.Scheme);

                    // Return the password reset link with a success response
                    return Ok(new
                    {
                        Status = "Success",
                        Message = Message,
                        ResetPasswordLink = forgetPasswordLink
                    });
                }

                // Return an error message if the status is not "Success"
                return BadRequest(new
                {
                    Status = "Failed",
                    Message = Message
                });
            }
            catch (RegistrationException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (AuthorizationException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (TokenException ex)
            {
                return BadRequest(new { Status = "Error", Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { Message = "An error occurred while processing the password reset.", Error = ex.Message });
            }
        }





        /// <summary>
        /// Generates a password reset URL using the provided token, email, and role, and redirects the user
        /// to the frontend component for resetting their password.
        /// </summary>
        /// <param name="token">The token used for verifying the password reset request.</param>
        /// <param name="email">The email address of the user requesting the password reset.</param>
        /// <param name="role">The role assigned to the user requesting the password reset.</param>
        /// <returns>A Task representing the asynchronous operation, redirecting the user to the frontend reset password page.</returns>
        /// <exception cref="ArgumentException">Thrown if the provided token, email, or role is invalid.</exception>
        /// <exception cref="InvalidOperationException">Thrown if there is an issue with generating the password reset URL.</exception>
        /// <exception cref="Exception">Thrown if an unexpected error occurs while redirecting to the frontend component.</exception>

        [HttpGet("getpassword")]
        public IActionResult ResetPassword(string token, string email, string role)
        {
            // Construct the URL of the frontend component
            var frontendUrl = _authService.GeneratePasswordResetUrl(token, email, role);

            // Redirect the user to the frontend componen
            return Redirect(frontendUrl);
        }


        /// <summary>
        /// Resets the password for a user using the provided reset password data.
        /// The method calls the service to handle the password reset, checking if the operation was successful
        /// and returning appropriate responses based on the result.
        /// </summary>
        /// <param name="resetPasswordDto">An object containing the necessary data to reset the user's password, such as the token and new password.</param>
        /// <returns>A Task representing the asynchronous operation, with an HTTP response indicating the success or failure of the password reset operation.</returns>
        /// <exception cref="AuthorizationException">Thrown when the user is not authorized to reset the password.</exception>
        /// <exception cref="TokenException">Thrown when the token used for resetting the password is invalid or expired.</exception>
        /// <exception cref="RegistrationException">Thrown when there is an issue with the user registration process related to resetting the password.</exception>
        /// <exception cref="Exception">Thrown for any unexpected errors during the password reset process.</exception>

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto resetPasswordDto)
        {
            try
            {
                var result = await _authService.ResetPasswordAsync(resetPasswordDto);

                if (result is OkObjectResult) // Check if the password reset was successful
                {
                    return Ok(new { status = "Success", message = "Password reset successfully." });
                }

                return result; // Return any errors or bad request status from the service
            }
            catch (AuthorizationException ex)
            {
                return BadRequest(new { status = "Error", message = ex.Message });
            }
            catch (TokenException ex)
            {
                return BadRequest(new { status = "Error", message = ex.Message });
            }
            catch (RegistrationException ex)
            {
                return BadRequest(new { status = "Error", message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { status = "Error", message = ex.Message });
            }
        }


    }
}
