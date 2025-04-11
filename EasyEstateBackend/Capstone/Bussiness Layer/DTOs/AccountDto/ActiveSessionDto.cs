using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness_Layer.DTOs.AccountDto
{
    public class ActiveSessionDto
    {
        [Required(ErrorMessage = "User ID is required.")]
        public string? UserId { get; set; }

        [Required(ErrorMessage = "User role is required.")]
        [MaxLength(50, ErrorMessage = "User role cannot exceed 50 characters.")]
        [RegularExpression("^(Owner|Customer)$", ErrorMessage = "Role must be either 'Customer' or 'Owner'.")]
        public string? UserRole { get; set; }

        [Required(ErrorMessage = "Token is required.")]
        [StringLength(500, ErrorMessage = "Token cannot exceed 500 characters.")]
        public string? Token { get; set; }

        [Required(ErrorMessage = "Expire date is required.")]
        [DataType(DataType.DateTime, ErrorMessage = "Expire date must be a valid date.")]
        [FutureDateValidation(ErrorMessage = "Expire date must be in the future.")]
        public DateTime ExpireDate { get; set; }

        public bool IsExpireValid => ExpireDate > DateTime.UtcNow;

    }

    public class FutureDateValidationAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value is DateTime dateTime && dateTime <= DateTime.UtcNow)
            {
                return new ValidationResult(ErrorMessage);
            }
            return ValidationResult.Success;
        }
    }
}
