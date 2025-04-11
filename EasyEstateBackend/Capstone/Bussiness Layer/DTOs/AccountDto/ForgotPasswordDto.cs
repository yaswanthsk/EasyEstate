using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness_Layer.DTOs.AccountDto
{
    public class ForgotPasswordDto
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Role is required.")]
        [RegularExpression("^(Owner|Customer)$", ErrorMessage = "Role must be either 'Customer' or 'Owner'.")]
        public string Role { get; set; }
    }
}
