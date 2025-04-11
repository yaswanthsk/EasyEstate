using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Bussiness_Layer.DTOs.PropertyDto;

namespace Bussiness_Layer.DTOs.StatusDto
{
    public class PropStatusDto
    {
        [Required(ErrorMessage = "UserId is required.")]
        [StringLength(50, ErrorMessage = "UserId cannot exceed 50 characters.")]
        public string? UserId { get; set; } // User identifier

        [Required(ErrorMessage = "CustomerName is required.")]
        [StringLength(100, ErrorMessage = "CustomerName cannot exceed 100 characters.")]
        public string? CustomerName { get; set; } // Name of the customer

        [Required(ErrorMessage = "PropertyID is required.")]
        [ForeignKey("Properties")]
        [Range(1, int.MaxValue, ErrorMessage = "PropertyID must be a positive integer.")]
        public int PropertyID { get; set; } // Property identifier

        [Required(ErrorMessage = "OwnerID is required.")]
        [StringLength(50, ErrorMessage = "OwnerID cannot exceed 50 characters.")]
        public string? OwnerID { get; set; } // Owner identifier

        [Required(ErrorMessage = "StatusType is required.")]
        [StringLength(20, ErrorMessage = "StatusType cannot exceed 20 characters.")]
        public string? StatusType { get; set; } 

        public PropertiesGetViewDto? PropertyDetails { get; set; } 
    }
}
