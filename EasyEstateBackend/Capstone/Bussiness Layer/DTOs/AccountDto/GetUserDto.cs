using System.ComponentModel.DataAnnotations;

namespace Bussiness_Layer.DTOs.AccountDto
{
    public class GetUserDto
    {
        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Invalid email format.")]
        public string Email { get; set; }

        [Phone(ErrorMessage = "Invalid phone number format.")]
        [StringLength(10, ErrorMessage = "Phone number cannot exceed 15 characters.")]
        public string? PhoneNumber { get; set; }

        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters.")]
        public string? FirstName { get; set; }

        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters.")]
        public string? LastName { get; set; }

        [DataType(DataType.Date, ErrorMessage = "Invalid date format.")]
        [CustomValidation(typeof(GetUserDto), nameof(ValidateDateOfBirth))]
        public string? DateofBirth { get; set; }

        [StringLength(200, ErrorMessage = "Address cannot exceed 200 characters.")]
        public string? Address { get; set; }

        [RegularExpression("^(male|female)$", ErrorMessage = "Gender must be either 'male' or 'female'.")]
        public string? Gender { get; set; }

        [Url(ErrorMessage = "Invalid avatar URL format.")]
        public string? Avatar { get; set; }

        // Custom validation for date of birth
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
