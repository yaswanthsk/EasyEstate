using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Bussiness_Layer.DTOs.AccountDto;
using Microsoft.AspNetCore.Mvc;

namespace Bussiness_Layer.Interfaces
{
    public interface IAuthService
    {
        //Login
        Task<(bool IsSuccess, string Message, string Token, DateTime Expiration)> LoginAsync(LoginUserDto loginUser);

        Task<(bool IsSuccess, string Message, string Token)> RegisterUserAsync(RegistrationDto registration, string role);
        Task<string> ConfirmEmailAsync(string token, string email, string role);

        string  GeneratePasswordResetUrl(string token, string Email, string Role);

        //forget password
        Task<(bool IsSuccess, string Message, string EncodedToken, string Email, string Role)> ForgotPasswordAsync(string email, string role);

        //logout
        Task<bool> Logout(string userToken);

        //Reset
        Task<IActionResult> ResetPasswordAsync(ResetPasswordDto resetPasswordDto);



    }
}
