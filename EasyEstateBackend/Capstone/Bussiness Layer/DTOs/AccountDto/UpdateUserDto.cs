using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bussiness_Layer.DTOs.AccountDto
{
    public class UpdateUserDto
    {
        //[Phone(ErrorMessage = "Invalid phone number format.")]
        //[StringLength(10, ErrorMessage = "Phone number cannot exceed 10 characters.")]
        public string? PhoneNumber { get; set; }

        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters.")]
        public string? FirstName { get; set; }

        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters.")]
        public string? LastName { get; set; }

        [DataType(DataType.Date, ErrorMessage = "Invalid date format.")]
        [CustomValidation(typeof(UpdateUserDto), nameof(ValidateDateOfBirth))]
        public string? DateofBirth { get; set; }

        [StringLength(200, ErrorMessage = "Address cannot exceed 200 characters.")]
        public string? Address { get; set; }

        [RegularExpression("^(male|female|other)$", ErrorMessage = "Gender must be either 'male' or 'female' or 'other'.")]
        public string? Gender { get; set; }

        //[Url(ErrorMessage = "Invalid avatar URL format.")]
        public string? Avatar { get; set; }

        // Custom validation for DateofBirth
        public static ValidationResult? ValidateDateOfBirth(string? dateOfBirth, ValidationContext context)
        {
            if (string.IsNullOrEmpty(dateOfBirth)) return ValidationResult.Success;

            if (DateTime.TryParse(dateOfBirth, out DateTime dob))
            {
                if (dob > DateTime.UtcNow)
                {
                    return new ValidationResult("Date of birth cannot be in the future.");
                }
                return ValidationResult.Success;
            }

            return new ValidationResult("Invalid date format for date of birth.");
        }
    }
}
