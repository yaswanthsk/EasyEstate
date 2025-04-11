using Entitiy_Layer.AccountModel;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data_Access_Layer.Interfaces
{
    public interface IAccountRepository
    {
       
        Task<bool> IsUserNameExistsAsync(string username);
        Task<bool> IsUserEmailExistsAsync(string email, string role, string password);
        Task<bool> CreateRoleIfNotExistsAsync(string role);
        Task<ApplicationUser> FindUserByIdAsync(string userId);
        Task<bool> DeleteUserAsync(string userId);
        Task<IdentityResult> UpdateUserAsync(ApplicationUser user);




    }
}
