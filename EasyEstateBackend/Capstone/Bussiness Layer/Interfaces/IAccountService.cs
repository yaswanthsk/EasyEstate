using Azure;
using Bussiness_Layer.DTOs.AccountDto;
using Entitiy_Layer.AccountModel;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness_Layer.Interfaces
{
    public interface IAccountService
    {
       
        Task<bool> DeleteUserAsync(string userId);
        Task<IActionResult> UpdateUserAsync(string userId, UpdateUserDto updateUserDto);
        Task<GetUserDto> GetProfileAsync(string userId);

        
    }
}
