using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Entitiy_Layer.AccountModel
{
    public class ApplicationUser : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? DateofBirth { get; set; }

        public Byte[]? Avatar { get; set; }
        public string? Address { get; set; }
        public string? Gender { get; set; }
    }
}
