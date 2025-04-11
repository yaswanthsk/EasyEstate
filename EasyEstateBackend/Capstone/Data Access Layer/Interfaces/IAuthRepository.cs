using Entitiy_Layer.AccountModel;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data_Access_Layer.Interfaces
{
    public interface IAuthRepository
    {
        //registration
        Task<ApplicationUser> FindUserByNameAsync(string name);
        Task<ApplicationUser> FindUserByEmailAsync(string email);

        Task<bool> RoleExistsAsync(string role);

        Task<IdentityResult> CreateRoleAsync(IdentityRole role);

        Task<IdentityResult> CreateUserAsync(ApplicationUser user, string password);

        Task AddUserToRoleAsync(ApplicationUser user, string role);
        Task<string> GenerateEmailConfirmationTokenAsync(ApplicationUser user);



        //confirm email
        Task<IdentityResult> ConfirmEmailAsync(ApplicationUser user, string token);

        //login
        Task<List<ApplicationUser>> FindUsersByEmailAsync(string email);



        Task<IEnumerable<string>> GetUserRolesAsync(ApplicationUser user);
        Task<bool> IsUserLockedOutAsync(ApplicationUser user);
        Task<bool> CheckUserPasswordAsync(ApplicationUser user, string password);
        Task IncrementFailedAccessAsync(ApplicationUser user);
        Task ResetFailedAccessAsync(ApplicationUser user);

        //check user token in activesession
        Task<List<ActiveSession>> CheckActivetoken(string userid, string role);
        Task<string> GetSingleRolesAsync(ApplicationUser user);
        Task<int> RemoveactiveToken(List<ActiveSession> activeSession);
        Task<int> AddSession(ActiveSession activeSession);

        //logout
        Task<ActiveSession?> GetUserSession(string userToken);
        Task<bool> DeleteUserSession(ActiveSession activeSession);


        //forget password
        Task<string> GeneratePasswordResetTokenAsync(ApplicationUser user);

        //Reset Password
        Task<ApplicationUser> GetUserByIdAsync(string userId);
        Task<IdentityResult> ResetUserPasswordAsync(ApplicationUser user, string token, string newPassword);





    }
}
