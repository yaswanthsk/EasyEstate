using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entitiy_Layer.AccountModel
{
    [Table("ActiveSession")]
    public class ActiveSession
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SessionId { get; set; }

        // UserId should be a required, non-empty string
        [Required(ErrorMessage = "User ID is required.")]
        [ForeignKey("ApplicationUser")]
        public string? UserId { get; set; }

        // UserRole should be required, non-empty, and within a reasonable length
        [Required(ErrorMessage = "User role is required.")]
        [StringLength(20, ErrorMessage = "User role cannot be longer than 20 characters.")]
        public string? UserRole { get; set; }

        // Token should be required, non-empty, and a valid format (e.g., JWT)
        [Required(ErrorMessage = "Token is required.")]
        [StringLength(2500, ErrorMessage = "Token cannot be longer than 500 characters.")]
        public string? Token { get; set; }

        // Expiry should be required and should be in the future (i.e., not in the past)
        [Required(ErrorMessage = "Expiration date is required.")]
        public DateTime ExpireDate { get; set; }

        // Custom validation to ensure that expire date is in the future
        public bool IsExpireValid => ExpireDate > DateTime.UtcNow;

        public ApplicationUser ApplicationUser { get; set; }
    }
}
